const express = require('express');
const router = express.Router();
const https = require('https');
const fs = require('fs');
const { google } = require('googleapis');
const logger = require('../config/logger');
const auth = require('../auth/auth');
var request = require("request");
//const COMPONENTS = require('..')

const { CARTO_TOKEN } = require('../config/config');
const attachmentService = require('../services/attachment.service');
const { query } = require('../config/logger');

router.post('/', async (req, res) => {
  try {
    console.log('enter here');
    if (req.body.isproblem) {
      let filters = '';
      filters = getFilters(req.body);

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

      filters = getFilters(req.body);

      const PROJECT_FIELDS = `cartodb_id, objectid, projectid, projecttype, projectsubtype, coverimage, sponsor, finalCost, 
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
  console.log('PARAMS',params);
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
    const values = params.mhfddollarsallocated.split(',');
    let query = '';
    let operator = '';

    for (const mhfddolar of values) {
      let initValue = Number(mhfddolar) * 1000000;
      let endValue = initValue + 5000000;
      query += operator + ` (cast(mhfddollarsallocated as bigint) between ${initValue} and ${endValue})`;
      operator = ' or ';
    }
    
    if (filters.length > 0) {
      filters = filters + ` and (${query})`;
    } else {
      filters = ` (${query}) `;
    }
  }

  if (params.totalcost) {
    // console.log('TOTAL COST', params.totalcost);
    const values = params.totalcost.split(',');
    let query = '';
    let operator = '';

    for (const cost of values) {
      let initValue = Number(cost) * 1000000;
      let endValue = initValue + 5000000;
      query += operator + ` (coalesce(cast(finalcost as real), cast(estimatedcost as real)) between ${initValue} and ${endValue}) `;
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
      switch(year) {
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

router.get('/project-by-ids', async (req, res) => {
  const cartoid = req.query.cartoid;
  const objectid = req.query.objectid;
  //const projecttype = req.query.projecttype;
  const type = req.query.type;

  try {
    let SQL = '';
    let URL = '';
    if (type === 'projects_polygon_') {
      SQL = `SELECT * FROM projects_polygon_ where objectid=${objectid} and cartodb_id=${cartoid} `;
      URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${SQL} &api_key=${CARTO_TOKEN}`);
    } else {
      SQL = `SELECT * FROM projects_line_1 where objectid=${objectid} and cartodb_id=${cartoid} `;
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
          console.log('resultado', result);
          let problems = [];
          let attachmentFinal = [];
          let components = [];

          if (result.projectid && result.projectid !== null) {
            problems = await getProblemByProjectId(result.projectid);
            components = await getCoordinatesOfComponents(result.projectid, 'projectid');
          }

          console.log('listado', result.attachments);
          if (result.attachments) {
            attachments = await attachmentService.findByName(result.attachments);
          }
          // the_geom
          // the_geom_webmercator
          return res.status(200).send({
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
            components: components
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

async function getProblemByProjectId(projectid) {
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
    where projectid=${projectid} and projectid>0)`;
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
  const COMPONENTS_SQL = `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM grade_control_structure 
      where ${field}=${id}  union ` +
    `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM pipe_appurtenances 
      where ${field}=${id}  union ` +
    `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM special_item_point 
      where ${field}=${id}  union ` +
    `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM special_item_linear 
      where ${field}=${id}  union ` +
    `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM special_item_area 
      where ${field}=${id}  union ` +
    `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM channel_improvements_linear 
      where ${field}=${id}  union ` +
    `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM channel_improvements_area 
      where ${field}=${id}  union ` +
    `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM removal_line 
      where ${field}=${id}  union ` +
    `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM removal_area 
      where ${field}=${id}  union ` +
    `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM storm_drain 
      where ${field}=${id}  union ` +
    `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM detention_facilities 
      where ${field}=${id}  union ` +
    `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM maintenance_trails 
      where ${field}=${id}  union ` +
    `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM land_acquisition 
      where ${field}=${id}  union ` +
    `SELECT type, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM landscaping_area 
      where ${field}=${id}  `;

  console.log('components', COMPONENTS_SQL);
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

router.post('/components-by-entityid', async (req, res) => {
  try {
    const id = req.body.id;
    const typeid = req.body.typeid;
    let sortby = req.body.sortby;
    let sorttype = req.body.sorttype;

    let COMPONENTS_SQL = `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM grade_control_structure 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM pipe_appurtenances 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM special_item_point 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM special_item_linear 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM special_item_area 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM channel_improvements_linear 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM channel_improvements_area 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM removal_line 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM removal_area 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM storm_drain 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM detention_facilities 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM maintenance_trails 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM land_acquisition 
      where ${typeid}=${id} group by type union ` +
      `SELECT type, coalesce(sum(estimated_cost), 0) as estimated_cost, 
      coalesce(sum(original_cost), 0) as original_cost FROM landscaping_area 
      where ${typeid}=${id} group by type `;

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
            const percentage = await getTotals(type_component, id, typeid);
            result.push({
              ...comp,
              percentage: percentage
            })
          }
          return res.status(200).send(result);
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