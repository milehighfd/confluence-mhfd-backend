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
export const moveProjectCostsOnePosition = async (boardProjects, transaction) => { 
  // iterate though boardprojects and get the project_cost_id then update the sort_order and add 1 to each
  try {
    const boardProjectCostIds = boardProjects.map(b => b.boardProjectToCostData[0].board_project_cost_id);
    console.log('boardprojectsosids', boardProjectCostIds);
    const boardProjectCostsUpdate = await BoardProjectCost.update(
      { sort_order: sequelize.literal('sort_order + 1') },
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
const getBoardProjectsValues =  async (boardId, currentColumn, movePosition) => {
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
  const originPositionColumnName = `originPosition${currentColumn}`;
  const attributes = [
    'board_project_id',
    'project_id',
    'projectname',
    // rankColumnName,
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
      where: {
        req_position: currentColumn,
        sort_order: {[Op.gte]: movePosition}
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
    }]
  })).map(d => d.dataValues);
  return boardProjects;
}
export const getSortOrderValue = async (boardId, currentColumn, transaction) => {
  try {
    const boardProjects = await getBoardProjectsValues(boardId, currentColumn, 0);
    // get the max value of sort_order in boardProjects 
    const maxSortOrder = boardProjects.reduce((acc, curr) => {
      const currSortOrder = curr.boardProjectToCostData[0].sort_order;
      return currSortOrder > acc ? currSortOrder : acc;
    }, 0);
    console.log('_________ \n\n _________ maxSortOrder', maxSortOrder);
    return maxSortOrder + 1;
  } catch(error) {
    console.error('FAIL at getSortOrderValue ', error);
    return [];
  }
}
// move the cards from certain positions by 1
export const moveFromPositionOfColumn = async (boardId, currentColumn, movePosition, transaction) => {
  try {
    const boardProjects = await getBoardProjectsValues(boardId, currentColumn, movePosition);
    console.log('Move positions of ', boardProjects, currentColumn, movePosition);
    await moveProjectCostsOnePosition(boardProjects, transaction);
  } catch(error) {
    console.error('FAIL at INSERT AT BEGINNING OF COLUMN', error);
    return [];
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
    const boardProjectCostCreated = await BoardProjectCost.create(newProjectBoardData);  
    return boardProjectCostCreated;
  } catch (error) {
    console.error('FAIL at SAVE and create cost in position', error);
    return [];
  }
  
};