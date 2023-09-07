import express from 'express';
import { LexoRank } from 'lexorank';
import sequelize from 'sequelize';
import db from 'bc/config/db.js';
import moment from 'moment';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';
import boardService from 'bc/services/board.service.js';
import updateRank from 'bc/routes/board-project/update-rank.js'

const Board = db.board;
const BoardProject = db.boardProject;
const Project = db.project;
const ProjectCost = db.projectCost;
const ProjectIndependentAction = db.projectIndependentAction;

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
      include: [{
        model: Project,
        attributes: ['project_id'],
        as: 'projectData',
        include: [{
          model: ProjectCost,
          attributes: ['cost'],
          as: 'currentCost',
          where: {
            is_active: true
          },
        },
        {
          model: ProjectIndependentAction,
          required: false,
          separate: true,
          attributes: [
            'action_name',
            'project_id',
            'cost',
            'action_status'
          ]
        }]
      }],
      where: {
        board_project_id
      }
    });
    console.log("BOARD PROJECT RETURN", boardProject);
    return res.status(200).send(boardProject);
  } catch (error) {
    logger.error('ERROR FROM GET COST ' + error);
    return res.status(500).send({ error: error });
  }
});

router.post('/getCostsMaintenance', async (req, res) => {
  const { board_project_id } = req.body;
  try {
    const boardProject = await BoardProject.findAll({
      attributes: [
        'board_project_id',
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
    return res.status(200).send(boardProject);
  } catch (error) {
    logger.error('ERROR FROM GET COST ' + error);
    return res.status(500).send({ error: error });
  }
});

router.put('/update-target-cost', async(req,res) => {
  const {
    boardId,
    targetcost1,
    targetcost2,
    targetcost3,
    targetcost4,
    targetcost5
  } = req.body;
  const {
    locality,
    projecttype,
    type,
    year,
  } = boardId;
  const board = await Board.findOne({
    where: {
      locality,
      projecttype,
      type,
      year
    },
    sort: [['createdAt', 'DESC']]
  });

  try{
    let boardUpdate = await Board.update(
      { targetcost1, targetcost2, targetcost3, targetcost4, targetcost5 },
      {where: { board_id: board.board_id}}
    );
    return res.status(200).send(boardUpdate);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
  
});
router.put('/:board_project_id/update-rank', [auth], updateRank);
router.put('/:board_project_id/cost',[auth], async (req, res) => {
  logger.info('get board project cost by id');
  try {
  const { board_project_id } = req.params;
  const user = req.user;
  const { req1, req2, req3, req4, req5, year1, year2, isMaintenance } = req.body;
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
    if (
      (beforeUpdate[reqColumnName] === null && req.body[reqColumnName] !== null) ||
      (beforeUpdate[rankColumnName] === null && req.body[reqColumnName] !== null && beforeUpdate[reqColumnName] !== req.body[reqColumnName])
    ) {
      const where = {
        board_id: beforeUpdate.board_id,
        [rankColumnName]: { [Op.ne]: null }
      };
      const projects = await BoardProject.findAll({
        where,
        order: [[rankColumnName, 'DESC']],
        limit: 1
      });
      if (projects.length === 0) {
        updateFields[rankColumnName] = LexoRank.middle().toString();
      } else {
        const lastProject = projects[0];
        updateFields[rankColumnName] = LexoRank.parse(lastProject[rankColumnName]).genNext().toString();  
      }
    } else if (beforeUpdate[reqColumnName] !== null && req.body[reqColumnName] === null && !isMaintenance) {
      updateFields[rankColumnName] = null;
    }
  }
  const allPromises = [];
  const offsetMillisecond = 35007;
  let mainModifiedDate = new Date();
  for ( let pos = 0; pos < columnsChanged.length ; ++pos) {
    const currentColumn = columnsChanged[pos];
    if (currentColumn !== 0) {
      const reqColumnName = `req${currentColumn}`;
      const currentCost   = req.body[reqColumnName] ? req.body[reqColumnName]: 0; 
      allPromises.push(boardService.updateAndCreateProjectCosts(
        currentColumn,
        currentCost,
        currentProjectId,
        user,
        board_project_id,
        moment(mainModifiedDate).subtract( offsetMillisecond * pos).toDate()
      ));
    }
  }
  mainModifiedDate = new Date();
  for(let i = 1; i<=2; ++i){
    const valueYearHasChanged = beforeUpdate[`year${i}`] !== req.body[`year${i}`];
    if(valueYearHasChanged) {
      const currentColumn = 0 ; // due to limit in req position this value is whatever. 
      const currentCost = req.body[`year${i}`] ? req.body[`year${i}`] : 0;
      allPromises.push(boardService.updateAndCreateProjectCosts(
        currentColumn, // year1 = 6, year2 = 7
        currentCost,
        currentProjectId,
        user,
        board_project_id,
        moment(mainModifiedDate).subtract( offsetMillisecond * (i + columnsChanged.length)).toDate()
      ));
    }
  }
  await Promise.all(allPromises);
    let rank0 = null; 
    let shouldMoveToWorkspace = true;
    for(let currentRank in allCurrentAmounts) {
      if(allCurrentAmounts[currentRank]){
        shouldMoveToWorkspace = false;
      }
    }
    if ( shouldMoveToWorkspace && !isMaintenance) {
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
    const [updateCount] = await BoardProject.update(
      {
        rank0, req1, req2, req3, req4, req5, year1, year2, ...updateFields
      },
      { where: { board_project_id } }
    );
    const updatedRanks = await BoardProject.findOne({
      attributes: ['rank0', 'rank1', 'rank2', 'rank3', 'rank4', 'rank5'],
      where: { board_project_id }
    });
    let hasSomeRank = false;
    Object.keys(updatedRanks.dataValues).forEach(key => {
      if (updatedRanks.dataValues[key] !== null) {
        hasSomeRank = true;
      }
    });
    if (!hasSomeRank) {
      await BoardProject.update(
        { rank0: LexoRank.middle().toString() },
        { where: { board_project_id } }
      );
    }
    let x;
    if (updateCount > 0) {
      x = await BoardProject.findOne({where: { board_project_id }, attributes: [
        'req1',
        'req2',
        'req3',
        'req4',
        'req5',
        'year1',
        'year2'
      ]});
    }
    return res.status(200).send({ newCost: x, columnsChanged });
  } catch (error) {
    logger.error("ERROR At route cost" +error);
    return res.status(500).send({ error: error });
  }
});
router.get('/:board_project_id/duplicate', async (req, res) => {
  const { board_project_id } = req.params;
  const board_id = 84;
  await boardService.duplicateBoardProject(board_project_id, board_id);
  res.send(200);
})
export default router;
