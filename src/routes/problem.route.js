import express from 'express';
import https from 'https';
import logger from 'bc/config/logger.js';
import { PROBLEM_TABLE, CARTO_URL } from 'bc/config/config.js';

const router = express.Router();

router.get('/get-name', async (req, res) => {
  logger.info(`Starting endpoint problem.route/get-name with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    const problem_id = req.query.problem_id;

    const sql = `SELECT problem_name FROM ${PROBLEM_TABLE} WHERE problem_id = ${problem_id}`;
    const URL = `${CARTO_URL}&q=${sql}`;
    console.log(URL);
    https.get(URL, response => {
      console.log(response.statusCode);
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', function () {
          const result = JSON.parse(str).rows;
          const problemname = result.length ? result[0].problem_name : '-';
          return res.status(200).send({problem_name: problemname});
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

//This endpoint fails the test
router.post('/filters', async (req, res) => {
  logger.info(`Starting endpoint problem.route/filters with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    var filters = req.body;
    let where = '';
    let sql = `select * from ${PROBLEM_TABLE} `;
    if(filters) {
      where = '';
      for (const key in filters) {
        if (key === 'problemname' && filters[key] != null) { 
          where += `${key} = \'${filters[key]}\' `;
        }
      }
      console.log('WHERE', where);
      
      if (where !== '') {
        sql = sql + ' where ' + where;
      }
    }
    
    const URL = `${CARTO_URL}&q=${sql}`;
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

export default router;
