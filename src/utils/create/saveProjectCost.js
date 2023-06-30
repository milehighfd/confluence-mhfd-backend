import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectCost = db.projectCost;

export const saveProjectCost = async (cost, transaction = null) => {
  try {
    console.log('Creating project cost with this data', cost);
    const response = await ProjectCost.create(cost, { transaction: transaction }); 
    logger.info('cost created');
    return response;
  } catch (error) {
    logger.error('error creation cost', error);
    throw error;
  }
};