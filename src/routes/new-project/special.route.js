import express from 'express';
import Multer from 'multer';
import {
  CREATE_PROJECT_TABLE_V2,
  CREATE_PROJECT_TABLE
} from 'bc/config/config.js';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';
import { addProjectToBoard, cleanStringValue, updateProjectsInBoard } from 'bc/routes/new-project/helper.js';

import db from 'bc/config/db.js';
import cartoService from 'bc/services/carto.service.js';
import projectStatusService from 'bc/services/projectStatus.service.js';
import projectPartnerService from 'bc/services/projectPartner.service.js';
import projectService from 'bc/services/project.service.js';
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
  const { projectname, description, servicearea, county, geom, locality,
    jurisdiction, sponsor, cosponsor, cover, year, sendToWR, isWorkPlan } = req.body;
  let result = [];
  const creator = user.email;
  const defaultProjectId = '15';
  const defaultProjectType = 'Special';
  const splitedJurisdiction = jurisdiction.split(',');
  const splitedCounty = county.split(',');
  const splitedServicearea = servicearea.split(',');


  try {
    const codePhaseForCapital = await CodePhaseType.findOne({
      where: {
        code_phase_type_id: defaultProjectId
      }
    });
    const { duration, duration_type } = codePhaseForCapital;
    const formatDuration = duration_type[0].toUpperCase();

    const data = await projectService.saveProject(CREATE_PROJECT_TABLE_V2, cleanStringValue(projectname), cleanStringValue(description), defaultProjectId, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), creator, creator)
    result.push(data)
    const { project_id } = data;
    await cartoService.insertToCarto(CREATE_PROJECT_TABLE, geom, project_id);
    //await projectStatusService.saveProjectStatusFromCero(defaultProjectId, project_id, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), 2, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), creator, creator)
    const response = await projectStatusService.saveProjectStatusFromCero(defaultProjectId, 
      project_id, 
      moment().format('YYYY-MM-DD HH:mm:ss'), 
      moment().format('YYYY-MM-DD HH:mm:ss'), 
      moment().format('YYYY-MM-DD HH:mm:ss'), 
      moment().add(Number(duration), formatDuration).format('YYYY-MM-DD HH:mm:ss'), 
      moment().format('YYYY-MM-DD HH:mm:ss'), 
      Number(duration), 
      moment().format('YYYY-MM-DD HH:mm:ss'), 
      moment().format('YYYY-MM-DD HH:mm:ss'), 
      creator, 
      creator);
    const resres = await Project.update({
      current_project_status_id: response.project_status_id
    },{ where: { project_id: project_id }});
    console.log(resres);
    
    const projectsubtype = '';
    await addProjectToBoard(user, servicearea, county, locality, defaultProjectType, project_id, year, sendToWR, isWorkPlan, projectname, projectsubtype);
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
    await projectService.addProjectToCache(project_id);
    result.push(dataArcGis);
  } catch (error) {
    logger.error('Error at special route: ', error);
    return res.status(500).send(error);
  };

  res.send(result);
});

router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
  const project_id = req.params.projectid;
  const user = req.user;
  const { projectname, description, servicearea, county, geom, locality,
    jurisdiction, sponsor, cosponsor, cover, year, sendToWR, isWorkPlan } = req.body;
  let result = [];
  const creator = user.email;
  const splitedJurisdiction = jurisdiction.split(',');
  const splitedCounty = county.split(',');
  const splitedServicearea = servicearea.split(',');
  try {
    const data = await projectService.updateProject(project_id, cleanStringValue(projectname), cleanStringValue(description), moment().format('YYYY-MM-DD HH:mm:ss'), creator);
    result.push(data)
    await cartoService.updateToCarto(CREATE_PROJECT_TABLE, geom, project_id);
    const projectsubtype = '';
    const projecttype = 'Special';
    updateProjectsInBoard(project_id, cleanStringValue(projectname), projecttype, projectsubtype);
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
    await projectService.updateProject(project_id);
  } catch (error) {
    logger.error(error);
    return res.status(500).send(error);
  };
  res.send(result);
});

export default router;
