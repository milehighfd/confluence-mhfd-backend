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
const { query } = require('../config/logger');
//const { query } = require('../config/logger');
const PROJECT_TABLES = ['projects_line_1', 'projects_polygon_'];
const TABLES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
  'special_item_linear', 'special_item_area', 'channel_improvements_linear',
  'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
  'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];

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

  if (params.estimatedcostComp && params.estimatedcostComp.length > 0) {

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

  if (params.cost && params.cost.length > 0) {
    let query = '';
    let operator = '';
    for (const val of params.cost) {
      const values = val.split(',');

      query += operator + ` (cast(solutioncost as bigint) between ${values[0]} and ${values[1]})`;
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

  if (params.mhfddollarsallocated && params.mhfddollarsallocated.length > 0) {
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

  if (params.totalcost && params.totalcost.length > 0) {
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
          query += operator + ` workplanyr1 > 0`;
          break;
        }
        case "2020": {
          query += operator + ` workplanyr2 > 0`;
          break;
        }
        case "2021": {
          query += operator + ` workplanyr3 > 0`;
          break;
        }
        case "2022": {
          query += operator + ` workplanyr4 > 0`;
          break;
        }
        case "2023": {
          query += operator + ` workplanyr5 > 0`;
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
    filters = filters.trim();
    if (filters.length > 0) {

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
  return filters;
}

function createQueryForIn(data) {
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
            attachments: attachments,
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
    let table = '';
    let finalcost = '';
    if (typeid === 'projectid') {
      table = 'projects_line_1';
      finalcost = 'finalcost';
    } else {
      table = 'problems';
      finalcost = 'solutioncost';
    }
    let COMPONENTS_SQL = '';
    let union = '';
    for (const component of TABLES_COMPONENTS) {
      COMPONENTS_SQL += union + `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
        case when cast(${finalcost} as integer) > 0 then coalesce(sum(original_cost),0)/cast(${finalcost} as integer) else 0 END as original_cost,
        ((select count(*) from ${component} where ${typeid}=${id} and status='Completed')/count(*)) percen
        FROM ${component}, ${table}
        where ${component}.${typeid}=${id} and ${table}.${typeid}=${id} group by type, ${finalcost}`;
      union = ' union ';
    }

    if (sortby) {
      if (!sorttype) {
        sorttype = 'desc';
      }
      COMPONENTS_SQL += ` order by ${sortby} ${sorttype}`;
    }
    const query = { q: `${COMPONENTS_SQL}` };

    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
    const data = await needle('post', URL, query, { json: true });
    if (data.statusCode === 200) {
      const result = data.body.rows;
      return res.status(200).send(result);
    } else {
      console.log('bad status ', response.statusCode, response.body);
      res.status(500).send({ error: 'bad status' }).send({ error: 'Connection error' });
    }

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

async function getQuintilComponentValues(column, bounds) {
  const VALUES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
    'special_item_linear', 'special_item_area', 'channel_improvements_linear',
    'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
    'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];
  let connector = '';
  let query = '';
  const coords = bounds.split(',');
  let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
  filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
  for (const component of VALUES_COMPONENTS) {
    query += connector + `SELECT max(${column}) as max, min(${column}) as min FROM ${component} where ${filters} `;
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
          const max = Math.max.apply(Math, result.map(function (element) { return element.max }));
          let min = Math.min.apply(Math, result.map(function (element) { return element.min }));
          const difference = Math.round((max - min) / 5);
          let label = '';
          if (max < 1000000) {
            label = 'K';
          } else {
            label = 'M';
          }
          const divisor = 1000000;
          let finalResult = [];
          const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

          for (let i = 0; i < 5; i += 1) {
            let min1 = Math.round(min);
            let max1 = 0;
            let limitCount = 0;
            let counter = 0;

            if (i === 4) {
              max1 = max;
              limitCount = max;
              //finalResult.push({ min: Math.round(min), max: max, label: label });
            } else {
              max1 = Math.round(difference * (i + 1));
              limitCount = max1;
              //finalResult.push({ min: Math.round(min), max: Math.round(difference * (i + 1)), label: label });
            }

            let query1 = '';
            let union = '';
            for (const table1 of TABLES_COMPONENTS) {
              query1 += union + `select count(*) from ${table1} where (${column} between ${min1} and ${limitCount}) 
              and ${filters} `;
              union = ' union ';
            }

            const query = { q: `${query1} ` };
            const data = await needle('post', URL, query, { json: true });
            let answer = [];
            console.log('STATUS', data.statusCode);
            if (data.statusCode === 200) {
              const result = data.body.rows;
              for (const row of result) {
                counter += row.count;
              }
            } else {
              console.log('error');
            }

            finalResult.push({ min: min1, max: max1, label: label, counter: counter });
            min = (difference * (i + 1));
          }
          resolve(finalResult);
        })
      }
    });
  });
  return await newProm1;
}

