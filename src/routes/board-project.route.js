import express from 'express';
import { LexoRank } from 'lexorank';
import sequelize from 'sequelize';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';
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
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

router.put('/:board_project_id/update-rank', async (req, res) => {
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
  if (before === undefined) before = null;
  if (after === undefined) after = null;
  const rankColumnName = `rank${columnNumber}`;
  if (before === null && after === null) {
    const boardProject = await BoardProject.findOne({
      attributes: [
        'board_id',
      ],
      where: {
        board_project_id
      }
    });
    const board_id = boardProject.board_id;

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
      }
      return await BoardProject.update(
        { [rankColumnName]: lastLexo },
        { where: { board_project_id: project.board_project_id } }
      );
    });
    const results = await Promise.all(proms);
    return res.status(200).send(results);
  }
  if (before === null && beforeIndex !== -1) {
    logger.error('before is null but beforeIndex is not -1');
  } else if (after === null && afterIndex !== -1) {
    logger.error('after is null but afterIndex is not -1');
  }
  let lexo;
  if (before === null) {
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
    const x = await BoardProject.update(
      { [rankColumnName]: lexo, ...otherFields },
      { where: { board_project_id } }
    );
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
  await ProjectCost.update({
    is_active: 0
  }, {
    where: {
      project_cost_id: { [Op.in]: projectsIdsToUpdate }
    }
  });
  const projectCostCreated = await ProjectCost.create({
    cost: currentCost,
    project_id: currentProjectId,
    code_cost_type_id: CODE_COST_TYPE_ID,
    created_by: user.email,
    modified_by: user.email
  });
  const project_cost_id = projectCostCreated.dataValues.project_cost_id;
  await BoardProjectCost.create({
      board_project_id: board_project_id,
      project_cost_id: project_cost_id,
      req_position: currentColumn,
      created_by: user.email,
      last_modified_by: user.email
  });
}
router.put('/:board_project_id/cost',[auth], async (req, res) => {
  logger.info('get board project cost by id');
  const { board_project_id } = req.params;
  const user = req.user;
  const { req1, req2, req3, req4, req5, year1, year2 } = req.body;
  let updateFields = {};
  const beforeUpdate = await BoardProject.findOne({
    where: { board_project_id }
  });
  const columnsChanged = [];
  for (let pos = 1; pos <= 5; pos++) {
    const reqColumnName = `req${pos}`;
    const rankColumnName = `rank${pos}`;
    const valueHasChanged = beforeUpdate[reqColumnName] !== req.body[reqColumnName];
    if (valueHasChanged) {
      columnsChanged.push(pos);
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
      const lastProject = projects[0];
      updateFields[rankColumnName] = LexoRank.parse(lastProject[`rank${[pos]}`]).genNext().toString();
    } else if (beforeUpdate[reqColumnName] !== null && req.body[reqColumnName] === null) {
      updateFields[rankColumnName] = null;
    }
  }
  const currentProjectId = beforeUpdate.project_id;
  for ( let pos = 0; pos < columnsChanged.length ; ++pos) {
    const currentColumn = columnsChanged[pos];
    const reqColumnName = `req${currentColumn}`;
    const currentCost   = req.body[reqColumnName];
    if (currentCost) {
      updateAndCreateProjectCosts(
        currentColumn,
        currentCost,
        currentProjectId,
        user,
        board_project_id
      );
    }
  }
  try {
    let x = await BoardProject.update(
      {
        req1, req2, req3, req4, req5, year1, year2, ...updateFields
      },
      { where: { board_project_id } }
    );
    return res.status(200).send({ newCost: x, columnsChanged });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

export default router;
