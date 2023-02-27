import express from 'express';
import https from 'https';
import needle from 'needle';
import logger from 'bc/config/logger.js';
import {
  CARTO_URL,
  CARTO_URL_MAP,
  PROPSPROBLEMTABLES,
  PROBLEM_TABLE,
  MAIN_PROJECT_TABLE
} from 'bc/config/config.js';
import db from 'bc/config/db.js';

const router = express.Router();
const ComponentDependency = db.componentdependency;

router.post('/', async (req, res) => { 
  const table = req.body.table;
  let sql = `SELECT * FROM ${table}`;
  if(table.includes('mep_outfalls') || table.includes('mep_channels')){
    sql =  `SELECT cartodb_id, the_geom, the_geom_webmercator, projectname, mep_eligibilitystatus, projectno, mhfd_servicearea, mep_date_designapproval::text,mep_date_constructionapproval::text,mep_date_finalacceptance::text,mep_date_ineligible::text FROM ${table}` ;
  } else if(table.includes('mep_projects_temp_locations')) {
    sql = `SELECT cartodb_id, the_geom, the_geom_webmercator FROM ${table}`;
  } else if(table.includes('mep')){
    sql =  `SELECT cartodb_id, the_geom, the_geom_webmercator, projectname, mep_eligibilitystatus, projectno, mhfd_servicearea, mep_date_designapproval::text,mep_date_constructionapproval::text,mep_date_finalacceptance::text,mep_date_ineligible::text, pondname FROM ${table}` ;
  }
  if (table === 'bcz_prebles_meadow_jumping_mouse' || table === 'bcz_ute_ladies_tresses_orchid') {
    sql = `SELECT the_geom, the_geom_webmercator, expiration_date::text, website, letter, map FROM ${table}`;
  }
  if(table.includes('active_lomcs')){
    sql =  `SELECT cartodb_id, the_geom, the_geom_webmercator, objectid, globalid, shape_area, shape_length, creationdate::text, creator , editdate::text, editor, lomc_case, lomc_type, lomc_identifier, status_date::text, status, notes, effective_date::text FROM ${table}` ;
  }
  logger.info(sql);
  var mapConfig = {
    "version": '1.3.1',
    "buffersize": {mvt: 8},
    "layers":[ {
      "id":"pluto15v1",
      "type": 'mapnik',
      "options": {
        "sql": sql,
        "vector_extent": 4096,
        "bufferSize": 8,
        "version": '1.3.1'
      }
    }
  ]};
  mapConfig =  encodeURIComponent(JSON.stringify(mapConfig));
  const URL = `${CARTO_URL_MAP}&config=${mapConfig}`;
  logger.info(URL);
  https.get(URL, response => {
    if (response.statusCode == 200) {
      let str = '';
      response.on('data', function (chunk) {
        str += chunk;
      });
      response.on('end', function () {
        const tiles = JSON.parse(str).metadata.tilejson.vector.tiles;
        return res.send(tiles);
      });
    } else {
      return res.status(response.statusCode).send({error: 'error'});
    }
  }).on('error', err => {
    //console.log('failed call to ', URL, 'with error ', err);
    logger.error(`failed call to ${URL}  with error  ${err}`)
    res.status(500).send(err);
  });
});
async function getGeojsonCentroids(bounds, body) {
  let sql = `SELECT
            ST_X(ST_Centroid(the_geom)) as lon,
            ST_Y(ST_Centroid(the_geom)) as lat,
            cartodb_id,
            objectid,
            problem_id,
            problem_name,
            problem_type,
            problem_description,
            problem_severity,
            problem_score,
            mhfd_scale,
            estimated_cost,
            component_cost,
            component_status,
            globalid,
            created_user,
            created_date,
            last_edited_user,
            last_edited_date,
            mhfd_manager,
            service_area,
            county,
            local_government,
            special_district,
            stream_name,
            mhfd_code,
            validationstatus,
            study_id,
            source_type,
            source_name,
            source_complete_year,
            component_count,
            shape_starea,
            shape_stlength
            from problem_boundary`;

    const query = { q: ` ${sql} ` };
    try {
      const lineData = await needle('post', CARTO_URL, query, { json: true });
      const geojson = {
        type: "FeatureCollection",
        features: lineData.body.rows.map((row) => {
          return {
            type: "Feature",
            properties: {
              "cartodb_id": row.cartodb_id,
              "objectid": row.objectid,
              "problem_id": row.problem_id,
              "problem_name": row.problem_name,
              "problem_type": row.problem_type,
              "problem_description": row.problem_description,
              "problem_severity": row.problem_severity,
              "problem_score": row.problem_score,
              "mhfd_scale": row.mhfd_scale,
              "estimated_cost": row.estimated_cost,
              "component_cost": row.component_cost,
              "component_status": row.component_status,
              "globalid": row.globalid,
              "created_user": row.created_user,
              "created_date": row.created_date,
              "last_edited_user": row.last_edited_user,
              "last_edited_date": row.last_edited_date,
              "mhfd_manager": row.mhfd_manager,
              "service_area": row.service_area,
              "county": row.county,
              "local_government": row.local_government,
              "special_district": row.special_district,
              "stream_name": row.stream_name,
              "mhfd_code": row.mhfd_code,
              "validationstatus": row.validationstatus,
              "study_id": row.study_id,
              "source_type": row.source_type,
              "source_name": row.source_name,
              "source_complete_year": row.source_complete_year,
              "component_count": row.component_count,
              "shape_starea": row.shape_starea,
              "shape_stlength": row.shape_stlength
            },
            "geometry": {
              "type": "Point",
              "coordinates": [row.lon, row.lat, 0.0]
            }
          }
        })
      }
     return geojson;   
    } catch (error) {
     logger.error("Count total projects error ->",error);
    }
    
}