async function getQuintilValues(table, column, bounds) {
  const coords = bounds.split(',');
  let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
  filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
  const LINE_SQL = `SELECT max(${column}) as max, min(${column}) as min FROM ${table} where ${filters} `;
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
            min = Math.round(min);
            let max = 0;
            let limitCount = 0;
            if (i === 4) {
              //result2.push({ min: Math.round(min), max: result[0].max, label: label });
              max = result[0].max;
              limitCount = max;
            } else {
              max = Math.round(dif2 * (i + 1));
              limitCount = max;
              //result2.push({ min: Math.round(min), max: Math.round(dif2 * (i + 1)), label: label });
            }
            let counter = 0;
            const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
            if (table === 'problems') {
              //console.log('QUINTILES COUNTER');
              const query = { q: `select count(*) from ${table} where (${column} between ${min} and ${limitCount}) and ${filters} ` };
              const data = await needle('post', URL, query, { json: true });
              let answer = [];
              console.log('STATUS', data.statusCode);
              if (data.statusCode === 200) {
                const result = data.body.rows;
                //console.log('CONTADOR PROBLEMAS ', table, result);
                counter = result[0].count;
              }
            } else {
              let answer = [];
              for (const table1 of PROJECT_TABLES) {
                const query = {
                  q: `select count(*) from ${table1} where (cast(${column} as real) between ${min} and ${limitCount})
                and ${filters} `
                };
                //console.log('QUINTIL PROJECT', table1, query);
                const data = await needle('post', URL, query, { json: true });
                let answer = [];
                console.log('STATUS COST', data.statusCode);
                if (data.statusCode === 200) {
                  const result = data.body.rows;
                  //console.log('CONTADOR TABLA', table1, result);
                  counter += result[0].count;
                }
              }
            }

            result2.push({ min: min, max: max, label: label, counter: counter });
            min = (dif2 * (i + 1));
          }
          resolve(result2);

        })
      }
    });
  });
  return await newProm1;
}

async function getValuesByColumn(table, column, bounds) {
  let result = [];
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  if (table === 'problems') {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
    const query = { q: `select ${column} as column, count(*) as count from ${table} where ${filters} group by ${column} order by ${column} ` };
    const data = await needle('post', URL, query, { json: true });

    console.log('STATUS', data.statusCode, query);
    if (data.statusCode === 200) {
      const result1 = data.body.rows;
      for (const row of result1) {
        result.push({
          value: row.column,
          counter: row.count
        });
      }
    }
  } else {
    let answer = [];
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
    for (const table1 of PROJECT_TABLES) {
      const query = { q: `select ${column} as column, count(*) as count from ${table1} where ${filters} group by ${column} order by ${column} ` };
      const data = await needle('post', URL, query, { json: true });

      if (data.statusCode === 200) {
        const result1 = data.body.rows;
        answer = answer.concat(result1);
      }
    }
    for (const row of answer) {
      const search = result.filter(item => item.value === row.column);
      if (search.length === 0) {
        const sum = answer.filter(item => item.column === row.column).map(item => item.count).reduce((prev, next) => prev + next);
        result.push({
          value: row.column,
          counter: sum
        });
      }
    }
  }

  return result;
}

