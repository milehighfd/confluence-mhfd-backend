import { saveProjectAction, saveProjectIndependentAction } from 'bc/utils/create';
import logger from 'bc/config/logger.js';
import { ProjectActionsError } from 'bc/errors/project.error.js';

export const saveActions = async (project_id, independetComponent, components, creator, transaction) => {
  try {
    // Insert independent components
    if (independetComponent) {
      for (const independent of JSON.parse(independetComponent)) {
        await saveProjectIndependentAction({
          action_name: independent.name,
          project_id: project_id,
          cost: !isNaN(Number(independent.cost)) ? Number(independent.cost) : 0,
          action_status: independent.status,
          last_modified_by: creator,
          created_by: creator          
        }, transaction);
        logger.info('create independent component');
      }
    }
    // Insert proposed components
    if (components) {
      for (const component of JSON.parse(components)) {
        const action = {
          project_id: project_id,
          object_id: component.objectid,
          source_table_name: component.table,
          last_modified_by: creator,
          created_by: creator,
        };
        await saveProjectAction(action, transaction);
        logger.info('create component');
      }
    }
  } catch (error) {
    throw ProjectActionsError('Error creating actions', { cause: error });
  }
};