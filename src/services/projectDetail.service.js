import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectDetail = db.projectDetail;

const saveProjectDetail = async (
  maintenance_frequency, 
  is_public_ownership,
  project_id,
  last_modified_by,
  created_by,
  code_study_reason_id = null,
  maintenanceeligibility = 0,
  acquisition_anticipated_year = null,
  code_acquisition_progress_status_id = null
) => {
  try {
    const response = await ProjectDetail.create({
      maintenance_frequency: maintenance_frequency,
      is_public_ownership: is_public_ownership,
      project_id: project_id,
      code_study_reason_id: code_study_reason_id,
      acquisition_anticipated_year: acquisition_anticipated_year,
      code_acquisition_progress_status_id: code_acquisition_progress_status_id,
      last_modified_by: last_modified_by,
      created_by: created_by
    });
    logger.info('create ProjectDetail ');
    return response;
  } catch(error) {
    throw error;
  }
}

const updateProjectDetail = async (
  maintenance_frequency, 
  is_public_ownership,
  project_id,
  last_modified_by,
  code_study_reason_id = null,
  acquisition_anticipated_year = null,
  code_acquisition_progress_status_id = null
) => {
  try {
    const response = await ProjectDetail.update({
      maintenance_frequency: maintenance_frequency,
      is_public_ownership: is_public_ownership,
      acquisition_anticipated_year: acquisition_anticipated_year,
      code_acquisition_progress_status_id: code_acquisition_progress_status_id,
      last_modified_by: last_modified_by,
      code_study_reason_id: code_study_reason_id
    },{ where: { project_id: project_id }});
    logger.info('create ProjectDetail ');
    return response;
  } catch(error) {
    throw error;
  }
}

export default {
  saveProjectDetail,
  updateProjectDetail
};
