import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectCost = db.projectCost;

const saveProjectCost = async (cost) => {
  try {
    const response  = await ProjectCost.create(cost);
    logger.info('cost created');
    return response;
  } catch(error) {
    logger.error('error creation cost');
    throw error;
  }
}

const updateProjectCost = async (cost, project_id) => {
  try {
    const response  = await ProjectCost.update({
      ...cost
    },{ where: { project_id: project_id }});
    logger.info('cost created');
    return response;
  } catch(error) {
    logger.error('error creation cost');
    throw error;
  }
}



export default {
  saveProjectCost,
  updateProjectCost
};