async function getProbCentroids(req, res) {
  try {
     const bounds = req.query.bounds;
     const body = req.body;
     let geom = await getGeojsonCentroids(bounds, body);
     res.status(200).send({
        geom
     });
  } catch (error) {
     logger.error(error);
     logger.error(`countTotalProjects Connection error`);
  }
}
router.get('/probs', getProbCentroids);


router.get('/search/:query', async (req, res) => {
  const query = req.params.query;
  const to_url = encodeURIComponent(query);
  const map = `https://api.mapbox.com/geocoding/v5/mapbox.places/${to_url}.json?bbox=-105.39820822776036,39.38595107828999,-104.46244596259402,40.16671105031628&access_token=pk.eyJ1IjoibWlsZWhpZ2hmZCIsImEiOiJjazRqZjg1YWQwZTN2M2RudmhuNXZtdWFyIn0.oU_jVFAr808WPbcVOFnzbg`;
                                                              
  const promises = [];
  promises.push(new Promise((resolve, reject) => {
    console.log(map);
    https.get(map, response => {   
      if (response.statusCode == 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', function () {          
          const places = JSON.parse(str).features;
          const filteredPlaces = places.map(ele => {
            return {
              text: ele.text,
              place_name: ele.place_name,
              center: ele.center,
              type: 'geocoder'
          }});
          resolve(filteredPlaces);
        });
      } else {
        resolve([]);
      }
    }).on('error', err => {
      resolve([]);
    })})
  );  
  let sql = `SELECT ST_x(ST_LineInterpolatePoint(st_makeline(st_linemerge(the_geom)), 0.5)) as x, ST_y(ST_LineInterpolatePoint(st_makeline(st_linemerge(the_geom)), 0.5)) as y, str_name FROM streams WHERE  str_name ILIKE '${query}%' AND ST_IsEmpty(the_geom) = false group by str_name`;
  console.log('el query ' , sql);
  sql =  encodeURIComponent(sql);
  const URL = `${CARTO_URL}&q=${sql}`;
  promises.push(new Promise((resolve, reject) => {
    https.get(URL, response => {   
      if (response.statusCode == 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', function () {
          console.log(JSON.parse(str));
          const places = JSON.parse(str).rows;
          const filteredPlaces = places.map(ele => {
            return {
              text: ele.str_name,
              place_name: 'Stream',
              center: [ele.x, ele.y],
              type: 'stream'
          }});
          resolve(filteredPlaces);
        });
      } else {
        console.log('status ', response.statusCode, URL);
        resolve([]);
      }
    }).on('error', err => {
      console.log('failed call to ', URL, 'with error ', err);
      resolve([]);
    })})
  );  
  const all = await Promise.all(promises);
  const answer = [];
  for(const data of all) {
    answer.push(...data);
  }
  const weight = {'stream': 0, 'geocoder': 1};
  answer.sort((a,b) => {
    if (a.type !== b.type) {
      return weight[a.type] - weight[b.type];
    }
    return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
  });
  res.send(answer);
});
const components = [
  { key: 'grade_control_structure', value: 'Grade Control Structure' },
  { key: 'pipe_appurtenances', value: 'Pipe Appurtenances' },
  { key: 'special_item_point', value: 'Special Item Point' },
  { key: 'special_item_linear', value: 'Special Item Linear' },
  { key: 'special_item_area', value: 'Special Item Area' },
  { key: 'channel_improvements_linear', value: 'Channel Improvements Linear' },
  { key: 'channel_improvements_area', value: 'Channel Improvements Area' },
  { key: 'removal_line', value: 'Removal Line' },
  { key: 'removal_area', value: 'Removal Area' },
  { key: 'storm_drain', value: 'Storm Drain' },
  { key: 'detention_facilities', value: 'Detention Facilities' },
  { key: 'maintenance_trails', value: 'Maintenance Trails' },
  { key: 'land_acquisition', value: 'Land Acquisition' },
  { key: 'landscaping_area', value: 'Landscaping Area' }
];
router.get('/get-aoi-from-center', async (req, res) => {
  const coord = (req.query.coord || '0,0');
  const sql = `SELECT cartodb_id, aoi, filter, ST_AsGeoJSON(the_geom) FROM mhfd_zoom_to_areas where ST_CONTAINS(the_geom, ST_SetSRID(ST_MakePoint(${coord}), 4326))`;
  const URL = `${CARTO_URL}&q=${sql}`;
  try {
    https.get(URL, response => {   
      if (response.statusCode == 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', function () {
          const rows = JSON.parse(str).rows;
          console.log(rows);
          res.send({data: rows});
        });
      } else {
        console.log('status ', response.statusCode, URL);
        res.send({data: []});
      }
    }).on('error', err => {
      console.log('failed call to ', URL, 'with error ', err);
      res.send({data: []});
    });
  } catch(error) {
    res.send({error: error});
  }
  
});

