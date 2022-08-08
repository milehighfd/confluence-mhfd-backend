const express = require('express');
const Multer = require('multer');
const needle = require('needle');
const attachmentService = require('../../services/attachment.service');
const {
  CARTO_URL,
  CREATE_PROJECT_TABLE,
  COSPONSOR1
} = require('../../config/config');
const db = require('../../config/db');
const auth = require('../../auth/auth');
const logger = require('../../config/logger');
const { addProjectToBoard, getNewProjectId, setProjectID } = require('./helper');

const router = express.Router();
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

router.post('/', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, geom,
    acquisitionprogress, acquisitionanticipateddate, locality, jurisdiction, sponsor,
    cosponsor, cover, year, sendToWR } = req.body;
  const status = 'Draft';
  const projecttype = 'Acquisition';
  let notRequiredFields = ``;
  let notRequiredValues = ``;
  if (acquisitionprogress) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += 'acquisitionprogress';
    notRequiredValues += `'${acquisitionprogress}'`;
  }
  if (acquisitionanticipateddate) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += 'acquisitionanticipateddate';
    notRequiredValues += `${acquisitionanticipateddate}`;
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
  let result = [];
  const splittedJurisdiction = jurisdiction.split(',');
  for (const j of splittedJurisdiction) {
    const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, sponsor ${notRequiredFields}  ,projectid)
    VALUES(ST_GeomFromGeoJSON('${geom}'), '${j}', '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${sponsor}' ${notRequiredValues} ,${-1})`;
    const query = {
      q: insertQuery
    };
    
    logger.info('my query ' + query.q);
    let result = {};
    try {
      const data = await needle('post', CARTO_URL, query, { json: true });
      //console.log('STATUS', data.statusCode);
      if (data.statusCode === 200) {
        result = data.body;
        logger.info(JSON.stringify(result));
        let projectId = await getNewProjectId();
        const updateId = await setProjectID(res, projectId);
        if (!updateId) {
          return;
        }
        await addProjectToBoard(user, servicearea, county, j, projecttype, projectId, year, sendToWR);
        await attachmentService.uploadFiles(user, req.files, projectId, cover);
      } else {
        logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
        return res.status(data.statusCode).send(data.body);
      }
    } catch (error) {
      logger.error(error, 'at', sql);
      return res.status(500).send(error);
    };
  }
  res.send(result);
});

router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const projectid = req.params.projectid;
  const {projectname, description, servicearea, county, geom, acquisitionprogress,
    acquisitionanticipateddate, locality, jurisdiction, sponsor, cosponsor, cover, sendToWR} = req.body;
  const status = 'Draft';
  const projecttype = 'Acquisition';
  let notRequiredFields = ``;
  if (acquisitionprogress) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `acquisitionprogress = '${acquisitionprogress}'`;
  }
  if (acquisitionanticipateddate) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `acquisitionanticipateddate = ${acquisitionanticipateddate}`;
  }
  if (cosponsor) {
    if (notRequiredFields) {
      notRequiredFields += `, `;
    }
    notRequiredFields += `${COSPONSOR1} = '${cosponsor}'`;
  }
  if (notRequiredFields) {
    notRequiredFields = `, ${notRequiredFields}`;
  }
  const updateQuery = `UPDATE ${CREATE_PROJECT_TABLE} 
  SET the_geom = ST_GeomFromGeoJSON('${geom}'), jurisdiction = '${jurisdiction}',
   projectname = '${projectname}', description = '${description}', 
   servicearea = '${servicearea}', county = '${county}', status = '${status}', 
   projecttype = '${projecttype}',  
   sponsor = '${sponsor}'
   ${notRequiredFields}
   WHERE  projectid = ${projectid}
   `;
  logger.info('THE QUERY IS ' + updateQuery);
  const query = {
    q: updateQuery
  };
  let result = {};
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(JSON.stringify(result));
      await attachmentService.uploadFiles(user, req.files, projectid, cover);
    } else {
      logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
      return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error, 'at', sql);
    return res.status(500).send(error);
  };
  res.send(result);
});

module.exports = router;
