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
  const {isWorkPlan, projectname, description, servicearea, county, ids, streams, cosponsor, geom, locality, jurisdiction, sponsor, cover, year, studyreason, studysubreason, sendToWR} = req.body;
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
      if (idsArray.length) await cartoService.insertToCartoStudy(CREATE_PROJECT_TABLE, project_id, parsedIds);
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
          length_in_mile: parseFloat(stream.length),
          drainage_area_in_sq_miles: parseFloat(stream.drainage),
          local_government_id: stream.code_local_goverment ? stream.code_local_goverment[0].code_local_government_id : 0
        });
      }
      await studyService.saveStudy(cleanStringValue(projectname), moment().format('YYYY'), year, creator, project_id, JSON.parse(streams));
    } catch (error) {
      logger.error('ERROR ', error);
      return res.status(500).send(error);
    };
  res.send(result);
});
/* 
router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const projectid = req.params.projectid;
  const {projectname, description, servicearea, county, ids, cosponsor, geom, locality,
  streams, jurisdiction, sponsor, cover, sendToWR, studyreason, studysubreason } = req.body;
  const projecttype = 'Study';
  const projectsubtype = 'Master Plan';
  let idsArray = JSON.parse(ids);
  let parsedIds = '';
  for (const id of idsArray) {
    if (parsedIds) {
      parsedIds += ',';
    }
    parsedIds += "'" + id + "'";
  }
  let notRequiredFields = ``;
  if (cosponsor) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `${COSPONSOR1} = '${cosponsor}'`;
  }
  if (notRequiredFields) {
    notRequiredFields = `, ${notRequiredFields}`;
  }
  const updateQuery = `UPDATE ${CREATE_PROJECT_TABLE} SET
  the_geom = (SELECT ST_Collect(the_geom) FROM mhfd_stream_reaches WHERE unique_mhfd_code IN(${parsedIds})), jurisdiction = '${jurisdiction}',
   projectname = '${cleanStringValue(projectname)}', description = '${cleanStringValue(description)}',
    servicearea = '${servicearea}', county = '${county}',
     projecttype = '${projecttype}', 
     projectsubtype = '${projectsubtype}',
      sponsor = '${sponsor}',
      studyreason= '${studyreason}', studysubreason= '${studysubreason}' ${notRequiredFields} WHERE projectid = ${projectid}
  `;
  const query = {
    q: updateQuery
  };
  console.log('my query ' , query)
  let result = {};
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(JSON.stringify(result));
      await attachmentService.uploadFiles(user, req.files, projectid, cover);
      await projectStreamService.deleteByProjectId(projectid);
      for (const stream of JSON.parse(streams)) {
        projectStreamService.saveProjectStream({
          projectid: projectid,
          mhfd_code: stream.mhfd_code,
          length: stream.length,
          drainage: stream.drainage,
          jurisdiction: stream.jurisdiction,
          str_name: stream.str_name
        });
      }
    } else {
       logger.error('bad status ' + data.statusCode + '  -- '+ updateQuery +  JSON.stringify(data.body, null, 2));
       return res.status(data.statusCode).send(data.body);
      }
  } catch (error) {
    logger.error(error, 'at', updateQuery);
    return res.status(500).send(error);
  };
  res.send(result);
}); */

export default router;
