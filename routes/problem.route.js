const express = require('express');
const router = express.Router();
//const Problem = require('../models/problem.model');
const auth = require('../auth/auth');
const logger = require('../config/logger');
const https = require('https');
const { PROBLEM_TABLE } = require('../config/config');
const CARTO_TOKEN = 'a53AsTjS8iBMU83uEaj3dw';

router.post('/filters', async (req, res) => {
  try {
    var filters = req.body;
    let where = '';
    //console.log('filtros',filters);
    let sql = `select * from ${PROBLEM_TABLE} `;
    if(filters) {
      //console.log(filters);
      where = '';
      for (const key in filters) {
        //console.log('key ',key);
        if (key === 'problemname' && filters[key] != null) { 
          where += `${key} = \'${filters[key]}\' `;
        }
      }
      console.log('WHERE', where);
      
      if (where !== '') {
        sql = sql + ' where ' + where;
        //console.log('SQL', sql);
      }
    }
    
    const URL = `https://denver-mile-high-admin.carto.com/api/v2/sql?q=${sql}&api_key=${CARTO_TOKEN}`;
    console.log(URL);
    https.get(URL, response => {
      console.log(response.statusCode);
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', function () {
          result = JSON.parse(str).rows;
          return res.status(200).send(result);
        });
      }
    }).on('error', err => {
      console.log('failed call to ', url, 'with error ', err);
      logger.error(`failed call to ${url}  with error  ${err}`)
      res.status(500).send({ error: err });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error });
  }
});

module.exports = router;