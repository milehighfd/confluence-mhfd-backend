import db from 'bc/config/db.js';
import { CODE_DATA_SOURCE_TYPE, COST_IDS } from 'bc/lib/enumConstants.js';
import { saveProjectCost } from 'bc/utils/create';
import sequelize from 'sequelize';
import moment from 'moment';
const { Op } = sequelize;
const BoardProject = db.boardProject;
const Board = db.board;
const BoardProjectCost = db.boardProjectCost;
const ProjectCost = db.projectCost;

const applyLocalityCondition = (where) => {
  if (where.locality.startsWith('South Platte River')) {
    where.locality = {
      [Op.like]: 'South Platte River%'
    }
  }
  if (where.locality === 'Highlands Ranch Metro District') {
    where.locality = {
      [Op.in]: ['Highlands Ranch', 'Highlands Ranch Metro District']
    }
  }
  return where;
}
export const updateSortOrder = async (boardProject, movePosition, transaction) => {
  try { 
    const boardProjectCostId = boardProject.boardProjectToCostData[0].board_project_cost_id;
    const boardProjectCostsUpdate = await BoardProjectCost.update(
      { sort_order: movePosition },
      {
        where: {
          board_project_cost_id: boardProjectCostId
        },
        transaction
      }
    );
    console.log('Updated pcu', boardProjectCostsUpdate, JSON.stringify(boardProject));
  } catch(error) {
    console.error('FAIL at updateSortOrder ', error);
  }
}
export const moveProjectCostsOnePosition = async (boardProjects, arithmeticOperation ,transaction) => { 
  // iterate though boardprojects and get the project_cost_id then update the sort_order and add 1 to each
  try {
    const boardProjectCostIds = boardProjects.map(b => b.boardProjectToCostData[0].board_project_cost_id);
    console.log('boardprojectsosids', boardProjectCostIds);
    const boardProjectCostsUpdate = await BoardProjectCost.update(
      { sort_order: sequelize.literal(`sort_order ${arithmeticOperation}`) },
      {
        where: {
          board_project_cost_id: {
            [Op.in]: boardProjectCostIds
          }
        },
        transaction
      }
    );
    console.log('Updated pcu', boardProjectCostsUpdate);
  } catch(error) {
    console.error('FAIL at moveProjectCostsOnePosition ', error);
  }
}
const getBoardProjectsValues =  async (boardId, currentColumn, direction, movePosition) => {
  const {
    locality,
    projecttype,
    type,
    year,
  } = boardId;
  let boardWhere = {
    type,
    year,
    locality,
    projecttype,
  };
  boardWhere = applyLocalityCondition(boardWhere);
  const boards = await Board.findAll({
    attributes: ['board_id', 'type'],
    where: boardWhere,
  });
  const boardIds = boards.map(b => b.dataValues.board_id);
  const isWorkPlan = type === 'WORK_PLAN';
  const whereBPC = {
    req_position: currentColumn
  };
  const originPositionColumnName = `originPosition${currentColumn}`;
  if (direction == 'greater') {
    whereBPC.sort_order = {
      [Op.gte]: movePosition
    }
  } else {
    whereBPC.sort_order = {
      [Op.lte]: movePosition
    }
  }
  const attributes = [
    'board_project_id',
    'project_id',
    'origin',
    originPositionColumnName,
    'code_status_type_id',
  ];
  const where = {
    board_id: {[Op.in]: boardIds},
    // [rankColumnName]: { [Op.ne]: null }
  };
  const boardProjects = (await BoardProject.findAll({
    attributes,
    where,
    order: [[{model: BoardProjectCost, as: 'boardProjectToCostData'},'sort_order', 'ASC']],
    // [{ model: BoardProjectCost, as: 'boardProjectToCostData' }, 'sort_order', 'ASC']
    include:[{
      model: BoardProjectCost,
      as: 'boardProjectToCostData',
      required: true,
      // order: [['sort_order', 'ASC']],
      where: whereBPC,
      include: [
        {
          model: ProjectCost,
          as: 'projectCostData',
          required: true,
          where: {
            is_active: true,
            code_cost_type_id: isWorkPlan ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID: COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID
          }
        }
      ]
    }]
  })).map(d => d.dataValues);
  return boardProjects;
}
export const getBoardProjectsOfBoardOfColumn = async (board_id, isWorkPlan, columnNumber, transaction) => {
  const boardProjects = (await BoardProject.findAll({
    where: {
      board_id: board_id,
    },
    order: [[{model: BoardProjectCost, as: 'boardProjectToCostData'},'sort_order', 'ASC']],
    include:[{
      model: BoardProjectCost,
      as: 'boardProjectToCostData',
      required: true,
      where: {
        req_position: columnNumber
      },
      include: [
        {
          model: ProjectCost,
          as: 'projectCostData',
          required: true,
          where: {
            is_active: true,
            code_cost_type_id: isWorkPlan ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID: COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID
          }
        }
      ]
    }],
    transaction: transaction
  })).map(d => d.dataValues);
  console.log(board_id, isWorkPlan ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID: COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID, 'column nomber', columnNumber, '\n -------N -------- \n Board Projects ',board_id, '\n', boardProjects, '\n ---------- \n');
  return boardProjects;
}
export const getBoardProjectsOfBoard = async (board_id, isWorkPlan) => {
  const boardProjects = (await BoardProject.findAll({
    where: {
      board_id: board_id,
    },
    order: [[{model: BoardProjectCost, as: 'boardProjectToCostData'},'sort_order', 'ASC']],
    include:[{
      model: BoardProjectCost,
      as: 'boardProjectToCostData',
      required: true,
      // where: {
      //   req_position: {[Op.gt]: 0 }
      // },
      include: [
        {
          model: ProjectCost,
          as: 'projectCostData',
          required: true,
          where: {
            is_active: true,
            code_cost_type_id: isWorkPlan ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID: COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID
          }
        }
      ]
    }]
  })).map(d => d.dataValues);
  console.log('\n -------A-------- \n Board Projects of ',board_id, '\n', boardProjects, '\n ---------- \n');
  return boardProjects;
}
const getBoardProjectsValuesInRange =  async (boardId, currentColumn, movePosition, sourcePosition) => {
  const {
    locality,
    projecttype,
    type,
    year,
  } = boardId;
  let boardWhere = {
    type,
    year,
    locality,
    projecttype,
  };
  const min = Math.min(movePosition, sourcePosition);
  const max = Math.max(movePosition, sourcePosition);
  
  boardWhere = applyLocalityCondition(boardWhere);
  const boards = await Board.findAll({
    attributes: ['board_id', 'type'],
    where: boardWhere,
  });
  const boardIds = boards.map(b => b.dataValues.board_id);
  const isWorkPlan = type === 'WORK_PLAN';
  const whereBPC = {
    req_position: currentColumn
  };
  const originPositionColumnName = `originPosition${currentColumn}`;
  whereBPC.sort_order = {
    [Op.between]: [min, max]
  }
  const attributes = [
    'board_project_id',
    'project_id',
    'origin',
    originPositionColumnName,
    'code_status_type_id',
  ];
  const where = {
    board_id: {[Op.in]: boardIds},
    // [rankColumnName]: { [Op.ne]: null }
  };
  const boardProjects = (await BoardProject.findAll({
    attributes,
    where,
    order: [[{model: BoardProjectCost, as: 'boardProjectToCostData'},'sort_order', 'ASC']],
    // [{ model: BoardProjectCost, as: 'boardProjectToCostData' }, 'sort_order', 'ASC']
    include:[{
      model: BoardProjectCost,
      as: 'boardProjectToCostData',
      required: true,
      // order: [['sort_order', 'ASC']],
      where: whereBPC,
      include: [
        {
          model: ProjectCost,
          as: 'projectCostData',
          required: true,
          where: {
            is_active: true,
            code_cost_type_id: isWorkPlan ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID: COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID
          }
        }
      ]
    }]
  })).map(d => d.dataValues);
  return boardProjects;
}
export const getSortOrderValue = async (boardId, currentColumn, transaction) => {
  try {
    const boardProjects = await getBoardProjectsValues(boardId, currentColumn, 'greater',0);
    // get the max value of sort_order in boardProjects 
    const maxSortOrder = boardProjects.reduce((acc, curr) => {
      const currSortOrder = curr.boardProjectToCostData[0].sort_order;
      return currSortOrder > acc ? currSortOrder : acc;
    }, 0);
    console.log('_________ \n\n _________ maxSortOrder', maxSortOrder);
    return maxSortOrder + 1;
  } catch(error) {
    console.error('FAIL at getSortOrderValue ', error);
    throw new Error('UPDATE SORT ORDER');
  }
}
export const movePositionInsideColumn = async (boardId, currentColumn, movePosition, sourcePosition,direction, board_project_id, transaction) => {
  try {
    const boardProjects = await getBoardProjectsValuesInRange(boardId, currentColumn, movePosition, sourcePosition);
    // remove from boardProjects the board with board_project_id 
    const boardProjectIndex = boardProjects.findIndex(b => {
      return b.board_project_id === +board_project_id
    });
    // get the boardproject that is going to be removed 
    const currentBoardProject = boardProjects[boardProjectIndex];
    
    
    if (boardProjectIndex !== -1) {
      boardProjects.splice(boardProjectIndex, 1);
      const arithmeticOperation = direction === 'greater' ? '+ 1' : '- 1';
      await moveProjectCostsOnePosition(boardProjects, arithmeticOperation, transaction);
      if ( currentBoardProject ) {
        await updateSortOrder(currentBoardProject, movePosition, transaction);
      }
    }
  } catch(error) {
    console.error('FAIL at MOVE POSITION INSIDE COLUMN', error);
    throw new Error('UPDATE SORT ORDER');
  }

}
// move the cards from certain positions by 1
export const moveFromPositionOfColumn = async (boardId, currentColumn, movePosition, transaction) => {
  try {
    const boardProjects = await getBoardProjectsValues(boardId, currentColumn, 'greater', movePosition);
    console.log('Move positions of ', boardProjects, currentColumn, movePosition);
    const arithmeticOperation = '+ 1';
    await moveProjectCostsOnePosition(boardProjects, arithmeticOperation, transaction);
  } catch(error) {
    console.error('FAIL at INSERT AT BEGINNING OF COLUMN', error);
    throw new Error('UPDATE SORT ORDER');
  }
}
export const deletePositionInColumn = async (boardId, currentColumn, movePosition, transaction) => {
  try {
    const boardProjects = await getBoardProjectsValues(boardId, currentColumn, 'greater', movePosition);
    console.log('Delete positions of ', boardProjects, currentColumn, movePosition);
    const arithmeticOperation = '- 1';
    await moveProjectCostsOnePosition(boardProjects, arithmeticOperation, transaction);
  } catch(error) {
    console.error('FAIL at DELETE POSITION IN COLUMN', error);
    throw new Error('UPDATE SORT ORDER');
  }
}

