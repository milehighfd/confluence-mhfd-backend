import db from 'bc/config/db.js';
import { saveProjectAction } from 'bc/utils/create';
import moment from 'moment';

const ProjectProposedAction = db.projectProposedAction;


export const updateProjectActions = async ( actionsToInsertOrUpdate,previousActions, project_id,creator, transaction = null) => {
  try{
    console.log('ACtions to insert or update', actionsToInsertOrUpdate, 'previous actions', previousActions, 'project id', project_id);
    // find intersection between actionstoinserorupdate and previous actions
    const actionsToUpdate = actionsToInsertOrUpdate.filter(action => previousActions.some(prevAction => prevAction === action.objectid));
    // find actionstoinsertorupdate that are not in previous actions
    const actionsToInsert = actionsToInsertOrUpdate.filter(action => !previousActions.some(prevAction => prevAction === action.objectid));
    console.log('Actions to update', actionsToUpdate, 'actiostosinsert ', actionsToInsert);
    for(const action of actionsToInsert) {
      const newaction = {
        project_id: project_id,
        object_id: action.objectid,
        source_table_name: action.table,
        last_modified_by: creator,
        created_by: creator,
        modified_date: moment()     
      };
      console.log('Inserting new actions', newaction);
      const savedAction = await saveProjectAction(newaction, transaction);
      console.log('Saved Action', savedAction);
    }
    const promises = [];
    for(const action of actionsToUpdate) {
      console.log('updating action', moment(), action, creator);
      promises.push(ProjectProposedAction.update({
        modified_date: moment(),
        last_modified_by: creator,
      },{
        where: {
          project_id: project_id,
          object_id: action.objectid,
          source_table_name: action.table
        },
        transaction: transaction
      }));
    }
    const updatedvalues = await Promise.all(promises);

    return updatedvalues;


  }catch(error){
    console.log('update project action error at: ', error);
    throw error;
  }
}