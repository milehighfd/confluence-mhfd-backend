

import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const Project = db.project;

export const saveProject = async (
  CREATE_PROJECT_TABLE,
  project_name,
  description,
  code_project_type_id,
  created_date,
  modified_date,
  start_date,
  last_modified_by,
  created_by,
  code_maintenance_eligibility_type_id = null,
  transaction = null
) => {
  try {
    let insert;
    if (code_maintenance_eligibility_type_id) {
      insert = Project.create({
        project_name: project_name,
        project_alias: project_name,
        description: description,
        code_project_type_id: code_project_type_id,
        created_date: created_date,
        modified_date: modified_date,
        start_date: start_date,
        last_modified_by: last_modified_by,
        is_spatial_data_required: 0,
        created_by: created_by,
        code_maintenance_eligibility_type_id: code_maintenance_eligibility_type_id,
      }, { transaction: transaction });
    } else {
      insert = Project.create({
        project_name: project_name,
        project_alias: project_name,
        description: description,
        code_project_type_id: code_project_type_id,
        created_date: created_date,
        modified_date: modified_date,
        start_date: start_date,
        last_modified_by: last_modified_by,
        is_spatial_data_required: 0,
        created_by: created_by
      }, { transaction: transaction });
    }
    logger.info('create project ');
    return insert;
  } catch (error) {
    console.log('the error ', error);
    throw error;
  }
}