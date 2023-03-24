import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectIndependentAction = db.projectIndependentAction;

const getAll = (project_id) => {
  try {
    const list = ProjectIndependentAction.findAll({
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

const deleteByProjectId= async (project_id) => {
  const project = ProjectIndependentAction.destroy({
    where: {
      project_id: project_id 
    }});
  if (project) {
    logger.info('ProjectIndependentAction destroyed ');
    return true;
  } else {
    logger.info('ProjectIndependentAction not found');
    return false;
  }
}

const saveProjectIndependentAction = async (component) => {
  try {
    const ProjectIndependentAction = ProjectIndependentAction.create(component);
    return ProjectIndependentAction;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

export default {
  getAll,
  deleteByProjectId,
  saveProjectIndependentAction
};
