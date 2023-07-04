import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectCost = db.projectCost;

export const setCostActiveToFalse = async (project_id, transaction = null) => {
  try {
    await ProjectCost.update(
      {
        is_active: false,
      },
      {
        where: {
          project_id: project_id,
          is_active: true,
        },
        transaction: transaction
      }
    );
    return;
  } catch (error) {
    logger.error('error updating cost to false', error);
    throw error;
  }
};