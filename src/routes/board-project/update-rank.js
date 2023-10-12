import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import boardService from 'bc/services/board.service.js';
import { isOnWorkspace, determineStatusChange } from 'bc/services/board-project.service.js';
import sequelize from 'sequelize';
import { LexoRank } from 'lexorank';
import moment from 'moment';

const BoardProject = db.boardProject;
const BoardProjectCost = db.boardProjectCost;
const ProjectCost = db.projectCost;
const ProjectPartner = db.projectPartner;
const { Op } = sequelize;

async function getBoardProjectCost(board_project_id, columnNumber) {
  const MHFD_CODE_PARTNER_TYPE = 88;
  const reqExist = await BoardProjectCost.findOne({
    attributes: ['req_position', 'board_project_id'],
    where: {
      board_project_id,
      req_position: columnNumber
    },
    include: [
      {
        attributes: ['cost', 'code_cost_type_id', 'project_partner_id','project_id','project_cost_id'],
        model: ProjectCost,
        as: 'projectCostData',
        where: {
          is_active: true,
        },
        is_required: true,
        include: [
          {
            model: ProjectPartner,
            as: 'projectPartnerData',
            is_required: true,
            where: {
              code_partner_type_id: MHFD_CODE_PARTNER_TYPE
            }
          }
        ]
      }
    ]
  });
  return reqExist;
}

function getNumberFromRank(otherFields) {
  if (!otherFields) {
    return null;
  }
  for (let i = 0; i <= 5; i++) {
    const rankKey = `rank${i}`;
    if (otherFields.hasOwnProperty(rankKey)) {
      return i;
    }
  }
  return null;
}

const insertOnColumnAndFixColumn = async (columnNumber, board_id, targetPosition, otherFields, board_project_id, user) => {
  console.log('here');
  const reqColumnName = `req${columnNumber}`;
  const rankColumnName = `rank${columnNumber}`;
  const where = { board_id };
  let reqExist = null;
  if (`${columnNumber}` !== '0') {
    reqExist = await getBoardProjectCost(board_project_id, columnNumber);
    console.log('reqExist', reqExist)
    //where[reqColumnName] = { [Op.ne]: null };
    if (reqExist) {
      where['board_project_id'] = reqExist.board_project_id;
    }
  } else {
    where[rankColumnName] = { [Op.ne]: null }
  }
  console.log('where', where)
  console.log('req', reqExist)
  const projects = await BoardProject.findAll({
    where,
    order: [[rankColumnName, 'ASC']],
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
      const offsetMillisecond = 35000;
      let mainModifiedDate = new Date();
      let multiplicator = 0;
      for (const keys in otherFields) {
        if (keys.includes('req')) {
          const costToUpdate = otherFields[keys] ? otherFields[keys] : 0;
          const columnToEdit = keys.match(/[0-9]+/);
          console.log(columnToEdit, 'columnToEdit')
          console.log(costToUpdate, 'costToUpdate')
          await boardService.updateAndCreateProjectCosts(
            columnToEdit,
            costToUpdate,
            project.project_id,
            user,
            board_project_id,
            moment(mainModifiedDate).subtract(offsetMillisecond * multiplicator).toDate()
          );
          console.log('Multiplicating 000', moment(mainModifiedDate).subtract(offsetMillisecond * multiplicator).toDate(), multiplicator);
          multiplicator++;
        }
      }
    }   
    return await BoardProject.update(
      { [rankColumnName]: lastLexo },
      { where: { board_project_id: project.board_project_id } }
    );
  });
  let originCost = null;
  let targetCost = null;
  if (getNumberFromRank(otherFields) && columnNumber) {
    originCost = await getBoardProjectCost(board_project_id, getNumberFromRank(otherFields));
    targetCost = await getBoardProjectCost(board_project_id, columnNumber);
    if (originCost && targetCost) {
      const cost = originCost.projectCostData.cost + targetCost.projectCostData.cost;
      proms.push(ProjectCost.update(
        { cost: cost },
        { where: { project_cost_id: targetCost.projectCostData.project_cost_id } }
      ));
      proms.push(ProjectCost.update(
        { is_active: false },
        { where: { project_cost_id: originCost.projectCostData.project_cost_id } }
      ));
    }
  }
  try {
    const results = await Promise.all(proms);
    console.log('results', results);
  } catch (error) {
    console.error(`Error updating ranks: ${error}`);
  }
};

const updateRank = async (req, res) => {
  logger.info('get board project cost by id');
  const { board_project_id } = req.params;
  let { before, after } = req.body;
  const {
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
  const boardProjectBeforeUpdate = await BoardProject.findOne({
    where: {
      board_project_id
    }
  }) || {};
  const wasOnWorkspace = isOnWorkspace(boardProjectBeforeUpdate);
  console.log('wasOnWorkspace', wasOnWorkspace)
  const board_id = boardProjectBeforeUpdate.board_id;
  const columnCountWhere = {
    board_id,
    [rankColumnName]: { [Op.ne]: null }
  };
  const count = await BoardProject.count({ where: columnCountWhere });
  if (before === null && after === null && count > 0) {
    const results = await insertOnColumnAndFixColumn(
      columnNumber,
      board_id,
      targetPosition,
      otherFields,
      board_project_id,
      user
    );
    return res.status(201).send(results);
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
    const offsetMillisecond = 35000;
    let mainModifiedDate = new Date();
    let multiplicator = 0;
    const boardProjectUpdatedStatus = await BoardProject.update(
      { [rankColumnName]: lexo, ...otherFields },
      { where: { board_project_id } }
    );

    let boardProjectUpdated = await BoardProject.findOne({
      where: { board_project_id }
    });

    const onWorkspace = isOnWorkspace(boardProjectUpdated);
    console.log('onWorkspace', onWorkspace);

    for (const key in otherFields) {
      if (key != 'rank0') {
        const costToUpdate = otherFields[key] ? otherFields[key] : 0;
        const columnToEdit = key.match(/\d+/)[0];
        const originCost = await getBoardProjectCost(board_project_id, getNumberFromRank(otherFields));
        const targetCost = await getBoardProjectCost(board_project_id, columnNumber);
        let cost = 0;
        if (originCost && targetCost) {
          cost = originCost.projectCostData.cost + targetCost.projectCostData.cost;
        }
        await boardService.updateAndCreateProjectCosts(
          columnToEdit,
          cost,
          boardProject.project_id,
          user,
          board_project_id,
          moment(mainModifiedDate).subtract(offsetMillisecond * multiplicator).toDate()
        );
        multiplicator++;
      }
    }

    [boardProjectUpdated, ] = await determineStatusChange(wasOnWorkspace, boardProjectUpdated, board_id, user.email);
    return res.status(200).send(boardProjectUpdatedStatus);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
};

export default updateRank;
