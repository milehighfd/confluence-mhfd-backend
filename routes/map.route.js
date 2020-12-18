const express = require('express');
const router = express.Router();
const https = require('https');
const logger = require('../config/logger');

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
            if (rows[0].bbox != null) {
              rows[0].bbox = rows[0].bbox.replace('BOX(', '').replace(')', '').replace(/ /g, ',').split(',');
            }
            resolve({bbox: rows[0].bbox});
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
  const answer = [];
  for(const data of all) {
    if (data.bbox != null) { 
      answer.push(data);
    }
  }
  let [minLat, minLng, maxLat, maxLng] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const bbox of answer) {
    const coords = bbox.bbox;
    if (coords[0] < minLat) {
      minLat = coords[0];
    }
    if (coords[1] < minLng) {
      minLng = coords[1];
    }
    if (coords[2] > maxLat) {
      maxLat = coords[2];
    }
    if (coords[3] > maxLng) {
      maxLng = coords[3];
    }
  }
  const polygon = [[[minLat, minLng], [minLat, maxLng], [maxLat, maxLng], [maxLat, minLng], [minLat, minLng]]];
  res.send(polygon);
});

module.exports = (router);