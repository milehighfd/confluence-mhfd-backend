import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectIndependentAction = db.projectIndependentAction;

const getAll = async (project_id) => {
  try {
    const list = await ProjectIndependentAction.findAll({
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
  const project = await ProjectIndependentAction.destroy({
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

const saveProjectIndependentAction = async (component, transaction = null) => {
  try {
    const res = await ProjectIndependentAction.create(component, { transaction: transaction });
    return res;
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
