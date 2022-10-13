import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectComponent = db.projectComponent;

const getAll = (projectid) => {
  try {
    const list = ProjectComponent.findAll({
      where: {
        projectid: projectid
      }
    });
    return list;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const deleteByProjectId= async (projectid) => {
  const project = ProjectComponent.destroy({
    where: {
      projectid: projectid 
    }});
  if (project) {
    logger.info('ProjectComponent destroyed ');
    return true;
  } else {
    logger.info('ProjectComponent not found');
    return false;
  }
}

const saveProjectComponent = async (projectComponent) => {
  logger.info('create ProjectComponent ' + JSON.stringify(projectComponent));
  try {
    const newProjectComponent = await ProjectComponent.create(projectComponent);
    return newProjectComponent;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

export default {
  getAll,
  deleteByProjectId,
  saveProjectComponent
};
