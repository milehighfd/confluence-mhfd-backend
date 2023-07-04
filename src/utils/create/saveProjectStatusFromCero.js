import db from 'bc/config/db.js';
import moment from 'moment';

const ProjectStatus = db.projectStatus;

export const saveProjectStatusFromCero = async (
  code_phase_type_id,
  project_id,
  duration,
  formatDuration,
  created_by,
  transaction = null
) => {
  const createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
  const endDate = moment().add(Number(duration), formatDuration).format('YYYY-MM-DD HH:mm:ss');
  try {
    const res = await ProjectStatus.create({
      code_phase_type_id,
      project_id,
      phase_change_date: createdDate,
      planned_start_date: createdDate,
      actual_start_date: createdDate,
      planned_end_date: endDate,
      actual_end_date: endDate,
      duration,
      created_date: createdDate,
      modified_date: createdDate,
      last_modified_by: created_by,
      created_by
    }, { transaction: transaction });
    return res;
  } catch (error) {
    console.log('the error ', error);
    throw error;
  }
}