const express = require('express');
const router = express.Router();
const https = require('https');
const { CARTO_TOKEN } = require('../config/config');

router.get('/', async (req, res) => {
  try {
    const newProm = new Promise((resolve, reject) => {
      const sql = `select aoi, filter, ST_AsGeoJSON(ST_Envelope(the_geom)) from mhfd_zoom_to_areas order by aoi`;
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${sql}&api_key=${CARTO_TOKEN}`);
      let result = [];
      https.get(URL, response => {
        if (response.statusCode === 200) {
          let str = '';
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', async function () {
            let firstElement = {};
            let arrayAux = [];
            for (let row of JSON.parse(str).rows) {
              if (row.aoi === 'MHFD Boundary') {
                firstElement = {
                  aoi: row.aoi,
                  filter: row.filter,
                  coordinates: JSON.parse(row.st_asgeojson).coordinates
                }
              } else {
                arrayAux.push({
                  aoi: row.aoi,
                  filter: row.filter,
                  coordinates: JSON.parse(row.st_asgeojson).coordinates
                })
              }
            }
            let result = [];
            result.push(firstElement);
            result = result.concat(arrayAux);
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

router.get('/get-zoom-filter', async (req, res) => {
  try {
    const newProm = new Promise((resolve, reject) => {
      const sql = `select filter, aoi from mhfd_zoom_to_areas group by filter, aoi order by filter, aoi`;
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${sql}&api_key=${CARTO_TOKEN}`);
      let result = [];
      https.get(URL, response => {
        if (response.statusCode === 200) {
          let str = '';
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', async function () {
            let data = {};
            let result = JSON.parse(str).rows;
            let group = '';
            let elementGroup = [];

            for (let row of result) {
              if (group === '') {
                group = row.filter;
                elementGroup.push(row.aoi);
              } else {
                if (row.filter === group) {
                  elementGroup.push(row.aoi);
                } else {
                  if (group !== null) {
                    data[group] = elementGroup;
                  }
                  group = row.filter;
                  elementGroup = [];
                }
              }
            }

            if (group !== null) {
              data[group] = elementGroup;
            }

            resolve(data);
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
});

module.exports = (router);