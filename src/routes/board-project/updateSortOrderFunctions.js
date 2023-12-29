import db from 'bc/config/db.js';
import { COST_IDS } from 'bc/lib/enumConstants.js';
import sequelize from 'sequelize';
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
export const insertFromPositionOfColumn = async (boardId, currentColumn, movePosition, transaction) => {
  try {
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
    console.log('BOARD PROJECT CHECK ', boardProjects);
    // TODO: now move all sort values to +1 so that the new one is at the beginning
    moveProjectCostsOnePosition(boardProjects, transaction)
    console.log('\n ****************** \n\n ************* \n\n ************ \n\n THESE are the values for boardproject ', boardProjects, '\n\n ********* \n\n ');
  } catch(error) {
    console.error('FAIL at INSERT AT BEGINNING OF COLUMN', error);
    return [];
  }
}