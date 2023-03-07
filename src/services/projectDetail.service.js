import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectDetail = db.projectDetail;
const CodeMaintenanceElegibilityType = db.codeMaintenanceElegibilityType;

const saveProjectDetail = async (
  maintenance_frequency, 
  is_public_ownership,
  project_id,
  maintenanceeligibility = 0,
  acquisition_anticipated_year = null,
  code_acquisition_progress_status_id = null
) => {
  try {
    const id = await db.sequelize.query('SELECT MAX(project_detail_id) FROM "project_detail"');
    const lastID = Object.values(id[0][0]).length > 0 ? Object.values(id[0][0])[0] : -1

    const response = await ProjectDetail.create({
      project_detail_id: lastID + 1,
      maintenance_frequency: maintenance_frequency,
      is_public_ownership: is_public_ownership,
      project_id: project_id,
      code_maintenance_eligibility_type_id: maintenanceeligibility,
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
