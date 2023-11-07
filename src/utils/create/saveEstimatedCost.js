import logger from 'bc/config/logger.js';
import { ProjectActionsError } from 'bc/errors/project.error.js';
import db from 'bc/config/db.js';
import {
  getCostActiveForProj
} from 'bc/utils/create';

const ProjectCost = db.projectCost;
export const saveEstimatedCost = async (project_id, estimatedCost, creator, estimatedcostDescription, transaction) => {
  try {
    const ESTIMATED_CODE_COST = 1;
    const currentEstimatedCost = await getCostActiveForProj(project_id, [ESTIMATED_CODE_COST], transaction);
    const hasChanged = currentEstimatedCost[0]?.cost != estimatedCost || currentEstimatedCost[0]?.cost_description != estimatedcostDescription;
    if (hasChanged) {
      const pc = await ProjectCost.update({
        is_active: 0,
      }, {
        where: {
          project_id: project_id ,
          code_cost_type_id: ESTIMATED_CODE_COST 
        }
      });
      let mainModifiedDate = new Date();
      const newProjectCostData = {
        cost: +estimatedCost,
        project_id: project_id,
        code_cost_type_id: ESTIMATED_CODE_COST,
        created_by: creator,
        modified_by: creator,
        is_active: 1,
        last_modified: mainModifiedDate,
        cost_description: estimatedcostDescription
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