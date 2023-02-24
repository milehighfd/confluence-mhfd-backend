import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectStream = db.project_stream;
const Streams = db.stream;
const getAll = (projectid) => {
  try {
    const list = ProjectStream.findAll({
      where: {
        project_id: projectid
      },
      include: {
        model: Streams,
        attributes: [
          'stream_id',
          'stream_name'
        ]
      }
    });
    return list;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const deleteByProjectId= async (projectid) => {
  const project = ProjectStream.destroy({
    where: {
      project_id: projectid 
    }});
  if (project) {
    logger.info('ProjectStream destroyed ');
    return true;
  } else {
    logger.info('ProjectStream not found');
    return false;
  }
}

const saveProjectStream = async (projectStream) => {
  logger.info('create ProjectStream ' + JSON.stringify(projectStream));
  try {
    const newProjectStream = await ProjectStream.create(projectStream);
    return newProjectStream;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

export default {
  getAll,
  deleteByProjectId,
  saveProjectStream
};
