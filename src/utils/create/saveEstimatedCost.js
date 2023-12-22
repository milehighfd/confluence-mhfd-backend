import logger from 'bc/config/logger.js';
import { ProjectActionsError } from 'bc/errors/project.error.js';
import db from 'bc/config/db.js';
import moment from 'moment';
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
    if (hasChanged) {
      const findOne = await ProjectCost.findOne({
        where: {
          project_id: project_id ,
          code_cost_type_id: ESTIMATED_CODE_COST 
        }
      }, { transaction: transaction });
      console.log('Found one ', findOne);
      findOne.is_active = 0,
      findOne.last_modified = moment().format('YYYY-MM-DD HH:mm:ss'),
      modified_by = creator
      await findOne.save({ transaction: transaction });

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
      const resultCreatedProjectCost = await ProjectCost.create(newProjectCostData, { transaction: transaction });
      return resultCreatedProjectCost;
    } else if (descriptionHasChanged) {
      const findOne = await ProjectCost.findOne({
        where: {
          project_id: project_id ,
          code_cost_type_id: ESTIMATED_CODE_COST 
        }
      }, { transaction: transaction });
      console.log('Found one ', findOne);
      findOne.cost_description = estimatedcostDescription,
      await findOne.save({ transaction: transaction });
      // const pc = await ProjectCost.update({
      //   cost_description: estimatedcostDescription,
      // }, {
      //   where: {
      //     project_id: project_id ,
      //     code_cost_type_id: ESTIMATED_CODE_COST 
      //   }
      // });
    } else {
      return [];
    }
    
  } catch (error) {
    logger.error('error at save estimated cost '+ error)
    throw new ProjectActionsError('Error at creating subtotal cost ', { cause: error });
  }
};