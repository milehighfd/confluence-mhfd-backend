import express from 'express';
import Multer from 'multer';
import needle from 'needle';
import attachmentService from 'bc/services/attachment.service.js';
import projectStreamService from 'bc/services/projectStream.service.js';
import {
  CREATE_PROJECT_TABLE,
  CREATE_PROJECT_TABLE_V2,
} from 'bc/config/config.js';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';
import { addProjectToBoard, cleanStringValue, updateProjectsInBoard,createLocalitiesBoard,getLocalitiesNames } from 'bc/routes/new-project/helper.js';

import cartoService from 'bc/services/carto.service.js';
import db from 'bc/config/db.js';

import projectService from 'bc/services/project.service.js';
import projectStatusService from 'bc/services/projectStatus.service.js';
import projectPartnerService from 'bc/services/projectPartner.service.js';
import studyService from 'bc/services/study.service.js';
import {saveProjectStreams, insertToCartoStudy, saveStudy }from 'bc/utils/create';

import moment from 'moment';

const ProjectLocalGovernment = db.projectLocalGovernment;
const ProjectCounty = db.projectCounty;
const ProjectServiceArea = db.projectServiceArea;
const CodePhaseType = db.codePhaseType;
const Project = db.project;


const router = express.Router();
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

router.post('/', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const {
    isWorkPlan,
    projectname,
    description,
    servicearea,
    county,
    ids,
    streams,
    cosponsor,
    geom,
    locality,
    jurisdiction,
    sponsor,
    year,
    studyreason,
    otherReason,
    sendToWR,
    cover
  } = req.body;
  const defaultProjectId = 1;
  const defaultProjectType = 'Study';
  const projectsubtype = 'Master Plan';
  const creator = user.email;
  const splitedJurisdiction = jurisdiction.split(',');
  const splitedCounty = county.split(',');
  const splitedServicearea = servicearea.split(',');

  let parsedIds = '';
  let idsArray = JSON.parse(ids);
  for (const id of idsArray) {
    if (parsedIds) {
      parsedIds += ',';
    }
    parsedIds += "'" + id + "'";
  }
  let result = [];

  try {
    const codePhaseForCapital = await CodePhaseType.findOne({
      where: {
        code_phase_type_id: defaultProjectId,
      },
    });
    const { duration, duration_type } = codePhaseForCapital;
    const formatDuration = duration_type[0].toUpperCase();
    const officialProjectName = projectname + (projectname === 'Ex: Stream Name @ Location 202X'? ('_' + Date.now()) : '')
    console.log(CREATE_PROJECT_TABLE_V2,
      cleanStringValue(officialProjectName),
      cleanStringValue(description),
      defaultProjectId,
      moment().format('YYYY-MM-DD HH:mm:ss'),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      creator,
      creator)
    const data = await projectService.saveProject(
      CREATE_PROJECT_TABLE_V2,
      cleanStringValue(officialProjectName),
      cleanStringValue(description),
      defaultProjectId,
      moment().format('YYYY-MM-DD HH:mm:ss'),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      creator,
      creator
    );
    result.push(data);
    const { project_id } = data;
    if (idsArray.length) {
      await cartoService.checkIfExistGeomThenDelete(
        CREATE_PROJECT_TABLE,
        project_id
      );
      await insertToCartoStudy(
        CREATE_PROJECT_TABLE,
        project_id,
        parsedIds
      );
    }
    const response = await projectStatusService.saveProjectStatusFromCero(
      defaultProjectId,
      project_id,
      moment().format('YYYY-MM-DD HH:mm:ss'),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      moment()
        .add(Number(duration), formatDuration)
        .format('YYYY-MM-DD HH:mm:ss'),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      Number(duration),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      creator,
      creator
    );
    const resres = await Project.update(
      {
        current_project_status_id: response.project_status_id,
      },
      { where: { project_id: project_id } }
    );
    await attachmentService.uploadFiles(user, req.files, project_id, cover);

    // Start of Add or Create Board
    const PROJECT_TYPE = 'Study';
    const { localitiesBoard, typesList } = createLocalitiesBoard(isWorkPlan, sendToWR, year, PROJECT_TYPE, splitedJurisdiction, splitedCounty, splitedServicearea);
    const localNames = await getLocalitiesNames(localitiesBoard);
    if (isWorkPlan === 'true'){
      typesList.push('WORK_PLAN');
      localNames.push('MHFD District Work Plan');
    }
    const promisesLocal = [];
    for (let i = 0; i < localNames.length; i++) {
      const local = localNames[i];
      const type = typesList[i];
      if (local) {
        promisesLocal.push(addProjectToBoard(
          user,
          servicearea,
          county,
          local,
          defaultProjectType,
          project_id,
          year,
          sendToWR,
          isWorkPlan,
          projectname,
          projectsubtype,
          type
        ));
      }
    }
    await Promise.all(promisesLocal)
      .then(() => {
        logger.info('All projects added to board successfully');
      })
      .catch((error) => {
        logger.error(`Error adding projects to board: ${error}`);        
      });
    // End of Add or Create Board

    // DELETE after testing
    // await addProjectToBoard(
    //   user,
    //   servicearea,
    //   county,
    //   locality,
    //   defaultProjectType,
    //   project_id,
    //   year,
    //   sendToWR,
    //   isWorkPlan,
    //   cleanStringValue(projectname),
    //   projectsubtype
    // );

    await projectPartnerService.saveProjectPartner(
      sponsor,
      cosponsor,
      project_id
    );

    for (const j of splitedJurisdiction) {
      await ProjectLocalGovernment.create({
        code_local_government_id: parseInt(j),
        project_id: project_id,
        shape_length_ft: 0,
        last_modified_by: user.name,
        created_by: user.email,
      });
      logger.info('created jurisdiction');
    }
    for (const s of splitedServicearea) {
      await ProjectServiceArea.create({
        project_id: project_id,
        code_service_area_id: s,
        shape_length_ft: 0,
        last_modified_by: user.name,
        created_by: user.email,
      });
      logger.info('created service area');
    }
    for (const c of splitedCounty) {
      await ProjectCounty.create({
        state_county_id: c,
        project_id: project_id,
        shape_length_ft: 0,
      });
      logger.info('created county');
    }
    try {
      await saveProjectStreams(project_id, streams);      
    } catch (error) {
      console.error(error);
    }
    await studyService.saveStudy(
      project_id,
      studyreason,
      creator,
      creator,
      otherReason
    );
    logger.info('created study correctly');
    res.send(result);
  } catch (error) {
    logger.error('ERROR ', error);
    res.status(500).send(error);
  }  
});