async function getEnvelopeProblemsComponentsAndProject(id, table, field, activetab) {
  let SQL = `
  select ST_ASGEOJSON(ST_EXTENT(the_geom)) as envelope
    from (
    SELECT the_geom FROM ${table} where  projectid=${id}`;

  const SQLPROBLEM = `
  union 
    select the_geom from ${PROBLEM_TABLE}  
      where ${PROPSPROBLEMTABLES.problem_boundary[5]} in (SELECT problemid FROM grade_control_structure 
        where projectid=${id} and projectid>0  union SELECT problemid FROM pipe_appurtenances 
        where projectid=${id} and projectid>0  union SELECT problemid FROM special_item_point 
        where projectid=${id} and projectid>0  union SELECT problemid FROM special_item_linear 
        where projectid=${id} and projectid>0  union SELECT problemid FROM special_item_area 
        where projectid=${id} and projectid>0  union SELECT problemid FROM channel_improvements_linear 
        where projectid=${id} and projectid>0  union SELECT problemid FROM channel_improvements_area 
        where projectid=${id} and projectid>0  union SELECT problemid FROM removal_line 
        where projectid=${id} and projectid>0  union SELECT problemid FROM removal_area 
        where projectid=${id} and projectid>0  union SELECT problemid FROM storm_drain 
        where projectid=${id} and projectid>0  union SELECT problemid FROM detention_facilities 
        where projectid=${id} and projectid>0  union SELECT problemid FROM maintenance_trails 
        where projectid=${id} and projectid>0  union SELECT problemid FROM land_acquisition 
        where projectid=${id} and projectid>0  union SELECT problemid FROM landscaping_area 
        where projectid=${id} and projectid>0) `;
    
  const componentsSQL = `
  union  
    SELECT the_geom FROM grade_control_structure where ${field}=${id}  
      union SELECT the_geom FROM pipe_appurtenances where ${field}=${id}  
      union SELECT the_geom FROM special_item_point where ${field}=${id}  
      union SELECT the_geom FROM special_item_linear where ${field}=${id}  
      union SELECT the_geom FROM special_item_area where ${field}=${id}  
      union SELECT the_geom FROM channel_improvements_linear where ${field}=${id}  
      union SELECT the_geom FROM channel_improvements_area where ${field}=${id}  
      union SELECT the_geom FROM removal_line where ${field}=${id}  
      union SELECT the_geom FROM removal_area where ${field}=${id}  
      union SELECT the_geom FROM storm_drain where ${field}=${id}  
      union SELECT the_geom FROM detention_facilities where ${field}=${id}  
      union SELECT the_geom FROM maintenance_trails where ${field}=${id}  
      union SELECT the_geom FROM land_acquisition where ${field}=${id}  
      union SELECT the_geom FROM landscaping_area where ${field}=${id}  
  ) joinall
` ;  
  if (activetab == 1) {
    SQL = `${SQL} ${componentsSQL}`;
  } else {
    SQL = `${SQL} ${SQLPROBLEM} ${componentsSQL}`;
  }
  const SQL_URL = encodeURI(`${CARTO_URL}&q=${SQL}`);
  const newProm1 = new Promise((resolve, reject) => {
    https.get(SQL_URL, response => {
        if (response.statusCode === 200) {
          let str = '';
          response.on('data', function (chunk) {
              str += chunk;
          });
          response.on('end', async function () {
              resolve(JSON.parse(str).rows);
          })
        }
    });
  });
  const dataInFunction = await newProm1;
  console.log('entraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', dataInFunction);
  return dataInFunction;
}

