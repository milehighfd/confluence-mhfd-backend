const express = require('express');
const router = express.Router();
const https = require('https');
const fs = require('fs');
const { google } = require('googleapis');
const logger = require('../config/logger');
const auth = require('../auth/auth');
var request = require("request");
const needle = require('needle');

const { CARTO_TOKEN } = require('../config/config');
const attachmentService = require('../services/attachment.service');
const { response } = require('express');
//const { query } = require('../config/logger');
const PROJECT_TABLES = ['projects_line_1', 'projects_polygon_'];

router.post('/', async (req, res) => {
  try {
    console.log('enter here');
    if (req.body.isproblem) {
      let filters = '';
      filters = getFilters(req.body);
      // 
      const PROBLEM_SQL = `SELECT cartodb_id, problemid, problemname, solutioncost, jurisdiction, problempriority, solutionstatus, problemtype, county, ${getCounters('problems', 'problemid')} FROM problems `;
      //const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${PROBLEM_SQL} ${filters} &api_key=${CARTO_TOKEN}`);
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      const query = { q: `${PROBLEM_SQL} ${filters}` };
      //console.log('QUERY', PROBLEM_SQL, filters);
      let answer = [];
      try {
        const data = await needle('post', URL, query, { json: true });
        //console.log('status', data.statusCode);
        if (data.statusCode === 200) {
          answer = data.body.rows.map(element => {
            return {
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
              totalComponents: element.count_gcs + element.count_pa + element.count_sip + element.count_sil +
                element.count_cia + element.count_sia + element.count_rl + element.count_ra +
                element.count_sd + element.count_df + element.count_mt + element.count_la +
                element.count_la + element.count_la1 + element.count_cila
            }
          })
        } else {
          console.log('bad status', response.statusCode, response.body);
          logger.error('bad status', response.statusCode, response.body);
        }
      } catch (error) {
        console.log('Error', error);
      }
      res.send(answer);
    } else {
      let filters = '';
      let send = [];

      filters = getFilters(req.body);
      const PROJECT_FIELDS = 'cartodb_id, objectid, projectid, projecttype, projectsubtype, coverimage, sponsor, finalCost, ' +
        'estimatedCost, status, attachments, projectname, jurisdiction, streamname, county ';

      if (req.body.problemtype) {
        const result = await queriesByProblemTypeInProject(PROJECT_FIELDS, filters, req.body.problemtype);
        return res.status(200).send(result);
      } else {
        for (const table of PROJECT_TABLES) {
          let query = ''
          if (table === 'projects_line_1') {
            query = { q: `SELECT '${table}' as type, ${PROJECT_FIELDS}, ${getCounters('projects_line_1', 'projectid')} FROM ${table} ${filters} ` };
          } else {
            query = { q: `SELECT '${table}' as type, ${PROJECT_FIELDS}, ${getCounters('projects_polygon_', 'projectid')} FROM ${table} ${filters} ` };
          }
          
          const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
          let answer = [];
          try {
            const data = await needle('post', URL, query, { json: true });
            //console.log('STATUS', data.statusCode);
            if (data.statusCode === 200) {
              const result = data.body.rows;
              for (const element of result) {
                let valor = '';
                if (element.attachments) {
                  valor = await attachmentService.findByName(element.attachments);
                }
                answer.push({
                  type: element.type,
                  cartodb_id: element.cartodb_id,
                  objectid: element.objectid,
                  projectid: element.projectid,
                  projecttype: element.projecttype,
                  projectsubtype: element.projectsubtype,
                  coverimage: element.coverimage,
                  sponsor: element.sponsor,
                  finalcost: element.finalcost,
                  estimatedcost: element.estimatedcost,
                  status: element.status,
                  attachments: element.attachments,
                  projectname: element.projectname,
                  jurisdiction: element.jurisdiction,
                  streamname: element.streamname,
                  county: element.county,
                  attachments: valor,
                  totalComponents: element.count_gcs + element.count_pa + element.count_sip + element.count_sil +
                    element.count_cia + element.count_sia + element.count_rl + element.count_ra +
                    element.count_sd + element.count_df + element.count_mt + element.count_la +
                    element.count_la + element.count_la1 + element.count_cila
                });
              }
              send = send.concat(answer);
            } else {
              console.log('bad status ', response.statusCode, response.body);
            }
          } catch (error) {
            console.log(error);
          };
        }
      }
      return res.send(send);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Error with C connection' });
  }

});

function getCounters(table, column) {
  return ` (select count(*) from grade_control_structure where ${column} = cast(${table}.${column} as integer) ) as count_gcs, 
      (select count(*) from pipe_appurtenances where ${column} = cast(${table}.${column} as integer) ) as count_pa,
      (select count(*) from special_item_point where ${column} = cast(${table}.${column} as integer) ) as count_sip, 
      (select count(*) from special_item_linear where ${column} = cast(${table}.${column} as integer) ) as count_sil, 
      (select count(*) from special_item_area where ${column} = cast(${table}.${column} as integer) ) as count_sia, 
      (select count(*) from channel_improvements_linear where ${column} = cast(${table}.${column} as integer) ) as count_cila, 
      (select count(*) from channel_improvements_area where ${column} = cast(${table}.${column} as integer) ) as count_cia, 
      (select count(*) from  removal_line where ${column} = cast(${table}.${column} as integer) ) as count_rl, 
      (select count(*) from removal_area where ${column} = cast(${table}.${column} as integer) ) as count_ra, 
      (select count(*) from storm_drain where ${column} = cast(${table}.${column} as integer) ) as count_sd, 
      (select count(*) from detention_facilities where ${column} = cast(${table}.${column} as integer) ) as count_df, 
      (select count(*) from maintenance_trails where ${column} = cast(${table}.${column} as integer) ) as count_mt, 
      (select count(*) from land_acquisition where ${column} = cast(${table}.${column} as integer) ) as count_la, 
      (select count(*) from landscaping_area where ${column} = cast(${table}.${column} as integer) ) as count_la1 `;
}

function getFilters(params) {
  //console.log('PARAMS',params);
  let filters = '';
  let tipoid = '';
  let hasProjectType = false;
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
      
    }
  }

  // components
  if (params.componenttype) {
    console.log('COMPONENTS FILTER', params.componenttype);
    const values = params.componenttype.split(',');
    let query = '';
    let operator = '';
    for (const component of values) {
      query += operator + ` ${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid}) `;
      operator = ' or ';
    }

    if (filters.length > 0) {
      filters += ` AND (${query})`;
    } else {
      filters = ` (${query})`;
    }
    //console.log('QUERY COMPONENTS', query);
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
      filters += ` AND (${query})`;
    } else {
      filters = ` (${query})`;
    }

  }

  if (params.watershed) {
    const values = createQueryForIn(params.watershed.split(','));
    let query = '';
    let operator = '';
    //for (const value of values) {
    for (const component of VALUES_COMPONENTS) {
      query += operator +
        ` ${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid} and mhfdmanager in (${values})) `;
      operator = ' or ';
    }
    //}

    if (filters.length > 0) {
      filters += ` AND (${query})`;
    } else {
      filters = ` (${query})`;
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
          ` ${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid} and year_of_study between ${value} and ${value + 9}) `;
        operator = ' or ';
      }
    }

    if (filters.length > 0) {
      filters += ` AND (${query})`;
    } else {
      filters = ` (${query})`;
    }
  }

  if (params.estimatedcostComp) {
    
    let query = '';
    let operator = '';
    for (const value of params.estimatedcostComp) {
      const values = value.split(',');
      
      for (const component of VALUES_COMPONENTS) {
        query += operator +
          ` (${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid} and estimated_cost > 0 and estimated_cost between ${values[0]} and ${values[1]} )) `;
        operator = ' or ';
      }
    }

    if (filters.length > 0) {
      filters = `and (${query})`;
    } else {
      filters = ` (${query})`;
    }
  }

  if (params.jurisdictionComp) {

    const values = createQueryForIn(params.jurisdictionComp.split(','));
    let query = '';
    let operator = '';
    //const initValue = value;
    for (const component of VALUES_COMPONENTS) {
      query += operator +
        ` ${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid} and jurisdiction in (${values}) ) `;
      operator = ' or ';
    }

    if (filters.length > 0) {
      filters += ` AND (${query})`;
    } else {
      filters = ` (${query})`;
    }
  }

  if (params.countyComp) {
    const values = createQueryForIn(params.countyComp.split(','));
    let query = '';
    let operator = '';
    //const initValue = value;
    for (const component of VALUES_COMPONENTS) {
      query += operator +
        ` ${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid} and county in (${values}) ) `;
      operator = ' or ';
    }

    if (filters.length > 0) {
      filters += ` AND (${query})`;
    } else {
      filters = ` (${query})`;
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
    let query = '';
    let operator = '';
    for (const val of params.cost) {
      const values = val.split(',');
      
      query += operator + ` (cast(solutioncost as bigint) between ${values[0]} and ${values[1]})`;
      operator = ' or ';
    }
    //console.log('query', query);

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

  if (params.components) {
    //console.log('COMPONENTES', params.components);
    const values = params.components.split(',');
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
    hasProjectType = true;
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
    let query = '';
    let operator = '';

    for (const mhfddolar of params.mhfddollarsallocated) {
      const values = mhfddolar.split(',');
      query += operator + ` (cast(mhfddollarsallocated as bigint) between ${values[0]} and ${values[1]})`;
      operator = ' or ';
    }

    if (filters.length > 0) {
      filters = filters + ` and (${query})`;
    } else {
      filters = ` (${query}) `;
    }
  }

  if (params.totalcost) {
    let query = '';
    let operator = '';

    for (const cost of params.totalcost) {
      const values = cost.split(',');
      query += operator + ` (coalesce(cast(finalcost as real), cast(estimatedcost as real)) between ${values[0]} and ${values[1]}) `;
      operator = ' or ';
    }

    if (filters.length > 0) {
      filters += ` and (${query}) `;
    } else {
      filters = ` (${query}) `;
    }
  }

  //console.log(params);
  if (params.workplanyear) {
    const values = params.workplanyear.split(',');
    let query = '';
    let operator = '';
    for (const year of values) {
      //console.log(year);
      switch (year) {
        case "2019": {
          query += operator + ` workplanyr1 = ${year}`;
          break;
        }
        case "2020": {
          query += operator + ` workplanyr2 = ${year}`;
          break;
        }
        case "2021": {
          query += operator + ` workplanyr3 = ${year}`;
          break;
        }
        case "2022": {
          query += operator + ` workplanyr4 = ${year}`;
          break;
        }
        case "2023": {
          query += operator + ` workplanyr5 = ${year}`;
          break;
        }
      }
      operator = ' or ';
    }
    //console.log(query);
    if (filters.length > 0) {
      filters += ` and (${query}) `;
    } else {
      filters = ` (${query}) `;
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
    if (filters.length > 0) {
      filters = filters + ` and jurisdiction in (${query})`;
    } else {
      filters = ` jurisdiction in (${query})`;
    }
  }

  if (!hasProjectType && !params.isproblem) {
    if (filters.length > 0) {
      filters += ` and projecttype in ('Capital', 'Study', 'Maintenance')`;
    } else {
      filters = `projecttype in ('Capital', 'Study', 'Maintenance')`;
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

function createQueryByProblemType(problemType, project) {
  const VALUES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
    'special_item_linear', 'special_item_area', 'channel_improvements_linear',
    'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
    'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];

  let operator = '';
  let query = '';
  for (const component of VALUES_COMPONENTS) {
    query += operator + ` select projectid from ${component}, problems where projectid = ${project}.projectid 
    and ${component}.problemid = problems.problemid and problemtype='${problemType}' `;
    operator = ' union ';

  }
  query = ` projectid in (${query})`;
  return query;
}

async function queriesByProblemTypeInProject(project_fields, filters, problemTypes) { // , res

  let send = [];
  const values = problemTypes.split(',');
  //console.log('VALORES', values);
  for (const type of values) {
    
    for (const table of PROJECT_TABLES) {
      //console.log('TABLE', table);
      let newfilter = createQueryByProblemType(type, table);
      let query = '';
      //console.log('filtros ANTES', filters);
      if (filters.length > 0) {
        newfilter = ` where ${newfilter} and ` + filters.substr(6, filters.length);
      } else {
        newfilter = ` where ${newfilter}`;
      }
      
      //console.log('QUERY LINE', query_project_line);
      //console.log('FILTERS BY COMPONENT', newfilter);
      if (table === 'projects_line_1') {
        query = { q: `SELECT '${table}' as type, ${project_fields}, ${getCounters('projects_line_1', 'projectid')} FROM ${table} ${newfilter} ` };
      } else {
        query = { q: `SELECT '${table}' as type, ${project_fields}, ${getCounters('projects_polygon_', 'projectid')} FROM ${table} ${newfilter} ` };
      }
      //console.log('FILTROSSS', query);

      //console.log('MY QUERY ', query);
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

      const data = await needle('post', URL, query, { json: true });
      let answer = [];
      console.log('STATUS', data.statusCode);
      if (data.statusCode === 200) {
        const result = data.body.rows;
        //console.log('RESULTADO', result);
        for (const element of result) {
          let valor = '';
          if (element.attachments) {
            valor = await attachmentService.findByName(element.attachments);
          }
          answer.push({
            type: element.type,
            cartodb_id: element.cartodb_id,
            objectid: element.objectid,
            projectid: element.projectid,
            projecttype: element.projecttype,
            projectsubtype: element.projectsubtype,
            coverimage: element.coverimage,
            sponsor: element.sponsor,
            finalcost: element.finalcost,
            estimatedcost: element.estimatedcost,
            status: element.status,
            attachments: element.attachments,
            projectname: element.projectname,
            jurisdiction: element.jurisdiction,
            streamname: element.streamname,
            county: element.county,
            attachments: valor,
            totalComponents: element.count_gcs + element.count_pa + element.count_sip + element.count_sil +
              element.count_cia + element.count_sia + element.count_rl + element.count_ra +
              element.count_sd + element.count_df + element.count_mt + element.count_la +
              element.count_la + element.count_la1 + element.count_cila
          });
        }
        //console.log('DATOS', type, answer);

        send = send.concat(answer);
      } else {
        console.log('bad status ', response.statusCode, response.body);
      }

    }
  }
  //console.log('ENVIANDO RESPUESTA ', send);
  return send;
}

router.get('/project-by-ids', async (req, res) => {
  const cartoid = req.query.cartoid;
  const objectid = req.query.objectid;
  const type = req.query.type;

  try {
    let SQL = '';
    let URL = '';
    if (type === 'projects_polygon_') {
      SQL = `SELECT *, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM projects_polygon_ where objectid=${objectid} and cartodb_id=${cartoid} `;
      URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${SQL} &api_key=${CARTO_TOKEN}`);
    } else {
      SQL = `SELECT *, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM projects_line_1 where objectid=${objectid} and cartodb_id=${cartoid} `;
      URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${SQL} &api_key=${CARTO_TOKEN}`);
    }
    console.log(SQL);
    console.log(URL);
    https.get(URL, response => {
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', async function () {
          const result = JSON.parse(str).rows[0];
          /* console.log('resultado', result);
          console.log('JSON', JSON.parse(result.the_geom).coordinates); */
          let problems = [];
          let attachmentFinal = [];
          let components = [];
          let coordinates = [];

          if (result.projectid && result.projectid !== null) {
            problems = await getProblemByProjectId(result.projectid, 'problemname', 'asc');
            components = await getCoordinatesOfComponents(result.projectid, 'projectid');
          }

          console.log('listado', result.attachments);
          if (result.attachments) {
            attachments = await attachmentService.findByName(result.attachments);
          }
          //coordinates: JSON.parse(result.the_geom).coordinates
          if (JSON.parse(result.the_geom).coordinates) {
            coordinates = JSON.parse(result.the_geom).coordinates;
          }
          return res.status(200).send({
            cartodb_id: result.cartodb_id,
            objectid: result.objectid,
            projectid: result.projectid,
            onbaseid: result.onbaseid,
            projectname: result.projectname,
            status: result.status,
            requestedname: result.requestedname,
            projecttype: result.projecttype,
            projectsubtype: result.projectsubtype,
            description: result.description,
            sponsor: result.sponsor,
            cosponsor: result.cosponsor,
            recurrence: result.recurrence,
            frequency: result.frequency,
            mhfddollarsrequested: result.mhfddollarsrequested,
            estimatedcost: result.estimatedcost,
            mhfddollarsallocated: result.mhfddollarsallocated,
            finalcost: result.finalcost,
            startyear: result.startyear,
            completedyear: result.completedyear,
            consultant: result.consultant,
            contractor: result.contractor,
            lgmanager: result.lgmanager,
            mhfdmanager: result.mhfdmanager,
            servicearea: result.servicearea,
            county: result.county,
            jurisdiction: result.jurisdiction,
            streamname: result.streamname,
            tasksedimentremoval: result.tasksedimentremoval,
            tasktreethinning: result.tasktreethinning,
            taskbankstabilization: result.taskbankstabilization,
            taskdrainagestructure: result.taskdrainagestructure,
            taskregionaldetention: result.taskregionaldetention,
            goalfloodrisk: result.goalfloodrisk,
            goalwaterquality: result.goalwaterquality,
            goalstabilization: result.goalstabilization,
            goalcaprecreation: result.goalcaprecreation,
            goalcapvegetation: result.goalcapvegetation,
            goalstudyovertopping: result.goalstudyovertopping,
            goalstudyconveyance: result.goalstudyconveyance,
            goalstudypeakflow: result.goalstudypeakflow,
            goalstudydevelopment: result.goalstudydevelopment,
            creator: result.creator,
            datecreated: result.datecreated,
            lastmodifieduser: result.lastmodifieduser,
            lastmodifieddate: result.lastmodifieddate,
            workplanyr1: result.workplanyr1,
            workplanyr2: result.workplanyr2,
            workplanyr3: result.workplanyr3,
            workplanyr4: result.workplanyr4,
            workplanyr5: result.workplanyr5,
            coverimage: result.coverimage,
            globalid: result.globalid,
            shape_length: result.shape_length,
            attachments: attachmentFinal,
            problems: problems,
            components: components,
            coordinates: coordinates
          });
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
    const PROBLEM_SQL = `SELECT ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom, cartodb_id,
    objectid, problemid, problemname, problemdescription, problemtype,
    problempriority, source, sourcename, solutioncost, solutionstatus,
    mhfdmanager, servicearea, county, jurisdiction, streamname,
    problemsubtype, sourcedate, shape_length, shape_area 
    FROM problems where problemid='${id}'`;
    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${PROBLEM_SQL} &api_key=${CARTO_TOKEN}`);

    https.get(URL, response => {
      console.log('status', response.statusCode);
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', async function () {
          const result = JSON.parse(str).rows[0];
          const resultComponents = await getCoordinatesOfComponents(id, 'problemid');

          return res.status(200).send({
            cartodb_id: result.cartodb_id,
            objectid: result.objectid,
            problemid: result.problemid,
            problemname: result.problemname,
            problemdescription: result.problemdescription,
            problemtype: result.problemtype,
            problempriority: result.problempriority,
            source: result.source,
            solutioncost: result.solutioncost,
            solutionstatus: result.solutionstatus,
            sourcename: result.sourcename,
            mhfdmanager: result.mhfdmanager,
            servicearea: result.servicearea,
            county: result.county,
            streamname: result.streamname,
            problemsubtype: result.problemsubtype,
            sourcedate: result.sourcedate,
            jurisdiction: result.jurisdiction,
            shape_length: result.shape_length,
            shape_area: result.shape_area,
            components: resultComponents,
            coordinates: JSON.parse(result.the_geom).coordinates
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

async function getProblemByProjectId(projectid, sortby, sorttype) {
  let data = [];
  const LINE_SQL = `select problemid, problemname, problempriority from problems  
  where problemid in (SELECT problemid FROM grade_control_structure 
    where projectid=${projectid} and projectid>0  union ` +
    `SELECT problemid FROM pipe_appurtenances 
    where projectid=${projectid} and projectid>0  union ` +
    `SELECT problemid FROM special_item_point 
    where projectid=${projectid} and projectid>0  union ` +
    `SELECT problemid FROM special_item_linear 
    where projectid=${projectid} and projectid>0  union ` +
    `SELECT problemid FROM special_item_area 
    where projectid=${projectid} and projectid>0  union ` +
    `SELECT problemid FROM channel_improvements_linear 
    where projectid=${projectid} and projectid>0  union ` +
    `SELECT problemid FROM channel_improvements_area 
    where projectid=${projectid} and projectid>0  union ` +
    `SELECT problemid FROM removal_line 
    where projectid=${projectid} and projectid>0  union ` +
    `SELECT problemid FROM removal_area 
    where projectid=${projectid} and projectid>0  union ` +
    `SELECT problemid FROM storm_drain 
    where projectid=${projectid} and projectid>0  union ` +
    `SELECT problemid FROM detention_facilities 
    where projectid=${projectid} and projectid>0  union ` +
    `SELECT problemid FROM maintenance_trails 
    where projectid=${projectid} and projectid>0  union ` +
    `SELECT problemid FROM land_acquisition 
    where projectid=${projectid} and projectid>0  union ` +
    `SELECT problemid FROM landscaping_area 
    where projectid=${projectid} and projectid>0) 
    order by ${sortby} ${sorttype}`;
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
          resolve(JSON.parse(str).rows);
        })
      }
    });
  });
  data = await newProm1;
  return data;
}

async function getTotals(type_component, pid, typeid) {
  let data = [];
  const LINE_SQL = `select status, count(*) as total_projects from ${type_component} 
  where ${typeid}=${pid} and projectid>0 group by projectid, status`;
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
            resolve(state_apro / result.length);
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

async function getCoordinatesOfComponents(id, field) {
  const COMPONENTS_SQL = `SELECT type, 'grade_control_structure' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM grade_control_structure 
      where ${field}=${id}  union ` +
    `SELECT type, 'pipe_appurtenances' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM pipe_appurtenances 
      where ${field}=${id}  union ` +
    `SELECT type, 'special_item_point' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM special_item_point 
      where ${field}=${id}  union ` +
    `SELECT type, 'special_item_linear' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM special_item_linear 
      where ${field}=${id}  union ` +
    `SELECT type, 'special_item_area' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM special_item_area 
      where ${field}=${id}  union ` +
    `SELECT type, 'channel_improvements_linear' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM channel_improvements_linear 
      where ${field}=${id}  union ` +
    `SELECT type, 'channel_improvements_area' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM channel_improvements_area 
      where ${field}=${id}  union ` +
    `SELECT type, 'removal_line' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM removal_line 
      where ${field}=${id}  union ` +
    `SELECT type, 'removal_area' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM removal_area 
      where ${field}=${id}  union ` +
    `SELECT type, 'storm_drain' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM storm_drain 
      where ${field}=${id}  union ` +
    `SELECT type, 'detention_facilities' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM detention_facilities 
      where ${field}=${id}  union ` +
    `SELECT type, 'maintenance_trails' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM maintenance_trails 
      where ${field}=${id}  union ` +
    `SELECT type, 'land_acquisition' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM land_acquisition 
      where ${field}=${id}  union ` +
    `SELECT type, 'landscaping_area' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM landscaping_area 
      where ${field}=${id}  `;

  const newProm1 = new Promise((resolve, reject) => {
    const COMPONENT_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${COMPONENTS_SQL}&api_key=${CARTO_TOKEN}`);
    https.get(COMPONENT_URL, response => {
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', async function () {
          const result = JSON.parse(str).rows;
          let resultFinal = [];
          for (const res of result) {

            resultFinal.push({
              type: res.type,
              table: res.table,
              problemid: res.problemid,
              projectid: res.projectid,
              coordinates: JSON.parse(res.st_asgeojson).coordinates
            });
          }

          resolve(resultFinal);
        })
      }
    });
  });
  const finalResult = await newProm1;
  return finalResult;
}

router.post('/problems-by-projectid', async (req, res) => {
  try {
    const id = req.body.id;
    let sortby = req.body.sortby;
    let sorttype = req.body.sorttype;
    const problems = await getProblemByProjectId(id, sortby, sorttype);
    res.status(200).send(problems);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Connection error' });
  }
});

router.post('/components-by-entityid', async (req, res) => {
  try {
    let id = req.body.id;
    const typeid = req.body.typeid;
    let sortby = req.body.sortby;
    let sorttype = req.body.sorttype;

    if (id === '') {
      id = null;
    }

    let COMPONENTS_SQL = `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from grade_control_structure where ${typeid}=${id} and status='Completed')/count(*)) percen
       FROM grade_control_structure 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from pipe_appurtenances where ${typeid}=${id} and status='Completed')/count(*)) percen
      FROM pipe_appurtenances 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from special_item_point where ${typeid}=${id} and status='Completed')/count(*)) percen
      FROM special_item_point 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from special_item_linear where ${typeid}=${id} and status='Completed')/count(*)) percen
      FROM special_item_linear
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from special_item_area where ${typeid}=${id} and status='Completed')/count(*)) percen
      FROM special_item_area
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from channel_improvements_linear where ${typeid}=${id} and status='Completed')/count(*)) percen
      FROM channel_improvements_linear
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from channel_improvements_area where ${typeid}=${id} and status='Completed')/count(*)) percen
      FROM channel_improvements_area
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from removal_line where ${typeid}=${id} and status='Completed')/count(*)) percen
      FROM removal_line
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from removal_area where ${typeid}=${id} and status='Completed')/count(*)) percen
      FROM removal_area
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from storm_drain where ${typeid}=${id} and status='Completed')/count(*)) percen
      FROM storm_drain
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from detention_facilities where ${typeid}=${id} and status='Completed')/count(*)) percen
      FROM detention_facilities
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from maintenance_trails where ${typeid}=${id} and status='Completed')/count(*)) percen
      FROM maintenance_trails
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from land_acquisition where ${typeid}=${id} and status='Completed')/count(*)) percen
      FROM land_acquisition
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost,
      ((select count(*) from landscaping_area where ${typeid}=${id} and status='Completed')/count(*)) percen
      FROM landscaping_area
      where ${typeid}=${id} group by type `;

    if (sortby) {
      if (!sorttype) {
        sorttype = 'desc';
      }
      COMPONENTS_SQL += ` order by ${sortby} ${sorttype}`;
    }
    //console.log('components', COMPONENTS_SQL);

    const COMPONENT_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${COMPONENTS_SQL}&api_key=${CARTO_TOKEN}`);
    https.get(COMPONENT_URL, response => {
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', async function () {
          /* let result = [];
          for (const comp of JSON.parse(str).rows) {
            
            const type_component = comp.type.split(' ').join('_').toLowerCase();
            const percentage = await getTotals(type_component, id, typeid);
            result.push({
              ...comp
              //,percentage: percentage
            })
          } */
          return res.status(200).send(JSON.parse(str).rows);
        })
      }
    });

  } catch (error) {
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

async function getQuintilComponentValues(column) {
  const VALUES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
    'special_item_linear', 'special_item_area', 'channel_improvements_linear',
    'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
    'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];
  let connector = '';
  let query = '';
  for (const component of VALUES_COMPONENTS) {
    query += connector + `SELECT max(${column}) as max, min(${column}) as min FROM ${component}`;
    connector = ' union ';
  }
  const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${query}&api_key=${CARTO_TOKEN}`);

  const newProm1 = new Promise((resolve, reject) => {
    https.get(LINE_URL, response => {
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', async function () {
          const result = JSON.parse(str).rows;
          //console.log('DATIS', result);
          const max = Math.max.apply(Math, result.map(function(element) { return element.max }));
          let min = Math.min.apply(Math, result.map(function(element) { return element.min }));
          const difference = Math.round((max - min) / 5);
          let label = '';
          if (max < 1000000) {
            label = 'K';
          } else {
            label = 'M';
          }
          const divisor = 1000000;
          let finalResult = [];
          
          for (let i = 0; i < 5; i += 1) {
            finalResult.push({ min: Math.round(min), max: Math.round(difference * (i + 1)), label: label });
            min = (difference * (i + 1));
          }
          resolve(finalResult);

        })
      }
    });
  });
  return await newProm1;
}

