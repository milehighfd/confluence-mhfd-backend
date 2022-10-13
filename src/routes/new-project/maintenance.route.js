import express from 'express';
import Multer from 'multer';
import needle from 'needle';
import attachmentService from 'bc/services/attachment.service.js';
import {
  CARTO_URL,
  CREATE_PROJECT_TABLE,
  COSPONSOR1
} from 'bc/config/config.js';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';
import { addProjectToBoard, getNewProjectId, setProjectID, cleanStringValue } from 'bc/routes/new-project/helper.js';

const router = express.Router();
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

router.post('/', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  // console.log('the user ', user);
  const {isWorkPlan, projectname, description, servicearea, county, geom, projectsubtype, frequency, maintenanceeligibility, ownership, locality, jurisdiction, sponsor, cosponsor, cover, year, sendToWR} = req.body;
  const status = 'Draft';
  const projecttype = 'Maintenance';
  let notRequiredFields = ``;
  let notRequiredValues = ``;
  if (frequency) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += 'frequency';
    notRequiredValues += `'${frequency}'`;
  }
  if (maintenanceeligibility) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += 'maintenanceeligibility';
    notRequiredValues += `'${maintenanceeligibility}'`;
  }
  if (ownership) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += 'ownership';
    notRequiredValues += `'${ownership}'`;
  }
  if (cosponsor) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += COSPONSOR1;
    notRequiredValues += `'${cosponsor}'`;
  }
  if (notRequiredFields) {
    notRequiredFields = `, ${notRequiredFields}`;
    notRequiredValues = `, ${notRequiredValues}`;
  }
  let splittedJurisdiction = jurisdiction.split(',');
  if (isWorkPlan) {
    splittedJurisdiction = [locality];
  }
  for (const j of splittedJurisdiction) {
    const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, projectsubtype, sponsor ${notRequiredFields} ,projectid)
    VALUES(ST_GeomFromGeoJSON('${geom}'), '${j}', '${cleanStringValue(projectname)}', '${cleanStringValue(description)}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${projectsubtype}', '${sponsor}' ${notRequiredValues} ,${-1})`;
    const query = {
      q: insertQuery
    };
    let result = [];
    try {
      const data = await needle('post', CARTO_URL, query, { json: true });
      if (data.statusCode === 200) {
        result.push(data.body);
        logger.info(JSON.stringify(result));
        let projectId = await getNewProjectId();
        const updateId = await setProjectID(res, projectId);
        if (!updateId) {
          return;
        }
        await addProjectToBoard(user, servicearea, county, j, projecttype, projectId, year, sendToWR, isWorkPlan);
        await attachmentService.uploadFiles(user, req.files, projectId, cover);
      } else {
        logger.error('\n\n\nbad status ' + data.statusCode + '  -- '+ insertQuery +  JSON.stringify(data.body, null, 2));
        return res.status(data.statusCode).send(data.body);
      }
    } catch (error) {
      logger.error(error, 'at', insertQuery);
    };
  }
  res.send(result);
});

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
});

export default router;
