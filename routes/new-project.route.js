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

router.post('/get-all-streams', auth, async (req, res) => {
  const geom = req.body.geom;
  const sql = `SELECT cartodb_id FROM streams WHERE ST_INTERSECTS(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom)`;
  const query = {
    q: sql
  };
  let body = {};
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      body = data.body;
      logger.info(JSON.stringify(body.rows));
      body.rows = body.rows.map(data => data.cartodb_id);
      res.send(body.rows);
      //logger.info(JSON.stringify(body, null, 2));
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  };
});
router.post('/get-stream', auth, async (req, res) => {
  const geom = req.body.geom;
  let result = {};
  const sql = `SELECT ST_AsGeoJSON(
    ST_Simplify(ST_Intersection(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'),
                    ST_COLLECT(ARRAY(SELECT the_geom FROM streams))), 0.5)
  ) as geom`;
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
      logger.info(JSON.stringify(body.rows[0]));
      res.send(body.rows[0]);
      //logger.info(JSON.stringify(body, null, 2));
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  };
});

router.post('/get-stream-convexhull', auth, async (req, res) => {
  const geom = req.body.geom;
  let result = {};
  const current = new Date().getTime();
  const createSQL = `CREATE TABLE aux_${current} AS (SELECT the_geom, the_geom_webmercator FROM ${COMPONENTS_TABLES[0]} 
  WHERE ST_INTERSECTS(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom) AND projectid is null)`;
  logger.info(createSQL);
  const createQuery = {
    q: createSQL
  };
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  try {
    const data = await needle('post', URL, createQuery, { json: true });
    if (data.statusCode === 200) {
      logger.info('CREATE');
      const promises = [];
      for (let i = 1; i < COMPONENTS_TABLES.length; i++) {
        const updateSQL = `INSERT INTO aux_${current} (the_geom, the_geom_webmercator)
        (SELECT the_geom, the_geom_webmercator FROM ${COMPONENTS_TABLES[i]}
        WHERE ST_INTERSECTS(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom) AND projectid is null)`;
        logger.info(updateSQL);
        const updateQuery = {
          q: updateSQL
        };
        const promise = new Promise((resolve, reject) => {
          needle('post', URL, updateQuery, { json: true })
          .then(response => {
            if (response.statusCode === 200) {
              logger.info('INSERT ', COMPONENTS_TABLES[i]);
              resolve(true);
            } else {
              logger.info('FAIL TO INSERT ',  COMPONENTS_TABLES[i]);
              resolve(false);
            }
          })
          .catch(error => {
            reject(false);
          });
        });
        promises.push(promise);
      }
      Promise.all(promises).then(async (values) => {
        const hullSQL = `
        SELECT ST_AsGeoJSON(
          ST_Simplify(ST_Intersection(ST_ConvexHull(ST_COLLECT(ARRAY(SELECT the_geom FROM aux_${current}))),
                          ST_COLLECT(ARRAY(SELECT the_geom FROM streams))), 0.5)
        ) as geom`;
        const hullQuery = {
          q: hullSQL
        };
        logger.info(hullSQL);
        const intersectionData = await needle('post', URL, hullQuery, { json: true });
        if (intersectionData.statusCode === 200) {
          const body = intersectionData.body;
          logger.info(JSON.stringify(body.rows));
          result = body.rows[0];
          const dropSQL = `DROP table if exists  aux_${current} `;
          const dropQuery = {
            q: dropSQL
          }
          console.log(dropSQL);
          const deleted = await needle('post', URL, dropQuery, { json: true });
          if (deleted.statusCode === 200) {
            logger.info('DELETE TABLE aux_' + current);
          } else {
            logger.error('IMPOSSIBLE DELETE TABLE aux_' + current + ' ' + deleted.statusCode + ' ' + JSON.stringify(deleted.body));
          }
          res.send(result);
          logger.info('length ' + result.length);
          //logger.info(JSON.stringify(body, null, 2));
        } else {
          logger.error('bad status ' + intersectionData.statusCode + ' ' +  JSON.stringify(intersectionData.body, null, 2));
        }
      });
    } else {
      logger.info('NOT CREATED ' +  data.statusCode + ' [ ' + JSON.stringify(data.body));
    }
  } catch(error) {
    console.log(error);
    res.status(500).send({error: JSON.stringify(error)});
  }
});

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
          body.rows = body.rows.map(element => {
            return {
              table: component, ...element
            };
          })
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
  const {projectname, description, servicearea, county, geom, 
    overheadcost, overheadcostdescription, additionalcost, additionalcostdescription} = req.body;
  const sponsor = user.sponsor;
  const status = 'Draft';
  const projecttype = 'Capital';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county, status, projecttype, sponsor, overheadcost, overheadcostdescription, additionalcost, additionalcostdescription)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${sponsor}', '${overheadcost}',
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
       res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});

router.post('/maintenance', auth, async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, geom, projectsubtype, frequency, maintenanceeligibility, ownership} = req.body;
  const sponsor = user.sponsor;
  const status = 'Draft';
  const projecttype = 'Maintenance';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county, status, projecttype, projectsubtype, frequency, sponsor, maintenanceeligibility, ownership)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${projectsubtype}', '${frequency}', '${sponsor}', '${maintenanceeligibility}', '${ownership})`;
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
       res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});
router.post('/study', auth, async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, geom, cosponsor} = req.body;
  const sponsor = req.body.sponsor || user.sponsor;
  const status = 'Draft';
  const projecttype = 'Study';
  const projectsubtype = 'Master Plan';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county, status, projecttype, projectsubtype, cosponsor, sponsor)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${projectsubtype}', ${cosponsor}, '${sponsor}')`;
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
       res.status(data.statusCode).send(data.body);
      }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});
router.post('/acquisition', auth, async (req, res) => {
  const user = req.user;
  const sponsor = user.sponsor;
  const {projectname, description, servicearea, county, geom, acquisitionprogress, acquisitionanticipateddate} = req.body;
  const status = 'Draft';
  const projecttype = 'Acquisition';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county, status, projecttype, acquisitionprogress, acquisitionanticipateddate, sponsor)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${acquisitionprogress}', ${acquisitionanticipateddate}, '${sponsor}')`;
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
      res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});
router.post('/special', auth, async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, geom} = req.body;
  const status = 'Draft';
  const projecttype = 'Special';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county, status,projecttype)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}')`;
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
      res.status(data.statusCode).send(data.body);
espera    }
 } catch (error) {
    logger.error(error);
 };
  res.send(result);
});
module.exports = router;