async function getQuintilValues(table, column) {
  const LINE_SQL = `SELECT max(${column}) as max, min(${column}) as min FROM ${table}`;
  const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL}&api_key=${CARTO_TOKEN}`);

  const newProm1 = new Promise((resolve, reject) => {
    https.get(LINE_URL, response => {
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', async function () {
          const result = JSON.parse(str).rows;
          //console.log('RESULT', result);
          const dif2 = Math.round((result[0].max - result[0].min) / 5);
          let label = '';
          let divisor = 1000000;
          if (result[0].max < 1000000) {
            divisor = 1000;
            label = 'K';
          } else {
            label = 'M';
          }

          let result2 = [];
          let min = result[0].min;
          for (let i = 0; i < 5; i += 1) {
            result2.push({ min: Math.round(min), max: Math.round(dif2 * (i + 1)), label: label });
            min = (dif2 * (i + 1));
          }
          //console.log('FINAL', result2);
          resolve(result2);

        })
      }
    });
  });
  return await newProm1;
}

async function getValuesByColumn(table, column) {
  let data = [];
  const LINE_SQL = `SELECT ${column} FROM ${table} group by ${column} order by ${column}`;
  const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL}&api_key=${CARTO_TOKEN}`);

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
    const mhfddollarsallocated = await getQuintilValues('projects_line_1', 'mhfddollarsallocated');
    //const workplanyear = await getValuesByColumn('projects_line_1', 'workplanyear');
    const solutioncost = await getQuintilValues('problems', 'solutioncost');
    const problemtype = await getValuesByColumn('problems', 'problemtype');
    const jurisdictionProj = await getValuesByColumn('projects_line_1', 'jurisdiction');
    const countyProj = await getValuesByColumn('projects_line_1', 'county');
    const priority = ['High', 'Medium', 'Low'];
    const countyProb = await getValuesByColumn('problems', 'county');
    const jurisdictionProb = await getValuesByColumn('problems', 'jurisdiction');
    const mhfdmanagerprob = await getValuesByColumn('problems', 'mhfdmanager');
    const sources = await getValuesByColumn('problems', 'source');
    const estimatedCostProj = await getQuintilValues('projects_line_1', 'estimatedcost');
    const estimatedCostComp = await getQuintilComponentValues('estimated_cost');
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
    // = await getComponentsValuesByColumn('estimated_cost');
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
        "streamname": streamname,
        "estimatedCost": estimatedCostProj
      },
      "problems": {
        "problemtype": problemtype,
        "priority": priority,
        "county": countyProb,
        "jurisdiction": jurisdictionProb,
        "mhfdmanager": mhfdmanagerprob,
        "source": sources,
        "components": components,
        "cost": solutioncost
      },
      "components": {
        "component_type": components,
        "status": statusComponent,
        "yearofstudy": yearOfStudyComponent,
        "jurisdiction": jurisdictionComponent,
        "county": countyComponent,
        "watershed": mhfdManagerComponent,
        "estimatedcost": estimatedCostComp
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