import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectDetail = db.projectDetail;

export const saveStudy = async (
  project_id,
  code_study_reason_id,
  last_modified_by,
  created_by,
  transaction = null,
  otherReason = null,
) => {
  try {
    await ProjectDetail.create({
      maintenance_frequency: 0,
      is_public_ownership: 0,
      project_id: project_id,
      code_study_reason_id: code_study_reason_id,
      last_modified_by: last_modified_by,
      created_by: created_by
    }, { transaction });

    if (otherReason) {
      await ProjectDetail.create({
        maintenance_frequency: 0,
        is_public_ownership: 0,
        project_id: project_id,
        comment: otherReason,
        code_study_reason_id: code_study_reason_id,
        last_modified_by: last_modified_by,
        created_by: created_by
      }, { transaction });
    }

    logger.info('create Study ');
  } catch(error) {
    logger.error('error Study creation ', error);
    throw error;
  }
};