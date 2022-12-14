import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const Project = db.project;

const getAll = (Projectsid) => {
  try {
    const list = Project.findAll({
      where: {
        project_id: Projectsid
      }
    });
    return list;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const deleteByProjectId= async (Projectsid) => {
  const project = Project.destroy({
    where: {
      project_id: Projectsid 
    }});
  if (project) {
    logger.info('project destroyed ');
    return true;
  } else {
    logger.info('project not found');
    return false;
  }
}

const saveProject = async (
  CREATE_PROJECT_TABLE,
  location, 
  project_name, 
  description,
  code_project_type_id, 
  created_date,
  modified_date,
  start_date,
  last_modified_by,
  notRequiredFields,
  notRequiredValues,
  created_by
) => {
  logger.info('create project ' + JSON.stringify(
    CREATE_PROJECT_TABLE,
    location, 
    project_name, 
    description,
    code_project_type_id, 
    created_date,
    modified_date,
    start_date,
    last_modified_by,
    notRequiredFields,
    notRequiredValues,
    created_by ));
  try {
    const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (location, project_name, description, code_project_type_id, created_date, modified_date, start_date, last_modified_by ${notRequiredFields} , created_by)
    OUTPUT inserted . *
    VALUES('${location}', '${project_name}', '${description}', '${code_project_type_id}', '${created_date}', '${modified_date}', '${start_date}', '${last_modified_by}' ${notRequiredValues},'${created_by}')`;
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
  deleteByProjectId,
  saveProject
};
