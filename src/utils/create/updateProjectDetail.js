import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectDetail = db.projectDetail;

export const updateProjectDetail = async (
  project_id,
  body,
  creator,
  transaction = null
) => {
  const { frequency, ownership, studyreason, acquisitionanticipateddate, acquisitionprogress } = body;
    const maintenanceFrequency = frequency || 0;
    const isPublicOwnership = ownership || 0;
    const codeStudyReasonId = studyreason || null;
    const acquisitionAnticipatedYear = acquisitionanticipateddate || null;
    const codeAcquisitionProgressStatusId = acquisitionprogress || null;
  try {
    const response = await ProjectDetail.update(
      {
        maintenance_frequency: maintenanceFrequency,
        is_public_ownership: isPublicOwnership,
        acquisition_anticipated_year: acquisitionAnticipatedYear && Number(acquisitionAnticipatedYear),
        code_acquisition_progress_status_id: codeAcquisitionProgressStatusId && Number(codeAcquisitionProgressStatusId),
        last_modified_by: creator,
        code_study_reason_id: codeStudyReasonId
      },
      {
        where: { project_id: project_id },
        transaction: transaction
      }
    );
    logger.info('update ProjectDetail');
    return response;
  } catch (error) {
    throw error;
  }
};