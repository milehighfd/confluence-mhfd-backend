import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import { ProjectLocalGovernmentError } from 'bc/errors/project.error.js';

const ProjectLocalGovernment = db.projectLocalGovernment;

export const createLocalGovernment = async (splitedJurisdiction, project_id, user, transaction = null) => {
  for (const j of splitedJurisdiction) {
    try {
      await ProjectLocalGovernment.create({
        code_local_government_id: parseInt(j),
        project_id: project_id,
        shape_length_ft: 0,
        last_modified_by: user.name,
        created_by: user.email,
      }, { transaction: transaction });
    } catch (error) {
      throw ProjectLocalGovernmentError('Error creating jurisdiction', { cause: error });
    }
    logger.info('created jurisdiction');
  }
};