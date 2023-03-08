import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const Study = db.study;
const Projectstudy = db.projectstudy;
const Streamstudy = db.streamstudy;

const saveStudy = async (
  study_name, 
  study_year,
  complete_year,
  last_update_user,
  project_id,
  streams
) => {
  try {
     const res = await Study.create({
      study_name: study_name,
      study_type_id: 1,
      study_year: study_year,
      complete_year: complete_year,
      status: '',
      code_study_sub_reason_id: 1,
      contract_id: 0,
      onbase_ID: 0,
      onbase_project_name: "",
      last_update_user: last_update_user
    }); 
    await Projectstudy.create({
      project_id: project_id,
      study_id: res.study_id,
      last_update_user: last_update_user
    })
    for (const stream of streams) {
      await Streamstudy.create({
        stream_id: stream.stream ? stream.stream[0].stream_id : 0,
        study_id: res.study_id
      })
    }
    logger.info('create Study ');
  } catch(error) {
    logger.error('error Study creation ', error);
    throw error;
  }
}

export default {
  saveStudy
};
