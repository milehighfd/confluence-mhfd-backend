import { saveProjectCost } from 'bc/utils/create';
import logger from 'bc/config/logger.js';

export const saveCosts = async (project_id, additionalcost, aditionalCostId, additionalcostdescription, creator, filtered, filterFrontOverheadCosts, transaction) => {
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
    logger.info('Creating cost with this data', {
      project_id: project_id,
      cost: !isNaN(Number(filterFrontOverheadCosts[index])) ? Number(filterFrontOverheadCosts[index]) : 0,
      code_cost_type_id: element,
      created_by: creator,
      modified_by: creator,
      is_active: true,
      transaction: transaction
    });
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
    .then(() => {
      logger.info('All costs saved successfully');
    })
    .catch((error) => {
      logger.error('Error saving costs:', error);
      throw error;
    });
  return result;
};