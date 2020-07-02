const express = require('express');
const router = express.Router();
const https = require('https');
const fs = require('fs');
const { google } = require('googleapis');
const logger = require('../config/logger');
const auth = require('../auth/auth');
var request = require("request");

const { CARTO_TOKEN } = require('../config/config');
const attachmentService = require('../services/attachment.service');
const { query } = require('../config/logger');

router.get('/', async (req, res) => {
  try {
    console.log('enter here');
    if (req.query.isproblem) {
      let filters = '';
      filters = getFilters(req.query);

      /* const PROBLEM_SQL = `SELECT problemid, problemname, solutioncost, jurisdiction,
            problempriority, solutionstatus, problemtype, county FROM problems `; */
      const PROBLEM_SQL = `SELECT cartodb_id, problemid, problemname, solutioncost, jurisdiction,
            problempriority, solutionstatus, problemtype, county, 
            (select count(*) from grade_control_structure where problemid = cast(problems.problemid as integer) ) as count_gcs, 
            (select count(*) from pipe_appurtenances where problemid = cast(problems.problemid as integer) ) as count_pa,
            (select count(*) from special_item_point where problemid = cast(problems.problemid as integer) ) as count_sip, 
            (select count(*) from special_item_linear where problemid = cast(problems.problemid as integer) ) as count_sil, 
            (select count(*) from channel_improvements_area where problemid = cast(problems.problemid as integer) ) as count_cia, 
            (select count(*) from special_item_area where problemid = cast(problems.problemid as integer) ) as count_sia, 
            (select count(*) from  removal_line where problemid = cast(problems.problemid as integer) ) as count_rl, 
            (select count(*) from removal_area where problemid = cast(problems.problemid as integer) ) as count_ra, 
            (select count(*) from storm_drain where problemid = cast(problems.problemid as integer) ) as count_sd, 
            (select count(*) from detention_facilities where problemid = cast(problems.problemid as integer) ) as count_df, 
            (select count(*) from maintenance_trails where problemid = cast(problems.problemid as integer) ) as count_mt, 
            (select count(*) from land_acquisition where problemid = cast(problems.problemid as integer) ) as count_la, 
            (select count(*) from landscaping_area where problemid = cast(problems.problemid as integer) ) as count_la1 
            FROM problems `;
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${PROBLEM_SQL} ${filters} &api_key=${CARTO_TOKEN}`);
      //console.log('SQL', PROBLEM_SQL);

      //console.log(URL);
      https.get(URL, response => {
        if (response.statusCode === 200) {
          let str = '';
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', async function () {
            const result = JSON.parse(str).rows;
            const finalResult = [];
            for (const element of result) {
              let total = 0;
              total = element.count_gcs + element.count_pa + element.count_sip + element.count_sil +
                element.count_cia + element.count_sia + element.count_rl + element.count_ra +
                element.count_sd + element.count_df + element.count_mt + element.count_la +
                element.count_la + element.count_la1;
              finalResult.push(
                {
                  cartodb_id: element.cartodb_id,
                  type: 'problems',
                  problemid: element.problemid,
                  problemname: element.problemname,
                  solutioncost: element.solutioncost,
                  jurisdiction: element.jurisdiction,
                  problempriority: element.problempriority,
                  solutionstatus: element.solutionstatus,
                  problemtype: element.problemtype,
                  county: element.county,
                  totalComponents: total
                }
              );
              // console.log('total', total);
            }
            return res.status(200).send(finalResult);
            //return res.status(200).send(result);
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

      const PROJECT_FIELDS = `cartodb_id, objectid, projecttype, projectsubtype, coverimage, sponsor, finalCost, 
        estimatedCost, status, attachments, projectname, jurisdiction, streamname, county `;
      const LINE_SQL = `SELECT 'projects_line_1' as type, ${PROJECT_FIELDS} FROM projects_line_1`;
      const POLYGON_SQL = `SELECT 'projects_polygon_' as type, ${PROJECT_FIELDS} FROM projects_polygon_`;
      console.log(LINE_SQL, filters);
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
  let tipoid = '';
  const VALUES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
    'special_item_linear', 'special_item_area', 'channel_improvements_linear',
    'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
    'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];

  if (params.isproblem) {
    console.log('PROBLEMS');
    tipoid = 'problemid';
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
      if (filters.length > 0) {
        filters = filters + ` and problemtype in (${query}) `;
      } else {
        filters = ` problemtype in (${query}) `;
      }
    }
  } else {
    console.log('PROJECTS');
    tipoid = 'projectid';
    if (params.name) {
      if (filters.length > 0) {
        filters = ` and projectname ilike '%${params.name}%' `;
      } else {
        filters = ` projectname ilike '%${params.name}%' `;
      }
    }

    if (params.problemtype) {
      console.log('TIPOS PROBLEMAS', params.problemtype);
      const values = params.problemtype.split(',');

      let operator = '';
      let query = '';
      for (const component of VALUES_COMPONENTS) {
        for (const val of values) {
          query += operator + ` projectid in (select projectid 
            from ${component} where projectid > 0 and 
            problemid in (select problemid from problems where problemtype='${val}')) `;
          operator = ' or ';
        }
      }
      if (filters.length > 0) {
        filters += ` and (${query}) `;
      } else {
        filters += ` (${query}) `;
      }
    }
  }

  // components
  if (params.componenttype) {
    const values = params.componenttype.split(',');
    let query = '';
    let operator = '';
    for (const component of values) {
      query += operator + ` ${tipoid} in (select ${tipoid} from ${component}) `;
      operator = ' or ';
    }

    if (filters.length > 0) {
      filters += ` AND ${query}`;
    } else {
      filters = ` ${query}`;
    }
  }

  if (params.componentstatus) {
    const values = createQueryForIn(params.componentstatus.split(','));
    let query = '';
    let operator = '';
    // for (const value of values) {
    for (const component of VALUES_COMPONENTS) {
      query += operator +
        ` ${tipoid} in (select ${tipoid} from ${component} where status in (${values})) `;
      operator = ' or ';
    }
    //}

    if (filters.length > 0) {
      filters += ` AND ${query}`;
    } else {
      filters = ` ${query}`;
    }

  }

  if (params.watershed) {
    const values = createQueryForIn(params.watershed.split(','));
    let query = '';
    let operator = '';
    //for (const value of values) {
    for (const component of VALUES_COMPONENTS) {
      query += operator +
        ` ${tipoid} in (select ${tipoid} from ${component} where mhfdmanager in (${values})) `;
      operator = ' or ';
    }
    //}

    if (filters.length > 0) {
      filters += ` AND ${query}`;
    } else {
      filters = ` ${query}`;
    }
  }

  if (params.yearofstudy) {
    const values = params.yearofstudy.split(',');
    let query = '';
    let operator = '';
    for (const value of values) {
      //const initValue = value;
      for (const component of VALUES_COMPONENTS) {
        query += operator +
          ` ${tipoid} in (select ${tipoid} from ${component} where year_of_study between ${value} and ${value + 9}) `;
        operator = ' or ';
      }
    }

    if (filters.length > 0) {
      filters += ` AND ${query}`;
    } else {
      filters = ` ${query}`;
    }
  }

  if (params.estimatedcostComp) {
    const values = params.estimatedcostComp.split(',');
    let query = '';
    let operator = '';
    for (const value of values) {
      const initValue = Number(value) * 1000000;
      for (const component of VALUES_COMPONENTS) {
        query += operator +
          ` (${tipoid} in (select ${tipoid} from ${component} where estimated_cost > 0 and estimated_cost between ${initValue} and ${initValue + 2000000} )) `;
        operator = ' or ';
      }
    }

    if (filters.length > 0) {
      filters = `and ${query}`;
    } else {
      filters = ` ${query}`;
    }
  }

  if (params.jurisdictionComp) {

    const values = createQueryForIn(params.jurisdictionComp.split(','));
    let query = '';
    let operator = '';
    //const initValue = value;
    for (const component of VALUES_COMPONENTS) {
      query += operator +
        ` ${tipoid} in (select ${tipoid} from ${component} where jurisdiction in (${values}) ) `;
      operator = ' or ';
    }

    if (filters.length > 0) {
      filters += ` AND ${query}`;
    } else {
      filters = ` ${query}`;
    }
  }

  if (params.countyComp) {
    const values = createQueryForIn(params.countyComp.split(','));
    let query = '';
    let operator = '';
    //const initValue = value;
    for (const component of VALUES_COMPONENTS) {
      query += operator +
        ` ${tipoid} in (select ${tipoid} from ${component} where county in (${values}) ) `;
      operator = ' or ';
    }

    if (filters.length > 0) {
      filters += ` AND ${query}`;
    } else {
      filters = ` ${query}`;
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
    console.log('SOLUTIONS', params.solutionstatus);
    const values = params.solutionstatus.split(',');
    let query = '';
    let operator = '';
    for (const val of values) {

      limite = Number(val) + 25;
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

    const values = params.cost.split(',');
    let query = '';
    let operator = '';
    for (const val of values) {
      let initValue = 0;
      let endValue = 0;
      if (val === '1' || val === '5') {
        initValue = Number(val) * 1000000;
        endValue = 10000000;
      } else {
        initValue = Number(val) * 1000000;
        endValue = initValue + 5000000;
      }
      query += operator + ` (cast(solutioncost as bigint) between ${initValue} and ${endValue})`;
      operator = ' or ';
    }

    if (filters.length > 0) {
      filters += ` and ${query}`;
    } else {
      filters = ` ${query}`;
    }
  }

  if (params.mhfdmanager) {
    console.log('MHFD MANAGER', params.mhfdmanager);
    const query = createQueryForIn(params.mhfdmanager.split(','));
    console.log('QUERY', query);
    if (filters.length > 0) {
      filters = filters + ` and mhfdmanager in (${query})`;
    } else {
      filters = `mhfdmanager in (${query})`;
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

  if (params.component) {
    const values = params.component.split(',');
    let query = '';
    let operator = '';
    for (const val of values) {
      query += operator + ` problemid in (select problemid from ${val})`;
      operator = ' or ';
    }

    if (filters.length > 0) {
      filters += ` and ${query} `;
    } else {
      filters = ` ${query} `;
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
  if (params.limit && params.page) {
    filters = ` limit= ${limit} offset=${params.page * params.limit}`
  }
  //console.log('FILTROS', filters);
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
    const COMPONENTS_SQL = `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM grade_control_structure where problemid=${id} group by type, status union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM pipe_appurtenances where problemid=${id} group by type, status union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM special_item_point where problemid=${id} group by type, status union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM special_item_linear where problemid=${id} group by type, status union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM special_item_area where problemid=${id} group by type, status union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM channel_improvements_linear where problemid=${id} group by type, status union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM channel_improvements_area where problemid=${id} group by type, status union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM removal_line where problemid=${id} group by type, status union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM removal_area where problemid=${id} group by type, status union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM storm_drain where problemid=${id} group by type, status union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM detention_facilities where problemid=${id} group by type, status union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM maintenance_trails where problemid=${id} group by type, status union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM land_acquisition where problemid=${id} group by type, status union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, status, coalesce(sum(original_cost), 0) as original_cost FROM landscaping_area where problemid=${id} group by type, status`;
    console.log('components', COMPONENTS_SQL);
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
        response.on('end', async function () {
          const result = JSON.parse(str).rows[0];
          const newProm1 = new Promise((resolve, reject) => {
            https.get(URL_COMPONENT, response1 => {
              if (response1.statusCode === 200) {
                let str2 = '';
                response1.on('data', function (chunk) {
                  str2 += chunk;
                });

                response1.on('end', async function () {
                  resolve(JSON.parse(str2).rows);
                });
              }
            });
          });

          const resultComponents = await newProm1;
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

async function getTotals(type_component, problemid) {
  let data = [];
  const LINE_SQL = `select status, count(*) as total_projects from ${type_component} 
  where problemid=${problemid} and projectid>0 group by projectid, status`;
  const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL}&api_key=${CARTO_TOKEN}`);
  //console.log(LINE_URL);
  const newProm1 = new Promise((resolve, reject) => {
    https.get(LINE_URL, response => {
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', async function () {
          let data = [];
          let result = JSON.parse(str).rows;
          let state_apro = 0;
          if (result.length > 0) {
            for (const proj of result) {
              //data.push(res[column]);
              if (proj.status === 'Completed') {
                state_apro += proj.total_projects;
              }
            }
            resolve(state_apro/result.length);
          } else {
            resolve(0);
          }
        })
      }
    });
  });
  data = await newProm1;
  return data;
}

