import { saveProjectCost } from 'bc/utils/create';
import logger from 'bc/config/logger.js';
import { ProjectCostsError } from '../../errors/project.error.js';
import { CODE_DATA_SOURCE_TYPE } from 'bc/lib/enumConstants.js';

export const saveCosts = async (project_id, additionalcost, aditionalCostId, additionalcostdescription, creator, filtered, filterFrontOverheadCosts, overheadcostdescription, transaction) => {
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
    code_data_source_type_id: CODE_DATA_SOURCE_TYPE.USER
  }, transaction));
  //creating overhead cost
  for (const [index, element] of filtered.entries()) {
    promises.push(saveProjectCost({
      project_id: project_id,
      cost: !isNaN(Number(filterFrontOverheadCosts[index])) ? Number(filterFrontOverheadCosts[index]) : 0,
      code_cost_type_id: element,
      cost_description: overheadcostdescription,
      created_by: creator,
      modified_by: creator,
      is_active: true,
      code_data_source_type_id: CODE_DATA_SOURCE_TYPE.USER
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
};