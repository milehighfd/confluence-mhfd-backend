const express = require('express');
const router = express.Router();
const Multer = require('multer');
const bcrypt = require('bcryptjs');
const https = require('https');
const needle = require('needle');
const attachmentService = require('../services/attachment.service');
const projectStreamService = require('../services/projectStream.service');
const projectComponentService = require('../services/projectComponent.service');
const indepdendentService = require('../services/independent.service');
const { CARTO_TOKEN, CREATE_PROJECT_TABLE } = require('../config/config');

const db = require('../config/db');
const Board = db.board;
const BoardProject = db.boardProject;
const Locality = db.locality;
//const User = require('../models/user.model');
const User = db.user;
const IndependentComponent = db.independentComponent;
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
      usableComponents[component.table].push(component.objectid);
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
      queryWhere = `objectid IN(${usableComponents[component].join(',')})`;
    }
    if (where) {
      if (queryWhere) {
        queryWhere = queryWhere + ' OR ' + where;
      } else {
        queryWhere = where;
      }
    }
    const sql = `SELECT objectid, cartodb_id, type, jurisdiction, status, original_cost, problemid  FROM ${component} 
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
    jurisdiction: '-',
    solutionstatus: 0
  }};
  let problems = ['No problem'];
  if (inn) {
    const sqlProblems = `SELECT problemname, problemid, jurisdiction, solutionstatus FROM problems WHERE problemid IN (${inn})`;
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
            solutionstatus: problem.solutionstatus,
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
                      ST_COLLECT(ARRAY(SELECT the_geom FROM mhfd_stream_reaches)))
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
  const sql = `SELECT problemname, problemid, jurisdiction, solutionstatus FROM problems WHERE problemid = ${problemid}`;
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
          solutionstatus: problem.solutionstatus,
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
  // const sql = `SELECT  
  //       j.jurisdiction, 
  //       s.str_name, 
  //       s.cartodb_id, 
  //       ST_length(ST_intersection(s.the_geom, j.the_geom)::geography) as length  
  //         FROM mhfd_stream_reaches s, jurisidictions j 
  //         where ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), s.the_geom, 0) 
  //         and ST_DWithin(s.the_geom, j.the_geom, 0) `;

  const sql = `
    SELECT 
      j.jurisdiction, 
      streamsIntersected.str_name, 
      streamsIntersected.cartodb_id,  
      streamsIntersected.mhfd_code,
      ST_length(ST_intersection(streamsIntersected.the_geom, j.the_geom)::geography) as length
      FROM 
      ( SELECT unique_mhfd_code as mhfd_code, cartodb_id, str_name, the_geom FROM mhfd_stream_reaches WHERE ST_INTERSECTS(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom) ) streamsIntersected ,
      jurisidictions j 
      WHERE
      ST_DWithin(streamsIntersected.the_geom, j.the_geom, 0)
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
        if (row.str_name) {
          if (!answer[row.str_name]) {
            answer[row.str_name] = [];
          }
          answer[row.str_name].push({
            jurisdiction: row.jurisdiction,
            length: row.length,
            cartodb_id: row.cartodb_id,
            mhfd_code: row.mhfd_code,
            str_name: row.str_name,
            drainage: 0
          });
        }
      });
      /*
      const drainageQuery = `SELECT s.str_name, j.jurisdiction, ST_AREA(ST_Intersection(c.the_geom, j.the_geom)::geography) 
      as area FROM mhfd_stream_reaches s,  mhfd_catchments_simple_v1 c, jurisidictions j WHERE 
      ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), s.the_geom, 0) AND s.reach_code is not distinct from c.reach_code 
      and s.trib_code1 is not distinct from c.trib_code1 and s.trib_code2 is not distinct from c.trib_code2 and s.trib_code3 is not distinct from c.trib_code3
      and s.trib_code4 is not distinct from c.trib_code4 and s.trib_code5 is not distinct from c.trib_code5
      and s.trib_code6 is not distinct from c.trib_code6 and s.trib_code7 is not distinct from c.trib_code7 AND ST_DWithin(c.the_geom, j.the_geom, 0) 
      AND s.reach_code is not distinct from (SELECT max(reach_code) FROM mhfd_stream_reaches WHERE ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom, 0)) `;
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


router.post('/get-jurisdiction-for-polygon', async (req, res) => {
  const { geom } = req.body;
  const sql = `SELECT jurisdiction FROM "denver-mile-high-admin".jurisidictions WHERE ST_Dwithin(the_geom, ST_Centroid(ST_GeomFromGeoJSON('${JSON.stringify(geom)}')), 0)`;
  logger.info(sql);
  const query = { q: sql };
  try {
    const data = await needle('post', URL, query, { json: true });
    console.log(JSON.stringify(data.body));
    if (data.statusCode === 200) {
      return res.send({jurisdiction: data.body.rows[0].jurisdiction});
    }
    logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
    return res.status(data.statusCode).send(data);
  } catch (error) {
    res.status(500).send({error: error});
  }
});

router.post('/get-countyservicearea-for-polygon', auth, async (req, res) => {
  const geom = req.body.geom;
  const sql = `WITH dumped AS (
    SELECT  (
            ST_Dump(
                ST_Intersection( 
                    mhfd_stream_reaches.the_geom, 
        ST_GeomFromGeoJSON('${JSON.stringify(geom)}')
                )
            )
        ).geom AS the_geom
    FROM mhfd_stream_reaches
),
unioned AS (
    SELECT ST_Union(the_geom) AS the_geom FROM dumped
)
SELECT aoi, filter 
FROM mhfd_zoom_to_areas, unioned 
WHERE filter SIMILAR TO '%(Service Area|County)%' 
AND ST_DWithin( 
    unioned.the_geom, 
    mhfd_zoom_to_areas.the_geom, 
    0
)
    `;
  const query = {
    q: sql
  }
  logger.info(sql)
  try {
    const data = await needle('post', URL, query, { json: true });
    if (data.statusCode === 200) {
      const body = data.body;
      let answer = {
        jurisdiction: await getAllJurisdictionByGeom(JSON.stringify(geom))
      };
      body.rows.forEach(row => {
        if (row.filter) {
          if (!answer[row.filter]) {
            answer[row.filter] = [];
          }
          answer[row.filter].push(row.aoi);
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

router.post('/get-countyservicearea-for-geom', auth, async (req, res) => {
  const geom = req.body.geom;
  const sql = `SELECT aoi, filter FROM mhfd_zoom_to_areas where filter SIMILAR TO '%(Service Area|County|Jurisdiction)%' 
  AND ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom, 0)`;
  const query = {
    q: sql
  };
  logger.info(sql)
  try {
    const data = await needle('post', URL, query, { json: true });
    if (data.statusCode === 200) {
      const body = data.body;
      let answer = {};

      body.rows.forEach(row => {
        if (row.filter) {
          if (!answer[row.filter]) {
            answer[row.filter]  = [];
          }
          answer[row.filter].push([row.aoi]);
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
      let answer = {
        jurisdiction: [await getJurisdictionByGeom(JSON.stringify(geom))]
      };

      body.rows.forEach(row => {
        if (row.filter) {
          answer[row.filter] = [row.aoi];
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
                      ST_COLLECT(ARRAY(SELECT the_geom FROM mhfd_stream_reaches)))
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
  const sql = `SELECT cartodb_id, unique_mhfd_code as mhfd_code FROM mhfd_stream_reaches WHERE ST_INTERSECTS(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom)`;
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
      body.rows = body.rows.map(data => { 
        return {cartodb_id: data.cartodb_id, mhfd_code: data.mhfd_code}
      });
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
                    ST_COLLECT(ARRAY(SELECT the_geom FROM mhfd_stream_reaches)))
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
                          ST_COLLECT(ARRAY(SELECT the_geom FROM mhfd_stream_reaches)))
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
      jurisdiction: '-',
      solutionstatus: '-'
    }};
    let problems = ['No problem'];
    if (inn) {
      const sqlProblems = `SELECT problemname, problemid, jurisdiction, solutionstatus FROM problems WHERE problemid IN (${inn})`;
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
              solutionstatus: problem.solutionstatus,
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
    overheadcost, overheadcostdescription, additionalcost, additionalcostdescription,
    independetComponent, locality, components, jurisdiction, sponsor, cosponsor, cover} = req.body;
  const status = 'Draft';
  const projecttype = 'Capital';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, sponsor, overheadcost, overheadcostdescription, additionalcost, additionalcostdescription, cosponsor, projectid)
   VALUES(ST_GeomFromGeoJSON('${geom}'), '${jurisdiction}', '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${sponsor}', '${overheadcost}',
   '${overheadcostdescription}', '${additionalcost}', '${additionalcostdescription}', '${cosponsor}', ${-1})`;
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
      logger.info(JSON.stringify(result));
      let projectId = await getNewProjectId();
      const updateId = await setProjectID(res, projectId);
      if (!updateId) {
        return;
      }
      await addProjectToBoard(sponsor, projecttype, projectId);
      await attachmentService.uploadFiles(user, req.files, projectId, cover);
      for (const independent of JSON.parse(independetComponent)) {
        const element = {name: independent.name, cost: independent.cost, status: independent.status, projectid: projectId};
        try {
          IndependentComponent.create(element);
          logger.info('create independent component');
        } catch(error) {
          logger.error('cannot create independent component ' + error);
        }
      }
      for (const component of JSON.parse(components)) { 
        const data = {
          table: component.table,
          projectid: projectId,
          objectid: component.objectid
        };
        projectComponentService.saveProjectComponent(data);
      }
    } else {
       logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
       return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});

