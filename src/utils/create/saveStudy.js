import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectDetail = db.projectDetail;

export const saveStudy = async (
  project_id,
  code_study_reason_id,
  creator,
  otherReason = null,
  body,
  transaction = null,  
) => {
  try {
    const { is_routine } = body;
    const isRoutine = is_routine ? (is_routine === 'true' ? 1 : 0) : 0;
    let study = null;
    if (otherReason) {
      study = await ProjectDetail.create({
        maintenance_frequency: 0,
        is_public_ownership: 0,
        project_id: project_id,
        comment: otherReason,
        code_study_reason_id: code_study_reason_id,
        last_modified_by: creator,
        created_by: creator,
        is_routine: isRoutine
      }, { transaction });
    }else{
      study = await ProjectDetail.create({
        maintenance_frequency: 0,
        is_public_ownership: 0,
        project_id: project_id,
        code_study_reason_id: code_study_reason_id,
        last_modified_by: creator,
        created_by: creator,
        is_routine: isRoutine
      }, { transaction });
    }

    logger.info('create Study ');
    return { message: 'Study created successfully', study };
  } catch(error) {
    logger.error('error Study creation ', error);
    throw error;
  }
};