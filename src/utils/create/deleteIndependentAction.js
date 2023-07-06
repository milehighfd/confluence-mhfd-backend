import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectIndependentAction = db.projectIndependentAction;

export const deleteIndependentAction = async (project_id, transaction) => {
  try {
    const project = await ProjectIndependentAction.destroy({
      where: {
        project_id: project_id
      },
      transaction
    });
    if (project) {
      logger.info('ProjectIndependentAction destroyed ');
      return true;
    } else {
      logger.info('ProjectIndependentAction not found');
      return false;
    }
  } catch (error) {
    logger.error(`Error deleting independent action: ${error}`);
    throw error;
  }
}