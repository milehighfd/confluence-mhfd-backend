import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const Project = db.project;

export const updateProject = async (
  project_id,
  project_name, 
  description,
  modified_date,
  last_modified_by,
  code_maintenance_eligibility_type_id = null,
  transaction = null
) => {
  try {
    let insert;
    if (code_maintenance_eligibility_type_id) {
      insert = Project.update({
        project_name: project_name,
        description: description,
        modified_date: modified_date,
        last_modified_by: last_modified_by,
        code_maintenance_eligibility_type_id: code_maintenance_eligibility_type_id,
      }, { where: { project_id: project_id }, transaction });
    } else {
      insert = Project.update({
        project_name: project_name,
        description: description,
        modified_date: modified_date,
        last_modified_by: last_modified_by,
      }, { where: { project_id: project_id }, transaction });
    }
    logger.info('update project ');
    return insert;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}