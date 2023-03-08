import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectDetail = db.projectDetail;

const saveProjectDetail = async (
  maintenance_frequency, 
  is_public_ownership,
  project_id,
  maintenanceeligibility = 0,
  acquisition_anticipated_year = null,
  code_acquisition_progress_status_id = null
) => {
  try {
    const response = await ProjectDetail.create({
      maintenance_frequency: maintenance_frequency,
      is_public_ownership: is_public_ownership,
      project_id: project_id,
      acquisition_anticipated_year: acquisition_anticipated_year,
      code_acquisition_progress_status_id: code_acquisition_progress_status_id
    });
    logger.info('create ProjectDetail ');
    return response;
  } catch(error) {
    throw error;
  }
}



export default {
  saveProjectDetail,
};
