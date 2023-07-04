import { 
  setCostActiveToFalse,
  saveProjectCost
} from 'bc/utils/create';

export const updateCosts = async (project_id, additionalcost, aditionalCostId, additionalcostdescription, creator, splitedOverheadcost, filtered, transaction) => {
  await setCostActiveToFalse(project_id, transaction);
  await saveProjectCost(
    {
      project_id,
      cost: !isNaN(Number(additionalcost)) ? Number(additionalcost) : 0,
      code_cost_type_id: aditionalCostId,
      cost_description: additionalcostdescription || null,
      created_by: creator,
      modified_by: creator,
      is_active: true
    }, transaction
  );    
  filtered.forEach(async (element, index) => {
    await saveProjectCost(
      {
        project_id,
        cost: !isNaN(Number(splitedOverheadcost[index+1])) ? Number(splitedOverheadcost[index+1]) : 0,
        code_cost_type_id: element,
        created_by: creator,
        modified_by: creator,
        is_active: true
      }, transaction
    );
  });
}