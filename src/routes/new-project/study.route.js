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
import { addProjectToBoard, cleanStringValue } from 'bc/routes/new-project/helper.js';

import cartoService from 'bc/services/carto.service.js';
import db from 'bc/config/db.js';

import projectService from 'bc/services/project.service.js';
import projectStatusService from 'bc/services/projectStatus.service.js';
import projectPartnerService from 'bc/services/projectPartner.service.js';
import studyService from 'bc/services/study.service.js';

import moment from 'moment';

const ProjectLocalGovernment = db.projectLocalGovernment;
const ProjectCounty = db.projectCounty;
const ProjectServiceArea = db.projectServiceArea;


const router = express.Router();
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

router.post('/', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const {isWorkPlan, projectname, description, servicearea, county, ids, streams, cosponsor, geom, locality, jurisdiction, sponsor, year, studyreason, otherReason, sendToWR} = req.body;
  const defaultProjectId = 1;
  const defaultProjectType = 'Study'
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
      const data = await projectService.saveProject(CREATE_PROJECT_TABLE_V2, cleanStringValue(projectname), cleanStringValue(description), defaultProjectId, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), creator, creator)
      result.push(data);
      const { project_id } = data;
      if (idsArray.length) {
        await cartoService.insertToCartoStudy(CREATE_PROJECT_TABLE, project_id, parsedIds);
      }
      await projectStatusService.saveProjectStatusFromCero(defaultProjectId, project_id, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), 2, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), creator, creator)
      await addProjectToBoard(user, servicearea, county, locality, defaultProjectType, project_id, year, sendToWR, isWorkPlan);
      await projectPartnerService.saveProjectPartner(sponsor, cosponsor, project_id);
      
      for (const j of splitedJurisdiction) {
        await ProjectLocalGovernment.create({
          code_local_government_id: parseInt(j),
          project_id: project_id,
          shape_length_ft: 0,
          last_modified_by: user.name,
          created_by: user.email
        });
        logger.info('created jurisdiction');
      }
      for (const s of splitedServicearea) {
        await ProjectServiceArea.create({
          project_id: project_id,
          code_service_area_id: s,
          shape_length_ft: 0,
          last_modified_by: user.name,
          created_by: user.email
        });
        logger.info('created service area');
      }
      for (const c of splitedCounty) {
        await ProjectCounty.create({
          state_county_id: c,
          project_id: project_id,
          shape_length_ft: 0
        });
        logger.info('created county');
      }
      for (const stream of JSON.parse(streams)) {
        await projectStreamService.saveProjectStream({
          project_id: project_id,
          stream_id: stream.stream ? stream.stream[0].stream_id : 0,
          length_in_mile: new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
          }).format(stream.length * 0.000621371),
          drainage_area_in_sq_miles: new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
          }).format(stream.drainage),
          local_government_id: stream.code_local_goverment.length > 0 ? stream.code_local_goverment[0].objectid : 0
        });
      }
      await studyService.saveStudy(project_id, studyreason, creator, creator, otherReason);
      logger.info('created study correctly');
    } catch (error) {
      logger.error('ERROR ', error);
      return res.status(500).send(error);
    };
  res.send(result);
});

router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const project_id = req.params.projectid;
  const {isWorkPlan, projectname, description, servicearea, county, ids, streams, cosponsor, geom, locality, jurisdiction, sponsor, year, studyreason, otherReason, sendToWR} = req.body;
  const creator = user.email;
  const splitedJurisdiction = jurisdiction.split(',');
  const splitedCounty = county.split(',');
  const splitedServicearea = servicearea.split(',');
  let parsedIds = '';
  let idsArray = JSON.parse(ids).filter(e => !!e);
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
      creator)
    result.push(data);
    if (idsArray.length) await cartoService.updateCartoStudy(CREATE_PROJECT_TABLE, project_id, parsedIds);
    await projectPartnerService.updateProjectPartner(sponsor, cosponsor, project_id);

    if (splitedJurisdiction) await ProjectLocalGovernment.destroy({
      where: {
        project_id: project_id
      }
    });
    if (splitedServicearea) await ProjectServiceArea.destroy({
      where: {
        project_id: project_id
      }
    });
    if (splitedCounty) await ProjectCounty.destroy({
      where: {
        project_id: project_id
      }
    });

    for (const j of splitedJurisdiction) {
      await ProjectLocalGovernment.create({
        code_local_government_id: parseInt(j),
        project_id: project_id,
        shape_length_ft: 0,
        last_modified_by: user.name,
        created_by: user.email
      });
      logger.info('created jurisdiction');
    }
    for (const s of splitedServicearea) {
      await ProjectServiceArea.create({
        project_id: project_id,
        code_service_area_id: s,
        shape_length_ft: 0,
        last_modified_by: user.name,
        created_by: user.email
      });
      logger.info('created service area');
    }
    for (const c of splitedCounty) {
      await ProjectCounty.create({
        state_county_id: c,
        project_id: project_id,
        shape_length_ft: 0
      });
      logger.info('created county');
    }
    await projectStreamService.deleteByProjectId(project_id);
    for (const stream of JSON.parse(streams)) {
      await projectStreamService.saveProjectStream({
        project_id: project_id,
        stream_id: stream.stream.stream_id ? stream.stream.stream_id : stream.stream[0].stream_id,
        length_in_mile: stream.length,
        drainage_area_in_sq_miles: stream.drainage,
        local_government_id: stream.code_local_goverment.length > 0 ? stream.code_local_goverment[0].objectid : 0
      });
    }
    await studyService.updateStudy(project_id, creator,  otherReason);
    logger.info('updated study');
  } catch (error) {
    logger.error('error',error);
    return res.status(500).send(error);
  };
  res.send('updated study');
});

export default router;
