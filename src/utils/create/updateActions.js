import { saveProjectAction, saveProjectIndependentAction } from 'bc/utils/create';
import logger from 'bc/config/logger.js';
import db from 'bc/config/db.js';

const ProjectIndependentAction = db.projectIndependentAction;

export const updateActions = async (project_id, independentComponent, components, creator, transaction = null) => {

  const independentActionsinDB = await ProjectIndependentAction.findAll({
    where: {
      project_id: project_id,
    }
  })
  const indActionIds = independentActionsinDB.map(item => item.independent_action_id);
  const actionsToRemove = indActionIds.filter(id => 
    !JSON.parse(independentComponent).some(action => action.index === id && (action.key === undefined))
  );
  console.log('actionsToRemove', actionsToRemove);
  if (actionsToRemove.length > 0) {
    await ProjectIndependentAction.destroy({
      where: {
        independent_action_id: actionsToRemove
      },
      transaction
    });
  }
  for (const independent of JSON.parse(independentComponent)) {
    if (independent && independent.name) {
      await saveProjectIndependentAction(
      independentActionsinDB,
      {
        action_name: independent.name,
        project_id,
        cost: !isNaN(Number(independent.cost)) ? Number(independent.cost) : 0,
        action_status: independent.status,
        last_modified_by: creator,
        created_by: creator,
        index: independent.index
      }, transaction);
    } else {
      await saveProjectIndependentAction(
      independentActionsinDB,
      {
        action_name: independent.action_name,
        project_id,
        cost: !isNaN(Number(independent.cost)) ? Number(independent.cost) : 0,
        action_status: independent.action_status,
        last_modified_by: creator,
        created_by: creator,
        index: independent.index
      }, transaction);
    }
    logger.info('create independent component');
  }
  if (components){
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
  }  
};