async function getCountByYearStudy(values, bounds) {
  let result = [];
  let queryComponents = '';
  let union = '';
  const coords = bounds.split(',');
  let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
  filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

  for (const value of values) {
    const initValue = Number(value);
    let endValue = 0;
    if (value === '2020') {
      endValue = initValue + 10;
    } else {
      endValue = initValue + 9;
    }

    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
    const SQL = `SELECT count(*) as count FROM grade_control_structure where ${filters} and year_of_study between ${initValue} and ${endValue} union
      SELECT count(*) as count FROM pipe_appurtenances where ${filters} and year_of_study between ${initValue} and ${endValue} union
      SELECT count(*) as count FROM special_item_point where ${filters} and year_of_study between ${initValue} and ${endValue} union
      SELECT count(*) as count FROM special_item_linear where ${filters} and year_of_study between ${initValue} and ${endValue} union
      SELECT count(*) as count FROM special_item_area where ${filters} and year_of_study between ${initValue} and ${endValue} union
      SELECT count(*) as count FROM channel_improvements_linear where ${filters} and year_of_study between ${initValue} and ${endValue} union
      SELECT count(*) as count FROM channel_improvements_area where ${filters} and year_of_study between ${initValue} and ${endValue} union
      SELECT count(*) as count FROM removal_line where ${filters} and year_of_study between ${initValue} and ${endValue} union
      SELECT count(*) as count FROM removal_area where ${filters} and year_of_study between ${initValue} and ${endValue} union
      SELECT count(*) as count FROM storm_drain where ${filters} and year_of_study between ${initValue} and ${endValue} union
      SELECT count(*) as count FROM detention_facilities where ${filters} and year_of_study between ${initValue} and ${endValue} union
      SELECT count(*) as count FROM maintenance_trails where ${filters} and year_of_study between ${initValue} and ${endValue} union
      SELECT count(*) as count FROM land_acquisition where ${filters} and year_of_study between ${initValue} and ${endValue} union
      SELECT count(*) as count FROM landscaping_area where ${filters} and year_of_study between ${initValue} and ${endValue} `;
    //console.log(' YEAR OF STUDY', SQL);
    const query = { q: ` ${SQL} ` };
    const data = await needle('post', URL, query, { json: true });
    let counter = 0;

    console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      const result1 = data.body.rows;
      for (const val of result1) {
        counter += val.count;
      }
      result.push({
        value: value,
        count: counter
      });
    }
  }
  return result;
}

async function getComponentsValuesByColumn(column, bounds) {

  let result = [];
  const coords = bounds.split(',');
  let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
  filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

  const LINE_SQL = `SELECT ${column} as column, count(*) as count FROM grade_control_structure where ${filters} group by ${column} union
      SELECT ${column} as column, count(*) as count FROM pipe_appurtenances where ${filters} group by ${column} union
      SELECT ${column} as column, count(*) as count FROM special_item_point where ${filters} group by ${column} union
      SELECT ${column} as column, count(*) as count FROM special_item_linear where ${filters} group by ${column} union
      SELECT ${column} as column, count(*) as count FROM special_item_area where ${filters} group by ${column} union
      SELECT ${column} as column, count(*) as count FROM channel_improvements_linear where ${filters} group by ${column} union
      SELECT ${column} as column, count(*) as count FROM channel_improvements_area where ${filters} group by ${column} union
      SELECT ${column} as column, count(*) as count FROM removal_line where ${filters} group by ${column} union
      SELECT ${column} as column, count(*) as count FROM removal_area where ${filters} group by ${column} union
      SELECT ${column} as column, count(*) as count FROM storm_drain where ${filters} group by ${column} union
      SELECT ${column} as column, count(*) as count FROM detention_facilities where ${filters} group by ${column} union
      SELECT ${column} as column, count(*) as count FROM maintenance_trails where ${filters} group by ${column} union
      SELECT ${column} as column, count(*) as count FROM land_acquisition where ${filters} group by ${column} union
      SELECT ${column} as column, count(*) as count FROM landscaping_area where ${filters} group by ${column} `;
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  const query = { q: ` ${LINE_SQL} ` };
  const data = await needle('post', URL, query, { json: true });
  let answer = [];

  console.log('STATUS', data.statusCode);
  if (data.statusCode === 200) {
    answer = data.body.rows;
  }
  for (const row of answer) {
    const search = result.filter(item => item.value === row.column);
    if (search.length === 0) {
      const sum = answer.filter(item => item.column === row.column).map(item => item.count).reduce((prev, next) => prev + next);
      result.push({
        value: row.column,
        counter: sum
      });
    }
  }
  return result;
}

async function getCountWorkYear(data) {
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  for (const value of data) {
    let counter = 0;
    for (const table of PROJECT_TABLES) {
      const query = { q: `select ${column} as column, count(*) as count from ${table} where ${column}='${value}' group by ${column} order by ${column} ` };
      const data = await needle('post', URL, query, { json: true });
      console.log('STATUS', data.statusCode, query);
      if (data.statusCode === 200) {
        if (data.body.rows.length > 0) {
          counter += data.body.rows[0].count;
        }
      }
    }
  }
}