export const createCostAndInsertInPosition = async (project_id, board_project_id, code_cost_type_id, project_partner_id, creator, boardId, currentColumn, movePosition, cost, transaction) => { 
  try {
    const dataProjectCost = {
      project_id: project_id,
      cost: cost,
      code_cost_type_id: code_cost_type_id,
      created_by: creator,
      modified_by: creator,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      is_active: true,
      code_data_source_type_id: CODE_DATA_SOURCE_TYPE.USER,
      project_partner_id: project_partner_id,
    };
    console.log('Null cost is created with values', dataProjectCost);
    const projectCostCreated = await saveProjectCost(dataProjectCost, transaction);
    const project_cost_id = projectCostCreated.dataValues.project_cost_id;
    const newProjectBoardData = {
      board_project_id: board_project_id,
      project_cost_id: project_cost_id,
      req_position: currentColumn,
      created_by: creator,
      last_modified_by: creator,
      sort_order: movePosition,
      last_modified_by: creator,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    console.log('new BoardProjectBoardData', newProjectBoardData);
    await moveFromPositionOfColumn(boardId, currentColumn, movePosition, transaction);
    const boardProjectCostCreated = await BoardProjectCost.create(newProjectBoardData, {transaction});  
    return boardProjectCostCreated;
  } catch (error) {
    console.error('FAIL at SAVE and create cost in position', error);
    throw new Error('UPDATE SORT ORDER');
  }
  
};