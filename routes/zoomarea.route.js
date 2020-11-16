const express = require('express');
const router = express.Router();
const https = require('https');
const { CARTO_TOKEN } = require('../config/config');
//const { response } = require('express');

router.get('/', async (req, res) => {
  try {
    const newProm = new Promise((resolve, reject) => {
      const sql = `select aoi, filter, ST_AsGeoJSON(ST_Envelope(the_geom)) from mhfd_zoom_to_areas`;
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${sql}&api_key=${CARTO_TOKEN}`);
      let result = [];
      https.get(URL, response => {
        if (response.statusCode === 200) {
          let str = '';
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', async function() {
            let data = [];
            let result = JSON.parse(str).rows.map(element => {
              return {
                aoi: element.aoi,
                filter: element.filter,
                coordinates: JSON.parse(element.st_asgeojson).coordinates
              }
            }
            )
            resolve(result);
          })
        }
      })
    })

    const respuesta = await newProm;
    res.status(200).send(respuesta);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Error with C connection' });
  }
})

module.exports = (router);