const express = require('express');
const router = express.Router();
const Multer = require('multer');
const bcrypt = require('bcryptjs');
const https = require('https');
const needle = require('needle');
const attachmentService = require('../services/attachment.service');
const { CARTO_TOKEN, CREATE_PROJECT_TABLE } = require('../config/config');

const db = require('../config/db');
const Board = db.board;
const BoardProject = db.boardProject;
//const User = require('../models/user.model');
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

const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

const COMPONENTS_TABLES = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
'special_item_linear', 'special_item_area', 'channel_improvements_linear',
'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];

router.post('/get-components-by-components-and-geom', auth, async (req, res) => {
  const geom = req.body.geom;
  const components = req.body.components;
  const usableComponents = {};
  let where = '';
  if (geom) {
    where = `ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom, 0)`;
  }
  if (components) {
    for (const component of components) {
      if (!usableComponents[component.table]) {
        usableComponents[component.table] = [];
      }
      usableComponents[component.table].push(component.cartodb_id);
    }
  }
  logger.info('my usable components ' + JSON.stringify(usableComponents, null, 2));
  let result = [];
  for (const component of COMPONENTS_TABLES) {
    if (!geom && !usableComponents[component]) {
      continue;
    }
    let queryWhere = '';
    if (usableComponents[component]) {
      queryWhere = `cartodb_id IN(${usableComponents[component].join(',')})`;
    }
    if (where) {
      if (queryWhere) {
        queryWhere = queryWhere + ' OR ' + where;
      } else {
        queryWhere = where;
      }
    }
    const sql = `SELECT cartodb_id, type, jurisdiction, status, original_cost, problemid  FROM ${component} 
    WHERE  ${queryWhere} AND projectid is null `;
    const query = {
      q: sql
    };
    console.log(sql);
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
    const sqlProblems = `SELECT problemname, problemid, jurisdiction FROM problems WHERE problemid IN (${inn})`;
    const queryProblems = {
      q: sqlProblems
    }
    let body = {};
    try {
      const data = await needle('post', URL, queryProblems, { json: true });
      //console.log('STATUS', data.statusCode);
      if (data.statusCode === 200) {
        body = data.body;
        logger.info(JSON.stringify(body.rows));
        const bodyProblems = body.rows.map(row => row.problemname);
        for (const problem of body.rows) {
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

router.post('/get-stream-by-components-and-geom', auth, async (req, res) => {
  const geom = req.body.geom;
  const components = req.body.components;
  const usableComponents = {};
  const current = new Date().getTime();
  let where = '';
  if (geom) {
    where = `ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom, 0)`;
  }
  if (components) {
    for (const component of components) {
      if (!usableComponents[component.table]) {
        usableComponents[component.table] = [];
      }
      usableComponents[component.table].push(component.cartodb_id);
    }
  }
  logger.info(JSON.stringify(usableComponents, null, 2));
  const promises = [];
  let create = false
  for (const component of COMPONENTS_TABLES) {
    if (!geom && !usableComponents[component]) {
      continue;
    }
    let queryWhere = '';
    if (usableComponents[component]) {
      logger.info('this line ' + usableComponents[component].join(','));
      queryWhere = `cartodb_id IN(${usableComponents[component].join(',')})`;
    }
    if (where) {
      if (queryWhere) {
        queryWhere = queryWhere + ' OR ' + where;
      } else {
        queryWhere = where;
      }
    }
    if (!create) {
      const createSQL = `CREATE TABLE aux_${current} AS (SELECT the_geom, the_geom_webmercator FROM ${component} 
        WHERE ${queryWhere} AND projectid is null)`;
      const createQuery = {
        q: createSQL
      };
      logger.info(createSQL);
      try {
        const data = await needle('post', URL, createQuery, { json: true });
        //console.log('STATUS', data.statusCode);
        if (data.statusCode === 200) {
          logger.info('TABLE CREATED ' + component);
          //logger.info(JSON.stringify(body, null, 2));
        } else {
          logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
          res.status(data.statusCode).send(data);
        }
      } catch (error) {
        logger.error(error);
        res.status(500).send(error);
      };
    } else {
      const updateSQL = `INSERT INTO aux_${current} (the_geom, the_geom_webmercator)
        (SELECT the_geom, the_geom_webmercator FROM ${component}
        WHERE ${queryWhere} AND projectid is null)`;
      logger.info(updateSQL);
      const updateQuery = {
        q: updateSQL
      };
      const promise = new Promise((resolve, reject) => {
        needle('post', URL, updateQuery, { json: true })
        .then(response => {
          if (response.statusCode === 200) {
            logger.info('INSERT '+ component);
            resolve(true);
          } else {
            logger.error(response.statusCode + ' ' + JSON.stringify(response.body));
            logger.info('FAIL TO INSERT '+  component);
            resolve(false);
          }
        })
        .catch(error => {
          reject(false);
        });
      });
      promises.push(promise);
    }
    create = true; 
  }
  Promise.all(promises).then(async (values) => {
    const hullSQL = `
    SELECT ST_AsGeoJSON(
      ST_Intersection(ST_ConvexHull(ST_COLLECT(ARRAY(SELECT the_geom FROM aux_${current}))),
                      ST_COLLECT(ARRAY(SELECT the_geom FROM streams)))
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
});

router.get('/components-by-problemid', auth, async (req, res) => {
  const problemid = req.query.problemid;
  const sql = `SELECT problemname, problemid, jurisdiction FROM problems WHERE problemid = ${problemid}`;
  const query = {
    q: sql
  };
  const groups = {};
  const result = [];
  const promises = [];
  try {
    const data = await needle('post', URL, query, { json: true });
    if (data.statusCode === 200) {
      const body = data.body;
      body.rows.forEach(problem => {
        groups[problem.problemid] = {
          problemname: problem.problemname,
          jurisdiction: problem.jurisdiction,
          components: []
        };
      });
      for (const component of COMPONENTS_TABLES) {
        const componentSQL = `SELECT cartodb_id, type, jurisdiction, status, original_cost, problemid 
         FROM ${component} WHERE problemid = ${problemid} AND projectid is null`;
        logger.info(componentSQL);
        const componentQuery = {
          q: componentSQL
        };
        const promise = new Promise((resolve, reject) => {
          needle('post', URL, componentQuery, { json: true })
          .then(response => {
            if (response.statusCode === 200) {
              const body = response.body;
              body.rows.forEach(row => {
                groups[problemid].components.push({
                  table: component,
                  ...row
                });
                result.push({
                  table: component,
                  ...row
                });
              });
              logger.info('DO SELECT FOR ' + component);
              resolve(true);
            } else {
              logger.info('FAIL TO SELECT ' + component + ' ' + response.statusCode + ' ' +  JSON.stringify(response.body));
              logger.error(response.statusCode + ' ' + response.body);
              resolve(false);
            }
          })
          .catch(error => {
            reject(false);
          });
        });
        promises.push(promise);
      }
      Promise.all(promises).then((values) => {
        res.send({
          result: result,
          problems: groups[problemid].problemname,
          groups: groups
        });
      });
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  };
});

router.post('/streams-data', auth, async (req, res) => {
  const geom = req.body.geom;
  const sql = `SELECT  j.jurisdiction, s.str_name, ST_length(ST_intersection(s.the_geom, j.the_geom)::geography) as length  FROM streams s, jurisidictions j 
  where ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), s.the_geom, 0) 
  and ST_DWithin(s.the_geom, j.the_geom, 0) `;
  const query = {
    q: sql
  }
  logger.info(sql)
  try {
    const data = await needle('post', URL, query, { json: true });
    if (data.statusCode === 200) {
      const body = data.body;
      const answer = {};
      body.rows.forEach(row => {
        if (row.str_name) {
          if (!answer[row.str_name]) {
            answer[row.str_name] = [];
          }
          answer[row.str_name].push({
            jurisdiction: row.jurisdiction,
            length: row.length,
            drainage: 0
          });
        }
      });
      /*
      const drainageQuery = `SELECT s.str_name, j.jurisdiction, ST_AREA(ST_Intersection(c.the_geom, j.the_geom)::geography) 
      as area FROM streams s,  mhfd_catchments_simple_v1 c, jurisidictions j WHERE 
      ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), s.the_geom, 0) AND s.reach_code is not distinct from c.reach_code 
      and s.trib_code1 is not distinct from c.trib_code1 and s.trib_code2 is not distinct from c.trib_code2 and s.trib_code3 is not distinct from c.trib_code3
      and s.trib_code4 is not distinct from c.trib_code4 and s.trib_code5 is not distinct from c.trib_code5
      and s.trib_code6 is not distinct from c.trib_code6 and s.trib_code7 is not distinct from c.trib_code7 AND ST_DWithin(c.the_geom, j.the_geom, 0) 
      AND s.reach_code is not distinct from (SELECT max(reach_code) FROM streams WHERE ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom, 0)) `;
      */
      res.send(answer);
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  };
});

router.post('/get-countyservicearea-for-polygon', auth, async (req, res) => {
  const geom = req.body.geom;
  const sql = `SELECT aoi, filter FROM mhfd_zoom_to_areas where filter SIMILAR TO '%(Service Area|County)%'
  AND ST_DWithin((SELECT ST_Centroid(ST_Collect(ST_Intersection(
          streams.the_geom, ST_GeomFromGeoJSON('${JSON.stringify(geom)}')))) FROM streams), mhfd_zoom_to_areas.the_geom, 0)
  `;
  const query = {
    q: sql
  }
  logger.info(sql)
  try {
    const data = await needle('post', URL, query, { json: true });
    if (data.statusCode === 200) {
      const body = data.body;
      const answer = {};
      body.rows.forEach(row => {
        if (row.filter) {
          answer[row.filter] = row.aoi;
        }
      });
      res.send(answer);
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  };
});

router.post('/get-countyservicearea-for-point', auth, async (req, res) => {
  const geom = req.body.geom;
  const sql = `SELECT aoi, filter FROM mhfd_zoom_to_areas where filter SIMILAR TO '%(Service Area|County)%' 
  AND ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom, 0)`;
  const query = {
    q: sql
  };
  logger.info(sql)
  try {
    const data = await needle('post', URL, query, { json: true });
    if (data.statusCode === 200) {
      const body = data.body;
      const answer = {};
      body.rows.forEach(row => {
        if (row.filter) {
          answer[row.filter] = row.aoi;
        }
      });
      res.send(answer);
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  };
});

router.post('/convexhull-by-components', auth, async(req, res) => {
  const components = req.body.components;
  logger.info('COMPONENTS ' + JSON.stringify(components));
  let createTable = false;
  const current = new Date().getTime();
  const promises = []
  for (const component in components) {
    logger.info('component ' + component);
    const inList = components[component]['in'];
    let inQuery = '';
    if (!inList.length) {
      continue;
    }
    inQuery = 'IN(' + inList.join(',') + ')';
    if (!createTable) {
      const createSQL = `CREATE TABLE aux_${current} AS (SELECT the_geom, the_geom_webmercator FROM ${component} 
        WHERE cartodb_id ${inQuery} AND projectid is null)`;
      logger.info(createSQL);
      const createQuery = {
        q: createSQL
      };
      try {
        const data = await needle('post', URL, createQuery, { json: true });
        //console.log('STATUS', data.statusCode);
        if (data.statusCode === 200) {
          logger.info('TABLE CREATED ');
          //logger.info(JSON.stringify(body, null, 2));
        } else {
          logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
          res.status(data.statusCode).send(data);
        }
      } catch (error) {
        logger.error(error);
        res.status(500).send(error);
      };
    } else {
      const updateSQL = `INSERT INTO aux_${current} (the_geom, the_geom_webmercator)
        (SELECT the_geom, the_geom_webmercator FROM ${component}
        WHERE cartodb_id ${inQuery} AND projectid is null)`;
      logger.info(updateSQL);
      const updateQuery = {
        q: updateSQL
      };
      const promise = new Promise((resolve, reject) => {
        needle('post', URL, updateQuery, { json: true })
        .then(response => {
          if (response.statusCode === 200) {
            logger.info('INSERT ', component);
            resolve(true);
          } else {
            logger.info('FAIL TO INSERT ',  component);
            resolve(false);
          }
        })
        .catch(error => {
          reject(false);
        });
      });
      promises.push(promise);
    }
    createTable = true;
  }
  Promise.all(promises).then(async (values) => {
    const hullSQL = `
    SELECT ST_AsGeoJSON(
      ST_Intersection(ST_ConvexHull(ST_COLLECT(ARRAY(SELECT the_geom FROM aux_${current}))),
                      ST_COLLECT(ARRAY(SELECT the_geom FROM streams)))
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
});

router.post('/get-all-streams', auth, async (req, res) => {
  const geom = req.body.geom;
  const sql = `SELECT cartodb_id FROM streams WHERE ST_INTERSECTS(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom)`;
  const query = {
    q: sql
  };
  let body = {}
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
    ST_Intersection(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'),
                    ST_COLLECT(ARRAY(SELECT the_geom FROM streams)))
  ) as geom`;
  const query = {
    q: sql
  };
  console.log(sql)
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
  }
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
          ST_Intersection(ST_ConvexHull(ST_COLLECT(ARRAY(SELECT the_geom FROM aux_${current}))),
                          ST_COLLECT(ARRAY(SELECT the_geom FROM streams)))
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
      const sqlProblems = `SELECT problemname, problemid, jurisdiction FROM problems WHERE problemid IN (${inn})`;
      const queryProblems = {
        q: sqlProblems
      }
      let body = {};
      try {
        const data = await needle('post', URL, queryProblems, { json: true });
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

const getNewProjectId = async () => {
  const query = {
    q: `SELECT GREATEST(max(projectid + 1), 800000) FROM ${CREATE_PROJECT_TABLE}`
  }
  const data = await needle('post', URL, query, { json: true });
  return data.body.rows[0].greatest;
}

const setProjectID = async (res, projectId) => {
  const update = `UPDATE ${CREATE_PROJECT_TABLE}
  SET projectid = ${projectId}
  WHERE projectid = -1`;
  const updateQuery = {
    q: update
  };
  logger.info('update projectid query ' + JSON.stringify(updateQuery));
  try {
    const data = await needle('post', URL, updateQuery, { json: true });
    console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      return true;
    } else {
       logger.error('bad status on UPDATE projectid ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
       res.status(data.statusCode).send(data.body);
       return false;
    }
  } catch (error) {
    logger.error(error);
  };
  return true;
}

router.post('/capital', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, geom, 
    overheadcost, overheadcostdescription, additionalcost, additionalcostdescription} = req.body;
  const sponsor = user.organization;
  const status = 'Draft';
  const projecttype = 'Capital';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county, status, projecttype, sponsor, overheadcost, overheadcostdescription, additionalcost, additionalcostdescription)
   VALUES(ST_GeomFromGeoJSON('${geom}'), '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${sponsor}', '${overheadcost}',
   '${overheadcostdescription}', '${additionalcost}', '${additionalcostdescription}')`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query)
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
      let projectId = await getNewProjectId();
      const updateId = await setProjectID(res, projectId);
      if (!updateId) {
        return;
      }
      await addProjectToBoard(jurisdiction, projecttype, projectId);
      await attachmentService.uploadFiles(user, req.files);
    } else {
       logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
       return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});

router.post('/maintenance', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  console.log('the user ', user);
  const {projectname, description, servicearea, county, geom, projectsubtype, frequency, maintenanceeligibility, ownership} = req.body;
  const sponsor = user.organization;
  const status = 'Draft';
  const projecttype = 'Maintenance';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county, status, projecttype, projectsubtype, frequency, sponsor, maintenanceeligibility, ownership)
   VALUES(ST_GeomFromGeoJSON('${geom}'), '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${projectsubtype}', '${frequency}', '${sponsor}', '${maintenanceeligibility}', '${ownership}')`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query)
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
      let projectId = await getNewProjectId();
      const updateId = await setProjectID(res, projectId);
      if (!updateId) {
        return;
      }
      await addProjectToBoard(jurisdiction, projecttype, projectId);
      await attachmentService.uploadFiles(user, req.files);
    } else {
       logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
       return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});

router.post('/study', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, ids, cosponsor} = req.body;
  const sponsor = req.body.sponsor || user.organization;
  const status = 'Draft';
  const projecttype = 'Study';
  const projectsubtype = 'Master Plan';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county, status, projecttype, projectsubtype, cosponsor, sponsor)
  (SELECT ST_Collect(the_geom) as the_geom,  '${projectname}' as projectname , '${description}' as description, '${servicearea}' as servicearea,
  '${county}' as county, '${status}' as status, '${projecttype}' as projecttype, '${projectsubtype}' as projectsubtype, '${cosponsor}' as cosponsor,
   '${sponsor}' as sponsor FROM streams WHERE cartodb_id IN(${ids.join(',')}))`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query)
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
      let projectId = await getNewProjectId();
      const updateId = await setProjectID(res, projectId);
      if (!updateId) {
        return;
      }
      await addProjectToBoard(jurisdiction, projecttype, projectId);
      await attachmentService.uploadFiles(user, req.files);
    } else {
       logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
       return res.status(data.statusCode).send(data.body);
      }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});

