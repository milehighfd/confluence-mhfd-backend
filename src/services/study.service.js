import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const Study = db.study;
const Projectstudy = db.projectstudy;
const Streamstudy = db.streamstudy;
const ProjectDetail = db.projectDetail;

const saveStudy = async (
  study_name, 
  study_year,
  complete_year,
  last_update_user,
  project_id,
  streams,
  code_study_reason_id = 1,
  otherReason = null,
) => {
  try {
     const res = await Study.create({
      study_name: study_name,
      study_type_id: 1,
      study_year: study_year,
      complete_year: complete_year,
      status: '',
      code_study_reason_id: code_study_reason_id,
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
    if (otherReason) {
      await ProjectDetail.create({
        maintenance_frequency: 0,
        is_public_ownership: 0,
        project_id: project_id,
        comments: otherReason
      });
    } 
    logger.info('create Study ');
  } catch(error) {
    logger.error('error Study creation ', error);
    throw error;
  }
}

const updateStudy = async (
  study_name, 
  complete_year,
  last_update_user,
  project_id,
  streams,
  code_study_reason_id = 1,
  otherReason = null,
) => {
  try {
    console.log(project_id);
    const studyID = await Projectstudy.findOne({
      where:{
        project_id: project_id
      }
    });
     await Study.update({
      study_name: study_name,
      complete_year: complete_year,
      status: '',
      code_study_reason_id: code_study_reason_id,
      last_update_user: last_update_user
    }, {where: { study_id: studyID.study_id }}); 

    await Projectstudy.update({
      last_update_user: last_update_user
    }, {where: { project_study_id: studyID.project_study_id}})

    await Streamstudy.destroy({
      where: {
        study_id: studyID.study_id 
      }
    });

    for (const stream of streams) {
      const id = stream.stream.stream_id ? stream.stream.stream_id : stream.stream[0].stream_id;
      await Streamstudy.create({
        stream_id: id,
        study_id: studyID.study_id
      })
    }
    if (otherReason) {
      await ProjectDetail.update({
        comments: otherReason
      },{where:{ project_id: project_id}});
    } 
    logger.info('updated Study ');
  } catch(error) {
    logger.error('error Study update ', error);
    throw error;
  }
}

export default {
  saveStudy,
  updateStudy
};
