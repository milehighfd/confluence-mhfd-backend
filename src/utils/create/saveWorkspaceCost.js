import { saveProjectCost } from 'bc/utils/create';
import db from 'bc/config/db.js';
import { ProjectCostsError } from '../../errors/project.error.js';
import { CODE_DATA_SOURCE_TYPE } from 'bc/lib/enumConstants.js';
import { moveFromPositionOfColumn } from 'bc/routes/board-project/updateSortOrderFunctions.js';
const BoardProjectCost = db.boardProjectCost;
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
    const currentColumn = 0;
    const movePosition = 1;
    await moveFromPositionOfColumn(boardId, currentColumn, movePosition, transaction);
    const boardProjectCostCreated = await BoardProjectCost.create({
      board_project_id: board_project_id,
      project_cost_id: project_cost_id,
      req_position: currentColumn,
      created_by: creator,
      last_modified_by: creator,
      sort_order: movePosition
  });  
    return boardProjectCostCreated;
  } catch (error) {
    console.error('FAIL at SAVE WORKSPACE COST INIT', error);
    return [];
  }
  
};