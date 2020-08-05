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
  let sql = `SELECT ST_x(ST_line_interpolate_point(st_makeline(st_linemerge(the_geom)), 0.5)) as x, ST_y(ST_line_interpolate_point(st_makeline(st_linemerge(the_geom)), 0.5)) as y, str_name FROM streams WHERE  str_name ILIKE '${query}%' AND ST_IsEmpty(the_geom) = false group by str_name`;
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
  res.send(answer);
});

module.exports = (router);