router.post('/acquisition', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const sponsor = user.organization;
  const {projectname, description, servicearea, county, geom, acquisitionprogress, acquisitionanticipateddate} = req.body;
  const status = 'Draft';
  const projecttype = 'Acquisition';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectname, description, servicearea, county, status, projecttype, acquisitionprogress, acquisitionanticipateddate, sponsor)
   VALUES(ST_GeomFromGeoJSON('${geom}'), '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${acquisitionprogress}', ${acquisitionanticipateddate}, '${sponsor}')`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query)
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
      let projectId = await getNewProjectId();
      const updateId = await setProjectID(res, projectId);
      if (!updateId) {
        return;
      }
      await addProjectToBoard(jurisdiction, projecttype, projectId);
      await attachmentService.uploadFiles(user, req.files);
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
      return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});

const getJurisdictionByGeom = async (geom) => {
  let sql = `SELECT jurisdiction FROM "denver-mile-high-admin".jurisidictions WHERE ST_Dwithin(the_geom, ST_GeomFromGeoJSON('${geom}'), 0)`;
  const query = { q: sql };
  const data = await needle('post', URL, query, { json: true });
  return data.body.rows[0].jurisdiction;
}

const addProjectToBoard = async (locality, projecttype, project_id) => {
  let type = 'WORK_REQUEST';
  let year = '2021';
  let board = await Board.findOne({
    where: {
        type, year, locality, projecttype
      }
  });
  if (!board) {
    let newBoard = new Board({
      type, year, locality, projecttype
    });
    await newBoard.save();
    board = newBoard;
  }
  console.log('new BoardProject', {
    board_id: board._id,
    project_id: `${project_id}`,
    column: 0,
    position: 0
  })
  let boardProject = new BoardProject({
    board_id: board._id,
    project_id: project_id,
    column: 0,
    position: 0
  })
  boardProject.save().then(function (boardProjectSaved) {
    console.log('saved', boardProjectSaved)
  }).catch(function (err) {
    console.log('error', err)
  });
}

router.post('/special', [ multer.array('files')], async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, geom} = req.body;
  let jurisdiction = await getJurisdictionByGeom(geom);
  const status = 'Draft';
  const projecttype = 'Special';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, projectid) 
  VALUES(ST_GeomFromGeoJSON('${geom}'), '${jurisdiction}', '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', -1)`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , JSON.stringify(query));
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(JSON.stringify(result));
      let projectId = await getNewProjectId();

      const updateId = await setProjectID(res, projectId);
      if (!updateId) {
        return;
      }
      await addProjectToBoard(jurisdiction, projecttype, projectId);
      await attachmentService.uploadFiles(user, req.files);
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
      return res.status(data.statusCode).send(data.body);
    }
 } catch (error) {
    logger.error(error);
 };
  res.send(result);
});
module.exports = router;