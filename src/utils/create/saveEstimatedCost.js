import logger from 'bc/config/logger.js';
import { ProjectActionsError } from 'bc/errors/project.error.js';
import db from 'bc/config/db.js';

const ProjectCost = db.projectCost;
export const saveEstimatedCost = async (project_id, estimatedCost, creator, transaction) => {
  try {
    const ESTIMATED_CODE_COST = 1;

    console.log('\n\n estimated cost \n', estimatedCost);
    const pc = await ProjectCost.update({
      is_active: 0,
    }, {
      where: {
        project_cost_id: project_id ,
        code_cost_type_id: ESTIMATED_CODE_COST
      }
    });
    console.log('PC', pc);
    let mainModifiedDate = new Date();
    const newProjectCostData = {
      cost: +estimatedCost,
      project_id: project_id,
      code_cost_type_id: ESTIMATED_CODE_COST,
      created_by: creator,
      modified_by: creator,
      is_active: 1,
      last_modified: mainModifiedDate,
      cost_description: 'Estimated Cost'
    };
    console.log('Please create with ', newProjectCostData);
    const resultCreatedProjectCost = await ProjectCost.create(newProjectCostData, { transaction: transaction });
    console.log('Should have created ', newProjectCostData);
    return resultCreatedProjectCost;
  } catch (error) {
    throw new ProjectActionsError('Error at creating subtotal cost ', { cause: error });
  }
};