router.post('/components-by-problemid', async (req, res) => {
  try {
    const id = req.body.id;
    const sortby = req.body.sortby;
    let sorttype = req.body.sorttype;

    const COMPONENTS_SQL = `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM grade_control_structure 
      where problemid=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM pipe_appurtenances 
      where problemid=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM special_item_point 
      where problemid=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM special_item_linear 
      where problemid=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM special_item_area 
      where problemid=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM channel_improvements_linear 
      where problemid=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM channel_improvements_area 
      where problemid=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM removal_line 
      where problemid=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM removal_area 
      where problemid=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM storm_drain 
      where problemid=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM detention_facilities 
      where problemid=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM maintenance_trails 
      where problemid=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM land_acquisition 
      where problemid=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM landscaping_area 
      where problemid=${id} group by type `;

    if (sortby) {
      if (sorttype) {
        sorttype = 'desc';
      }
      COMPONENTS_SQL += ` order by ${sortby} ${sorttype}`;
    }
    console.log('components', COMPONENTS_SQL);
    //console.log('FILTER', filters);
    const COMPONENT_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${COMPONENTS_SQL}&api_key=${CARTO_TOKEN}`);
    https.get(COMPONENT_URL, response => {
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', async function () {
          let result = [];
          for (const comp of JSON.parse(str).rows) {
            //console.log(comp);
            const type_component = comp.type.split(' ').join('_').toLowerCase();
            const percentage = await getTotals(type_component, id);
            result.push({
              ...comp,
              percentage: percentage
            })
          }
          return res.status(200).send(result);
        })
      }
    });
    
  } catch (err) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Connection error' });
  }
})

router.post('/group-by', async (req, res) => {
  try {
    const table = req.body.table;
    const column = req.body.column;
    console.log(table, column);
    const LINE_SQL = `SELECT ${column} FROM ${table} group by ${column} order by ${column}`;
    console.log(LINE_SQL);
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

async function getValuesByColumn(table, column) {
  /* const table = req.body.table;
  const column = req.body.column; */
  let data = [];
  const LINE_SQL = `SELECT ${column} FROM ${table} group by ${column} order by ${column}`;
  const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL}&api_key=${CARTO_TOKEN}`);
  //console.log(LINE_URL);
  const newProm1 = new Promise((resolve, reject) => {
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
          resolve(data);

        })
      }
    });
  });
  data = await newProm1;
  return data;
}



