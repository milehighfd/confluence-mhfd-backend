import logger from 'bc/config/logger.js';
import { ProjectActionsError } from 'bc/errors/project.error.js';
import db from 'bc/config/db.js';
import {
  getCostActiveForProj
} from 'bc/utils/create';
import { CODE_DATA_SOURCE_TYPE } from 'bc/lib/enumConstants.js';

const ProjectCost = db.projectCost;
export const saveEstimatedCost = async (project_id, estimatedCost, creator, estimatedcostDescription, sourceFromSystem, transaction) => {
  try {
    
    const ESTIMATED_CODE_COST = 1;
    const currentEstimatedCost = await getCostActiveForProj(project_id, [ESTIMATED_CODE_COST], transaction);
    const hasChanged = currentEstimatedCost[0]?.cost != estimatedCost;
    const CODE_DATA_SOURCE_TYPE_VALUE = sourceFromSystem ? CODE_DATA_SOURCE_TYPE.SYSTEM: CODE_DATA_SOURCE_TYPE.USER;
    console.log('saveEstimatedCost', project_id, estimatedCost, sourceFromSystem, CODE_DATA_SOURCE_TYPE_VALUE);
    const descriptionHasChanged = currentEstimatedCost[0]?.cost_description != estimatedcostDescription;
    if (descriptionHasChanged && currentEstimatedCost[0]?.cost_description == estimatedcostDescription) {
      const pc = await ProjectCost.update({
        cost_description: estimatedcostDescription,
      }, {
        where: {
          project_id: project_id ,
          code_cost_type_id: ESTIMATED_CODE_COST 
        }
      });
    }
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
        cost_description: estimatedcostDescription,
        code_data_source_type_id: CODE_DATA_SOURCE_TYPE_VALUE
      };
      console.log('About to create new project cost data', newProjectCostData);
      const resultCreatedProjectCost = await ProjectCost.create(newProjectCostData, { transaction: transaction });
      return resultCreatedProjectCost;
    } else {
      return [];
    }
    
  } catch (error) {
    logger.error('error at save estimated cost '+ error)
    throw new ProjectActionsError('Error at creating subtotal cost ', { cause: error });
  }
};