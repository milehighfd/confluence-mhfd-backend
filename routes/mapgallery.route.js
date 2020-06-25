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

      filters = getFilters(req.query);

      const PROBLEM_SQL = `SELECT problemid, problemname, solutioncost, jurisdiction, problempriority, solutionstatus, problemtype FROM problems `;
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${PROBLEM_SQL} ${filters} &api_key=${CARTO_TOKEN}`);
      /* console.log('SQL', PROBLEM_SQL);
      console.log('FILTER', filters);
       */
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
        logger.error(`failed call to ${URL}  with error  ${err}`)
        return res.status(500).send({ error: err });
      });
    }
    else {
      let filters = '';

      filters = getFilters(req.query);

      const PROJECT_FIELDS = `objectid, projecttype, projectsubtype, coverimage, sponsor, finalCost, 
        estimatedCost, status, attachments, projectname, jurisdiction, streamname `;
      const LINE_SQL = `SELECT ${PROJECT_FIELDS} FROM projects_line_1`;
      const POLYGON_SQL = `SELECT ${PROJECT_FIELDS} FROM projects_polygon_`;
      const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL} ${filters}  &api_key=${CARTO_TOKEN}`);
      const POLYGON_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${POLYGON_SQL} ${filters} &api_key=${CARTO_TOKEN}`);
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
                    let valor = '';
                    if (element.attachments) {
                      valor = await attachmentService.findByName(element.attachments);
                    }
                    
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
              logger.error(`failed call to ${LINE_URL}  with error  ${err}`)
              return res.status(500).send({ error: err });
            });
          });
        } else {
          return res.status(response.statusCode).send({ error: 'Error with C connection' });
        }
      }).on('error', err => {
        //logger.error(`failed call to ${url}  with error  ${err}`)
        logger.error(`failed call to url ${LINE_URL} with error  ${err}`)
        return res.status(500).send({ error: err });
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Error with C connection' });
  }

});

function getFilters(params) {
  let filters = '';
  if (params.isproblem) {
    console.log('PROBLEMS');
    if (params.name) {
      if (filters.length > 0) {
        filters = filters = ` and problemname ilike '%${params.name}%'`;
      }
      else {
        filters = ` problemname ilike '%${params.name}%' `;
      }
    }

    if (params.problemtype) {
      if (filters.length > 0) {
        filters = filters + ` and problemtype = '${params.problemtype}'`;
      } else {
        filters = ` problemtype = '${params.problemtype}'`;
      }
    }
  } else {
    console.log('PROJECTS');
    if (params.name) { 
      if (filters.length > 0) {
        filters = ` and projectname ilike '%${params.name}%' `;
      } else {
        filters = ` projectname ilike '%${params.name}%' `;
      }
    }

    if (params.problemtype) {
      
    }
  }

  // ALL FILTERS
  // PROBLEMS 
  if (params.priority) {
    if (filters.length > 0) {
      filters = filters + ` and problempriority = '${params.priority}'`;
    } else {
      filters = ` problempriority = '${params.priority}'`;
    }
    console.log('FILTRO', filters);
  }

  if (params.solutionstatus) { 
    let limite = 0;
    if (params.solutionstatus === '10') {
      limite = 25;
    } else {
      limite = Number(params.solutionstatus) + 25;
    }
    if (filters.length > 0) {
      filters = filters + ` and (cast(solutionstatus as int) between ${params.solutionstatus} and ${limite}) `;
    } else {
      filters = ` (cast(solutionstatus as int) between ${params.solutionstatus} and ${limite}) `;
    }
  }

  if (params.cost) {
    let initValue = 0;
    let endValue = 0;
    if (params.cost === '1' || params.cost === '5') {
      initValue = Number(params.cost) * 1000000;
      endValue = 10000000;
    } else {
      initValue = Number(params.cost) * 1000000;
      endValue = initValue + 5000000;
    }
    if (filters.length > 0) {
      filters = filters + ` and (cast(solutioncost as bigint) between ${initValue} and ${endValue})`;
    } else {
      filters = ` (cast(solutioncost as bigint) between ${initValue} and ${endValue})`;
    }
  }

  if (params.mhfdmanager) {
    if (filters.length > 0) {
      filters = filters + ` and mhfdmanager = '${params.mhfdmanager}'`;
    } else {
      filters = `mhfdmanager = '${params.mhfdmanager}'`;
    }
  }

  if (params.problemtype) {
    if (filters.length > 0) {
      filters = filters + ` and source = '${params.problemtype}'`
    } else {
      filters = ` source = '${params.problemtype}'`;
    }
  }

  // PROJECTS
  if (params.projecttype) {
    if (filters.length > 0) {
      filters = filters + ` and projecttype = '${params.projecttype}'`;
    } else {
      filters = `projecttype = '${params.projecttype}'`;
    }
  }

  if (params.status) { 
    if (filters.length > 0) {
      filters = filters + ` and status = '${params.status}'`;
    } else {
      filters = `status = '${params.status}'`;
    }
  }

  if (params.startyear) {
    if (filters.length > 0) {
      filters = filters + ` and startyear = ${params.startyear} `;
    } else {
      filters = `startyear = ${params.startyear} `;
    }
  }

  if (params.completedyear) {
    if (filters.length > 0) {
      filters = filters + ` and completedyear = ${params.completedyear} `;
    } else {
      filters = ` completedyear = ${params.completedyear} `;
    }
  }

  if (params.mhfddollarsallocated) {
    let initValue = Number(params.mhfddollarsallocated) * 1000000;
    let endValue = initValue + 5000000;
    if (filters.length > 0) {
      filters = filters + ` and (cast(mhfddollarsallocated as bigint) between ${initValue} and ${endValue})`;
    } else {
      filters = `(cast(mhfddollarsallocated as bigint) between ${initValue} and ${endValue})`;
    }
  }

  if (params.workplanyear) {
    if (filters.length > 0) {
      filters = filters + ` and workplanyear = ${params.workplanyear}`;
    } else {
      filters = ` workplanyear = ${params.workplanyear}`;
    }
  }

  if (params.mhfdmanager) {
    if (filters.length > 0) {
      filters = filters + ` and mhfdmanager ilike '%${params.mhfdmanager}%'`;
    } else {
      filters = ` mhfdmanager ilike '%${params.mhfdmanager}%'`;
    }
  }

  if (params.lgmanager) {
    if (filters.length > 0) {
      filters = filters + ` and lgmanager ilike '%${params.lgmanager}%' `;
    } else {
      filters = ` lgmanager ilike '%${params.lgmanager}%' `;
    }
  }

  if (params.streamname) {
    if (filters.length > 0) {
      filters = filters + ` and streamname ilike '%${params.streamname}%' `;
    } else {
      filters = ` streamname ilike '%${params.streamname}%' `;
    }
  }

  if (params.creator) {
    if (filters.length > 0) {
      filters = filters + ` and creator ilike '%${params.creator}%' `;
    } else {
      filters = ` creator ilike '%${params.creator}%' `;
    }
  }

  // 
  if (params.bounds) {
    const coords = params.bounds.split(',');
    if (filters.length > 0) {
      console.log('FILTERS coord', filters);
      filters += ` and (ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`; // only for readbility 
    } else {
      filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`; // only for readbility 
    }
  }

  if (params.county) {
    if (filters.length > 0) {
      filters = filters + ` and county ilike '${params.county}'`;
    } else {
      filters = `county ilike '${params.county}'`;
    }
  }

  if (params.jurisdiction) {
    if (filters.length > 0) {
      filters = filters + ` and jurisdiction = '${params.jurisdiction}'`;
    } else {
      filters = ` jurisdiction = '${params.jurisdiction}'`;
    }
  }

  if (filters.length > 0) {
    filters = ' where ' + filters;
  }

  if (params.sortby) {
    let sorttype = '';
    if (!params.sorttype) {
      sorttype = 'desc';
    } else {
      sorttype = params.sorttype;
    }
    filters += ` order by ${params.sortby} ${sorttype}`;
  }

  console.log('FILTROS', filters);

  return filters;
}

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

router.get('/', async (req, res) => {
  try {
    const SQL = ``;
    const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${SQL}&api_key=${CARTO_TOKEN}`);
  } catch(err) {
    logger.error(err);
    res.status(500).send({ error: 'No there data in Components' });
  }
})


router.post('/group-by', async (req, res) => {
  try {
    const table = req.body.table;
    const column = req.body.column;
    const LINE_SQL = `SELECT ${column} FROM ${table} group by ${column} order by ${column}`;
    const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL}&api_key=${CARTO_TOKEN}`);
    https.get(LINE_URL, response => {
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', async function () {
          let data = [];
          let result = JSON.parse(str).rows;
          for (const res of result) {
            data.push(res[column]);
          }
          return res.status(200).send({'data': data});
        })
      }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Connection error' });
  }
})

module.exports = (router);