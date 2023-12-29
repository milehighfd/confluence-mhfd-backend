import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const BoardProject = db.boardProject;
const Board = db.board;
const BoardProjectCost = db.boardProjectCost;
const ProjectCost = db.projectCost;

export const isOnWorkspace =  async (boardProject) => {
  let allNull = true;
  const indexes = [1, 2, 3, 4, 5];
  // indexes.forEach((index) => {
  //   const rankColumnName = `rank${index}`;
  //   if (boardProject[rankColumnName] !== null) {
  //     allNull = false;
  //   }
  // });
  // validate if boardproject has a board_project_cost with req_position = 0 with project_cost with is_active = true
  const boardProjectId = boardProject.board_project_id;
  // find all boardprojectcost of boardProejctId and get projectCost that has is_active = true
  const boardProjectCosts = await BoardProjectCost.findAll({
    where: { board_project_id: boardProjectId },
    include: [{
      model: ProjectCost,
      // where: { is_active: true }
    }]
  });
  console.log('IS ON WORKSPACE CHECK', boardProjectCosts, boardProjectId);
  return allNull;
};

export const isOnFirstYear = (boardProject) => {
  let allNull = true;
  const indexes = [0, 2, 3, 4, 5];
  // indexes.forEach((index) => {
  //   const rankColumnName = `rank${index}`;
  //   if (boardProject[rankColumnName] !== null) {
  //     allNull = false;
  //   }
  // });
  return allNull;
};

export const determineStatusChange = async (wasOnWorkspace, boardProject, board_id, creator) => {
  logger.info('determineStatusChange');
  let statusHasChanged = false;
  const board = await Board.findOne({
    attributes: ['type'],
    where: { board_id }
  });
  const previous_code_status_type_id = boardProject.code_status_type_id;
  const boardType = board.type;
  logger.info(`boardProject.parent_board_project_id=${boardProject.parent_board_project_id}`);
  const hasParentBoardProject = boardProject.parent_board_project_id !== null;
  logger.info(`hasParentProject=${hasParentBoardProject}`);
  const onWorkspace = await isOnWorkspace(boardProject);
  if (wasOnWorkspace && !onWorkspace) {
    let code_status_type;
    if (boardType === 'WORK_REQUEST') {
      code_status_type = 2;
    } else if (boardType === 'WORK_PLAN') {
      if (hasParentBoardProject) {
        code_status_type = 2;
      } else {
        code_status_type = 3;
      }
    }
    boardProject.code_status_type_id = code_status_type;
    logger.info('determineStatusChange wasOnWorkspace && !onWorkspace');
  } else if (!wasOnWorkspace && onWorkspace) {
    let code_status_type;
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
    boardProject.code_status_type_id = code_status_type;
    logger.info('determineStatusChange !wasOnWorkspace && onWorkspace');
  }
  statusHasChanged = boardProject.code_status_type_id !== previous_code_status_type_id;
  // if (onWorkspace) {
  //   boardProject.rank1 = null;
  //   boardProject.rank2 = null;
  //   boardProject.rank3 = null;
  //   boardProject.rank4 = null;
  //   boardProject.rank5 = null;
  // } else {
  //   boardProject.rank0 = null;
  // }
  boardProject.last_modified_by = creator;
  boardProject = await boardProject.save();
  return [boardProject, statusHasChanged];
};
