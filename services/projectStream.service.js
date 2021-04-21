const db = require('../config/db');
const logger = require('../config/logger');
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

const saveProjectStream = async (ProjectStream) => {
  logger.info('create ProjectStream ' + JSON.stringify(ProjectStream));
  try {
    const newProjectStream = await ProjectStream.create(ProjectStream);
    return newProjectStream;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

module.exports = {
  getAll,
  deleteByProjectId,
  saveProjectStream
};
