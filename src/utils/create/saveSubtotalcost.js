import logger from 'bc/config/logger.js';
import { ProjectActionsError } from 'bc/errors/project.error.js';
import db from 'bc/config/db.js';
import { CODE_DATA_SOURCE_TYPE } from 'bc/lib/enumConstants.js';
import {
  getCostActiveForProj
} from 'bc/utils/create';
import moment from 'moment';

const ProjectCost = db.projectCost;
export const saveSubtotalcost = async (project_id, subtotalcost, creator, transaction) => {
  try {
    const PROPOSED_CODE_COST = 14;

    const currentSubtotalCost = await getCostActiveForProj(project_id, [PROPOSED_CODE_COST], transaction);
    const hasChanged = currentSubtotalCost[0]?.cost != subtotalcost;
    if (hasChanged) {
      console.log('About to update with this data', {
        is_active: 0,
        last_modified: moment().format('YYYY-MM-DD HH:mm:ss'),
        modified_by: creator
      });
      await ProjectCost.update({
        is_active: 0,
        last_modified: moment().format('YYYY-MM-DD HH:mm:ss'),
        modified_by: creator
      }, {
        where: {
          project_id: project_id,
          code_cost_type_id: PROPOSED_CODE_COST,
          is_active: true
        },
        transaction: transaction
      });
      // const pc = await ProjectCost.update({
      //   is_active: 0,
      //   last_modified: moment().format('YYYY-MM-DD HH:mm:ss'),
      //   modified_by: creator
      // }, {
      //   where: {
      //     project_id: project_id ,
      //     code_cost_type_id: PROPOSED_CODE_COST
      //   }
      // }, { transaction: transaction });
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
      console.log('About to create with ', newProjectCostData);
      const resultCreatedProjectCost = await ProjectCost.create(newProjectCostData, { transaction: transaction });
      return resultCreatedProjectCost;
    } else {
      return [];
    }
    
  } catch (error) {
    throw new ProjectActionsError('Error at creating subtotal cost ', { cause: error });
  }
};