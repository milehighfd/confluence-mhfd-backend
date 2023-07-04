import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectDetail = db.projectDetail;

export const saveProjectDetails = async (  
  project_id,
  body,
  creator,
  transaction = null
) => {
  try {
    const { maintenance_frequency, is_public_ownership, code_study_reason_id, acquisition_anticipated_year, code_acquisition_progress_status_id } = body;
    const maintenanceFrequency = maintenance_frequency || 0;
    const isPublicOwnership = is_public_ownership || 0;
    const codeStudyReasonId = code_study_reason_id || null;
    const acquisitionAnticipatedYear = acquisition_anticipated_year || null;
    const codeAcquisitionProgressStatusId = code_acquisition_progress_status_id || null;
    const response = await ProjectDetail.create({
      maintenance_frequency: maintenanceFrequency,
      is_public_ownership: isPublicOwnership,
      project_id: project_id,
      code_study_reason_id: codeStudyReasonId,
      acquisition_anticipated_year: acquisitionAnticipatedYear && Number(acquisitionAnticipatedYear),
      code_acquisition_progress_status_id: codeAcquisitionProgressStatusId && Number(codeAcquisitionProgressStatusId),
      last_modified_by: creator,
      created_by: creator
    }, { transaction: transaction });
    logger.info('create ProjectDetail ');
    return response;
  } catch(error) {
    logger.error('Error saving project details', { cause: error });
    throw error;
  }
}
