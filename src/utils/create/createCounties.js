import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import { ProjectCountiesError } from '../../errors/project.error.js';

const ProjectCounty = db.projectCounty;

export const createCounties = async (splitedCounty, project_id, user, transaction = null) => {
  for (const c of splitedCounty) {
    try {
      await ProjectCounty.create({
        state_county_id: c,
        project_id: project_id,
        shape_length_ft: 0,
        last_modified_by: user.name,
        created_by: user.email,
      }, { transaction: transaction });
    } catch (error) {
      throw ProjectCountiesError('Error creating county', { cause: error });
    }
    logger.info('created county');
  }
};
