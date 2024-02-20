import { saveProjectCost } from 'bc/utils/create';
import db from 'bc/config/db.js';
import { ProjectCostsError } from '../../errors/project.error.js';
import { CODE_DATA_SOURCE_TYPE, GAP, INITIAL_GAP } from 'bc/lib/enumConstants.js';
import { moveFromPositionOfColumn } from 'bc/routes/board-project/updateSortOrderFunctions.js';
import moment from 'moment';

const BoardProjectCost = db.boardProjectCost;
const BoardProject = db.boardProject;
const ProjectCost = db.projectCost;
const Board = db.board;

export const saveWorkspaceCostInit = async (project_id, board_project_id, code_cost_type_id, project_partner_id, creator, boardId, transaction) => { 
  try {
    const dataProjectCost = {
      project_id: project_id,
      cost: null,
      code_cost_type_id: code_cost_type_id,
      created_by: creator,
      modified_by: creator,
      is_active: true,
      code_data_source_type_id: CODE_DATA_SOURCE_TYPE.SYSTEM,
      project_partner_id: project_partner_id,
    };
    console.log('Null cost is created with values', dataProjectCost);
    const projectCostCreated = await saveProjectCost(dataProjectCost, transaction);
    const project_cost_id = projectCostCreated.dataValues.project_cost_id;
    const WORK_SPACE_COLUMN = 0;

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

    const board = await Board.findOne({
      where: boardWhere,
      transaction: transaction,
    });

    let boardIdValue = board.dataValues.board_id;
    if (!boardIdValue) {
      const currentDate = moment().format('YYYY-MM-DD');
      createdBoard = await Board.create(
        {
          ...boardWhere,
          status: 'Under Review',
          created_by: creator,
          last_modified_by: creator,
          createdAt: currentDate,
          updatedAt: currentDate
        }, 
        { transaction });
    }
    const firstSortOrder = await BoardProjectCost.findOne({
      attributes: ['sort_order'],
      include: [{
        model: BoardProject,
        required: true,
        as: 'boardProjectData',
        where: {
          board_id: boardIdValue,
        }
      }, {
        model: ProjectCost,
        required: true,
        as: 'projectCostData',
        where: {
          is_active: true,
          code_cost_type_id: code_cost_type_id
        }
      }],
      where: {
        req_position: WORK_SPACE_COLUMN,
      },
      order: [['sort_order', 'ASC']],
      transaction
    });
    console.log('firstSortOrder', firstSortOrder)
    const movePosition = firstSortOrder ? firstSortOrder.dataValues.sort_order - GAP : INITIAL_GAP;

    //await moveFromPositionOfColumn(boardId, currentColumn, movePosition, transaction);
    const boardProjectCostCreated = await BoardProjectCost.create({
      board_project_id: board_project_id,
      project_cost_id: project_cost_id,
      req_position: WORK_SPACE_COLUMN,
      created_by: creator,
      last_modified_by: creator,
      sort_order: movePosition
    }, { transaction });

    return boardProjectCostCreated;
  } catch (error) {
    console.error('FAIL at SAVE WORKSPACE COST INIT', error);
    throw error;
  }  
};
