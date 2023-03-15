import express from 'express';
import needle from 'needle';
import {
  CARTO_URL,
  PROBLEM_TABLE,
  PROPSPROBLEMTABLES,
} from 'bc/config/config.js';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';
import projectStreamService from 'bc/services/projectStream.service.js';
import capitalRouter from 'bc/routes/new-project/capital.route.js';
import maintenanceRouter from 'bc/routes/new-project/maintenance.route.js';
import studyRouter from 'bc/routes/new-project/study.route.js';
import acquisitionRouter from 'bc/routes/new-project/acquisition.route.js';
import specialRouter from 'bc/routes/new-project/special.route.js';
import copyRouter from 'bc/routes/new-project/copy.route.js';
import projectProposedAction from "bc/services/projectProposedAction.service.js";
import db from 'bc/config/db.js';
const CodeLocalGoverment = db.codeLocalGoverment;
const Stream = db.stream;

const router = express.Router();
const COMPONENTS_TABLES = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
'special_item_linear', 'special_item_area', 'channel_improvements_linear',
'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area', 'stream_improvement_measure'];

router.use('/capital', capitalRouter);
router.use('/maintenance', maintenanceRouter);
router.use('/study', studyRouter);
router.use('/acquisition', acquisitionRouter);
router.use('/special', specialRouter);
router.use('/copy', copyRouter);

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
      if (!usableComponents[component.source_table_name]) {
        usableComponents[component.source_table_name] = [];
      }
      usableComponents[component.source_table_name].push(component.object_id);
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
    const type = component === 'stream_improvement_measure' ? 'component_part_category as type' : 'type';
    const jurisdiction = component === 'stream_improvement_measure' ? 'service_area as jurisdiction' : 'jurisdiction'; 
    const cost = component === 'stream_improvement_measure' ? 'estimated_cost_base as original_cost' : 'original_cost';
    const problemid = component === 'stream_improvement_measure' ? 'problem_id' : 'problemid';
    const projectid = component === 'stream_improvement_measure' ? 'project_id' : 'projectid';
    const sql = `SELECT objectid, cartodb_id, ${type}, ${jurisdiction}, status, ${cost}, ${problemid}  FROM ${component} 
    WHERE  ${queryWhere} AND ${projectid} is null `;
    const query = {
      q: sql
    };
    let body = {};
    try {
      const data = await needle('post', CARTO_URL, query, { json: true });
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
        logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
      }
    } catch (error) {
      logger.error(error, 'at', sql);
    };
  }
  let inn = '';
  for (const element of result) {
    if (element.problemid || element.problem_id) {
      if (inn) {
        inn += ',';
      }
      inn += element.problemid ? element.problemid : element.problem_id;
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
    const sqlProblems = `SELECT ${PROPSPROBLEMTABLES.problem_boundary[6]} as ${PROPSPROBLEMTABLES.problems[6]}, ${PROPSPROBLEMTABLES.problem_boundary[5]} as ${PROPSPROBLEMTABLES.problems[5]}, ${PROPSPROBLEMTABLES.problem_boundary[2]} as ${PROPSPROBLEMTABLES.problems[2]}, ${PROPSPROBLEMTABLES.problem_boundary[1]} as ${PROPSPROBLEMTABLES.problems[1]} FROM ${PROBLEM_TABLE} WHERE ${PROPSPROBLEMTABLES.problem_boundary[5]} IN (${inn})`;
    const queryProblems = {
      q: sqlProblems
    }
    let body = {};
    try {
      const data = await needle('post', CARTO_URL, queryProblems, { json: true });
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
        logger.error('bad status ' + data.statusCode + '  -- '+ sqlProblems +  JSON.stringify(data.body, null, 2));
      }
    } catch (error) {
      logger.error(error, 'at', sqlProblems);
    };
  }
  for (const project of result) {
    if (project.problemid == null) {
      groups['-1'].components.push(project);
    } else {
      groups[project.problemid]?.components.push(project);
    }
  }
  logger.info("RESULT IS => " + JSON.stringify(result, null, 2));
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
        const data = await needle('post', CARTO_URL, createQuery, { json: true });
        //console.log('STATUS', data.statusCode);
        if (data.statusCode === 200) {
          logger.info('TABLE CREATED ' + component);
          //logger.info(JSON.stringify(body, null, 2));
        } else {
          logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
          res.status(data.statusCode).send(data);
        }
      } catch (error) {
        logger.error(error, 'at', sql);
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
        needle('post', CARTO_URL, updateQuery, { json: true })
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
    const intersectionData = await needle('post', CARTO_URL, hullQuery, { json: true });
    if (intersectionData.statusCode === 200) {
      const body = intersectionData.body;
      logger.info(JSON.stringify(body.rows));
      result = body.rows[0];
      const dropSQL = `DROP table if exists  aux_${current} `;
      const dropQuery = {
        q: dropSQL
      }
      console.log(dropSQL);
      const deleted = await needle('post', CARTO_URL, dropQuery, { json: true });
      if (deleted.statusCode === 200) {
        logger.info('DELETE TABLE aux_' + current);
      } else {
        logger.error('IMPOSSIBLE DELETE TABLE aux_' + current + ' ' + deleted.statusCode + ' ' + JSON.stringify(deleted.body));
      }
      res.send(result);
      logger.info('length ' + result.length);
      //logger.info(JSON.stringify(body, null, 2));
    } else {
      logger.error('bad status ' + intersectionData.statusCode + '  -- '+ sql +  JSON.stringify(intersectionData.body, null, 2));
    }
  });
});
router.get('/components-by-problemid', auth, async (req, res) => {
  const problemid = req.query.problemid;
  const sql = `SELECT ${PROPSPROBLEMTABLES.problem_boundary[6]} as ${PROPSPROBLEMTABLES.problems[6]}, ${PROPSPROBLEMTABLES.problem_boundary[5]} as ${PROPSPROBLEMTABLES.problems[5]}, ${PROPSPROBLEMTABLES.problem_boundary[2]} as ${PROPSPROBLEMTABLES.problems[2]}, ${PROPSPROBLEMTABLES.problem_boundary[1]} as ${PROPSPROBLEMTABLES.problems[1]}, objectid FROM ${PROBLEM_TABLE} WHERE ${PROPSPROBLEMTABLES.problem_boundary[5]} = ${problemid}`;
  const query = {
    q: sql
  };
  const groups = {};
  const result = [];
  const promises = [];
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
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
        const componentSQL = `SELECT cartodb_id, type, jurisdiction, status, original_cost, problemid, objectid
         FROM ${component} WHERE problemid = ${problemid} AND projectid is null`;
        logger.info(componentSQL);
        const componentQuery = {
          q: componentSQL
        };
        const promise = new Promise((resolve, reject) => {
          needle('post', CARTO_URL, componentQuery, { json: true })
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
      logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error, 'at', sql);
    res.status(500).send(error);
  };
});
router.post('/component-geom', async (req,res) => {
  let table = req.body.table; 
  let objectid = req.body.objectid;
  let sql = `SELECT ST_ASGEOJSON(the_geom) as the_geom from ${table} where objectid=${objectid}`;
  const query = {
    q: sql
  };
  logger.info(sql);
  let streamsInfo = [];
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      const body = data.body;
      res.send({geom:body.rows[0].the_geom});
    
    } else {
      logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error, 'at', sql);
    res.status(500).send(error);
  };

});
router.post('/problem-geom', async (req,res) => {
  let problemid = req.body.problemid;
  let sql = `SELECT ST_ASGEOJSON(the_geom) as the_geom from ${PROBLEM_TABLE} where ${PROPSPROBLEMTABLES.problem_boundary[5]}=${problemid}`;
  const query = {
    q: sql
  };
  logger.info(sql);
  let streamsInfo = [];
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      const body = data.body;
      res.send({geom:body.rows[0].the_geom});
    
    } else {
      logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error, 'at', sql);
    res.status(500).send(error);
  };

});
router.post('/streams-data', auth, async (req, res) => {
  const geom = req.body.geom;
  const sql = `
    SELECT 
      j.jurisdiction, 
      streamsIntersected.str_name, 
      streamsIntersected.cartodb_id,  
      streamsIntersected.mhfd_code,
      streamsIntersected.reach_code,
      streamsIntersected.trib_code1,
      streamsIntersected.trib_code2,
      streamsIntersected.trib_code3,
      streamsIntersected.trib_code4,
      streamsIntersected.trib_code5,
      streamsIntersected.trib_code6,
      streamsIntersected.trib_code7,
      ST_length(ST_intersection(streamsIntersected.the_geom, j.the_geom)::geography) as length
      FROM 
      ( SELECT unique_mhfd_code as mhfd_code, reach_code, trib_code1, trib_code2, trib_code3, trib_code4, trib_code5, trib_code6, trib_code7, 
        cartodb_id, str_name, the_geom FROM mhfd_stream_reaches WHERE ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom, 0) ) streamsIntersected ,
      jurisidictions j 
      WHERE
      ST_DWithin(streamsIntersected.the_geom, j.the_geom, 0)
  `;
  const query = {
    q: sql
  }
  logger.info(sql);
  let streamsInfo = [];
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      const body = data.body;
      streamsInfo = body.rows;
      const answer = {};
      body.rows.forEach(async row => {
        let str_name = row.str_name ? row.str_name : 'Unnamed Streams';
        
          if (!answer[str_name]) {
            answer[str_name] = [];
          }
          console.log(row.jurisdiction);
          const locality = await CodeLocalGoverment.findOne({
            where: {
              local_government_name: row.jurisdiction,
            }
          });
          const whereStatement = {};
          const ids = row.mhfd_code.split('.')
          if (row.str_name) whereStatement.stream_name = row.str_name;
          ids.forEach((element, index) => {
            if(index === 0) whereStatement.Reach_Code = parseInt(element);
            else whereStatement[`Trib_Code${index}`] = parseInt(element);
          });
          const stream = await Stream.findOne({
            where: whereStatement,
            attributes: ['stream_id', 'stream_name']
          });
          answer[str_name].push({
            jurisdiction: row.jurisdiction,
            length: row.length,
            cartodb_id: row.cartodb_id,
            mhfd_code: row.mhfd_code,
            str_name: str_name,
            drainage: 0,
            code_local_goverment: [locality],
            stream: stream ? [stream] : []
          });
        
      });
      const promises = [];
      for (const stream of streamsInfo) {
        const drainageSQL = `select st_area(ST_transform(st_intersection(j.the_geom, union_c.the_geom), 26986) ) as area , j.jurisdiction from jurisidictions j , (select st_union(the_geom) as the_geom from mhfd_catchments_simple_v1 c where 
         '${stream.reach_code}' is not distinct from c.reach_code 
          ${stream.trib_code1 != null ? `and ${stream.trib_code1} is not distinct from c.trib_code1` : ''} 
          ${stream.trib_code2 != null ? `and ${stream.trib_code2} is not distinct from c.trib_code1` : ''} 
          ${stream.trib_code3 != null ? `and ${stream.trib_code3} is not distinct from c.trib_code1` : ''} 
          ${stream.trib_code4 != null ? `and ${stream.trib_code4} is not distinct from c.trib_code1` : ''} 
          ${stream.trib_code5 != null ? `and ${stream.trib_code5} is not distinct from c.trib_code1` : ''} 
          ${stream.trib_code6 != null ? `and ${stream.trib_code6} is not distinct from c.trib_code1` : ''} 
          ${stream.trib_code7 != null ? `and ${stream.trib_code7} is not distinct from c.trib_code1` : ''} 
          ) union_c 
          where ST_INTERSECTS(ST_SimplifyPreserveTopology(j.the_geom, 0.1), ST_SimplifyPreserveTopology(union_c.the_geom, 0.1)) `;
          const drainageQuery = {
            q: drainageSQL
          };
          const promise = new Promise((resolve, reject) => {
            needle('post', CARTO_URL, drainageQuery, { json: true })
            .then(response => {
              if (response.statusCode === 200) {
                logger.info('I reached ', JSON.stringify(response.body.rows));
                resolve({
                  str_name: stream.str_name,
                  drainage: response.body.rows 
                });
              } else {
                logger.info('for query '+ drainageSQL);
                logger.error(response.statusCode + ' ' + JSON.stringify(response.body));
                resolve({
                  str_name: stream.str_name,
                  drainage: []
                });
              }
            })
            .catch(error => {
              logger.info('crashed');
              reject({
                str_name: stream.str_name,
                drainage: []
              });
            });
          });
          promises.push(promise);
      }
      Promise.all(promises).then(async (promiseData) => {
        logger.info('my values '+ JSON.stringify(promiseData));
        promiseData.forEach(async bucket => {
          const str_name = bucket.str_name? bucket.str_name : 'Unnamed Streams';
          for (const array of answer[str_name]) {
            logger.info('array '+ JSON.stringify(array));
            for (const info of bucket.drainage) {
              if (array.jurisdiction === info.jurisdiction) {
                array.drainage += (info.area * 3.86102e-7);
              }
            }
          }
        });
        res.send(answer);
      });
    } else {
      logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error, 'at', sql);
    res.status(500).send(error);
  };
});


