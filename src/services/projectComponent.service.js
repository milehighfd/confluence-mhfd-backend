import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectComponent = db.projectComponent;

const getAll = (project_id) => {
  try {
    const list = ProjectComponent.findAll({
      where: {
        project_id: project_id
      }
    });
    return list;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const deleteByProjectId= async (project_id) => {
  const project = ProjectComponent.destroy({
    where: {
      project_id: project_id 
    }});
  if (project) {
    logger.info('ProjectComponent destroyed ');
    return true;
  } else {
    logger.info('ProjectComponent not found');
    return false;
  }
}

const saveProjectComponent = async (
  component_id, 
  source_table_name, 
  component_name,
  component_status, 
  projectid 
) => {
  logger.info('create ProjectComponent ' + JSON.stringify(
    component_id, 
    source_table_name, 
    component_name,
    component_status, 
    projectid ));
  try {
    const insertQuery = `INSERT INTO project_component (project_id, component_id, source_table_name, component_name, component_status)
      OUTPUT inserted . *
      VALUES('${projectid}', '${component_id}', '${source_table_name}', '${component_name}', '${component_status}')`;
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
  saveProjectComponent
};
