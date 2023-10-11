import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import { Op } from 'sequelize';
const ProjectCost = db.projectCost;

export const setCostActiveToFalse = async (project_id, transaction = null) => {
  const WORK_REQUEST_CODE_COST_TYPE_ID = 22;
  try {
    console.log('***************\n\n************\n About to update alllllll', project_id, '**********************\n\n\n***********\n\n');
    await ProjectCost.update(
      {
        is_active: false,
      },
      {
        where: {
          project_id: project_id,
          is_active: true,
          code_cost_type_id: {[Op.ne]: WORK_REQUEST_CODE_COST_TYPE_ID}
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