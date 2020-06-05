const express = require('express');
const router = express.Router();
const https = require('https');

const {CARTO_TOKEN} = require('../config/config');

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
    console.log('failed call to ', url, 'with error ', err);
    logger.error(`failed call to ${url}  with error  ${err}`)
    res.status(500).send({error: err});
  });
});

module.exports = (router);