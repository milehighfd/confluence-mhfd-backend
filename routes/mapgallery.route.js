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

      if (req.query.jurisdiction) {
        if (filters.length > 0) {
          filters = filters + ` and jurisdiction = '${req.query.jurisdiction}'`;
        } else {
          filters = ` jurisdiction = '${req.query.jurisdiction}'`;
        }
      }

      if (req.query.mhfdmanager) {
        if (filters.length > 0) {
          filters = filters + ` and mhfdmanager = '${req.query.mhfdmanager}'`;
        } else {
          filters = `mhfdmanager = '${req.query.mhfdmanager}'`;
        }
      }

      if (req.query.problemtype) {
        if (filters.length > 0) {
          filters = filters + ` and problemtype = '${req.query.problemtype}'`;
        } else {
          filters = ` problemtype = '${req.query.problemtype}'`;
        }
      }

      if (req.query.problemtype) {
        if (filters.length > 0) {
          filters = filters + ` and source = '${req.query.problemtype}'`
        } else {
          filters = ` source = '${req.query.problemtype}'`;
        }
      }

      if (filters.length > 0) {
        filters = ' where ' + filters;
      }

      const PROBLEM_SQL = `SELECT problemid, problemname, solutioncost, jurisdiction, problempriority, solutionstatus, problemtype FROM problems `;
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
      console.log('PROJECTS')
      //let name = '';
      if (req.query.name) {
        //name = req.query.name;
        filters = ` projectname ilike '%${req.query.name}%' `;
      }

      if (req.query.projecttype) {
        console.log('TYPE', req.query.projecttype);
        if (filters.length > 0) {
          filters = filters + ` and projecttype = '${req.query.projecttype}'`;
        } else {
          filters = `projecttype = '${req.query.projecttype}'`;
        }
      }

      if (req.query.status) {
        if (filters.length > 0) {
          filters = filters + ` and status = '${req.query.status}'`;
        } else {
          filters = `status = '${req.query.status}'`;
        }
      }

      if (req.query.startyear) {
        if (filters.length > 0) {
          filters = filters +  ` and startyear = ${req.query.startyear} `;
        } else {
          filters = `startyear = ${req.query.startyear} `;
        }
      }

      if (req.query.completedyear) {
        if (filters.length > 0) {
          filters = filters + ` and completedyear = ${req.query.completedyear} `;
        } else {
          filters = ` completedyear = ${req.query.completedyear} `;
        }
      }

      if (req.query.mhfddollarsallocated) {
        let initValue = Number(req.query.mhfddollarsallocated) * 1000000;
        let endValue = initValue + 5000000;
        if (filters.length > 0) {
          filters = filters + ` and (cast(mhfddollarsallocated as bigint) between ${initValue} and ${endValue})`;
        } else {
          filters = `(cast(mhfddollarsallocated as bigint) between ${initValue} and ${endValue})`;
        }
      }

      if (req.query.workplanyear) {
        if (filters.length > 0) {
          filters = filters + ` and workplanyear = ${req.query.workplanyear}`;
        } else {
          filters = ` workplanyear = ${req.query.workplanyear}`;
        }
      }

      if (req.query.mhfdmanager) {
        if (filters.length > 0) {
          filters = filters + ` and mhfdmanager ilike '%${req.query.mhfdmanager}%'`;
        } else {
          filters = ` mhfdmanager ilike '%${req.query.mhfdmanager}%'`;
        }
      }

      if (req.query.jurisdiction) {
        if (filters.length > 0) {
          filters = filters + ` and jurisdiction = '${req.query.jurisdiction}' `;
        } else {
          filters = `jurisdiction = '${req.query.jurisdiction}' `;
        }
      }

      if (req.query.lgmanager) {
        if (filters.length > 0) {
          filters = filters + ` and lgmanager ilike '%${req.query.lgmanager}%' `;
        } else {
          filters = ` lgmanager ilike '%${req.query.lgmanager}%' `;
        }  
      }

      if (req.query.county) {
        if (filters.length > 0) {
          filters = filters + ` and county = '${req.query.county}'`;
        } else {
          filters = `county = '${req.query.county}'`;
        }
      }

      if (req.query.streamname) {
        if (filters.length > 0) {
          filters = filters + ` and streamname ilike '%${req.query.streamname}%' `;
        } else {
          filters = ` streamname ilike '%${req.query.streamname}%' `;
        }
      }

      if (req.query.creator) {
        if (filters.length > 0) { 
          filters = filters + ` and creator ilike '%${req.query.creator}%' `;
        } else {
          filters = ` creator ilike '%${req.query.creator}%' `;
        }
      }

      if (filters.length > 0) {
        filters = ' where ' + filters;
      }
      console.log('FILTROS', filters);

      const PROJECT_FIELDS = `objectid, projecttype, coverimage, sponsor, finalCost, estimatedCost, status, attachments, projectname, jurisdiction `;
      const LINE_SQL = `SELECT ${PROJECT_FIELDS} FROM projects_line_1`;
      const POLYGON_SQL = `SELECT ${PROJECT_FIELDS} FROM projects_polygon_`;
      const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL} ${filters}&api_key=${CARTO_TOKEN}`);
      const POLYGON_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${POLYGON_SQL} ${filters}&api_key=${CARTO_TOKEN}`);
      console.log(LINE_URL);
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
                  for (const element of result) {
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

router.get('/project-by-id/:id', async (req, res) => {
  const id = req.params.id;
  try {
    console.log('ID', id)
    //const PROJECT_FIELDS = `objectid, projecttype, coverimage, sponsor, finalCost, estimatedCost, status, attachments, projectname `;
    const LINE_SQL = `SELECT * FROM projects_line_1 where objectid=${id}`;
    //const POLYGON_SQL = `SELECT ${PROJECT_FIELDS} FROM projects_polygon_`;
    const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL} &api_key=${CARTO_TOKEN}`);
    //const POLYGON_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${POLYGON_SQL} ${filters}&api_key=${CARTO_TOKEN}`);
    console.log(LINE_URL);
    https.get(LINE_URL, response => {
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', async function () {
          const result = JSON.parse(str).rows[0];
          //console.log('resultado', result);
          const valor = await attachmentService.findByName(result.attachments);
          //console.log('IMAGEN', valor);
          result.attachments = valor;
          return res.status(200).send(result);
        });
      }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: 'No there data with ID' });
  }
})

router.get('/problem-by-id/:id', async (req, res) => {
  const id = req.params.id;
  try {
    //console.log('ID',id);
    const PROBLEM_SQL = `SELECT * FROM problems where problemid='${id}'`;
    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${PROBLEM_SQL} &api_key=${CARTO_TOKEN}`);
    console.log('SQL', PROBLEM_SQL);
    //console.log('FILTER', filters);
    console.log(URL);
    https.get(URL, response => {
      console.log('status', response.statusCode);
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', function () {
          const result = JSON.parse(str).rows[0];
          //console.log('resultado', result);
          return res.status(200).send(result);
        });
      } else {
        return res.status(response.statusCode).send({ error: 'Error with C connection' });
      }
    }).on('error', err => {
      logger.error(`failed call to ${url}  with error  ${err}`)
      return res.status(500).send({ error: err });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: 'No there data with ID' });
  }
})


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
        response.on('end', async function () {
          let result = JSON.parse(str).rows;
          //const result = result.concat(JSON.parse(str).rows);
          return res.status(200).send(result);
        })
      }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Connection error' });
  }
})

module.exports = (router);