async function getComponentsValuesByColumn(column) {
  /* const table = req.body.table;
  const column = req.body.column; */
  let data = [];
  const LINE_SQL = `SELECT ${column} FROM grade_control_structure group by ${column} union
      SELECT ${column} FROM pipe_appurtenances group by ${column} union
      SELECT ${column} FROM special_item_point group by ${column} union
      SELECT ${column} FROM special_item_linear group by ${column} union
      SELECT ${column} FROM special_item_area group by ${column} union
      SELECT ${column} FROM channel_improvements_linear group by ${column} union
      SELECT ${column} FROM channel_improvements_area group by ${column} union
      SELECT ${column} FROM removal_line group by ${column} union
      SELECT ${column} FROM removal_area group by ${column} union
      SELECT ${column} FROM storm_drain group by ${column} union
      SELECT ${column} FROM detention_facilities group by ${column} union
      SELECT ${column} FROM maintenance_trails group by ${column} union
      SELECT ${column} FROM land_acquisition group by ${column} union
      SELECT ${column} FROM landscaping_area group by ${column} order by ${column}`;
  const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL}&api_key=${CARTO_TOKEN}`);
  //console.log(LINE_URL);
  const newProm1 = new Promise((resolve, reject) => {
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
          resolve(data);

        })
      }
    });
  });
  data = await newProm1;
  return data;
}


router.get('/params-filters', async (req, res) => {
  try {
    const creators = await getValuesByColumn('projects_line_1', 'creator');
    const mhfdmanagers = await getValuesByColumn('projects_line_1', 'mhfdmanager');
    const projecttypes = ['Maintenance', 'Study', 'Capital'];
    const status = await getValuesByColumn('projects_line_1', 'status');
    const startyear = await getValuesByColumn('projects_line_1', 'startyear');
    const completedyear = await getValuesByColumn('projects_line_1', 'completedyear');
    const mhfddollarsallocated = await getValuesByColumn('projects_line_1', 'mhfddollarsallocated');
    //const workplanyear = await getValuesByColumn('projects_line_1', 'workplanyear');
    const problemtype = await getValuesByColumn('problems', 'problemtype');
    const jurisdictionProj = await getValuesByColumn('projects_line_1', 'jurisdiction');
    const countyProj = await getValuesByColumn('projects_line_1', 'county');
    const priority = ['High', 'Medium', 'Low'];
    const countyProb = await getValuesByColumn('problems', 'county');
    const jurisdictionProb = await getValuesByColumn('problems', 'jurisdiction');
    const mhfdmanagerprob = await getValuesByColumn('problems', 'mhfdmanager');
    const sources = await getValuesByColumn('problems', 'source');
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
    const lgmanager = await getValuesByColumn('projects_line_1', 'county');
    const streamname = await getValuesByColumn('projects_line_1', 'streamname');
    const statusComponent = await getComponentsValuesByColumn('status');
    const yearOfStudyComponent = [1970, 1980, 1990, 2000, 2010, 2020];
    //const estimatedCostComp = await getComponentsValuesByColumn('estimated_cost');
    const jurisdictionComponent = await getComponentsValuesByColumn('jurisdiction');
    const countyComponent = await getComponentsValuesByColumn('county');
    const mhfdManagerComponent = await getComponentsValuesByColumn('mhfdmanager');
    //const streamnameComponent = await getComponentsValuesByColumn('streamname'); 

    const result = {
      "projects": {
        "creator": creators,
        "mhfdmanager": mhfdmanagers,
        "projecttype": projecttypes,
        "status": status,
        "startyear": startyear,
        "completedyear": completedyear,
        "mhfddollarsallocated": mhfddollarsallocated,
        "workplanyear": [],
        "problemtype": problemtype,
        "jurisdiction": jurisdictionProj,
        "county": countyProj,
        "lgmanager": lgmanager,
        "streamname": streamname
      },
      "problems": {
        "problemtype": problemtype,
        "priority": priority,
        "county": countyProb,
        "jurisdiction": jurisdictionProb,
        "mhfdmanager": mhfdmanagerprob,
        "source": sources,
        "components": components
      },
      "components": {
        "component_type": components,
        "status": statusComponent,
        "yearofstudy": yearOfStudyComponent,
        "estimatedcost": [],
        "jurisdiction": jurisdictionComponent,
        "county": countyComponent,
        "watershed": mhfdManagerComponent,
        //"streamname": streamnameComponent
      }
    }
    res.status(200).send(result);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Connection error' });
  }
});

module.exports = (router);