router.get('/bbox-components', async (req, res) => {
  logger.info('BBOX components executing');
  const id = req.query.id;
  const table = req.query.table;
  const activetab = req.query.activetab;
  let field = 'projectid';
  const promises = [];
  const extraQueries = [];
  if (table === PROBLEM_TABLE) {
    field = 'problemid';
    const comps = await ComponentDependency.findAll({
      where: {'problem_id': id},
      attributes: ['component_id']
    });
    logger.info(`COMPONENTS FROM Component dependency table ${JSON.stringify(comps)}`);
    for (const component of comps) {
      let sql = `SELECT ST_extent(detention_facilities.the_geom) as bbox FROM detention_facilities
        where detention_facilities.component_id = ${component.component_id}`;
        logger.info(`SQL FOR Component dependency : ${sql}`);
        sql = encodeURIComponent(sql);
        const extra = `SELECT ST_AsGeoJSON(the_geom) as geojson, 'detention_facilities' as component, 
        original_cost as cost from detention_facilities where component_id = ${component.component_id}`;
        extraQueries.push(extra);
        const URL = `${CARTO_URL}&q=${sql}`;
        promises.push(new Promise((resolve, reject) => {
          https.get(URL, response => {   
            if (response.statusCode == 200) {
              let str = '';
              response.on('data', function (chunk) {
                str += chunk;
              });
              response.on('end', function () {
                const rows = JSON.parse(str).rows;
                console.log(rows);
                if (rows[0].bbox != null) {
                  rows[0].bbox = rows[0].bbox.replace('BOX(', '').replace(')', '').replace(/ /g, ',').split(',');
                }
                resolve({
                  bbox: rows[0].bbox,
                  component: 'detention_facilities'
                });
              });
            } else {
              console.log('status ', response.statusCode, URL);
              resolve([]);
            }
          }).on('error', err => {
            console.log('failed call to ', URL, 'with error ', err);
            resolve([]);
          })})
        );  
    }
  }
  for (const element of components) {
    const component = element.key;
    let sql = `SELECT ST_extent(${component}.the_geom) as bbox FROM ${component} 
    where ${component}.${field} = ${id}`;
    logger.info(`SQL FOR BBOX: ${sql}`);
    sql = encodeURIComponent(sql);
    const URL = `${CARTO_URL}&q=${sql}`;
    promises.push(new Promise((resolve, reject) => {
      https.get(URL, response => {   
        if (response.statusCode == 200) {
          let str = '';
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', function () {
            const rows = JSON.parse(str).rows;
            console.log(rows);
            if (rows[0].bbox != null) {
              rows[0].bbox = rows[0].bbox.replace('BOX(', '').replace(')', '').replace(/ /g, ',').split(',');
            }
            resolve({
              bbox: rows[0].bbox,
              component
            });
          });
        } else {
          console.log('status ', response.statusCode, URL);
          resolve([]);
        }
      }).on('error', err => {
        console.log('failed call to ', URL, 'with error ', err);
        resolve([]);
      })})
    );  
  }
  const all = await Promise.all(promises);
  const query = {
    q: components.map(t => 
      `SELECT ST_AsGeoJSON(the_geom) as geojson, '${t.key}' as component, original_cost as cost from ${t.key} where ${field} = ${id}` 
    ).concat(extraQueries).join(' union ')
  }
  console.log('JSON.stringify(query)\n\n\n\n', JSON.stringify(query));
  const datap = await needle('post', CARTO_URL, query, { json: true });
  let centroids = datap.body.rows.map((r) => {
    let geojson = JSON.parse(r.geojson);
    let center = [0, 0];
    if (geojson.type === 'MultiLineString') {
      if (geojson.coordinates[0].length > 0) {
        let len = geojson.coordinates[0].length;
        let mid = Math.floor(len / 2);
        center = geojson.coordinates[0][mid];
      }
    }
    if (geojson.type === 'MultiPolygon') {
      if (geojson.coordinates[0][0].length > 0) {
        let len = geojson.coordinates[0][0].length;
        let mid = Math.floor(len / 2);
        center = geojson.coordinates[0][0][mid];
      }
    }
    if (geojson.type === 'Point') {
      center = geojson.coordinates;
    }
    let arcWidth;
    if (r.cost <= 500 * 1000) {
      arcWidth = 2;
    } else if (r.cost <= 1 * 1000 * 1000) {
      arcWidth = 4;
    } else if (r.cost <= 5 * 1000 * 1000) {
      arcWidth = 6;
    } else {
      arcWidth = 8;
    }
    return {
      component: r.component,
      centroid: center,
      arcWidth
    };
  })

  const bboxes = [];
  for(const data of all) {
    if (data.bbox != null) { 
      bboxes.push(data);
    }
  }
  let [minLat, minLng, maxLat, maxLng] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const bbox of bboxes) {
    const coords = bbox.bbox;
    if (+coords[0] < minLat) {
      minLat = +coords[0];
    }
    if (+coords[1] < minLng) {
      minLng = +coords[1];
    }
    if (+coords[2] > maxLat) {
      maxLat = +coords[2];
    }
    if (+coords[3] > maxLng) {
      maxLng = +coords[3];
    }
  }

  let selfCentroid = {
    component: 'self',
    centroid: [(minLat + maxLat) / 2, (minLng + maxLng) / 2]
  };
  let bboxMain;
  if (table === MAIN_PROJECT_TABLE) {
    const queryProjectLine = {
      q: [table].map(t => 
        `SELECT ST_AsGeoJSON(the_geom) as geojson from ${t} where projectid = ${id}`
      ).join(' union ')
    }
    const dataProjectLine = await needle('post', CARTO_URL, queryProjectLine, { json: true });
    let r = dataProjectLine.body.rows[0];
    let geojson = JSON.parse(r.geojson);
    let projectCenter = [0, 0];
    if (geojson.type === 'MultiLineString') {
      if (geojson.coordinates[0].length > 0) {
        let len = geojson.coordinates[0].length;
        let mid = Math.floor(len / 2);
        projectCenter = geojson.coordinates[0][mid];
      }
    }
    selfCentroid = {
      component: 'self',
      centroid: projectCenter
    }

  let SQL = `SELECT *, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom2, ST_AsGeoJSON(the_geom) as the_geom3 FROM ${table} where  projectid=${id} `;
  let URL = encodeURI(`${CARTO_URL}&q=${SQL}`);
  const dataForBBOX = await needle('get', URL, { json: true });
  console.log("\n\n\n\nSQL\n\n\n\n", SQL);
  let coordinatesForBBOX = [];
  if (dataForBBOX.statusCode === 200 && dataForBBOX.body.rows.length > 0) {
    const result = dataForBBOX.body.rows[0];
    
    let convexhull = [];
    if (result.projectid !== null && result.projectid !== undefined && result.projectid) {
      convexhull = await getEnvelopeProblemsComponentsAndProject(result.projectid, table, 'projectid', activetab);
      if(convexhull[0]){
        convexhull = JSON.parse(convexhull[0].envelope).coordinates;
      }
    }
    // let createdCoordinates = {};
    // if (isDev) {
    //   createdCoordinates = result.the_geom3;
    // }
    result.the_geom = result.the_geom2;
    if(convexhull[0].length > 0){
      coordinatesForBBOX = convexhull;
       console.log("CONVEX HULL", coordinatesForBBOX);
    } else if (JSON.parse(result.the_geom).coordinates) {
      coordinatesForBBOX = JSON.parse(result.the_geom).coordinates;
      console.log("CONVEX HULL without", coordinatesForBBOX);
    }
  }
          bboxMain=coordinatesForBBOX

  }
  centroids = [selfCentroid, ...centroids]
  // const polygon = [[[minLat, minLng], [minLat, maxLng], [maxLat, maxLng], [maxLat, minLng], [minLat, minLng]]];
  res.send({
    bbox: bboxMain,
    centroids
  });
});
router.get('/problemname/:problemid', async (req, res) => {
  const problemid = req.params.problemid;
  const sql = `select ${PROPSPROBLEMTABLES.problem_boundary[6]} as ${PROPSPROBLEMTABLES.problems[6]} from ${PROBLEM_TABLE} where ${PROPSPROBLEMTABLES.problem_boundary[5]} = ${problemid}`;
  const sqlURI =  encodeURIComponent(sql);
  const URL = `${CARTO_URL}&q=${sqlURI}`;
  console.log("SQL", sql)
  try {
    https.get(URL, response => {   
      if (response.statusCode == 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', function () {
          const rows = JSON.parse(str).rows;
          return res.status(200).send(rows);
        });
      } else {
        console.log('status ', response.statusCode, URL);
        return res.status(320).send(response.statusCode);
      }
    }).on('error', err => {
      console.log('failed at problemname call to ', URL, 'with error ', err);
      res.send({problemname: []});
    });
  } catch(error) {
    res.send({error: error});
  }
});

export default router;
