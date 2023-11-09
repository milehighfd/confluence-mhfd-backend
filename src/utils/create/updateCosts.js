import {
  setCostActiveToFalse,
  saveProjectCost,
  getCostActiveForProj,
  updateDescriptionOnly
} from 'bc/utils/create';
import { EditCostProjectError } from '../../errors/project.error.js';
import logger from 'bc/config/logger.js';
import { CODE_DATA_SOURCE_TYPE } from 'bc/lib/enumConstants.js';

export const updateCosts = async (project_id, additionalcost, aditionalCostId, additionalcostdescription, creator, overheadIds, filterFrontOverheadCosts, overheadcostdescription, userChangedOverhead, userChangedAdditional, transaction) => {
  try {
    const overheadCostUser = JSON.parse(userChangedOverhead);
    const promises = [];
    const promisesUpdate = [];
    const currentAdditionalCost = await getCostActiveForProj(project_id, [aditionalCostId], transaction);
    const currentOverheadCosts = await getCostActiveForProj(project_id, overheadIds, transaction);
    
    const aditionalHasChanged = currentAdditionalCost[0]?.cost != additionalcost;
    const additionalDescriptionHasChanged = currentAdditionalCost[0]?.cost_description != additionalcostdescription;
    if (aditionalHasChanged) {
      //creating aditional cost
      const additionalCost = {
        project_id: project_id,
        cost: !isNaN(Number(additionalcost)) ? Number(additionalcost) : 0,
        code_cost_type_id: aditionalCostId,
        cost_description: additionalcostdescription,
        created_by: creator,
        modified_by: creator,
        is_active: true,
        code_data_source_type_id:  userChangedAdditional? CODE_DATA_SOURCE_TYPE.USER : CODE_DATA_SOURCE_TYPE.SYSTEM
      };
      console.log('Data for update addiciont', additionalCost, 'userChangedAdditional', userChangedAdditional);
      promisesUpdate.push(setCostActiveToFalse(project_id,aditionalCostId, transaction));
      promises.push(saveProjectCost(additionalCost, transaction));
    } else if (additionalDescriptionHasChanged) {
      promisesUpdate.push(updateDescriptionOnly(project_id, aditionalCostId, additionalcostdescription, transaction));
    }
    //creating overhead cost
    for (const [index, element] of overheadIds.entries()) {
      const currentEquivalentOverheadCost = currentOverheadCosts.find((cost) => cost.code_cost_type_id === element);
      const hasChanged = (filterFrontOverheadCosts[index] != currentEquivalentOverheadCost?.cost); 
      if (hasChanged) {
        const overheadCostToSave = {
          project_id: project_id,
          cost: !isNaN(Number(filterFrontOverheadCosts[index])) ? Number(filterFrontOverheadCosts[index]) : 0,
          code_cost_type_id: element,
          created_by: creator,
          modified_by: creator,
          is_active: true,
          cost_description: overheadcostdescription,
          code_data_source_type_id: overheadCostUser[index] ? CODE_DATA_SOURCE_TYPE.USER: CODE_DATA_SOURCE_TYPE.SYSTEM
        };
        promisesUpdate.push(setCostActiveToFalse(project_id,element, transaction));
        promises.push(saveProjectCost(overheadCostToSave, transaction));
      } else if (overheadcostdescription != currentEquivalentOverheadCost?.cost_description) {
        promisesUpdate.push(updateDescriptionOnly(project_id, element, overheadcostdescription, transaction));
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