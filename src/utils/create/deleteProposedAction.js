import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectProposedAction = db.projectProposedAction;

export const deleteProposedAction = async (project_id, transaction) => {
  try {
    const project = await ProjectProposedAction.destroy({
      where: {
        project_id: project_id 
      },
      transaction
    });
    if (project) {
      logger.info('ProjectComponent destroyed');
      return true;
    } else {
      logger.info('ProjectComponent not found');
      return false;
    }
  } catch (error) {
    logger.error(`Error deleting proposed action: ${error}`);
    throw error;
  }
}