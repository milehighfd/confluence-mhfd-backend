import { updateProjectActions, saveProjectIndependentAction } from 'bc/utils/create';
import logger from 'bc/config/logger.js';
import db from 'bc/config/db.js';
import sequelize, { where } from 'sequelize';
const ProjectIndependentAction = db.projectIndependentAction;
const ProjectProposedAction = db.projectProposedAction;
const { Op } = sequelize;

const arraysMatch = (actionIds, ActionsFromFrontend) => {
  // Check if the arrays have the same length
  if (actionIds.length !== ActionsFromFrontend.length) {
      return false;
  }

  // Check if each objectid in actionIds is present in ActionsFromFrontend
  for (let i = 0; i < actionIds.length; i++) {
      const actionId = actionIds[i];
      const found = ActionsFromFrontend.some(item => item.objectid === actionId);

      // If the objectid is not found in ActionsFromFrontend, return false
      if (!found) {
          return false;
      }
  }

  // If all objectids are found, return true
  return true;
}
export const updateActions = async (project_id, independentComponent, actions, creator, transaction = null) => {

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
        independent_action_id: {[Op.in]: actionsToRemove}
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
  if (actions){
    const ProjectProposedActionInDB = await ProjectProposedAction.findAll({
      where: {
        project_id: project_id,
      }
    })
    const actionIds = ProjectProposedActionInDB.map(item => item.object_id);
    console.log('ProjectProposedActionInDB', ProjectProposedActionInDB);
    console.log('actionIds', actionIds);
    console.log('compotents from frontned', actions);
    console.log('arraysMatch', arraysMatch(actionIds, JSON.parse(actions)));
    if (!arraysMatch(actionIds, JSON.parse(actions))) {
      const actionsToRemove = actionIds.filter(id => 
        !JSON.parse(actions).some(action => action.objectid === id )
      );
      // get actionids minus actionstoremove 
      const previousActionsNotRemoved = actionIds.filter(id => !actionsToRemove.includes(id));
      
      console.log('actionsToRemoveb remove this ', actionsToRemove, 'previousActionsNotRemoved', previousActionsNotRemoved);
      if (actionsToRemove.length > 0) {
       const destroyecactions = await ProjectProposedAction.destroy({
          where: {
            object_id: { [Op.in]: actionsToRemove},
            project_id: project_id
          },
          transaction
        });
        console.log('destroyed values', destroyecactions);
      }
      await updateProjectActions(JSON.parse(actions),previousActionsNotRemoved, project_id, creator, transaction);
      logger.info('All components saved successfully');
    }
  }  
};