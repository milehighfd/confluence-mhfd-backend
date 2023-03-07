import express from 'express';
import Multer from 'multer';
import {
  CREATE_PROJECT_TABLE_V2,
  CREATE_PROJECT_TABLE
} from 'bc/config/config.js';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';
import { addProjectToBoard, getNewProjectId, setProjectID, cleanStringValue } from 'bc/routes/new-project/helper.js';
import cartoService from 'bc/services/carto.service.js';
import db from 'bc/config/db.js';


import projectService from 'bc/services/project.service.js';
import projectStatusService from 'bc/services/projectStatus.service.js';
import projectDetailService from 'bc/services/projectDetail.service.js';
import projectPartnerService from 'bc/services/projectPartner.service.js';

import moment from 'moment';

const CodeProjectType = db.codeProjectType;
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
  const {isWorkPlan, projectname, description, servicearea, county, geom, projectsubtype, frequency, maintenanceeligibility, ownership, locality, jurisdiction, sponsor, cosponsor, cover, year, sendToWR} = req.body;
  const status = 'Draft';
  const defaultProjectId = await CodeProjectType.findOne({
    where: {
      project_type_name: projectsubtype
    }
  });
  const defaultProjectType = 'Maintenance'
  const creator = user.email;
  const splitedJurisdiction = jurisdiction.split(',');
  const splitedCounty = county.split(',');
  const splitedServicearea = servicearea.split(',');
  let result = [];
  try {
    const data = await projectService.saveProject(CREATE_PROJECT_TABLE_V2, cleanStringValue(projectname), cleanStringValue(description), defaultProjectId.code_project_type_id, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), creator, creator, maintenanceeligibility)
    result.push(data)
    const { project_id } = data;
    await cartoService.insertToCarto(CREATE_PROJECT_TABLE, geom, project_id);
    await projectStatusService.saveProjectStatusFromCero(defaultProjectId.code_project_type_id, project_id, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), 2, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), creator, creator);
    await projectDetailService.saveProjectDetail(frequency, ownership, project_id, maintenanceeligibility);
    //await attachmentService.uploadFiles(user, req.files, projectId, cover);
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
    const dataArcGis = await projectService.insertIntoArcGis(geom, project_id, cleanStringValue(projectname));
    result.push(dataArcGis);
  } catch (error) {
    console.error("aaa:", error)
    logger.error(error);
  };
  res.send(result);
});

/* 
router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  console.log('the user ', user);
  const {projectname, description, servicearea, county, geom, projectsubtype, frequency, maintenanceeligibility, ownership, locality, jurisdiction, sponsor, cosponsor, cover, sendToWR} = req.body;
  const projectid = req.params.projectid;
  const projecttype = 'Maintenance';
  let notRequiredFields = ``;
  if (frequency) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `frequency = '${frequency}'`;
  }
  if (maintenanceeligibility) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `maintenanceeligibility = '${maintenanceeligibility}'`;
  }
  if (ownership) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `ownership = '${ownership}'`;
  }
  if (cosponsor) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `${COSPONSOR1} = '${cosponsor}'`;
  }
  if (notRequiredFields) {
    notRequiredFields = `, ${notRequiredFields}`;
  }
  const updateQuery = `UPDATE ${CREATE_PROJECT_TABLE} SET the_geom = ST_GeomFromGeoJSON('${geom}'), jurisdiction = '${jurisdiction}',
   projectname = '${cleanStringValue(projectname)}', description = '${cleanStringValue(description)}', servicearea = '${servicearea}',
    county = '${county}', projecttype = '${projecttype}',
     projectsubtype = '${projectsubtype}',  
     sponsor = '${sponsor}'
     ${notRequiredFields} 
       WHERE projectid = ${projectid}`;
  const query = {
    q: updateQuery
  };
  console.log('my query ' , updateQuery)
  let result = {};
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(JSON.stringify(result));
      await attachmentService.uploadFiles(user, req.files, projectid, cover);
    } else {
       logger.error('bad status ' + data.statusCode + '  -- '+ updateQuery +  JSON.stringify(data.body, null, 2));
       return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error, 'at', updateQuery);
  };
  res.send(result);
}); */

export default router;