router.post('/capital/:projectid', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, geom, 
    overheadcost, overheadcostdescription, additionalcost, additionalcostdescription,
    independetComponent, locality, components, jurisdiction, sponsor, cosponsor, cover} = req.body;
  const projectid = req.params.projectid;
  const status = 'Draft';
  const projecttype = 'Capital';
  const updateQuery = `UPDATE ${CREATE_PROJECT_TABLE} SET the_geom = ST_GeomFromGeoJSON('${geom}'),
   jurisdiction = '${jurisdiction}', projectname = '${projectname}', 
   description = '${description}', servicearea = '${servicearea}', county = '${county}',
    status = '${status}', projecttype = '${projecttype}', sponsor = '${sponsor}', 
    overheadcost = '${overheadcost}', overheadcostdescription = '${overheadcostdescription}', 
    additionalcost = '${additionalcost}', additionalcostdescription = '${additionalcostdescription}',
    cosponsor = '${cosponsor}'
    WHERE  projectid = ${projectid}`;
  const query = {
    q: updateQuery
  };
  console.log('my query ' , query)
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(JSON.stringify(result));
      await attachmentService.uploadFiles(user, req.files, projectid, cover);
      await projectComponentService.deleteByProjectId(projectid);
      await indepdendentService.deleteByProjectId(projectid);
      for (const independent of JSON.parse(independetComponent)) {
        const element = {name: independent.name, cost: independent.cost, status: independent.status, projectid: projectid};
        try {
          IndependentComponent.create(element);
          logger.info('create independent component' + JSON.stringify(element));
        } catch(error) {
          logger.error('cannot create independent component ' + error);
        }
      }
      for (const component of JSON.parse(components)) { 
        const data = {
          table: component.table,
          projectid: projectid,
          objectid: component.objectid
        };
        projectComponentService.saveProjectComponent(data);
      }
    } else {
       logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2))    ;
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
  const {projectname, description, servicearea, county, geom, projectsubtype, frequency, maintenanceeligibility, ownership, locality, jurisdiction, sponsor, cosponsor, cover} = req.body;
  const status = 'Draft';
  const projecttype = 'Maintenance';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, projectsubtype, frequency, sponsor, maintenanceeligibility, ownership, cosponsor, projectid)
   VALUES(ST_GeomFromGeoJSON('${geom}'), '${jurisdiction}', '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${projectsubtype}', '${frequency}', '${sponsor}', '${maintenanceeligibility}', '${ownership}', '${cosponsor}', ${-1})`;
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
      logger.info(JSON.stringify(result));
      let projectId = await getNewProjectId();
      const updateId = await setProjectID(res, projectId);
      if (!updateId) {
        return;
      }
      await addProjectToBoard(sponsor, projecttype, projectId, projectsubtype);
      await attachmentService.uploadFiles(user, req.files, projectId, cover);
    } else {
       logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
       return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});

router.post('/maintenance/:projectid', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  console.log('the user ', user);
  const {projectname, description, servicearea, county, geom, projectsubtype, frequency, maintenanceeligibility, ownership, locality, jurisdiction, sponsor, cosponsor, cover} = req.body;
  const projectid = req.params.projectid;
  const status = 'Draft';
  const projecttype = 'Maintenance';
  const updateQuery = `UPDATE ${CREATE_PROJECT_TABLE} SET the_geom = ST_GeomFromGeoJSON('${geom}'), jurisdiction = '${jurisdiction}',
   projectname = '${projectname}', description = '${description}', servicearea = '${servicearea}',
    county = '${county}', status = '${status}', projecttype = '${projecttype}',
     projectsubtype = '${projectsubtype}', frequency = '${frequency}', 
     sponsor = '${sponsor}', maintenanceeligibility = '${maintenanceeligibility}', 
     ownership = '${ownership}', cosponsor = '${cosponsor}' WHERE projectid = ${projectid}`;
  const query = {
    q: updateQuery
  };
  console.log('my query ' , updateQuery)
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(JSON.stringify(result));
      await attachmentService.uploadFiles(user, req.files, projectid, cover);
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
  const {projectname, description, servicearea, county, ids, streams, cosponsor, geom, locality, jurisdiction, sponsor, cover} = req.body;
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
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, projectsubtype, cosponsor, sponsor, projectid)
  (SELECT ST_Collect(the_geom) as the_geom, '${jurisdiction}' as jurisdiction, '${projectname}' as projectname , '${description}' as description, '${servicearea}' as servicearea,
  '${county}' as county, '${status}' as status, '${projecttype}' as projecttype, '${projectsubtype}' as projectsubtype, '${cosponsor}' as cosponsor,
   '${sponsor}' as sponsor, ${-1} as projectid FROM mhfd_stream_reaches WHERE unique_mhfd_code  IN(${parsedIds}))`;
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
      logger.info(JSON.stringify(result));
      let projectId = await getNewProjectId();
      const updateId = await setProjectID(res, projectId);
      if (!updateId) {
        return;
      }
      await addProjectToBoard(sponsor, projecttype, projectId);
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
       logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
       return res.status(data.statusCode).send(data.body);
      }
  } catch (error) {
    logger.error(error);
    return res.status(500).send(eroor);
  };
  res.send(result);
});