async function getCountByArrayColumns(table, column, columns, bounds) {
  let result = [];
  const coords = bounds.split(',');
  let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
  filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

  if (table === 'problems') {
    for (const value of columns) {
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      const query = {
        q: `select ${column} as column, count(*) as count from ${table} 
      where ${column}='${value}' and ${filters} group by ${column} order by ${column} `
      };
      const data = await needle('post', URL, query, { json: true });

      console.log('STATUS', data.statusCode);
      if (data.statusCode === 200) {
        const result1 = data.body.rows;
        result.push({
          value: result1[0].column,
          count: result1[0].count
        });
      }
    }
  } else {

    for (const value of columns) {
      let answer = [];
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      let counter = 0;
      for (const table of PROJECT_TABLES) {
        const query = {
          q: `select ${column} as column, count(*) as count from ${table} 
        where ${column}='${value}' and ${filters} group by ${column} order by ${column} `
        };
        const data = await needle('post', URL, query, { json: true });

        console.log('STATUS', data.statusCode);
        if (data.statusCode === 200) {
          if (data.body.rows.length > 0) {
            answer = answer.concat(data.body.rows);
          }
        }
      }
      for (const row of answer) {
        const search = result.filter(item => item.value === row.column);
        if (search.length === 0) {
          counter = answer.filter(item => item.column === row.column).map(item => item.count).reduce((prev, next) => prev + next);
        }
      }

      result.push({
        value: value,
        counter: counter
      });

    }

  }

  return result;
}

async function getSubtotalsByComponent(table, column, bounds) {
  let result = [];
  const coords = bounds.split(',');
  let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
  filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

  const COMPONENTS = ['Grade Control Structure', 'Pipe Appurtenances', 'Special Item Point',
    'Special Item Linear', 'Special Item Area', 'Channel Improvements Linear',
    'Channel Improvements Area', 'Removal Line', 'Removal Area', 'Storm Drain',
    'Detention Facilities', 'Maintenance Trails', 'Land Acquisition', 'Landscaping Area'];

  if (table === 'problems') {
    for (const tablename of COMPONENTS) {
      const table = tablename.toLowerCase().split(' ').join('_');
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      const query = { q: `select count(*) from ${table}, problems where problems.${column}= ${table}.${column} where ${filters} ` };
      const data = await needle('post', URL, query, { json: true });
      let counter = 0;
      if (data.statusCode === 200) {
        if (data.body.rows.length > 0) {
          counter = data.body.rows[0].count;
        }
      }
      result.push({
        key: table,
        value: tablename,
        count: counter
      });
    }
  } else {
    for (const tablename of COMPONENTS) {
      let counter = 0;
      for (const project of PROJECT_TABLES) {
        const table = tablename.toLowerCase().split(' ').join('_');
        const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
        const query = { q: `select count(*) from ${table}, ${project} where ${project}.${column}= ${table}.${column} where ${filters} ` };
        const data = await needle('post', URL, query, { json: true });

        if (data.statusCode === 200) {
          if (data.body.rows.length > 0) {
            counter = data.body.rows[0].count;
          }
        }
      }

      result.push({
        key: table,
        value: tablename,
        count: counter
      });
    }
  }

  return result;
}

