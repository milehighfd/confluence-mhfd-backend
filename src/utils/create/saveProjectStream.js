import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectStream = db.projectStream;

export const saveProjectStream = async (projectStream, transaction = null) => {
  logger.info('create ProjectStream ' + JSON.stringify(projectStream));
  try {
    const newProjectStream = await ProjectStream.create(projectStream, { transaction });
    return newProjectStream;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}