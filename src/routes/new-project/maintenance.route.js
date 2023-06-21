import express from 'express';
import Multer from 'multer';
import {
  CREATE_PROJECT_TABLE_V2,
  CREATE_PROJECT_TABLE
} from 'bc/config/config.js';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';
import { addProjectToBoard, cleanStringValue, updateProjectsInBoard,createLocalitiesBoard,getLocalitiesNames } from 'bc/routes/new-project/helper.js';
import cartoService from 'bc/services/carto.service.js';
import db from 'bc/config/db.js';

import attachmentService from 'bc/services/attachment.service.js';
import projectService from 'bc/services/project.service.js';
import projectStatusService from 'bc/services/projectStatus.service.js';
import projectDetailService from 'bc/services/projectDetail.service.js';
import projectPartnerService from 'bc/services/projectPartner.service.js';

import moment from 'moment';

const CodeProjectType = db.codeProjectType;
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
    geom,
    projectsubtype,
    frequency,
    maintenanceeligibility,
    ownership,
    locality,
    jurisdiction,
    sponsor,
    cosponsor,
    cover,
    year,
    sendToWR,
  } = req.body;
  const status = 'Draft';
  const defaultProjectId = await CodeProjectType.findOne({
    where: {
      project_type_name: projectsubtype,
    },
  });
  const defaultProjectType = 'Maintenance';
  const creator = user.email;
  const splitedJurisdiction = jurisdiction.split(',');
  const splitedCounty = county.split(',');
  const splitedServicearea = servicearea.split(',');
  let result = [];
  try {
    let codePhaseForCapital = await CodePhaseType.findOne({
      where: {
        code_project_type_id: defaultProjectId.code_project_type_id,
      },
    });    
    if (!codePhaseForCapital) {
      codePhaseForCapital = await CodePhaseType.findOne();
    }
    const { duration, duration_type } = codePhaseForCapital;
    const formatDuration = duration_type[0].toUpperCase();
    const officialProjectName = projectname + (projectname === 'Ex: Stream Name @ Location 202X'? ('_' + Date.now()) : '')
    const data = await projectService.saveProject(
      CREATE_PROJECT_TABLE_V2,
      cleanStringValue(officialProjectName),
      cleanStringValue(description),
      defaultProjectId.code_project_type_id,
      moment().format('YYYY-MM-DD HH:mm:ss'),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      creator,
      creator,
      maintenanceeligibility
    );
    result.push(data);
    const { project_id } = data;
    await cartoService.checkIfExistGeomThenDelete(
      CREATE_PROJECT_TABLE,
      project_id
    );
    await cartoService.insertToCarto(CREATE_PROJECT_TABLE, geom, project_id);
    const response = await projectStatusService.saveProjectStatusFromCero(
      codePhaseForCapital.code_phase_type_id,
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
    console.log(resres);

    await projectDetailService.saveProjectDetail(
      frequency,
      ownership,
      project_id,
      creator,
      creator
    );
    await attachmentService.uploadFiles(user, req.files, project_id, cover);

    // Start of Add or Create Board
    const PROJECT_TYPE = 'Maintenance';
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
    const dataArcGis = await projectService.insertIntoArcGis(
      geom,
      project_id,
      cleanStringValue(projectname)
    );
    result.push(dataArcGis);
    res.send(result);
  } catch (error) {    
    logger.error(error);
    res.status(500).send(error);
  }  
});

router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
  const project_id = req.params.projectid;
  const user = req.user;
  const {
    isWorkPlan,
    projectname,
    description,
    servicearea,
    county,
    geom,
    projectsubtype,
    frequency,
    maintenanceeligibility,
    ownership,
    locality,
    jurisdiction,
    sponsor,
    cosponsor,
    cover,
    year,
    sendToWR,
  } = req.body;
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
      maintenanceeligibility
    );
    result.push(data);
    await cartoService.checkIfExistGeomThenDelete(
      CREATE_PROJECT_TABLE,
      project_id
    );
    await cartoService.insertToCarto(CREATE_PROJECT_TABLE, geom, project_id);
    const projecttype = 'Maintenance';
    await attachmentService.toggleName(cover);
    await attachmentService.uploadFiles(user, req.files, project_id, cover);
    updateProjectsInBoard(
      project_id,
      cleanStringValue(projectname),
      projecttype,
      projectsubtype
    );
    await projectDetailService.updateProjectDetail(
      frequency,
      ownership,
      project_id,
      creator
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
    logger.info('UPDATED!');
    res.send(result);
  } catch (error) {
    logger.error(error);
  };
}); 

export default router;
