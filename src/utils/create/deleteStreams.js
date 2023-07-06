import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectStream = db.project_stream;

export const deleteStreams = async (project_id, transaction) => {
  try {
    const project = await ProjectStream.destroy({
      where: {
        project_id: project_id 
      },
      transaction: transaction
    });
    if (project) {
      logger.info('ProjectStream destroyed ');
      return true;
    } else {
      logger.info('ProjectStream not found');
      return false;
    }
  } catch (error) {
    logger.error(`Error deleting project streams: ${error}`);
    return false;
  }
}