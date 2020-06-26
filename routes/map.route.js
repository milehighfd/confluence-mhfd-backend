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

module.exports = (router);