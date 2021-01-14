const express = require('express');
const router = express.Router();
const https = require('https');
const logger = require('../config/logger');
const needle = require('needle');

const {CARTO_TOKEN} = require('../config/config');

router.get('/organization', async (req, res) => {
  // where {_user} = 'Local Gov'
  const URL = `https://denver-mile-high-admin.carto.com/api/v2/sql?q=select type, name from organizations group by type,name order by type &api_key=${CARTO_TOKEN}`;
  console.log(URL);
  https.get(URL, response => {
    if (response.statusCode == 200) {
      let str = '';
      response.on('data', function (chunk) {
        str += chunk;
      });
      response.on('end', function () {
        const tiles = JSON.parse(str).rows;
        return res.send(tiles);
      });
    } else {
      return res.status(response.statusCode).send({error: 'error'});
    }
  });
})

router.post('/', async (req, res) => { 
  const table = req.body.table;
  const sql = `SELECT * FROM ${table}`;
  var mapConfig = {
    "layers":[ {
      "id":"pluto15v1",
      "options": {
        "sql": sql
      }
    }
  ]};
  console.log('TABLA', table);
  mapConfig =  encodeURIComponent(JSON.stringify(mapConfig));
  const URL = `https://denver-mile-high-admin.carto.com/api/v1/map?config=${mapConfig}&api_key=${CARTO_TOKEN}`;
  
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
  const URL = `https://denver-mile-high-admin.carto.com/api/v2/sql?q=${sql}&api_key=${CARTO_TOKEN}`;
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
router.get('/bbox-components', async (req, res) => {
  const id = req.query.id;
  const table = req.query.table;
  let field = 'projectid';
  if (table === 'problems') {
    field = 'problemid';
  }
  const promises = [];
  for (const element of components) {
    const component = element.key;
    let sql = `SELECT ST_extent(${component}.the_geom) as bbox FROM "denver-mile-high-admin".${component} 
    where ${component}.${field} = ${id}`;
    console.log('my sql ', sql);
    sql = encodeURIComponent(sql);
    const URL = `https://denver-mile-high-admin.carto.com/api/v2/sql?q=${sql}&api_key=${CARTO_TOKEN}`;
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
  const URL2 = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  const query = {
    q: components.map(t => 
      `SELECT ST_AsGeoJSON(the_geom) as geojson, '${t.key}' as component, original_cost as cost from ${t.key} where ${field} = ${id}` 
    ).join(' union ')
  }
  const datap = await needle('post', URL2, query, { json: true });
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
  centroids = [{
    component: 'self',
    centroid: [(minLat + maxLat) / 2, (minLng + maxLng) / 2]
  }, ...centroids]
  const polygon = [[[minLat, minLng], [minLat, maxLng], [maxLat, maxLng], [maxLat, minLng], [minLat, minLng]]];
  res.send({
    bbox: polygon,
    centroids
  });
});

module.exports = (router);