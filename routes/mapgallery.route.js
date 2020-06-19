const express = require('express');
const router = express.Router();
const https = require('https');
const fs = require('fs');
const { google } = require('googleapis');
const logger = require('../config/logger');

const { CARTO_TOKEN } = require('../config/config');
const attachmentService = require('../services/attachment.service');

router.get('/', async (req, res) => {
  try {
    console.log('enter here');
    if (req.query.isproblem) {
      let filters = '';
      if (req.query.name) {
        filters = ` problemname ilike '%${req.query.name}%' `;
      }

      if (req.query.priority) {
        //console.log('PRIORU',req.query.priority);
        if (filters.length > 0) {
          //console.log('HAY DATO');
          filters = filters + ` and problempriority = '${req.query.priority}'`;
        } else {
          //console.log('no hay');
          filters = ` problempriority = '${req.query.priority}'`;
        }
        console.log('FILTRO', filters);
      }

      if (req.query.status) {
        let limite = 0;
        if (req.query.status === '10') {
          limite = 25;
        } else {
          limite = Number(req.query.status) + 25;
        }
        if (filters.length > 0) {
          filters = filters + ` and (cast(solutionstatus as int) between ${req.query.status} and ${limite}) `;
        } else {
          filters = ` (cast(solutionstatus as int) between ${req.query.status} and ${limite}) `;
        }
      }

      if (req.query.county) {
        if (filters.length > 0) {
          filters = filters + ` and county ilike '${req.query.county}'`;
        } else {
          filters = `county ilike '${req.query.county}'`;
        }
      }

      if (req.query.cost) {
        let initValue = 0;
        let endValue = 0;
        if (req.query.cost === '1' || req.query.cost === '5') {
          initValue = Number(req.query.cost) * 1000000;
          endValue = 10000000;
        } else {
          initValue = Number(req.query.cost) * 1000000;
          endValue = initValue + 5000000;
        }
        if (filters.length > 0) {
          filters = filters + ` and (cast(solutioncost as bigint) between ${initValue} and ${endValue})`;
        } else {
          filters = ` (cast(solutioncost as bigint) between ${initValue} and ${endValue})`;
        }
        //console.log('FILTROOS2 ', filters);
      }

      if (filters.length > 0) {
        filters = ' where ' + filters;
      }
      
      const PROBLEM_SQL = `SELECT problemname, solutioncost, jurisdiction, problempriority, solutionstatus, problemtype FROM problems `;
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${PROBLEM_SQL} ${filters} &api_key=${CARTO_TOKEN}`);
      console.log('SQL', PROBLEM_SQL);
      console.log('FILTER', filters);
      console.log(URL);
      https.get(URL, response => {
        if (response.statusCode === 200) {
          let str = '';
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', function () {
            const result = JSON.parse(str).rows;
            return res.status(200).send(result);
          });
        } else {
          return res.status(response.statusCode).send({ error: 'Error with C connection' });
        }
      }).on('error', err => {
        logger.error(`failed call to ${url}  with error  ${err}`)
        return res.status(500).send({ error: err });
      });
    }
    else {
      let filters = '';
      //let name = '';
      if (req.query.name) {
        //name = req.query.name;
        filters = ` projectname ilike '%${req.query.name}%' `;
      }

      if (filters.length > 0) {
        filters = ' where ' + filters;
      }
      const PROJECT_FIELDS = `objectid, coverimage, sponsor, finalCost, estimatedCost, status, attachments, projectname `;
      const LINE_SQL = `SELECT ${PROJECT_FIELDS} FROM projects_line_1`;
      const POLYGON_SQL = `SELECT ${PROJECT_FIELDS} FROM projects_polygon_`;
      const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL} ${filters}&api_key=${CARTO_TOKEN}`);
      const POLYGON_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${POLYGON_SQL} ${filters}&api_key=${CARTO_TOKEN}`);
      https.get(LINE_URL, response => {
        if (response.statusCode === 200) {
          let str = '';
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', function () {
            let result = JSON.parse(str).rows;
            https.get(POLYGON_URL, response => {
              console.log(response.statusCode);
              if (response.statusCode === 200) {
                let str2 = '';
                response.on('data', function (chunk) {
                  str2 += chunk;
                });
                response.on('end', async function () {
                  result = result.concat(JSON.parse(str2).rows);
                  const finalResult = [];
                  for(const element of result) {
                    const valor = await attachmentService.findByName(element.attachments);// imaben.jpg
                    finalResult.push(
                      {
                        ...element,
                        attachments: valor
                      }
                    );
                  }
                  return res.status(200).send(finalResult);
                });
              } else {
                return res.status(response.statusCode);
              }
            }).on('error', err => {
              logger.error(`failed call to ${url}  with error  ${err}`)
              return res.status(500).send({ error: err });
            });
          });
        } else {
          return res.status(response.statusCode).send({ error: 'Error with C connection' });
        }
      }).on('error', err => {
        //logger.error(`failed call to ${url}  with error  ${err}`)
        logger.error(`failed call to url  with error  ${err}`)
        return res.status(500).send({ error: err });
      });
      console.log(URL);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Error with C connection' });
  }

});


router.get('/group-by', async (req, res) => {
  try {
    const column = req.query.column;
    const LINE_SQL = `SELECT ${column} FROM projects_line_1 group by ${column} order by ${column}`;
    const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL}&api_key=${CARTO_TOKEN}`);
    https.get(LINE_URL, response => {
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', async function() {
          let result = JSON.parse(str).rows;
          //const result = result.concat(JSON.parse(str).rows);
          return res.status(200).send(result);
        })
      }
    });
  } catch(error) {
    logger.error(error);
    res.status(500).send({error: error}).send({error: 'Connection error'});
  }
})

module.exports = (router);