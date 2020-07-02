const express = require('express');
const router = express.Router();
const https = require('https');

const {CARTO_TOKEN} = require('../config/config');
const { response } = require('../app');

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
          resolve(null);
        }
      });
    });
    send = send.concat(answer);
  }
  res.send([... new Set(send)]);
});

module.exports = router;
