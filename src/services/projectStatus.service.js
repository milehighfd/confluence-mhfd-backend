import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectStatus = db.projectStatus;

const getAll = (ProjectStatusid) => {
  try {
    const list = ProjectStatus.findAll({
      where: {
        project_status_id: ProjectStatusid
      }
    });
    return list;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const deleteByProjectStatusId= async (ProjectStatusid) => {
  const project = ProjectStatus.destroy({
    where: {
        project_status_id: ProjectStatusid 
    }});
  if (project) {
    logger.info('ProjectStatus destroyed ');
    return true;
  } else {
    logger.info('ProjectStatus not found');
    return false;
  }
}

const saveProjectStatusFromCero = async (
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
) => {
  logger.info('create ProjectStatus ' + JSON.stringify(
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
    created_by ));
  try {
    const insertQuery = `INSERT INTO project_status (code_phase_type_id, project_id, phase_change_date, planned_start_date, actual_start_date, planned_end_date, actual_end_date, duration, created_date, modified_date, last_modified_by, created_by)
    OUTPUT inserted . *
    VALUES('${code_phase_type_id}', '${project_id}', '${phase_change_date}', '${planned_start_date}', '${actual_start_date}', '${planned_end_date}', '${actual_end_date}', '${duration}', '${created_date}', '${modified_date}', '${last_modified_by}', '${created_by}')`;
    const data = await db.sequelize.query(
      insertQuery,
      {
        type: db.sequelize.QueryTypes.INSERT,
      });
    return data[0][0];
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

export default {
  getAll,
  deleteByProjectStatusId,
  saveProjectStatusFromCero
};
