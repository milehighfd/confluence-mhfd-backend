const express = require('express');
const router = express.Router();
const Multer = require('multer');
const bcrypt = require('bcryptjs');
const https = require('https');
const needle = require('needle');
const { CARTO_TOKEN, CREATE_PROJECT_TABLE } = require('../config/config');

//const User = require('../models/user.model');
const db = require('../config/db');
const User = db.user;
const UserService = require('../services/user.service');
const auth = require('../auth/auth');
const { validator } = require('../utils/utils');
const { EMAIL_VALIDATOR, ROLES } = require('../lib/enumConstants');
const userService = require('../services/user.service');
const UPDATEABLE_FIELDS = userService.requiredFields('edit');
const logger = require('../config/logger');
const ORGANIZATION_DEFAULT = 'Mile High Flood District'; // 'Mile High Flood Control District';
const { count, group } = require('console');
const { PROJECT_TYPES_AND_NAME } = require('../lib/enumConstants');
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

const COMPONENTS_TABLES = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
'special_item_linear', 'special_item_area', 'channel_improvements_linear',
'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];

router.post('/showcomponents', auth, async (req, res) => {
   const geom = req.body.geom;
   let result = [];
   for (const component of COMPONENTS_TABLES) {
     const sql = `SELECT cartodb_id, type, jurisdiction, status, original_cost, problemid  FROM ${component} WHERE ST_INTERSECTS(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom) AND projectid is null `;
     const query = {
      q: sql
      };
      console.log(sql);
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      let body = {};
      try {
        const data = await needle('post', URL, query, { json: true });
        //console.log('STATUS', data.statusCode);
        if (data.statusCode === 200) {
          body = data.body;
          logger.info(JSON.stringify(body.rows));
          result = result.concat(body.rows);
          logger.info('length ' + result.length);
          //logger.info(JSON.stringify(body, null, 2));
        } else {
          logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
        }
      } catch (error) {
        logger.error(error);
      };
    }
    let inn = '';
    for (const element of result) {
      if (element.problemid) {
        if (inn) {
          inn += ',';
        }
        inn += element.problemid;
      }
    }
    const groups = {'-1': {
      problemname: 'No name',
      components: [],
      jurisdiction: '-'
    }};
    const problems = ['No problem'];
    if (inn) {
      const sql_problems = `SELECT problemname, problemid, jurisdiction FROM problems WHERE problemid IN (${inn})`;
      const query_problems = {
        q: sql_problems
      }
      let body = {};
      try {
        const data = await needle('post', URL, query, { json: true });
        //console.log('STATUS', data.statusCode);
        if (data.statusCode === 200) {
          body = data.body;
          logger.info(JSON.stringify(body.rows));
          const bodyProblems = body.rows(row => row.problemname);
          for (const problem of body) {
            groups[problem.problemid] = {
              problemname: problem.problemname,
              jurisdiction: problem.jurisdiction,
              components: []
            };
          }
          problems = problems.concat(bodyProblems);
          logger.info('length of problems' + problems.length);
          //logger.info(JSON.stringify(body, null, 2));
        } else {
          logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
        }
      } catch (error) {
        logger.error(error);
      };
    }
    for (const project of result) {
      if (project.problemid == null) {
        groups['-1'].components.push(project);
      } else {
        groups[project.problemid].components.push(project);
      }
    }
    res.send({
      result: result,
      problems: problems,
      groups: groups
    });
   
});
router.post('/capital', auth, async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county1, geom, 
    overheadcost, overheadcostdescription, additionalcost, additionalcostdescription} = req.body;
  const sponsor = user.sponsor;
  const status = 'Draft';
  const projecttype = 'Capital';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county1, status, projecttype, sponsor, overheadcost, overheadcostdescription, additionalcost, additionalcostdescription)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county1}', '${status}', '${projecttype}', '${sponsor}', '${overheadcost}',
   '${overheadcostdescription}', '${additionalcost}', '${additionalcostdescription}')`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query);
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
    } else {
       logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});

router.post('/maintenance', auth, async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county1, geom, projectsubtype, frequency, maintenanceeligibility, ownership} = req.body;
  const sponsor = user.sponsor;
  const status = 'Draft';
  const projecttype = 'Maintenance';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county1, status, projecttype, projectsubtype, frequency, sponsor, maintenanceeligibility, ownership)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county1}', '${status}', '${projecttype}', '${projectsubtype}', '${frequency}', '${sponsor}', '${maintenanceeligibility}', '${ownership})`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query);
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
    } else {
       logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});
router.post('/study', auth, async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county1, geom, cosponsor} = req.body;
  const sponsor = req.body.sponsor || user.sponsor;
  const status = 'Draft';
  const projecttype = 'Study';
  const projectsubtype = 'Master Plan';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county1, status, projecttype, projectsubtype, cosponsor, sponsor)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county1}', '${status}', '${projecttype}', '${projectsubtype}', ${cosponsor}, '${sponsor}')`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query);
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
    } else {
       logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});
router.post('/acquisition', auth, async (req, res) => {
  const user = req.user;
  const sponsor = user.sponsor;
  const {projectname, description, servicearea, county1, geom, acquisitionprogress, acquisitionanticipateddate} = req.body;
  const status = 'Draft';
  const projecttype = 'Acquisition';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county1, status, projecttype, acquisitionprogress, acquisitionanticipateddate, sponsor)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county1}', '${status}', '${projecttype}', '${acquisitionprogress}', ${acquisitionanticipateddate}, '${sponsor}')`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query);
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});
router.post('/special', auth, async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county1, geom} = req.body;
  const status = 'Draft';
  const projecttype = 'Special';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county1, status,projecttype)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county1}', '${status}', '${projecttype}')`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query);
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
    }
 } catch (error) {
    logger.error(error);
 };
  res.send(result);
});
module.exports = router;