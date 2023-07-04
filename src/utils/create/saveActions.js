import { saveProjectAction, saveProjectIndependentAction } from 'bc/utils/create';
import logger from 'bc/config/logger.js';
import { ProjectActionsError } from 'bc/errors/project.error.js';

export const saveActions = async (project_id, independentComponent, components, creator, transaction) => {
  try {
    const promises = [];
    // Insert independent components
    if (independentComponent) {
      for (const independent of JSON.parse(independentComponent)) {
        const promise = saveProjectIndependentAction({
          action_name: independent.name,
          project_id: project_id,
          cost: !isNaN(Number(independent.cost)) ? Number(independent.cost) : 0,
          action_status: independent.status,
          last_modified_by: creator,
          created_by: creator          
        }, transaction);
        promises.push(promise);
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
        const promise = saveProjectAction(action, transaction);
        promises.push(promise);
      }
    }
    const result = await Promise.all(promises)
      .then((results) => {
        const resultObj = {};
        for (const [index, result] of results.entries()) {
          if (independentComponent && index < JSON.parse(independentComponent).length) {
            resultObj[`independentCreated${index}`] = result;
          } else {
            resultObj[`componentCreated${index - JSON.parse(independentComponent).length}`] = result;
          }
        }
        logger.info('All actions saved successfully');
        return resultObj;
      })
      .catch((error) => {
        logger.error('Error saving actions:', error);
        throw ProjectActionsError('Error saving actions', { cause: error });
      });
    return result;
  } catch (error) {
    throw new ProjectActionsError('Error creating actions', { cause: error });
  }
};