import db from 'bc/config/db.js';

const ProjectIndependentAction = db.projectIndependentAction;

export const saveProjectIndependentAction = async (component, transaction = null) => {
  try {
    const res = await ProjectIndependentAction.create(component, { transaction: transaction });
    return res;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}