import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';

const Project = db.project;

export const updateProject = async (
  project_id,
  project_name, 
  description,
  last_modified_by,
  countyWide,
  southPlate,
  code_maintenance_eligibility_type_id = null,
  transaction = null
) => {
  try {
    let updatedProject;
    if (code_maintenance_eligibility_type_id) {
      updatedProject = await Project.update({
        project_name: project_name,
        description: description,
        modified_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        last_modified_by: last_modified_by,
        code_maintenance_eligibility_type_id: code_maintenance_eligibility_type_id,
        is_county_wide: countyWide,
        is_located_on_south_plate_river: southPlate
      }, { where: { project_id: project_id }, transaction, returning: true });
    } else {
      updatedProject = await Project.update({
        project_name: project_name,
        description: description,
        modified_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        last_modified_by: last_modified_by,
        is_county_wide: countyWide,
        is_located_on_south_plate_river: southPlate
      }, { where: { project_id: project_id }, transaction, returning: true });
    }
    logger.info('update project ');
    return updatedProject[1][0].dataValues;
  } catch(error) {
    logger.error('error updating project ', error);
    throw error;
  }
}