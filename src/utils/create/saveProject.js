

import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';

const Project = db.project;


export const saveProject = async (
  code_project_type_id,
  project_name,
  description,
  creator,
  isCountyWide,
  isSouthPlate,
  code_maintenance_eligibility_type_id = null,  
  transaction = null,
) => {
  console.log('save project-------------------------')
  console.log(code_project_type_id, project_name, description, creator, code_maintenance_eligibility_type_id, isCountyWide, isSouthPlate)
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
        is_county_wide: isCountyWide,
        is_located_on_south_plate_river: isSouthPlate
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
        created_by: creator,
        is_county_wide: isCountyWide,
        is_located_on_south_plate_river: isSouthPlate
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
const STUDY_CODE_PROJECT_TYPE_ID = 1;
export const saveStudyP = saveProject.bind(null, STUDY_CODE_PROJECT_TYPE_ID);
const RESTORATION_CODE_PROJECT_TYPE_ID = 7;
export const saveRestoration = saveProject.bind(null, RESTORATION_CODE_PROJECT_TYPE_ID);
const ROUTINE_TRASH_CODE_PROJECT_TYPE_ID = 8;
export const saveRoutineTrash = saveProject.bind(null, ROUTINE_TRASH_CODE_PROJECT_TYPE_ID);
const SEDIMENT_REMOVAL_CODE_PROJECT_TYPE_ID = 9;
export const saveSedimentRemoval = saveProject.bind(null, SEDIMENT_REMOVAL_CODE_PROJECT_TYPE_ID);
const MINOR_REPAIRT_CODE_PROJECT_TYPE_ID = 17;
export const saveMinorRepairs = saveProject.bind(null, MINOR_REPAIRT_CODE_PROJECT_TYPE_ID);
const VEGETATION_MANAGEMENT_CODE_PROJECT_TYPE_ID = 11;
export const saveVegetationManagement = saveProject.bind(null, VEGETATION_MANAGEMENT_CODE_PROJECT_TYPE_ID);
