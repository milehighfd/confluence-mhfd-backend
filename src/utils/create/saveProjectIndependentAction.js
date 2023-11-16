import db from 'bc/config/db.js';
import moment from 'moment';

const ProjectIndependentAction = db.projectIndependentAction;

export const saveProjectIndependentAction = async (independentActionsinDB,component, transaction = null) => {
  try {
    let res;
    const IndependentactionToBeUpdated = independentActionsinDB.find(element => { console.log( 'condition', element.dataValues.independent_action_id === component.index, element.dataValues.independent_action_id,component.index); return element.dataValues.independent_action_id === component.index});
    const hasChanged = IndependentactionToBeUpdated && IndependentactionToBeUpdated.dataValues.action_name !== component.action_name || IndependentactionToBeUpdated && IndependentactionToBeUpdated.dataValues.cost !== component.cost; 
    if(IndependentactionToBeUpdated && hasChanged){
        res = ProjectIndependentAction.update({
          action_name: component.action_name,
          cost: component.cost,
          last_modified_by: component.last_modified_by,
          modified_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          where: {
            independent_action_id: IndependentactionToBeUpdated.dataValues.independent_action_id
          }
        },
        { transaction: transaction });
      } else if (!IndependentactionToBeUpdated) { 
        res = await ProjectIndependentAction.create(component, { transaction: transaction });
      }
    // const res = await ProjectIndependentAction.create(component, { transaction: transaction });
    return res;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}