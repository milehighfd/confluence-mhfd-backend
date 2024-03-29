import {
  setCostActiveToFalse,
  saveProjectCost
} from 'bc/utils/create';
import { EditCostProjectError } from '../../errors/project.error.js';
import logger from 'bc/config/logger.js';

export const updateCosts = async (project_id, additionalcost, aditionalCostId, additionalcostdescription, creator, filtered, filterFrontOverheadCosts, transaction) => {
  try {
    await setCostActiveToFalse(project_id, transaction);
    const promises = [];
    //creating aditional cost
    promises.push(saveProjectCost({
      project_id: project_id,
      cost: !isNaN(Number(additionalcost)) ? Number(additionalcost) : 0,
      code_cost_type_id: aditionalCostId,
      cost_description: additionalcostdescription,
      created_by: creator,
      modified_by: creator,
      is_active: true,
    }, transaction));
    //creating overhead cost
    for (const [index, element] of filtered.entries()) {
      promises.push(saveProjectCost({
        project_id: project_id,
        cost: !isNaN(Number(filterFrontOverheadCosts[index])) ? Number(filterFrontOverheadCosts[index]) : 0,
        code_cost_type_id: element,
        created_by: creator,
        modified_by: creator,
        is_active: true,
      }, transaction));
    }
    const result = await Promise.all(promises)
      .then((results) => {
        logger.info('All costs saved successfully');
        return results;
      })
      .catch((error) => {
        logger.error('Error saving costs:', error);
        throw new ProjectCostsError('Error saving costs', { cause: error });
      });
    return result;
  } catch (error) {
    console.error(error);
    throw new EditCostProjectError('Error creating project or creatings statuses', { cause: error });
  }
}