router.get('/get-streams-by-projectid/:projectid', [auth], async (req, res) => {
  const projectid = req.params.projectid;
  try {
    console.log("THE PROJECT ID WITH STREAMS IS ", projectid);
    const streams = await projectStreamService.getAll(projectid);
    const ids = streams.map(stream => stream.str_name);
    const obj = {};
    for (const id of ids) {
      obj[id] = [];
    }
    for (const stream of streams) {
      obj[stream.str_name].push(stream);
    }
    return res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/get-components-by-projectid/:projectid', [auth], async (req, res) => {
  const projectid = req.params.projectid;
  try {
    console.log("THE PROJECT ID WITH COMPONENTS IS ", projectid);
    const components = await projectComponentService.getAll(projectid);
    return res.send(components);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/get-independent-components-by-projectid/:projectid', [auth], async (req, res) => {
  const projectid = req.params.projectid;
  try {
    console.log("THE PROJECT ID WITH INDEPENDENT COMPONENTS IS ", projectid);
    const components = await indepdendentService.getAll(projectid);
    return res.send(components);
  } catch (error) {
    res.status(500).send(error);
  }
});


router.post('/study/:projectid', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const projectid = req.params.projectid;
  const {projectname, description, servicearea, county, ids, cosponsor, geom, locality,
  streams, jurisdiction, sponsor, cover} = req.body;
  const status = 'Draft';
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
  const updateQuery = `UPDATE ${CREATE_PROJECT_TABLE} SET
  the_geom = (SELECT ST_Collect(the_geom) FROM mhfd_stream_reaches WHERE unique_mhfd_code IN(${parsedIds})), jurisdiction = '${jurisdiction}',
   projectname = '${projectname}', description = '${description}',
    servicearea = '${servicearea}', county = '${county}',
     status = '${status}', projecttype = '${projecttype}', 
     projectsubtype = '${projectsubtype}', cosponsor = '${cosponsor}',
      sponsor = '${sponsor}' WHERE projectid = ${projectid}
  `;
  const query = {
    q: updateQuery
  };
  console.log('my query ' , query)
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
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
       logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
       return res.status(data.statusCode).send(data.body);
      }
  } catch (error) {
    logger.error(error);
    return res.status(500).send(error);
  };
  res.send(result);
});

