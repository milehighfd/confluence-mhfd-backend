import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const Study = db.study;
const Projectstudy = db.projectstudy;
const Streamstudy = db.streamstudy;
const ProjectDetail = db.projectDetail;

const saveStudy = async (
  project_id,
  code_study_reason_id,
  last_modified_by,
  created_by,
  otherReason = null,
) => {
  try {
    if (otherReason) {
      await ProjectDetail.create({
        maintenance_frequency: 0,
        is_public_ownership: 0,
        project_id: project_id,
        comment: otherReason,
        code_study_reason_id: code_study_reason_id,
        last_modified_by: last_modified_by,
        created_by: created_by
      });
    }else {
      await ProjectDetail.create({
        maintenance_frequency: 0,
        is_public_ownership: 0,
        project_id: project_id,
        code_study_reason_id: code_study_reason_id,
        last_modified_by: last_modified_by,
        created_by: created_by
      });
    }
    logger.info('create Study ');
  } catch(error) {
    logger.error('error Study creation ', error);
    throw error;
  }
}

const updateStudy = async (
  project_id,
  code_study_reason_id,
  last_modified_by,
  otherReason = null,
) => {
  try {
    if (otherReason) {
      await ProjectDetail.update({
        comment: otherReason,
        code_study_reason_id: code_study_reason_id,
        last_modified_by: last_modified_by
      },{where:{ project_id: project_id}});
    } else {
      await ProjectDetail.update({
        code_study_reason_id: code_study_reason_id,
        last_modified_by: last_modified_by
      },{where:{ project_id: project_id}});
    }
    logger.info('updated Study ');
  } catch(error) {
    logger.error('error Study update ', error);
    throw error;
  }
}

export default {
  saveStudy,
  updateStudy
};
