const express = require('express');
const Multer = require('multer');
const needle = require('needle');
const attachmentService = require('../../services/attachment.service');
const {
  CARTO_URL,
  CREATE_PROJECT_TABLE,
  COSPONSOR1
} = require('../../config/config');
const auth = require('../../auth/auth');
const logger = require('../../config/logger');
const { addProjectToBoard, getNewProjectId, setProjectID, cleanStringValue } = require('./helper');

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
    jurisdiction, sponsor, cosponsor, cover, year, sendToWR } = req.body;
  const status = 'Draft';
  const projecttype = 'Special';
  let notRequiredFields = '';
  let notRequiredValues = '';
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
  let splittedJurisdiction = jurisdiction.split(',');
  if (isWorkPlan) {
    splittedJurisdiction = [locality];
  }
  for (const j of splittedJurisdiction) {
    const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, sponsor ${notRequiredFields} ,projectid) 
    VALUES(ST_GeomFromGeoJSON('${geom}'), '${j}', '${cleanStringValue(projectname)}', '${cleanStringValue(description)}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${sponsor}' ${notRequiredValues} , -1)`;
    const query = {
      q: insertQuery
    };
    console.log('my query ', JSON.stringify(query));
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
        await addProjectToBoard(user, servicearea, county, jurisdiction, projecttype, projectId, year, sendToWR);
        await attachmentService.uploadFiles(user, req.files, projectId, cover);
      } else {
        logger.error('bad status ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));
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
  const { projectname, description, servicearea, county, geom, locality, jurisdiction, sponsor, cosponsor, sendToWR, cover } = req.body;
  const projecttype = 'Special';
  let notRequiredFields = '';
  if (cosponsor) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += `${COSPONSOR1} = '${cosponsor}'`;
  }
  if (notRequiredFields) {
    notRequiredFields = `, ${notRequiredFields}`;
  }
  const updateQuery = `UPDATE ${CREATE_PROJECT_TABLE}
  SET the_geom = ST_GeomFromGeoJSON('${geom}'), jurisdiction = '${jurisdiction}', 
  projectname = '${cleanStringValue(projectname)}', description = '${cleanStringValue(description)}',
   servicearea = '${servicearea}', county = '${county}', 
   projecttype = '${projecttype}', sponsor = '${sponsor}'
   ${notRequiredFields}
   WHERE  projectid = ${projectid}`;
  const query = {
    q: updateQuery
  };
  logger.info('my query ' + JSON.stringify(query));
  let result = {};
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(JSON.stringify(result));
      await attachmentService.uploadFiles(user, req.files, projectid, cover);
    } else {
      logger.error('bad status ' + data.statusCode + '  -- ' + updateQuery + JSON.stringify(data.body, null, 2));
      return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error, 'at', updateQuery);
    return res.status(500).send(error);
  };
  res.send(result);
});

module.exports = router;