router.get('/params-filters', async (req, res) => {
  try {
    bounds = req.query.bounds;
    console.log(bounds);
    let requests = [];

    requests.push(getValuesByColumn('projects_line_1', 'creator', bounds));
    requests.push(getValuesByColumn('projects_line_1', 'mhfdmanager', bounds));
    requests.push(getCountByArrayColumns('projects_line_1', 'projecttype', ['Maintenance', 'Study', 'Capital'], bounds));
    requests.push(getCountByArrayColumns('projects_line_1', 'status', ['Draft', 'Requested',
      'Approved', 'Idle', 'Initiated', 'Ongoing',
      'Preliminary Design', 'Construction', 'Final Design', 'Permit Monitoring',
      'Hydrology', 'Floodplain', 'Alternatives', 'Conceptual', 'Complete'], bounds));
    requests.push(getValuesByColumn('projects_line_1', 'startyear', bounds));
    requests.push(getValuesByColumn('projects_line_1', 'completedyear', bounds));
    requests.push(getQuintilValues('projects_line_1', 'mhfddollarsallocated', bounds));
    const workplanyear = [{ value: 2019, counter: 0 }, { value: 2020, counter: 0 },
    { value: 2021, counter: 0 }, { value: 2022, counter: 0 }, { value: 2023, counter: 0 }];
    const problemtype = [{
      value: "Human Connection",
      counter: 0
    },
    {
      value: "Geomorphology",
      counter: 0
    },
    {
      value: "Vegetation",
      counter: 0
    },
    {
      value: "Hydrology",
      counter: 0
    },
    {
      value: "Hydraulics",
      counter: 0
    }];
    requests.push(getValuesByColumn('projects_line_1', 'jurisdiction', bounds));
    requests.push(getValuesByColumn('projects_line_1', 'county', bounds));
    requests.push(getValuesByColumn('projects_line_1', 'lgmanager', bounds));
    requests.push(getValuesByColumn('projects_line_1', 'streamname', bounds));
    requests.push(getQuintilValues('projects_line_1', 'estimatedcost', bounds));

    requests.push(getValuesByColumn('problems', 'problemtype', bounds));
    requests.push(getCountByArrayColumns('problems', 'problempriority', ['High', 'Medium', 'Low'], bounds));
    requests.push(getValuesByColumn('problems', 'county', bounds));
    requests.push(getValuesByColumn('problems', 'jurisdiction', bounds));
    requests.push(getValuesByColumn('problems', 'mhfdmanager', bounds));
    requests.push(getValuesByColumn('problems', 'source', bounds));
    requests.push(getSubtotalsByComponent('problems', 'problemid', bounds));
    requests.push(getQuintilValues('problems', 'solutioncost', bounds));

    const components = [
      { key: 'grade_control_structure', value: 'Grade Control Structure', counter: 0 },
      { key: 'pipe_appurtenances', value: 'Pipe Appurtenances', counter: 0 },
      { key: 'special_item_point', value: 'Special Item Point', counter: 0 },
      { key: 'special_item_linear', value: 'Special Item Linear', counter: 0 },
      { key: 'special_item_area', value: 'Special Item Area', counter: 0 },
      { key: 'channel_improvements_linear', value: 'Channel Improvements Linear', counter: 0 },
      { key: 'channel_improvements_area', value: 'Channel Improvements Area', counter: 0 },
      { key: 'removal_line', value: 'Removal Line', counter: 0 },
      { key: 'removal_area', value: 'Removal Area', counter: 0 },
      { key: 'storm_drain', value: 'Storm Drain', counter: 0 },
      { key: 'detention_facilities', value: 'Detention Facilities', counter: 0 },
      { key: 'maintenance_trails', value: 'Maintenance Trails', counter: 0 },
      { key: 'land_acquisition', value: 'Land Acquisition', counter: 0 },
      { key: 'landscaping_area', value: 'Landscaping Area', counter: 0 }
    ];
    requests.push(getComponentsValuesByColumn('status', bounds));
    requests.push(getCountByYearStudy([1970, 1980, 1990, 2000, 2010, 2020], bounds));
    requests.push(getComponentsValuesByColumn('jurisdiction', bounds));
    requests.push(getComponentsValuesByColumn('county', bounds));
    requests.push(getComponentsValuesByColumn('mhfdmanager', bounds));
    requests.push(getQuintilComponentValues('estimated_cost', bounds));


    const promises = await Promise.all(requests);

    const result = {
      "projects": {
        "creator": promises[0],
        "mhfdmanager": promises[1],
        "projecttype": promises[2],
        "status": promises[3],
        "startyear": promises[4],
        "completedyear": promises[5],
        "mhfddollarsallocated": promises[6],
        "workplanyear": workplanyear,
        "problemtype": problemtype,
        "jurisdiction": promises[7],
        "county": promises[8],
        "lgmanager": promises[9],
        "streamname": promises[10],
        "estimatedCost": promises[11]
      },
      "problems": {
        "problemtype": promises[12],
        "priority": promises[13],
        "county": promises[14],
        "jurisdiction": promises[15],
        "mhfdmanager": promises[16],
        "source": promises[17],
        "components": promises[18],
        "cost": promises[19]
      },
      "components": {
        "component_type": components,
        "status": promises[20],
        "yearofstudy": promises[21],
        "jurisdiction": promises[22],
        "county": promises[23],
        "watershed": promises[24],
        "estimatedcost": promises[25]
      }
    }
    res.status(200).send(result);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Connection error' });
  }
});

module.exports = (router); 