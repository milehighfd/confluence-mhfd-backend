import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import boardService from 'bc/services/board.service.js';
import sequelize from 'sequelize';
import { LexoRank } from 'lexorank';
import moment from 'moment';

const BoardProject = db.boardProject;
const Board = db.board;
const { Op } = sequelize;

const isOnWorkspace = (board) => {
  let allNull = true;
  const indexes = [1, 2, 3, 4, 5];
  indexes.forEach((index) => {
    const rankColumnName = `rank${index}`;
    if (board[rankColumnName] !== null) {
      allNull = false;
    }
  });
  return allNull;
};

const insertOnColumnAndFixColumn = async (columnNumber, board_id, targetPosition, otherFields, board_project_id, user) => {
  console.log('here');
  const reqColumnName = `req${columnNumber}`;
  const rankColumnName = `rank${columnNumber}`;
  const where = { board_id };
  if (`${columnNumber}` !== '0') {
    where[reqColumnName] = { [Op.ne]: null };
  } else {
    where[rankColumnName] = { [Op.ne]: null }
  }

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
  return Promise.all(proms);
};

const determineStatusChange = async (wasOnWorkspace, boardProject, board_id) => {
  logger.info('determineStatusChange');
  const board = await Board.findOne({
    attributes: ['type'],
    where: { board_id }
  });

  const type = board.type;
  logger.info(`boardProject.parent_board_project_id=${boardProject.parent_board_project_id}`);
  const shouldStatusChange = boardProject.parent_board_project_id === null;
  let nonWorkspaceStatus;
  if (type === 'WORK_REQUEST') {
    nonWorkspaceStatus = 2;
  } else if (type === 'WORK_PLAN') {
    nonWorkspaceStatus = 3;
  }
  logger.info(`determineStatusChange=${nonWorkspaceStatus}, shouldStatusChange=${shouldStatusChange}`);
  if (shouldStatusChange) {
    const onWorkspace = isOnWorkspace(boardProject);
    if (wasOnWorkspace && !onWorkspace) {
      boardProject.code_status_type_id = nonWorkspaceStatus;
      boardProject = await boardProject.save();
      logger.info('determineStatusChange wasOnWorkspace && !onWorkspace');
    } else if (!wasOnWorkspace && onWorkspace) {
      boardProject.code_status_type_id = 1;
      boardProject = await boardProject.save();
      logger.info('determineStatusChange !wasOnWorkspace && onWorkspace');
    }
  }
  return boardProject;
}

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
      if (key.includes('req') && key != 'req0') {
        const costToUpdate = otherFields[key] ? otherFields[key] : 0;
        const columnToEdit = key.match(/\d+/)[0];
        await boardService.updateAndCreateProjectCosts(
          columnToEdit,
          costToUpdate,
          boardProject.project_id,
          user,
          board_project_id,
          moment(mainModifiedDate).subtract(offsetMillisecond * multiplicator).toDate()
        );
        multiplicator++;
      }
    }

    boardProjectUpdated = await determineStatusChange(wasOnWorkspace, boardProjectUpdated, board_id);
    return res.status(200).send(boardProjectUpdatedStatus);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
};

export default updateRank;