router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const project_id = req.params.projectid;
  const {
    isWorkPlan,
    projectname,
    description,
    servicearea,
    county,
    ids,
    streams,
    cosponsor,
    geom,
    locality,
    jurisdiction,
    sponsor,
    year,
    studyreason,
    otherReason,
    sendToWR,
    cover,
  } = req.body;
  const creator = user.email;
  const splitedJurisdiction = jurisdiction.split(',');
  const splitedCounty = county.split(',');
  const splitedServicearea = servicearea.split(',');
  let parsedIds = '';
  let idsArray = JSON.parse(ids).filter((e) => !!e);
  for (const id of idsArray) {
    if (parsedIds) {
      parsedIds += ',';
    }
    parsedIds += "'" + id + "'";
  }
  let result = [];
  try {
    const data = await projectService.updateProject(
      project_id,
      cleanStringValue(projectname),
      cleanStringValue(description),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      creator
    );
    result.push(data);
    if (idsArray.length) {
      await cartoService.checkIfExistGeomThenDelete(
        CREATE_PROJECT_TABLE,
        project_id
      );
      await cartoService.insertToCartoStudy(
        CREATE_PROJECT_TABLE,
        project_id,
        parsedIds
      );
    }
    await attachmentService.toggleName(cover);
    await attachmentService.uploadFiles(user, req.files, project_id, cover);
    const projecttype = 'Study';
    const projectsubtype = 'Master Plan';
    updateProjectsInBoard(
      project_id,
      cleanStringValue(projectname),
      projecttype,
      projectsubtype
    );
    await projectPartnerService.updateProjectPartner(
      sponsor,
      cosponsor,
      project_id
    );

    if (splitedJurisdiction)
      await ProjectLocalGovernment.destroy({
        where: {
          project_id: project_id,
        },
      });
    if (splitedServicearea)
      await ProjectServiceArea.destroy({
        where: {
          project_id: project_id,
        },
      });
    if (splitedCounty)
      await ProjectCounty.destroy({
        where: {
          project_id: project_id,
        },
      });

    for (const j of splitedJurisdiction) {
      if (j) {
        await ProjectLocalGovernment.create({
          code_local_government_id: parseInt(j),
          project_id: project_id,
          shape_length_ft: 0,
          last_modified_by: user.name,
          created_by: user.email,
        });
      }
      logger.info('created jurisdiction');
    }
    for (const s of splitedServicearea) {
      if (s) {
        await ProjectServiceArea.create({
          project_id: project_id,
          code_service_area_id: s,
          shape_length_ft: 0,
          last_modified_by: user.name,
          created_by: user.email,
        });
      }
      logger.info('created service area');
    }
    for (const c of splitedCounty) {
      if (c) {
        await ProjectCounty.create({
          state_county_id: c,
          project_id: project_id,
          shape_length_ft: 0,
        });
      }
      logger.info('created county');
    }
    await projectStreamService.deleteByProjectId(project_id);
    for (const stream of JSON.parse(streams)) {
      console.log(stream)
      await projectStreamService.saveProjectStream({
        project_id: project_id,
        stream_id: stream.stream.stream_id
          ? stream.stream.stream_id
          : stream.stream[0].stream_id,
        length_in_mile: stream.length,
        drainage_area_in_sq_miles: stream.drainage,
        code_local_government_id:
          stream.code_local_goverment.length > 0
            ? stream.code_local_goverment[0].code_local_government_id 
            : 0,
      });
    }
    await studyService.updateStudy(project_id, studyreason, creator, otherReason);
    logger.info('updated study');
    res.send('updated study');
  } catch (error) {
    console.log(error)
    logger.error('error', error);
    return res.status(500).send(error);
  };
});

export default router;
