import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectIndependentAction = db.projectIndependentAction;

export const deleteIndependentAction= async (project_id) => {
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