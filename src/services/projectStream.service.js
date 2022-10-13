import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectStream = db.projectStream;

const getAll = (projectid) => {
  try {
    const list = ProjectStream.findAll({
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
  const project = ProjectStream.destroy({
    where: {
      projectid: projectid 
    }});
  if (project) {
    logger.info('ProjectStream destroyed ');
    return true;
  } else {
    logger.info('ProjectStream not found');
    return false;
  }
}

const saveProjectStream = async (projectStream) => {
  logger.info('create ProjectStream ' + JSON.stringify(projectStream));
  try {
    const newProjectStream = await ProjectStream.create(projectStream);
    return newProjectStream;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

export default {
  getAll,
  deleteByProjectId,
  saveProjectStream
};
