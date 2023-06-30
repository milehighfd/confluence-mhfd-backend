import db from 'bc/config/db.js';
import moment from 'moment';

const ProjectStatus = db.projectStatus;

export const saveProjectStatusFromCero = async (
  code_phase_type_id,
  project_id,
  duration,
  created_by,
  transaction = null
) => {
  const createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
  const endDate = moment().add(Number(duration), formatDuration).format('YYYY-MM-DD HH:mm:ss');
  try {
    const res = await ProjectStatus.create({
      code_phase_type_id,
      project_id,
      createdDate,
      createdDate,
      createdDate,
      endDate,
      endDate,
      duration,
      createdDate,
      createdDate,
      created_by,
      created_by
    }, { transaction: transaction });
    return res;
  } catch (error) {
    console.log('the error ', error);
    throw error;
  }
}