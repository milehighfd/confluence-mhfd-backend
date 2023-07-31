import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectDetail = db.projectDetail;

export const updateStudy = async (
  project_id,
  code_study_reason_id,
  creator,
  otherReason = null,
  transaction
) => {
  console.log(project_id, code_study_reason_id, creator, otherReason)
  try {
    let updatedProjectDetail;
    if (otherReason) {
      updatedProjectDetail = await ProjectDetail.update({
        comment: otherReason,
        code_study_reason_id: code_study_reason_id,
        last_modified_by: creator,
      },{where:{ project_id: project_id}, transaction, returning: true});
    } else {
      updatedProjectDetail = await ProjectDetail.update({
        code_study_reason_id: code_study_reason_id,
        last_modified_by: creator,
      },{where:{ project_id: project_id}, transaction, returning: true});
    }
    if (updatedProjectDetail[1].length > 0) {
      logger.info('updated Study ');
      return updatedProjectDetail[1][0].dataValues;
    } else {
      logger.warn(`No rows updated for project_id ${project_id}`);
      return null;
    }
  } catch(error) {
    logger.error('error Study update ', error);
    throw error;
  }
}