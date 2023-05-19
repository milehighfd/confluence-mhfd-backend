import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectCost = db.projectCost;

const saveProjectCost = async (cost) => {
  try {
    console.log('Creating project cost with this data', cost);
    const response = await ProjectCost.create(cost);
    logger.info('cost created');
    return response;
  } catch (error) {
    logger.error('error creation cost');
    throw error;
  }
};

const updateProjectOverhead = async (cost, project_id, code_cost_type_id) => {
  try {
    await ProjectCost.update(
      {
        is_active: false,
      },
      {
        where: {
          project_id: project_id,
          code_cost_type_id: code_cost_type_id,
          is_active: true,
        },
      }
    );
    logger.info('older cost updated');
    const response = await ProjectCost.create(cost);
    logger.info('cost updated');
    return response;
  } catch (error) {
    logger.error('error creation cost');
    throw error;
  }
};

export default {
  saveProjectCost,
  updateProjectOverhead,
};
