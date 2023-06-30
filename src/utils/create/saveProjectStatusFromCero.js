import db from 'bc/config/db.js';


const ProjectStatus = db.projectStatus;

export const saveProjectStatusFromCero = async (
  code_phase_type_id,
  project_id,
  phase_change_date,
  planned_start_date,
  actual_start_date,
  planned_end_date,
  actual_end_date,
  duration,
  created_date,
  modified_date,
  last_modified_by,
  created_by,
  transaction = null
) => {
  try {
    const res = await ProjectStatus.create({
      code_phase_type_id,
      project_id,
      phase_change_date,
      planned_start_date,
      actual_start_date,
      planned_end_date,
      actual_end_date,
      duration,
      created_date,
      modified_date,
      last_modified_by,
      created_by
    }, { transaction: transaction });
    return res;
  } catch (error) {
    console.log('the error ', error);
    throw error;
  }
}