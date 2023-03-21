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
    await projectDetailService.saveProjectDetail(frequency, ownership, project_id, creator, creator);
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


router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
  const project_id = req.params.projectid;
  const user = req.user;
  const {isWorkPlan, projectname, description, servicearea, county, geom, projectsubtype, frequency, maintenanceeligibility, ownership, locality, jurisdiction, sponsor, cosponsor, cover, year, sendToWR} = req.body;
  const creator = user.email;
  const splitedJurisdiction = jurisdiction.split(',');
  const splitedCounty = county.split(',');
  const splitedServicearea = servicearea.split(',');
  let result = [];
  try {
    const data = await projectService.updateProject(
      project_id,
      cleanStringValue(projectname),
      cleanStringValue(description),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      creator,
      maintenanceeligibility);
    result.push(data);
    await cartoService.updateToCarto(CREATE_PROJECT_TABLE, geom, project_id);
    await projectDetailService.updateProjectDetail(frequency, ownership, project_id, creator);
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
      if (j) {
        await ProjectLocalGovernment.create({
          code_local_government_id: parseInt(j),
          project_id: project_id,
          shape_length_ft: 0,
          last_modified_by: user.name,
          created_by: user.email
        }); 
      }
      logger.info('created jurisdiction');
    }
    for (const s of splitedServicearea) {
     if(s) {
      await ProjectServiceArea.create({
        project_id: project_id,
        code_service_area_id: s,
        shape_length_ft: 0,
        last_modified_by: user.name,
        created_by: user.email
      });
     }
      logger.info('created service area');
    }
    for (const c of splitedCounty) {
      if (c) {
        await ProjectCounty.create({
          state_county_id: c,
          project_id: project_id,
          shape_length_ft: 0
        });
      }
      logger.info('created county');
    }


    logger.info('UPDATED!');
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
}); 

export default router;
