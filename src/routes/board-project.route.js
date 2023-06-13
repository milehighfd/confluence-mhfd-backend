import express from 'express';
import { LexoRank } from 'lexorank';
import sequelize from 'sequelize';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';
const Board = db.board;
const BoardProject = db.boardProject;
const ProjectCost = db.projectCost;
const BoardProjectCost = db.boardProjectCost;

const { Op } = sequelize;
const router = express.Router();

router.get('/:board_project_id/cost', async (req, res) => {
  logger.info('get board project cost by id');
  const { board_project_id } = req.params;
  try {
    const boardProject = await BoardProject.findOne({
      attributes: [
        'req1',
        'req2',
        'req3',
        'req4',
        'req5',
        'year1',
        'year2'
      ],
      where: {
        board_project_id
      }
    });
    console.log(boardProject);
    return res.status(200).send(boardProject);
  } catch (error) {
    logger.error('ERROR FROM GET COST ' + error);
    return res.status(500).send({ error: error });
  }
});
router.put('/:board_id/update-target-cost', async(req,res) => {
  const { board_id } = req.params;
  const {
    targetcost1,
    targetcost2,
    targetcost3,
    targetcost4,
    targetcost5
  } = req.body;
  try{
    let boardUpdate = await Board.update(
      { targetcost1, targetcost2, targetcost3, targetcost4, targetcost5 },
      {where: { board_id}}
    );
    return res.status(200).send(boardUpdate);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
  
});
router.put('/:board_project_id/update-rank', [auth], async (req, res) => {
  logger.info('get board project cost by id');
  const { board_project_id } = req.params;
  const {
    before,
    after,
    columnNumber,
    beforeIndex,
    afterIndex,
    targetPosition,
    otherFields
  } = req.body;
  const user = req.user;
  if (before === undefined) before = null;
  if (after === undefined) after = null;
  const rankColumnName = `rank${columnNumber}`;
  const board_id = (await BoardProject.findOne({
    attributes: [
      'board_id',
    ],
    where: {
      board_project_id
    }
  }) || {}).board_id;
  const columnCountWhere = {
    board_id,
    [rankColumnName]: { [Op.ne]: null }
  };
  const count = await BoardProject.count({ where: columnCountWhere });
  if (before === null && after === null && count > 0) {
    const where = { board_id };
    if (`${columnNumber}` !== '0') {
      where[`req${columnNumber}`] = { [Op.ne]: null };
    } else {
      where[`rank${columnNumber}`] = { [Op.ne]: null }
    }
    /* This should fix all the projects in the column to have a rank */
    const projects = await BoardProject.findAll({
      where,
      order: [[`rank${columnNumber}`, 'ASC']],
    });
    let lastLexo = null;
    const proms = projects.map(async (project, index) => {
      if (lastLexo === null) {
        lastLexo = LexoRank.middle().toString();
      } else {
        lastLexo = LexoRank.parse(lastLexo).genNext().toString();
      }
      if (index === targetPosition) {
        lastLexo = LexoRank.parse(lastLexo).genNext().toString();
        await BoardProject.update(
          { ...otherFields, [rankColumnName]: lastLexo },
          { where: { board_project_id: board_project_id } }
        );
        for(const keys in otherFields) {
          if(keys.includes('req')) {
            const costToUpdate = otherFields[keys] ? otherFields[keys]: 0;
            const columnToEdit = keys.match(/[0-9]+/);
            updateAndCreateProjectCosts(columnToEdit, costToUpdate, project.project_id, user, board_project_id);
          }
        }
      }
      return await BoardProject.update(
        { [rankColumnName]: lastLexo },
        { where: { board_project_id: project.board_project_id } }
      );
    });
    const results = await Promise.all(proms);
    console.log(' ZXCVResylts ins here', results);
    return res.status(200).send(results);
  }
  if (before === null && beforeIndex !== -1) {
    logger.error('before is null but beforeIndex is not -1');
  } else if (after === null && afterIndex !== -1) {
    logger.error('after is null but afterIndex is not -1');
  }
  let lexo;
  if (count === 0) {
    lexo = LexoRank.middle().toString();
  } else if (before === null) {
    lexo = LexoRank.parse(after).genPrev().toString();
  } else if (after === null) {
    lexo = LexoRank.parse(before).genNext().toString();
  } else {
    if (before === after) {
      lexo = before; //TODO: change as this should not happen
    } else {
      lexo = LexoRank.parse(before).between(LexoRank.parse(after)).toString();
    }
  }
  try {
    const boardProject = await BoardProject.findOne({
      attributes: [
        'board_id',
        'project_id'
      ],
      where: {
        board_project_id
      }
    });
    const x = await BoardProject.update(
      { [rankColumnName]: lexo, ...otherFields },
      { where: { board_project_id } }
    );
    for(const key in otherFields) {
      if(key.includes('req') && key!='req0' ) {
        const costToUpdate = otherFields[key] ? otherFields[key]: 0;
        const columnToEdit = key.match(/\d+/)[0];
        console.log(' ZXCVColumn to edit is', columnToEdit, key, otherFields);
        updateAndCreateProjectCosts(columnToEdit, costToUpdate, boardProject.project_id, {email: 'test@test'}, board_project_id);
      }
    }
    console.log('WHAT ', x);
    return res.status(200).send(x);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});
const updateAndCreateProjectCosts = async (currentColumn, currentCost, currentProjectId, user, board_project_id) => {
  const CODE_COST_TYPE_ID = 22; // Work Request Code cost type // TODO: verify which code will be correct 
  const currentBoardProjectCosts = await BoardProjectCost.findAll({
    where: {
      board_project_id,
      req_position: currentColumn
    }
  });
  
  const projectsIdsToUpdate = currentBoardProjectCosts.map((cbpc) => cbpc.dataValues.project_cost_id);
  try {
    ProjectCost.update({
      is_active: 0
    }, {
      where: {
        project_cost_id: { [Op.in]: projectsIdsToUpdate }
      }
    }).then(async () => {
      logger.info('PROJECTS TO BE UPDATED'+ projectsIdsToUpdate + ' current PROJECT ID TO INSERT' + currentProjectId);
      logger.info("about to create project cost  "+ currentCost+" project id "+ currentProjectId + " created_by "+ user.email);
      const projectCostCreated = await ProjectCost.create({
        cost: currentCost,
        project_id: currentProjectId,
        code_cost_type_id: CODE_COST_TYPE_ID,
        created_by: user.email,
        modified_by: user.email,
        is_active: 1,
        last_modified: new Date()
      });
      console.log('PROJECT COST IS CREATED', projectCostCreated);
      const project_cost_id = projectCostCreated.dataValues.project_cost_id;
      await BoardProjectCost.create({
          board_project_id: board_project_id,
          project_cost_id: project_cost_id,
          req_position: currentColumn,
          created_by: user.email,
          last_modified_by: user.email
      });
    });
  } catch (error) {
    logger.error("ERROR AT PROJECT COST is", error)
  }
  
}
router.put('/:board_project_id/cost',[auth], async (req, res) => {
  logger.info('get board project cost by id');
  try {
  const { board_project_id } = req.params;
  const user = req.user;
  const { req1, req2, req3, req4, req5, year1, year2 } = req.body;
  let updateFields = {};
  const beforeUpdate = await BoardProject.findOne({
    where: { board_project_id }
  });
  const currentProjectId = beforeUpdate.project_id;
  const columnsChanged = [0];
  const allCurrentAmounts = {};
  for (let pos = 1; pos <= 5; pos++) {
    const reqColumnName = `req${pos}`;
    const rankColumnName = `rank${pos}`;
    const valueHasChanged = beforeUpdate[reqColumnName] !== req.body[reqColumnName];
    if (valueHasChanged) {
      columnsChanged.push(pos);
      allCurrentAmounts[reqColumnName] = req.body[reqColumnName];
    } else {
      allCurrentAmounts[reqColumnName] = beforeUpdate[reqColumnName];
    }
    if (beforeUpdate[reqColumnName] === null && req.body[reqColumnName] !== null) {
      const where = {
        board_id: beforeUpdate.board_id,
        [`rank${pos}`]: { [Op.ne]: null }
      };
      const projects = await BoardProject.findAll({
        where,
        order: [[`rank${pos}`, 'DESC']],
        limit: 1
      });
      if (projects.length === 0) {
        updateFields[rankColumnName] = LexoRank.middle().toString();
      } else {
        const lastProject = projects[0];
        updateFields[rankColumnName] = LexoRank.parse(lastProject[`rank${[pos]}`]).genNext().toString();  
      }
    } else if (beforeUpdate[reqColumnName] !== null && req.body[reqColumnName] === null) {
      updateFields[rankColumnName] = null;
    }
  }
  for ( let pos = 0; pos < columnsChanged.length ; ++pos) {
    const currentColumn = columnsChanged[pos];
    if (currentColumn !== 0) {
      const reqColumnName = `req${currentColumn}`;
      const currentCost   = req.body[reqColumnName] ? req.body[reqColumnName]: 0; 
      updateAndCreateProjectCosts(
        currentColumn,
        currentCost,
        currentProjectId,
        user,
        board_project_id
      );
    }
  }
  for(let i = 1; i<=2; ++i){
    const valueYearHasChanged = beforeUpdate[`year${i}`] !== req.body[`year${i}`];
    if(valueYearHasChanged) {
      const currentColumn = 0 ; // due to limit in req position this value is whatever. 
      const currentCost = req.body[`year${i}`] ? req.body[`year${i}`] : 0;
      updateAndCreateProjectCosts(
        currentColumn, // year1 = 6, year2 = 7
        currentCost,
        currentProjectId,
        user,
        board_project_id
      );
    }
  }
    let rank0 = null; 
    let shouldMoveToWorkspace = true;
    for(let currentRank in allCurrentAmounts) {
      if(allCurrentAmounts[currentRank]){
        shouldMoveToWorkspace = false;
      }
    }
    if ( shouldMoveToWorkspace) {
      const projects = await BoardProject.findAll({
        where: {
          board_id: beforeUpdate.board_id,
          rank0: {[Op.ne]: null}
        },
        order: [[`rank${0}`, 'ASC']],
        limit: 1
      });
      if (projects.length === 0) {
        rank0 = LexoRank.middle().toString();
      } else {
        const firstProject = projects[0];
        rank0 = LexoRank.parse(firstProject[`rank0`]).genPrev().toString();
      }
    }
    console.log('Value of rank0', rank0, 'shpould move', shouldMoveToWorkspace);
    let x = await BoardProject.update(
      {
        rank0, req1, req2, req3, req4, req5, year1, year2, ...updateFields
      },
      { where: { board_project_id } }
    );
    return res.status(200).send({ newCost: x, columnsChanged });
  } catch (error) {
    logger.error("ERROR At route cost" +error);
    return res.status(500).send({ error: error });
  }
});

export default router;
