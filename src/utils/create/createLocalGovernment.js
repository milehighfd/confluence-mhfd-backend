import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectLocalGovernment = db.projectLocalGovernment;

export const createLocalGovernments = async (splitedJurisdiction, project_id, user, transaction = null) => {
  const t = transaction ? await transaction : null;
  for (const j of splitedJurisdiction) {
    try {
      await ProjectLocalGovernment.create({
        code_local_government_id: parseInt(j),
        project_id: project_id,
        shape_length_ft: 0,
        last_modified_by: user.name,
        created_by: user.email,
      }, { transaction: t });
    } catch (error) {
      logger.error('cannot create jurisdiction ' + error);
      throw error;
    }
    logger.info('created jurisdiction');
  }
};