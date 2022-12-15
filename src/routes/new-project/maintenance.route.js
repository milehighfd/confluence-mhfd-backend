import express from 'express';
import Multer from 'multer';
import needle from 'needle';
import attachmentService from 'bc/services/attachment.service.js';
import {
  CARTO_URL,
  CREATE_PROJECT_TABLE_V2,
  COSPONSOR1
} from 'bc/config/config.js';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';
import { addProjectToBoard, getNewProjectId, setProjectID, cleanStringValue } from 'bc/routes/new-project/helper.js';


import projectComponentService from 'bc/services/projectComponent.service.js';
import projectService from 'bc/services/project.service.js';
import projectStatusService from 'bc/services/projectStatus.service.js';
import moment from 'moment';

const router = express.Router();
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});


router.post('/', [auth, multer.array('files')], async (req, res) => {
  //const user = req.user;
  // console.log('the user ', user);
  const {isWorkPlan, projectname, description, servicearea, county, geom, projectsubtype, frequency, maintenanceeligibility, ownership, locality, jurisdiction, sponsor, cosponsor, cover, year, sendToWR} = req.body;
  const status = 'Draft';
  const defaultProjectId = '8';
  const creator = 'sys'
  let notRequiredFields = ``;
  let notRequiredValues = ``;
/*   
ask mahesh
if (frequency) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += 'frequency';
    notRequiredValues += `'${frequency}'`;
  } */
  if (maintenanceeligibility) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += 'code_maintenance_eligibility_type_id';
    notRequiredValues += `'2'`;
  }
/*   
ask mahesh
if (ownership) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += 'ownership';
    notRequiredValues += `'${ownership}'`;
  } 
  ask mahesh

  if (cosponsor) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += COSPONSOR1;
    notRequiredValues += `'${cosponsor}'`;
  }
  ask mahesh

planned_start_date}', '${actual_start_date}', '${planned_end_date}', '${actual_end_date}', '${duration}', '${created_date}', '${modified_date}', '${last_modified_by}', '${created_by}')`
 
  */
  if (notRequiredFields) {
    notRequiredFields = `, ${notRequiredFields}`;
    notRequiredValues = `, ${notRequiredValues}`;
  }
  let splittedJurisdiction = jurisdiction.split(',');
  if (isWorkPlan) {
    splittedJurisdiction = [locality];
  }
  let result = [];
  for (const j of splittedJurisdiction) {
    try {
      const data = await projectService.saveProject(CREATE_PROJECT_TABLE_V2, j, cleanStringValue(projectname), cleanStringValue(description), defaultProjectId, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), creator, notRequiredFields, notRequiredValues, creator)
      result.push(data)
      const { project_id } = data;
      await projectStatusService.saveProjectStatusFromCero(defaultProjectId, project_id, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), 2, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), creator, creator)
      // await addProjectToBoard(user, servicearea, county, j, projecttype, projectId, year, sendToWR, isWorkPlan);
      //await attachmentService.uploadFiles(user, req.files, projectId, cover);
    } catch (error) {
      logger.error(error);
    };
  }
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
