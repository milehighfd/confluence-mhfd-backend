const express = require('express');
const Multer = require('multer');
const needle = require('needle');
const attachmentService = require('../../services/attachment.service');
const projectStreamService = require('../../services/projectStream.service');
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
  const {isWorkPlan, projectname, description, servicearea, county, ids, streams, cosponsor, geom, locality, jurisdiction, sponsor, cover, year, studyreason, studysubreason, sendToWR} = req.body;
  const status = 'Draft';
  const projecttype = 'Study';
  const projectsubtype = 'Master Plan';
  let parsedIds = '';
  let idsArray = JSON.parse(ids);
  for (const id of idsArray) {
    if (parsedIds) {
      parsedIds += ',';
    }
    parsedIds += "'" + id + "'";
  }
  let notRequiredFields = ``;
  let notRequiredValues = ``;
  if (cosponsor) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += COSPONSOR1;
    notRequiredValues += `'${cosponsor}' as cosponsor`;
  }
  if (notRequiredFields) {
    notRequiredFields = `, ${notRequiredFields}`;
    notRequiredValues = `, ${notRequiredValues}`;
  }
  let result = [];
  let splittedJurisdiction = jurisdiction.split(',');
  //if (isWorkPlan) {
  //  splittedJurisdiction = [locality];
  // }
  for (const j of splittedJurisdiction) {
    let finalQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, projectsubtype, sponsor, studyreason, studysubreason ${notRequiredFields} ,projectid)
    (SELECT ST_Collect(the_geom) as the_geom, '${j}' as jurisdiction, '${cleanStringValue(projectname)}' as projectname , '${cleanStringValue(description)}' as description, '${servicearea}' as servicearea,
    '${county}' as county, '${status}' as status, '${projecttype}' as projecttype, '${projectsubtype}' as projectsubtype,
    '${sponsor}' as sponsor, '${studyreason}' as studyreason, '${studysubreason}' as studysubreason ${notRequiredValues} ,${-1} as projectid FROM mhfd_stream_reaches WHERE unique_mhfd_code  IN(${parsedIds}))`;
    if (!idsArray.length) {
      finalQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (jurisdiction, projectname, description, servicearea, county, status, projecttype, projectsubtype, sponsor, studyreason, studysubreason ${notRequiredFields} ,projectid)
    VALUES ('${j}', '${cleanStringValue(projectname)}', '${cleanStringValue(description)}', '${servicearea}',
    '${county}', '${status}', '${projecttype}', '${projectsubtype}',
    '${sponsor}', '${studyreason}', '${studysubreason}' ${notRequiredValues} ,${-1})`;
    }
    const insertQuery = finalQuery;
    const query = {
      q: insertQuery
    };
    console.log('my query ' , query);
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
        let toBoard = j;
        if (eval(isWorkPlan)) {
          toBoard = locality;
        }
        await addProjectToBoard(user, servicearea, county, toBoard, projecttype, projectId, year, sendToWR, isWorkPlan);
        await attachmentService.uploadFiles(user, req.files, projectId, cover);
        for (const stream of JSON.parse(streams)) {
          projectStreamService.saveProjectStream({
            projectid: projectId,
            mhfd_code: stream.mhfd_code,
            length: stream.length,
            drainage: stream.drainage,
            jurisdiction: stream.jurisdiction,
            str_name: stream.str_name
          });
        }
      } else {
        logger.error('bad status ' + data.statusCode + '  -- '+ insertQuery +  JSON.stringify(data.body, null, 2));
        return res.status(data.statusCode).send(data.body);
        }
    } catch (error) {
      logger.error(error, 'at', insertQuery);
      return res.status(500).send(error);
    };
  }
  res.send(result);
});

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
  let geomUpdate = '';
  if (idsArray.length) {
    geomUpdate = `the_geom = (SELECT ST_Collect(the_geom) FROM mhfd_stream_reaches WHERE unique_mhfd_code IN(${parsedIds})),`;
  }
  const updateQuery = `UPDATE ${CREATE_PROJECT_TABLE} SET
    ${geomUpdate}
   jurisdiction = '${jurisdiction}',
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
});

module.exports = router;
