import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectProposedAction = db.projectProposedAction;

const getAll = (project_id) => {
  try {
    const list = ProjectProposedAction.findAll({
      where: {
        project_id: project_id
      }
    });
    return list;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const deleteByProjectId = async (project_id) => {
  const project = ProjectProposedAction.destroy({
    where: {
      project_id: project_id 
    }});
  if (project) {
    logger.info('ProjectComponent destroyed ');
    return true;
  } else {
    logger.info('ProjectComponent not found');
    return false;
  }
}

const saveProjectAction = async (action, transaction = null) => {
  try {
    const created = await ProjectProposedAction.create(action, { transaction: transaction });
    return created;
  } catch(error) {
    console.log('error at: ', error);
    throw error;
  }
}

export default {
  getAll,
  deleteByProjectId,
  saveProjectAction
};
