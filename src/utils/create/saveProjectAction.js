import db from 'bc/config/db.js';

const ProjectProposedAction = db.projectProposedAction;

export const saveProjectAction = async (action, transaction = null) => {
  try {

    const created = await ProjectProposedAction.create(action, { transaction: transaction });

    return created;
  } catch(error) {
    console.log('error at save projectaction: ', error);
    throw error;
  }
}