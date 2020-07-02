const express = require('express');
const router = express.Router();
const https = require('https');

const {CARTO_TOKEN} = require('../config/config');
const { response } = require('../app');
const { component } = require('../config/db');

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
const PROJECT_TABLES = ['projects_line_1', 'projects_polygon_'];
router.get('/', async (req, res) => {
  const tables = req.query.tables.split(',');
  let send = [];
  for (const table of tables) {
    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=SELECT DISTINCT problemid FROM ${table}  WHERE problemid is not null  &api_key=${CARTO_TOKEN}`);
    const answer = await new Promise(resolve => {
      https.get(URL, response => {
        var str = '';
        if (response.statusCode == 200) {
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', function () {
            var data = JSON.parse(str);
            resolve ( data.rows.map(element => element.problemid));
          });
        } else {
          console.log('Error ', response.statusCode);
          resolve([]);
        }
      });
    });
    send = send.concat(answer);
  }
  res.send([... new Set(send)]);
});

router.get('/projecttype', async (req, res) => {
  const problemtype = req.query.problemtype;
  let send = [];
  for (const element of components) {
    const component = element.key;
    for (const table of PROJECT_TABLES) {
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=SELECT DISTINCT ${table}.projectid FROM ${table}, problems, ${component}   WHERE ${table}.projectid = ${component}.projectid and problems.problemid = ${component}.problemid and problems.problemtype = '${problemtype}'  &api_key=${CARTO_TOKEN}`);
      const answer = await new Promise(resolve => {
        https.get(URL, response => {
          var str = '';
          if (response.statusCode == 200) {
            response.on('data', function (chunk) {
              str += chunk;
            });
            response.on('end', function () {
              var data = JSON.parse(str);
              resolve ( data.rows.map(element => element.projectid));
            });
          } else {
            console.log('Error ', response.statusCode);
            resolve([]);
          }
        });
      });
      send = send.concat(answer);
    }
  }
  res.send(send);
});
module.exports = router;
