import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import { Op } from 'sequelize';
import moment from 'moment';
const ProjectCost = db.projectCost;

export const getCostActiveForProj = async (project_id, code_cost_type_ids, transaction = null) => {
  try{
    const pc = await ProjectCost.findAll({
      where: {
        project_id: project_id,
        code_cost_type_id: {
          [Op.in]: code_cost_type_ids
        },
        is_active: true,
      },
      transaction: transaction
    });
    return pc;
  } catch(error) {
    logger.error('error getting active cost', error);
    throw error;
  }
}
export const setCostActiveToFalse = async (project_id, code_cost_type_id, modifier, transaction = null) => {
  try {
    await ProjectCost.update(
      {
        is_active: false,
        last_modified: moment().format('YYYY-MM-DD HH:mm:ss'),
        modified_by: modifier
      },
      {
        where: {
          project_id: project_id,
          is_active: true,
          code_cost_type_id: code_cost_type_id
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

export const updateDescriptionOnly = async (project_id, cost_type_id, newDescription, transaction = null) => {
  try {
    await ProjectCost.update(
      {
        cost_description: newDescription,
        last_modified: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      {
        where: {
          project_id: project_id,
          is_active: true,
          code_cost_type_id: cost_type_id
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