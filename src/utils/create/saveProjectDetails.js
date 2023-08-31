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
    const { frequency, ownership, acquisitionanticipateddate, acquisitionprogress, is_routine } = body;
    const maintenanceFrequency = frequency || 0;
    const isPublicOwnership = ownership || 0;
    const isRoutine = is_routine ? (is_routine === 'true' ? 1 : 0) : 0;
    const acquisitionAnticipatedYear = acquisitionanticipateddate || null;
    const codeAcquisitionProgressStatusId = acquisitionprogress || null;
    const response = await ProjectDetail.create({
      maintenance_frequency: maintenanceFrequency,
      is_public_ownership: isPublicOwnership,
      project_id: project_id,
      acquisition_anticipated_year: acquisitionAnticipatedYear && Number(acquisitionAnticipatedYear),
      code_acquisition_progress_status_id: codeAcquisitionProgressStatusId && Number(codeAcquisitionProgressStatusId),
      last_modified_by: creator,
      created_by: creator,
      is_routine: isRoutine
    }, { transaction: transaction });
    logger.info('create ProjectDetail ');
    return response;
  } catch(error) {
    logger.error('Error saving project details', { cause: error });
    throw error;
  }
}
