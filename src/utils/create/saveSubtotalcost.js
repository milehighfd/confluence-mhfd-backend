import logger from 'bc/config/logger.js';
import { ProjectActionsError } from 'bc/errors/project.error.js';
import db from 'bc/config/db.js';
import { CODE_DATA_SOURCE_TYPE } from 'bc/lib/enumConstants.js';
import {
  getCostActiveForProj
} from 'bc/utils/create';

const ProjectCost = db.projectCost;
export const saveSubtotalcost = async (project_id, subtotalcost, creator, transaction) => {
  try {
    const PROPOSED_CODE_COST = 14;

    const currentSubtotalCost = await getCostActiveForProj(project_id, [PROPOSED_CODE_COST], transaction);
    const hasChanged = currentSubtotalCost[0]?.cost != subtotalcost;
    if (hasChanged) {
      const pc = await ProjectCost.update({
        is_active: 0,
      }, {
        where: {
          project_id: project_id ,
          code_cost_type_id: PROPOSED_CODE_COST
        }
      });
      let mainModifiedDate = new Date();
      const newProjectCostData = {
        cost: +subtotalcost,
        project_id: project_id,
        code_cost_type_id: PROPOSED_CODE_COST,
        created_by: creator,
        modified_by: creator,
        is_active: 1,
        last_modified: mainModifiedDate,
        cost_description: 'Proposed (Formally Component Cost)',
        code_data_source_type_id: CODE_DATA_SOURCE_TYPE.SYSTEM
      };
      const resultCreatedProjectCost = await ProjectCost.create(newProjectCostData, { transaction: transaction });
      return resultCreatedProjectCost;
    } else {
      return [];
    }
    
  } catch (error) {
    throw new ProjectActionsError('Error at creating subtotal cost ', { cause: error });
  }
};