router.post('/acquisition', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, geom, acquisitionprogress, acquisitionanticipateddate, locality, jurisdiction, sponsor, cosponsor, cover} = req.body;
  const status = 'Draft';
  const projecttype = 'Acquisition';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, acquisitionprogress, acquisitionanticipateddate, sponsor, cosponsor, projectid)
   VALUES(ST_GeomFromGeoJSON('${geom}'), '${jurisdiction}', '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${acquisitionprogress}', ${acquisitionanticipateddate}, '${sponsor}', '${cosponsor}', ${-1})`;
  const query = {
    q: insertQuery
  };
  logger.info('my query ' + query);
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
      await addProjectToBoard(sponsor, projecttype, projectId);
      await attachmentService.uploadFiles(user, req.files, projectId, cover);
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
      return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).send(error);
  };
  res.send(result);
});

router.post('/acquisition/:projectid', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const projectid = req.params.projectid;
  const {projectname, description, servicearea, county, geom, acquisitionprogress, acquisitionanticipateddate, locality, jurisdiction, sponsor, cosponsor, cover} = req.body;
  const status = 'Draft';
  const projecttype = 'Acquisition';
  const updateQuery = `UPDATE ${CREATE_PROJECT_TABLE} 
  SET the_geom = ST_GeomFromGeoJSON('${geom}'), jurisdiction = '${jurisdiction}',
   projectname = '${projectname}', description = '${description}', 
   servicearea = '${servicearea}', county = '${county}', status = '${status}', 
   projecttype = '${projecttype}', acquisitionprogress = '${acquisitionprogress}', 
   acquisitionanticipateddate = ${acquisitionanticipateddate}, sponsor = '${sponsor}',
   cosponsor = '${cosponsor}'
   WHERE  projectid = ${projectid}
   `;
  logger.info('THE QUERY IS ' + updateQuery);
  const query = {
    q: updateQuery
  };
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
      await attachmentService.uploadFiles(user, req.files, projectid, cover);
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
      return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).send(error);
  };
  res.send(result);
});

const getJurisdictionByGeom = async (geom) => {
  let sql = `SELECT jurisdiction FROM "denver-mile-high-admin".jurisidictions WHERE ST_Dwithin(the_geom, ST_GeomFromGeoJSON('${geom}'), 0)`;
  const query = { q: sql };
  const data = await needle('post', URL, query, { json: true });
  return data.body.rows[0].jurisdiction;
}

const getAllJurisdictionByGeom = async (geom) => {
  let sql = `SELECT jurisdiction FROM "denver-mile-high-admin".jurisidictions WHERE ST_Dwithin(the_geom, ST_GeomFromGeoJSON('${geom}'), 0)`;
  const query = { q: sql };
  const data = await needle('post', URL, query, { json: true });
  return data.body.rows.map(element => element.jurisdiction);
}

const addProjectToBoard = async (locality, projecttype, project_id, projectsubtype) => {
  let dbLoc = await Locality.findOne({
    where: {
      name: locality
    }
  });
  let type = 'WORK_REQUEST';
  if (dbLoc) {
    if (dbLoc.type === 'JURISDICTION') {
      type = 'WORK_REQUEST';
    } else if (dbLoc.type === 'COUNTY' || dbLoc.type === 'SERVICE_AREA') {
      type = 'WORK_PLAN';
    }
  }
  let year = '2021';
  let board = await Board.findOne({
    where: {
        type, year, locality, projecttype
      }
  });
  if (!board) {
    let newBoard = new Board({
      type, year, locality, projecttype, status: 'Under Review'
    });
    await newBoard.save();
    board = newBoard;
  }
  let boardProjectObject = {
    board_id: board._id,
    project_id: project_id,
    from: locality
  }
  if (projecttype === 'Maintenance') {
    let subtypes = ['Debris Management', 'Vegetation Management', 'Sediment Removal', 'Minor Repairs', 'Restoration'];
    let index = subtypes.indexOf(projectsubtype);
    if (index === -1) {
      boardProjectObject.position0 = 0;
    } else {
      boardProjectObject[`position${index + 1}`] = 0;
    }
  } else {
    boardProjectObject.position0 = 0;
  }

  let boardProject = new BoardProject(boardProjectObject);

  boardProject.save().then(function (boardProjectSaved) {
    console.log('saved', boardProjectSaved)
  }).catch(function (err) {
    console.log('error', err)
  });
}

router.post('/special', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, geom, locality, jurisdiction, sponsor, cosponsor, cover} = req.body;
  const status = 'Draft';
  const projecttype = 'Special';
  const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, sponsor, cosponsor, projectid) 
  VALUES(ST_GeomFromGeoJSON('${geom}'), '${jurisdiction}', '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${sponsor}', '${cosponsor}', -1)`;
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
      await addProjectToBoard(sponsor, projecttype, projectId);
      await attachmentService.uploadFiles(user, req.files, projectId, cover);
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
      return res.status(data.statusCode).send(data.body);
    }
 } catch (error) {
    logger.error(error);
    return res.status(500).send(error);
 };
  res.send(result);
});

router.post('/special/:projectid', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const projectid = req.params.projectid;
  const {projectname, description, servicearea, county, geom, locality, jurisdiction, sponsor, cosponsor} = req.body;
  const status = 'Draft';
  const projecttype = 'Special';
  const updateQuery = `UPDATE ${CREATE_PROJECT_TABLE}
  SET the_geom = ST_GeomFromGeoJSON('${geom}'), jurisdiction = '${jurisdiction}', 
  projectname = '${projectname}', description = '${description}',
   servicearea = '${servicearea}', county = '${county}', 
   status = '${status}', projecttype = '${projecttype}', sponsor = '${sponsor}',
   cosponsor = '${cosponsor}' WHERE  projectid = ${projectid}`;
  const query = {
    q: updateQuery
  };
  logger.info('my query ' + JSON.stringify(query));
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(JSON.stringify(result));
      await attachmentService.uploadFiles(user, req.files, projectid, cover);
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
      return res.status(data.statusCode).send(data.body);
    }
 } catch (error) {
    logger.error(error);
    return res.status(500).send(error);
 };
  res.send(result);
});

module.exports = router;