import { saveProjectAction, saveProjectIndependentAction } from 'bc/utils/create';
import logger from 'bc/config/logger.js';

export const updateActions = async (project_id, independentComponent, components, creator, transaction = null) => {
  for (const independent of JSON.parse(independentComponent)) {
    console.log(independent);
    if (independent && independent.name) {
      await saveProjectIndependentAction({
        action_name: independent.name,
        project_id,
        cost: !isNaN(Number(independent.cost)) ? Number(independent.cost) : 0,
        action_status: independent.status,
        last_modified_by: creator,
        created_by: creator,        
      }, transaction);
    } else {
      await saveProjectIndependentAction({
        action_name: independent.action_name,
        project_id,
        cost: !isNaN(Number(independent.cost)) ? Number(independent.cost) : 0,
        action_status: independent.action_status,
        last_modified_by: creator,
        created_by: creator        
      }, transaction);
    }
    logger.info('create independent component');
  }

  for (const component of JSON.parse(components)) {
    const action = {
      project_id,
      object_id: component.objectid,
      source_table_name: component.table,
      last_modified_by: creator,
      created_by: creator,      
    };
    await saveProjectAction(action,transaction);
  }
  logger.info('All components saved successfully');
};