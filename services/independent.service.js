const db = require('../config/db');
const logger = require('../config/logger');
const IndependentComponent = db.independentComponent;

const getAll = (projectid) => {
  try {
    const list = IndependentComponent.findAll({
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
  const project = IndependentComponent.destroy({
    where: {
      projectid: projectid 
    }});
  if (project) {
    logger.info('IndependentComponent destroyed ');
    return true;
  } else {
    logger.info('IndependentComponent not found');
    return false;
  }
}

const saveIndependentComponent = async (independent) => {
  logger.info('create ProjectComponent ' + JSON.stringify(independent));
  try {
    const newProjectComponent = await IndependentComponent.create(independent);
    return newProjectComponent;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

module.exports = {
  getAll,
  deleteByProjectId,
  saveIndependentComponent
};
