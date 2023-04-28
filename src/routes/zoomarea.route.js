import express from 'express';
import https from 'https';
import { CARTO_URL } from 'bc/config/config.js';
import logger from 'bc/config/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  logger.info(`Starting endpoint zoomarea.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    const newProm = new Promise((resolve, reject) => {
      const sql = `select cartodb_id, aoi, filter, ST_AsGeoJSON(ST_Envelope(the_geom)) from mhfd_zoom_to_areas order by aoi`;
      const URL = encodeURI(`${CARTO_URL}&q=${sql}`);
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
              if (row.cartodb_id === 1) {
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
    logger.info(`Starting function newProm for zoomarea.route/`);
    const respuesta = await newProm;
    logger.info(`Finished function newProm for zoomarea.route/`);
    res.status(200).send(respuesta);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Error with C connection' });
  }
})


router.get('/complete', async (req, res) => {
  logger.info(`Starting endpoint zoomarea.route/complete with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    const newProm = new Promise((resolve, reject) => {
      const sql = `select cartodb_id, aoi, filter, ST_AsGeoJSON(the_geom) from mhfd_zoom_to_areas order by aoi`;
      const URL = encodeURI(`${CARTO_URL}&q=${sql}`);
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
              if (row.cartodb_id === 1) {
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
    logger.info(`Starting function newProm for zoomarea.route/complete`);
    const respuesta = await newProm;
    logger.info(`Finished function newProm for zoomarea.route/complete`);
    res.status(200).send(respuesta);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Error with C connection' });
  }
})

router.get('/get-zoom-filter', async (req, res) => {
  logger.info(`Starting endpoint zoomarea.route/get-zoom-filter with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    const newProm = new Promise((resolve, reject) => {
      const sql = `select filter, aoi from mhfd_zoom_to_areas group by filter, aoi order by filter, aoi`;
      const URL = encodeURI(`${CARTO_URL}&q=${sql}`);
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
    logger.info(`Starting function newProm for zoomarea.route/get-zoom-filter`);
    const respuesta = await newProm;
    logger.info(`Finished function newProm for zoomarea.route/get-zoom-filter`);
    res.status(200).send(respuesta);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Error with C connection' });
  }
});

export default router;
