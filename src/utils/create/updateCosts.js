import {
  setCostActiveToFalse,
  saveProjectCost,
  getCostActiveForProj
} from 'bc/utils/create';
import { EditCostProjectError } from '../../errors/project.error.js';
import logger from 'bc/config/logger.js';

export const updateCosts = async (project_id, additionalcost, aditionalCostId, additionalcostdescription, creator, overheadIds, filterFrontOverheadCosts, transaction, overheadcostdescription) => {
  try {
    
    const promises = [];
    const promisesUpdate = [];
    const currentIndependentCost = await getCostActiveForProj(project_id, [aditionalCostId], transaction);
    const currentOverheadCosts = await getCostActiveForProj(project_id, overheadIds, transaction);
    
    const independentHasChanged = currentIndependentCost[0]?.cost != additionalcost;
    if (independentHasChanged) {
      //creating aditional cost
      const additionalCost = {
        project_id: project_id,
        cost: !isNaN(Number(additionalcost)) ? Number(additionalcost) : 0,
        code_cost_type_id: aditionalCostId,
        cost_description: additionalcostdescription,
        created_by: creator,
        modified_by: creator,
        is_active: true,
      };
      promisesUpdate.push(setCostActiveToFalse(project_id,aditionalCostId, transaction));
      promises.push(saveProjectCost(additionalCost, transaction));
    }
    //creating overhead cost
    for (const [index, element] of overheadIds.entries()) {
      const currentEquivalentOverheadCost = currentOverheadCosts.find((cost) => cost.code_cost_type_id === element);
      const hasChanged = (filterFrontOverheadCosts[index] != currentEquivalentOverheadCost?.cost) || (overheadcostdescription != currentEquivalentOverheadCost?.cost_description);
      if (hasChanged) {
        const estimatedCostToSave = {
          project_id: project_id,
          cost: !isNaN(Number(filterFrontOverheadCosts[index])) ? Number(filterFrontOverheadCosts[index]) : 0,
          code_cost_type_id: element,
          created_by: creator,
          modified_by: creator,
          is_active: true,
          cost_description: overheadcostdescription,
        };
        promisesUpdate.push(setCostActiveToFalse(project_id,element, transaction));
        promises.push(saveProjectCost(estimatedCostToSave, transaction));
      } 
    }
    await Promise.all(promisesUpdate);
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