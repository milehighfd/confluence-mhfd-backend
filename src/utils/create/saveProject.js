

import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';

const Project = db.project;


export const saveProject = async (
  code_project_type_id,
  project_name,
  description,
  creator,
  code_maintenance_eligibility_type_id = null,
  transaction = null,
) => {
  console.log('save project-------------------------')
  console.log(code_project_type_id, project_name, description, creator, code_maintenance_eligibility_type_id)
  try {
    let insert;
    const currendDate = moment().format('YYYY-MM-DD HH:mm:ss');
    if (code_maintenance_eligibility_type_id) {
      insert = await Project.create({
        project_name: project_name,
        project_alias: project_name,
        description: description,
        code_project_type_id: code_project_type_id,
        created_date: currendDate,
        modified_date: currendDate,
        start_date: currendDate,
        last_modified_by: creator,
        is_spatial_data_required: 0,
        created_by: creator,
        code_maintenance_eligibility_type_id: code_maintenance_eligibility_type_id,
      }, { transaction: transaction });
    } else {
      insert = await Project.create({
        project_name: project_name,
        project_alias: project_name,
        description: description,
        code_project_type_id: code_project_type_id,
        created_date: currendDate,
        modified_date: currendDate,
        start_date: currendDate,
        last_modified_by: creator,
        is_spatial_data_required: 0,
        created_by: creator
      }, { transaction: transaction });
    }
    logger.info('create project ');
    return insert;
  } catch (error) {
    console.log('the error ', error);
    throw error;
  }
}

const CAPITAL_CODE_PROJECT_TYPE_ID = 5;
export const saveCapital = saveProject.bind(null, CAPITAL_CODE_PROJECT_TYPE_ID);
const ACQUISITION_CODE_PROJECT_TYPE_ID = 13;
export const saveAcquisition = saveProject.bind(null, ACQUISITION_CODE_PROJECT_TYPE_ID);
const SPECIAL_CODE_PROJECT_TYPE_ID = 15;
export const saveSpecial = saveProject.bind(null, SPECIAL_CODE_PROJECT_TYPE_ID);
