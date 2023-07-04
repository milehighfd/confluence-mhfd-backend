import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectProposedAction = db.projectProposedAction;

export const deleteProposedAction = async (project_id) => {
  const project = ProjectProposedAction.destroy({
    where: {
      project_id: project_id 
    }});
  if (project) {
    logger.info('ProjectComponent destroyed ');
    return true;
  } else {
    logger.info('ProjectComponent not found');
    return false;
  }
}