router.post('/get-jurisdiction-for-polygon', async (req, res) => {
  const { geom } = req.body;
  const sql = `SELECT jurisdiction FROM jurisidictions WHERE ST_Dwithin(the_geom, ST_Centroid(ST_GeomFromGeoJSON('${JSON.stringify(geom)}')), 0)`;
  logger.info(sql);
  const query = { q: sql };
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    console.log(JSON.stringify(data.body));
    if (data.statusCode === 200) {
      return res.send({jurisdiction: data.body.rows[0].jurisdiction});
    }
    logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
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
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      const body = data.body;
      let answer = {
        jurisdiction: await getAllJurisdictionByGeomStreams(JSON.stringify(geom))
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
      logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error, 'at', sql);
    res.status(500).send(error);
  };
});

router.post('/get-countyservicearea-for-geom', auth, async (req, res) => {
  const geom = req.body.geom;
  const sql = `SELECT aoi, filter FROM mhfd_zoom_to_areas where filter SIMILAR TO '%(Service Area|County)%' 
  AND ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom, 0)`;
  const query = {
    q: sql
  };
  logger.info(sql)
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      const { body } = data;
      let answer = {
        jurisdiction: await getAllJurisdictionByGeom(JSON.stringify(geom))
      };
      body.rows.forEach(row => {
        if (row.filter) {
          if (!answer[row.filter]) {
            answer[row.filter]  = [];
          }
          answer[row.filter].push(row.aoi);
        }
      });
      res.send(answer);
    } else {
      logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error, 'at', sql);
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
    const data = await needle('post', CARTO_URL, query, { json: true });
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
      logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error, 'at', sql);
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
        const data = await needle('post', CARTO_URL, createQuery, { json: true });
        //console.log('STATUS', data.statusCode);
        if (data.statusCode === 200) {
          logger.info('TABLE CREATED ');
          //logger.info(JSON.stringify(body, null, 2));
        } else {
          logger.error('bad status ' + data.statusCode + '  -- '+ createSQL +  JSON.stringify(data.body, null, 2));
          res.status(data.statusCode).send(data);
        }
      } catch (error) {
        logger.error(error, 'at', sql);
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
        needle('post', CARTO_URL, updateQuery, { json: true })
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
    const intersectionData = await needle('post', CARTO_URL, hullQuery, { json: true });
    if (intersectionData.statusCode === 200) {
      const body = intersectionData.body;
      logger.info(JSON.stringify(body.rows));
      result = body.rows[0];
      const dropSQL = `DROP table if exists  aux_${current} `;
      const dropQuery = {
        q: dropSQL
      }
      const deleted = await needle('post', CARTO_URL, dropQuery, { json: true });
      if (deleted.statusCode === 200) {
        logger.info('DELETE TABLE aux_' + current);
      } else {
        logger.error('IMPOSSIBLE DELETE TABLE aux_' + current + ' ' + deleted.statusCode + ' ' + JSON.stringify(deleted.body));
      }
      res.send(result);
      logger.info('length ' + result.length);
      //logger.info(JSON.stringify(body, null, 2));
    } else {
      logger.error('bad status ' + intersectionData.statusCode + '  -- '+ sql +  JSON.stringify(intersectionData.body, null, 2));
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
    const data = await needle('post', CARTO_URL, query, { json: true });
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
      logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error, 'at', sql);
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
    const data = await needle('post', CARTO_URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      body = data.body;
      logger.info(JSON.stringify(body.rows[0]));
      res.send(body.rows[0]);
      //logger.info(JSON.stringify(body, null, 2));
    } else {
      logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data);
    }
  } catch (error) {
    logger.error(error, 'at', sql);
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
    const data = await needle('post', CARTO_URL, createQuery, { json: true });
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
          needle('post', CARTO_URL, updateQuery, { json: true })
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
        const intersectionData = await needle('post', CARTO_URL, hullQuery, { json: true });
        if (intersectionData.statusCode === 200) {
          const body = intersectionData.body;
          logger.info(JSON.stringify(body.rows));
          result = body.rows[0];
          const dropSQL = `DROP table if exists  aux_${current} `;
          const dropQuery = {
            q: dropSQL
          }
          console.log(dropSQL);
          const deleted = await needle('post', CARTO_URL, dropQuery, { json: true });
          if (deleted.statusCode === 200) {
            logger.info('DELETE TABLE aux_' + current);
          } else {
            logger.error('IMPOSSIBLE DELETE TABLE aux_' + current + ' ' + deleted.statusCode + ' ' + JSON.stringify(deleted.body));
          }
          res.send(result);
          logger.info('length ' + result.length);
          //logger.info(JSON.stringify(body, null, 2));
        } else {
          logger.error('bad status ' + intersectionData.statusCode + '  -- '+ sql +  JSON.stringify(intersectionData.body, null, 2));
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
      const type = component === 'stream_improvement_measure' ? 'component_part_category as type' : 'type';
      const jurisdiction = component === 'stream_improvement_measure' ? 'service_area as jurisdiction' : 'jurisdiction'; 
      const cost = component === 'stream_improvement_measure' ? 'estimated_cost_base as original_cost' : 'original_cost';
      const problemid = component === 'stream_improvement_measure' ? 'problem_id' : 'problemid';
      const projectid = component === 'stream_improvement_measure' ? 'project_id' : 'projectid';
      const sql = `SELECT cartodb_id, ${type}, ${jurisdiction}, status, ${cost}, ${problemid}  FROM ${component} WHERE ST_INTERSECTS(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), the_geom) AND ${projectid} is null `;
      const query = {
        q: sql
      };
      console.log(sql);

      let body = {};
      try {
        const data = await needle('post', CARTO_URL, query, { json: true });
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
          logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
        }
      } catch (error) {
        logger.error(error, 'at', sql);
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
      const sqlProblems = `SELECT problemname, problemid, jurisdiction, solutionstatus FROM ${PROBLEM_TABLE} WHERE problemid IN (${inn})`;
      const queryProblems = {
        q: sqlProblems
      }
      let body = {};
      try {
        const data = await needle('post', CARTO_URL, queryProblems, { json: true });
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
          logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
        }
      } catch (error) {
        logger.error(error, 'at', sql);
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

router.get('/get-streams-by-projectid/:projectid', [auth], async (req, res) => {
  const projectid = req.params.projectid;
  try {
    const streams = await projectStreamService.getAll(projectid);
    const ids = streams.map(res => res.stream.stream_name);
    const obj = {};
    for (const id of ids) {
      obj[id] = [];
    }
    for (const stream of streams) {
      const local = await projectStreamService.getOneByStream(stream.local_government_id);
      const res = {stream, code_local_goverment: local, length: stream.length_in_mile, drainage: stream.drainage_area_in_sq_miles}
      obj[stream.stream.stream_name].push(res);
    }
    return res.send(obj);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get('/get-components-by-projectid/:projectid', [auth], async (req, res) => {
  const project_id = req.params.projectid;
  try {
    console.log("THE PROJECT ID WITH COMPONENTS IS ", project_id);
    const components = await projectProposedAction.getAll(project_id);
    return res.send(components);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

router.get('/get-independent-components-by-projectid/:projectid', [auth], async (req, res) => {
  const project_id = req.params.projectid;
  try {
    return res.send([]);
  } catch (error) {
    res.status(500).send(error);
  }
});

const getJurisdictionByGeom = async (geom) => {
  let sql = `SELECT jurisdiction FROM jurisidictions WHERE ST_Dwithin(the_geom, ST_GeomFromGeoJSON('${geom}'), 0)`;
  const query = { q: sql };
  const data = await needle('post', CARTO_URL, query, { json: true });
  return data.body.rows[0].jurisdiction;
}

const getAllJurisdictionByGeom = async (geom) => {
  let sql = `SELECT jurisdiction FROM jurisidictions WHERE ST_Dwithin(the_geom, ST_GeomFromGeoJSON('${geom}'), 0)`;
  const query = { q: sql };
  const data = await needle('post', CARTO_URL, query, { json: true });
  return data.body.rows.map(element => element.jurisdiction);
}

const getAllJurisdictionByGeomStreams = async (geom) => {
  
  let sql = `
  WITH dumped AS (
    SELECT  (
            ST_Dump(
                ST_Intersection( 
                    mhfd_stream_reaches.the_geom, 
        ST_GeomFromGeoJSON('${geom}')
                )
            )
        ).geom AS the_geom
    FROM mhfd_stream_reaches
),
unioned AS (
    SELECT ST_Union(the_geom) AS the_geom FROM dumped
)
SELECT jurisdiction 
FROM jurisidictions, unioned 
WHERE ST_DWithin( 
    unioned.the_geom, 
    jurisidictions.the_geom, 
    0
)`;
  const query = { q: sql };
  const data = await needle('post', CARTO_URL, query, { json: true });
  return data.body.rows.map(element => element.jurisdiction);
}

export default router;
