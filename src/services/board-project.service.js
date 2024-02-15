import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';

const BoardProject = db.boardProject;
const Board = db.board;
const BoardProjectCost = db.boardProjectCost;
const ProjectCost = db.projectCost;

export const isOnWorkspace =  async (boardProject) => {
  const boardProjectId = boardProject.board_project_id;
  const boardProjectCosts = await BoardProjectCost.findAll({
    where: { board_project_id: boardProjectId },
    include: [{
      model: ProjectCost,
      as: 'projectCostData',
      where: { is_active: true }
    }]
  });
  console.log('boardProjectCosts for board updated', JSON.stringify(boardProjectCosts));
  if ((boardProjectCosts.length > 0 && boardProjectCosts[0] && boardProjectCosts[0].dataValues.req_position === 0) || boardProjectCosts.length === 0) {
    console.log('COST: Is on Workspace', JSON.stringify(boardProjectCosts));
    return true;
  } else {
    return false;
  }
};

export const isOnFirstYear = async (boardProject, isMaintenance, transaction) => {
  let allNull = true;
  const indexes = isMaintenance? [11, 12] : [2, 3, 4, 5];
  const boardProjectId = boardProject.board_project_id;
  const boardProjectCosts = await BoardProjectCost.findAll({
    where: { board_project_id: boardProjectId },
    include: [{
      model: ProjectCost,
      as: 'projectCostData',
      where: { is_active: true }
    }],
    transaction: transaction
  });
  if(boardProjectCosts.length > 0) {
    // check if exist any boardprojectcost with req_position > 1 
    // if exist, then it is not on first year
    for (let i = 0; i < boardProjectCosts.length; i++) {
      if (indexes.includes(boardProjectCosts[i].dataValues.req_position)) {
        allNull = false;
        break;
      }
    }
  }
  return allNull;
};

export const determineStatusChange = async (wasOnWorkspace, boardProject, board_id, creator, transaction) => {
  logger.info('YY2 determineStatusChange');
  let statusHasChanged = false;
  const board = await Board.findOne({
    attributes: ['type', 'status'],
    where: { board_id }
  });
  const previous_code_status_type_id = boardProject.code_status_type_id;
  const boardType = board.type;
  logger.info(`boardProject.parent_board_project_id=${boardProject.parent_board_project_id}`);
  const hasParentBoardProject = boardProject.parent_board_project_id !== null;
  logger.info(`hasParentProject=${hasParentBoardProject}`);
  const onWorkspace = await isOnWorkspace(boardProject);
  let code_status_type;
  if (wasOnWorkspace && !onWorkspace) {
    if (boardType === 'WORK_REQUEST') {
      code_status_type = 2;
    } else if (boardType === 'WORK_PLAN') {
      if (hasParentBoardProject) {
        code_status_type = 2;
      } else {
        const currentStatusOfBoard = board.status;
        if (currentStatusOfBoard === 'Approved') {
          code_status_type = 3;
        } else {
          code_status_type = 2;
        }
      }
    }
    logger.info('determineStatusChange wasOnWorkspace && !onWorkspace' + wasOnWorkspace +' '+ onWorkspace);
  } else if (!wasOnWorkspace && onWorkspace) {
    if (boardType === 'WORK_REQUEST') {
      code_status_type = 1;
    } else if (boardType === 'WORK_PLAN') {
      if (hasParentBoardProject) {
        const parentBoardProject = await BoardProject.findByPk(boardProject.parent_board_project_id);
        const parentIsOnWorkspace = await isOnWorkspace(parentBoardProject);
        if (parentIsOnWorkspace) {
          code_status_type = 1;
        } else {
          code_status_type = 2;
        }
      } else {
        code_status_type = 1;
      }
    }
    logger.info('determineStatusChange !wasOnWorkspace && onWorkspace');
  }
  boardProject.code_status_type_id = code_status_type;
  statusHasChanged = boardProject.code_status_type_id !== previous_code_status_type_id;
  console.log('Board Project ', JSON.stringify(boardProject), '\n', 'onWorkspace', onWorkspace, '\n', 'wasOnWorkspace', wasOnWorkspace, 'boardid', board_id);
  console.log(code_status_type, 'codestatusnew' , boardProject.code_status_type_id, 'PREVIOUS ', previous_code_status_type_id, 'statusHasChanged', statusHasChanged);
  console.log('\n --------BC-------- ======== ------------- \n status has changed', statusHasChanged);
  boardProject.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
  boardProject.last_modified_by = creator;
  console.log(' \n -------wasONWORKSPACE',wasOnWorkspace,' is now on workspace?', onWorkspace,' \n board project', JSON.stringify(boardProject));
  if (transaction) {
    boardProject = await boardProject.save({ transaction: transaction });
  } else {
    boardProject = await boardProject.save();
  }
  return [boardProject, statusHasChanged];
};
