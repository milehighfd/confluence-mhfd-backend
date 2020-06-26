const express = require('express');
const router = express.Router();
const https = require('https');
const fs = require('fs');
const { google } = require('googleapis');
const logger = require('../config/logger');
const auth = require('../auth/auth');

const { CARTO_TOKEN } = require('../config/config');
const attachmentService = require('../services/attachment.service');
const { query } = require('../config/logger');

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


      //console.log('FILTER', filters);

      console.log(URL);
      https.get(URL, response => {
        if (response.statusCode === 200) {
          let str = '';
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', async function () {
            const result = JSON.parse(str).rows;
            console.log('cant probl', result.length);
            //let totalComponents = 0;
            /*const finalResult = [];
            for (const element of result) {
              //console.log('prob', element);
              const COMPONENTS_SQL = `SELECT id, type, estimated_cost, status FROM grade_control_structure where problemid=${element.problemid} union ` +
                `SELECT id, type, estimated_cost, status FROM pipe_appurtenances where problemid=${element.problemid} union ` +
                `SELECT id, type, estimated_cost, status FROM special_item_point where problemid=${element.problemid} union ` +
                `SELECT id, type, estimated_cost, status FROM special_item_linear where problemid=${element.problemid} union ` +
                `SELECT id, type, estimated_cost, status FROM special_item_area where problemid=${element.problemid} union ` +
                `SELECT id, type, estimated_cost, status FROM channel_improvements_linear where problemid=${element.problemid} union ` +
                `SELECT id, type, estimated_cost, status FROM channel_improvements_area where problemid=${element.problemid} union ` +
                `SELECT id, type, estimated_cost, status FROM removal_line where problemid=${element.problemid} union ` +
                `SELECT id, type, estimated_cost, status FROM removal_area where problemid=${element.problemid} union ` +
                `SELECT id, type, estimated_cost, status FROM storm_drain where problemid=${element.problemid} union ` +
                `SELECT id, type, estimated_cost, status FROM detention_facilities where problemid=${element.problemid} union ` +
                `SELECT id, type, estimated_cost, status FROM maintenance_trails where problemid=${element.problemid} union ` +
                `SELECT id, type, estimated_cost, status FROM land_acquisition where problemid=${element.problemid} union ` +
                `SELECT id, type, estimated_cost, status FROM landscaping_area where problemid=${element.problemid}`;
              const URL_COMPONENT = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${COMPONENTS_SQL} &api_key=${CARTO_TOKEN}`);
              const newProm1 = new Promise((resolve, reject) => {
                https.get(URL_COMPONENT, response1 => {
                  if (response.statusCode === 200) {
                    let str2 = '';
                    response1.on('data', function (chunk) {
                      str2 += chunk;
                    });
                    response1.on('end', async function () {
                      const res1 = JSON.parse(str2).rows;
                      //console.log(res1.length);
                      resolve(res1.length);
                    });
                  }
                })
              });

              const total = await newProm1;
              finalResult.push(
                {
                  ...element,
                  totalComponents: total
                }
              );
              //console.log('total', total);
            } 
            return res.status(200).send(finalResult);*/
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
            console.log('cantidad',result.length);
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
      const query = createQueryForIn(params.problemtype.split(','));
      console.log('prob tye', query);
      if (filters.length > 0) {
        filters = filters + ` and problemtype in (${query}) `;
      } else {
        filters = ` problemtype in (${query}) `;
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
    const query = createQueryForIn(params.priority.split(','));
    if (filters.length > 0) {
      filters = filters + ` and problempriority in (${query})`;
    } else {
      filters = ` problempriority in (${query})`;
    }
  }

  if (params.solutionstatus) {
    let limite = 0;
    const values = params.solutionstatus.split(',');
    let query = '';
    let operator = '';
    for (const val of values) {
      if (val === '10') {
        limite = 25;
      } else {
        limite = Number(val) + 25;
      }
      query += operator + ` (cast(solutionstatus as int) between ${val} and ${limite}) `;
      operator = ' or ';
    }
    
    if (filters.length > 0) {
      filters = filters + ` and ${query} `;
    } else {
      filters = ` ${query} `;
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
    const query = createQueryForIn(params.mhfdmanager.split(','))
    if (filters.length > 0) {
      filters = filters + ` and mhfdmanager = '${query}'`;
    } else {
      filters = `mhfdmanager = '${query}'`;
    }
  }

  if (params.source) {
    const query = createQueryForIn(params.source.split(','));
    if (filters.length > 0) {
      filters = filters + ` and source in (${query}) `;
    } else {
      filters = ` source in (${query}) `;
    }
  }

  // PROJECTS
  if (params.projecttype) {
    const query = createQueryForIn(params.projecttype.split(','));
    if (filters.length > 0) {
      filters = filters + ` and projecttype in (${query})`;
    } else {
      filters = `projecttype in (${query})`;
    }
  }

  if (params.status) {
    const query = createQueryForIn(params.status.split(','))
    if (filters.length > 0) {
      filters = filters + ` and status in (${query})`;
    } else {
      filters = `status in (${query})`;
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

  if (params.lgmanager) {
    const query = createQueryForIn(params.lgmanager.split(','));
    if (filters.length > 0) {
      filters = filters + ` and lgmanager in (${query}) `;
    } else {
      filters = ` lgmanager in (${query}) `;
    }
  }

  if (params.streamname) {
    const query = createQueryForIn(params.streamname.split(','));
    if (filters.length > 0) {
      filters = filters + ` and streamname in (${query}) `;
    } else {
      filters = ` streamname in (${query}) `;
    }
  }

  if (params.creator) {
    const query = createQueryForIn(params.creator.split(','));
    if (filters.length > 0) {
      filters = filters + ` and creator in (${query}) `;
    } else {
      filters = ` creator in (${query}) `;
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
    const query = createQueryForIn(params.county.split(','));
    if (filters.length > 0) {
      filters = filters + ` and county in (${query})`;
    } else {
      filters = `county in (${query})`;
    }
  }

  if (params.jurisdiction) {
    //const data = params.jurisdiction.split(',');
    const query = createQueryForIn(params.jurisdiction.split(','));
    console.log('jur', query);
    if (filters.length > 0) {
      filters = filters + ` and jurisdiction in (${query})`;
    } else {
      filters = ` jurisdiction in (${query})`;
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

function createQueryForIn(data) {
  //const data = params.jurisdiction.split(',');
  let query = '';
  let separator = '';
  for (const elem of data) {
    query += separator + '\'' + elem.trim() + '\'';
    separator = ','
  }
  return query;
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
    const COMPONENTS_SQL = `SELECT id, type, estimated_cost, status FROM grade_control_structure where problemid=${id} union ` +
      `SELECT id, type, estimated_cost, status FROM pipe_appurtenances where problemid=${id} union ` +
      `SELECT id, type, estimated_cost, status FROM special_item_point where problemid=${id} union ` +
      `SELECT id, type, estimated_cost, status FROM special_item_linear where problemid=${id} union ` +
      `SELECT id, type, estimated_cost, status FROM special_item_area where problemid=${id} union ` +
      `SELECT id, type, estimated_cost, status FROM channel_improvements_linear where problemid=${id} union ` +
      `SELECT id, type, estimated_cost, status FROM channel_improvements_area where problemid=${id} union ` +
      `SELECT id, type, estimated_cost, status FROM removal_line where problemid=${id} union ` +
      `SELECT id, type, estimated_cost, status FROM removal_area where problemid=${id} union ` +
      `SELECT id, type, estimated_cost, status FROM storm_drain where problemid=${id} union ` +
      `SELECT id, type, estimated_cost, status FROM detention_facilities where problemid=${id} union ` +
      `SELECT id, type, estimated_cost, status FROM maintenance_trails where problemid=${id} union ` +
      `SELECT id, type, estimated_cost, status FROM land_acquisition where problemid=${id} union ` +
      `SELECT id, type, estimated_cost, status FROM landscaping_area where problemid=${id}`;

    //console.log('FILTER', filters);
    console.log('URL', URL);
    const URL_COMPONENT = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${COMPONENTS_SQL} &api_key=${CARTO_TOKEN}`);
    https.get(URL, response => {
      console.log('status', response.statusCode);
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', function () {
          const result = JSON.parse(str).rows[0];
          let resultComponents = [];
          //console.log('PROBLEMAS', result);
          //console.log('URL COMPO', URL_COMPONENT);
          https.get(URL_COMPONENT, response1 => {
            //console.log('status2', response1.statusCode);
            if (response1.statusCode === 200) {
              let str2 = '';
              response1.on('data', function (chunk) {
                str2 += chunk;
              });

              response1.on('end', async function () {
                resultComponents = JSON.parse(str2).rows;
                console.log('componentes', resultComponents);
              });
            }
          })
          return res.status(200).send({
            ...result,
            components: resultComponents
          });
        });
      } else {
        return res.status(response.statusCode).send({ error: 'Error with C connection' });
      }
    }).on('error', err => {
      logger.error(`failed call to ${URL}  with error  ${err}`);
      return res.status(500).send({ error: err });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: 'No there data with ID' });
  }
});

router.post('/group-by', async (req, res) => {
  try {
    const table = req.body.table;
    const column = req.body.column;
    const LINE_SQL = `SELECT ${column} FROM ${table} group by ${column} order by ${column}`;
    const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL}&api_key=${CARTO_TOKEN}`);
    console.log(LINE_URL);
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
          return res.status(200).send({ 'data': data });
        })
      }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Connection error' });
  }
});

router.get('/data-jurisdiction', auth, async (req, res) => {
  try {
    console.log(req.user.organization, req.user._id);
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
          return res.status(200).send({ 'data': data });
        })
      }
    });
    res.status(200).send('ok');
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Connection error' });
  }
});

module.exports = (router);