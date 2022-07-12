const express = require('express');
const router = express.Router();
const https = require('https');
const logger = require('../config/logger');
const needle = require('needle');

const { CARTO_TOKEN, PROBLEM_TABLE, PROPSPROBLEMTABLES } = require('../config/config');
const attachmentService = require('../services/attachment.service');
const { response } = require('express');
const {
   componentCounterRoute,
   componentParamFilterRoute
} = require('./mapgallery.component.route');
const {
   projectCounterRoute,
   projectParamFilterRoute,
   projectStatistics,
} = require('./mapgallery.project.route');
const {
   problemCounterRoute,
   problemParamFilterRoute,
} = require('./mapgallery.problem.route');
const { printProject, printProblem } = require('./mapgallery.print');
const {
   getDataByProjectIds,
   getProblemByProjectId,
   getCoordinatesOfComponents
} = require('./mapgallery.service');
const {
   statusList
} = require('./gallery.constants');
const PROJECT_TABLES = ['mhfd_projects'];
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
         const PROBLEM_SQL = `SELECT cartodb_id, ${PROPSPROBLEMTABLES.problem_boundary[5]} as ${PROPSPROBLEMTABLES.problems[5]}, ${PROPSPROBLEMTABLES.problem_boundary[6]} as ${PROPSPROBLEMTABLES.problems[6]} , ${PROPSPROBLEMTABLES.problem_boundary[0]} as ${PROPSPROBLEMTABLES.problems[0]}, ${PROPSPROBLEMTABLES.problem_boundary[16]} as ${PROPSPROBLEMTABLES.problems[16]}, 0 as component_count,  ${PROPSPROBLEMTABLES.problem_boundary[2]} as ${PROPSPROBLEMTABLES.problems[2]}, ${PROPSPROBLEMTABLES.problem_boundary[7]} as ${PROPSPROBLEMTABLES.problems[7]}, ${PROPSPROBLEMTABLES.problem_boundary[1]} as ${PROPSPROBLEMTABLES.problems[1]}, ${PROPSPROBLEMTABLES.problem_boundary[8]} as ${PROPSPROBLEMTABLES.problems[8]}, county, ${getCountersProblems(PROBLEM_TABLE, PROPSPROBLEMTABLES.problems[5], PROPSPROBLEMTABLES.problem_boundary[5] )}, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM ${PROBLEM_TABLE} `;
         //const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${PROBLEM_SQL} ${filters} &api_key=${CARTO_TOKEN}`);
         const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
         const query = { q: `${PROBLEM_SQL} ${filters}` };
         let answer = [];
         try {
            const data = await needle('post', URL, query, { json: true });
            //console.log('status', data.statusCode);
            if (data.statusCode === 200) {
               /* let coordinates = [];
               if (JSON.parse(element.the_geom).coordinates) {
                 coordinates = JSON.parse(element.the_geom).coordinates;
               } */
               answer = data.body.rows.map(element => {
                  return {
                     cartodb_id: element.cartodb_id,
                     type: 'problem_boundary',
                     problemid: element.problemid,
                     problemname: element.problemname,
                     solutioncost: element.solutioncost,
                     component_cost: element.component_cost,
                     jurisdiction: element.jurisdiction,
                     problempriority: element.problempriority,
                     solutionstatus: element.solutionstatus,
                     problemtype: element.problemtype,
                     county: element.county,
                     totalComponents: element.component_count,
                     coordinates: JSON.parse(element.the_geom).coordinates ? JSON.parse(element.the_geom).coordinates : []
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
            'estimatedCost, status, attachments, projectname, jurisdiction, streamname, county, component_cost, component_count ';

         if (req.body.problemtype) {
            const result = await queriesByProblemTypeInProject(PROJECT_FIELDS, filters, req.body.problemtype);
            return res.status(200).send(result);
         } else {
            for (const table of PROJECT_TABLES) {
               let query = ''
               if (table === 'mhfd_projects') {
                  query = { q: `SELECT '${table}' as type, ${PROJECT_FIELDS}, ${getCounters('mhfd_projects', 'projectid')}, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM ${table} ${filters} ` };
                  console.log("THIS QUERY ROUTER",query);
               }

               const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
               console.log(URL);
               let answer = [];
               try {
                  const data = await needle('post', URL, query, { json: true });
                  console.log('STATUS', data.statusCode);
                  if (data.statusCode === 200) {
                     const result = data.body.rows;
                     for (const element of result) {
                        let valor = '';
                        if (element.attachments) {
                           valor = await attachmentService.findCoverImage(element.attachments);
                        }
                        let coordinates = [];
                        if (JSON.parse(element.the_geom).coordinates) {
                           coordinates = JSON.parse(element.the_geom).coordinates;
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
                           component_cost: element.component_cost,
                           estimatedcost: element.estimatedcost,
                           status: element.status,
                           attachments: element.attachments,
                           projectname: element.projectname,
                           jurisdiction: element.jurisdiction,
                           streamname: element.streamname,
                           county: element.county,
                           attachments: valor,
                           totalComponents: element.component_count,
                           coordinates: coordinates
                        });
                     }
                     send = send.concat(answer);
                  } else {
                     console.log('bad status ', data.statusCode, data.body);
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
function getCountersProblems(table, column, newcolumn) {
  return ` (select count(*) from grade_control_structure where ${column} = cast(${table}.${newcolumn} as integer) ) as count_gcs, 
     (select count(*) from pipe_appurtenances where ${column} = cast(${table}.${newcolumn} as integer) ) as count_pa,
     (select count(*) from special_item_point where ${column} = cast(${table}.${newcolumn} as integer) ) as count_sip, 
     (select count(*) from special_item_linear where ${column} = cast(${table}.${newcolumn} as integer) ) as count_sil, 
     (select count(*) from special_item_area where ${column} = cast(${table}.${newcolumn} as integer) ) as count_sia, 
     (select count(*) from channel_improvements_linear where ${column} = cast(${table}.${newcolumn} as integer) ) as count_cila, 
     (select count(*) from channel_improvements_area where ${column} = cast(${table}.${newcolumn} as integer) ) as count_cia, 
     (select count(*) from  removal_line where ${column} = cast(${table}.${newcolumn} as integer) ) as count_rl, 
     (select count(*) from removal_area where ${column} = cast(${table}.${newcolumn} as integer) ) as count_ra, 
     (select count(*) from storm_drain where ${column} = cast(${table}.${newcolumn} as integer) ) as count_sd, 
     (select count(*) from detention_facilities where ${column} = cast(${table}.${newcolumn} as integer) ) as count_df, 
     (select count(*) from maintenance_trails where ${column} = cast(${table}.${newcolumn} as integer) ) as count_mt, 
     (select count(*) from land_acquisition where ${column} = cast(${table}.${newcolumn} as integer) ) as count_la, 
     (select count(*) from landscaping_area where ${column} = cast(${table}.${newcolumn} as integer) ) as count_la1 `;
}

function getFilters(params) {
   //console.log('PARAMS', params);
   let filters = '';
   let tipoid = '';
   let hasProjectType = false;
   const VALUES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
      'special_item_linear', 'special_item_area', 'channel_improvements_linear',
      'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
      'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];

   if (params.isproblem) {
      // console.log('PROBLEMS');
      tipoid = 'problemid';
      if (params.name) {
         if (filters.length > 0) {
            filters = filters = ` and (${PROPSPROBLEMTABLES.problem_boundary[6]} ilike '%${params.name}%' OR ${PROPSPROBLEMTABLES.problem_boundary[5]}::text ilike '%${params.name}%')`;
         }
         else {
            filters = ` (${PROPSPROBLEMTABLES.problem_boundary[6]} ilike '%${params.name}%' OR ${PROPSPROBLEMTABLES.problem_boundary[5]}::text ilike '%${params.name}%') `;
         }
      }

      if (params.problemtype) {
         const query = createQueryForIn(params.problemtype.split(','));
         if (filters.length > 0) {
            filters = filters + ` and ${PROPSPROBLEMTABLES.problem_boundary[8]} in (${query}) `;
         } else {
            filters = ` ${PROPSPROBLEMTABLES.problem_boundary[8]} in (${query}) `;
         }
      }
   } else {
      // console.log('PROJECTS ROU');
      tipoid = 'projectid';
      if (params.name) {
         if (filters.length > 0) {
            filters = ` and (projectname ilike '%${params.name}%' OR onbaseid::text ilike '%${params.name}%') `;
         } else {
            filters = ` (projectname ilike '%${params.name}%' OR onbaseid::text ilike '%${params.name}%') `;
         }
      }
      // console.log("ID AQUI", params );
      if (params.problemtype) {

      }
   }

   // components
   if (params.componenttype) {
      //console.log('COMPONENTS FILTER', params.componenttype);
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
            ` ${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid} and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[2] : PROPSPROBLEMTABLES.problems[2]} in (${values}) ) `;
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
         filters = filters + ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[7] : PROPSPROBLEMTABLES.problems[7]} in (${query})`;
      } else {
         filters = ` ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[7] : PROPSPROBLEMTABLES.problems[7]} in (${query})`;
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
         query += operator + ` (cast(${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[1] : PROPSPROBLEMTABLES.problems[1]} as int) between ${val} and ${limite}) `;
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

         query += operator + ` (cast(${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[0] : PROPSPROBLEMTABLES.problems[0]} as bigint) between ${values[0]} and ${values[1]})`;
         operator = ' or ';
      }

      if (filters.length > 0) {
         filters += ` and ${query}`;
      } else {
         filters = ` ${query}`;
      }
   }

   if (params.servicearea) {
      const query = createQueryForIn(params.servicearea.split(','));
      if (filters.length > 0) {
         filters += ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[9] : PROPSPROBLEMTABLES.problems[9]} in (${query})`;
      } else {
         filters = ` ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[9] : PROPSPROBLEMTABLES.problems[9]} in (${query})`;
      }
   }

   if (params.mhfdmanager) {
      const query = createQueryForIn(params.mhfdmanager.split(','));
      if (filters.length > 0) {
         filters = filters + ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[3] : PROPSPROBLEMTABLES.problems[3]} in (${query})`;
      } else {
         filters = `${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[3] : PROPSPROBLEMTABLES.problems[3]} in (${query})`;
      }
   }

   if (params.source) {
      const query = createQueryForIn(params.source.split(','));
      if (filters.length > 0) {
         filters = filters + ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[14] : PROPSPROBLEMTABLES.problems[14]} in (${query}) `;
      } else {
         filters = ` ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[14] : PROPSPROBLEMTABLES.problems[14]} in (${query}) `;
      }
   }

   if (params.components) {
      //console.log('COMPONENTES', params.components);
      const values = params.components.split(',');
      let query = '';
      let operator = '';
      for (const val of values) {
         query += operator + ` ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[5] : PROPSPROBLEMTABLES.problems[5]} in (select ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[5] : PROPSPROBLEMTABLES.problems[5]} from ${val})`;
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

   if (params.consultant) {
      const query = createQueryForIn(params.consultant.split(','));
      if (filters.length > 0) {
         filters += ` and consultant in (${query}) `;
      } else {
         filters = ` consultant in (${query})`;
      }
   }

   if (params.contractor) {
      const query = createQueryForIn(params.contractor.split(','));
      if (filters.length > 0) {
         filters += ` and contractor in (${query}) `;
      } else {
         filters = ` contractor in (${query})`;
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
         filters = filters + ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[15] : PROPSPROBLEMTABLES.problems[15]} in (${query}) `;
      } else {
         filters = ` ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[15] : PROPSPROBLEMTABLES.problems[15]} in (${query}) `;
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
         filters = filters + ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[2] : PROPSPROBLEMTABLES.problems[2]} in (${query})`;
      } else {
         filters = ` ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[2] : PROPSPROBLEMTABLES.problems[2]} in (${query})`;
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
      let sortby = params.sortby;
      if (params.sortby === 'estimatedcost') {
         sortby = ` (coalesce(${params.sortby}::real, 0)) `;
      }

      if (params.sortby === 'projectname') {
         sortby = ` coalesce(projectname, '')`;
      }

      if (!params.sorttype) {
         sorttype = 'desc';
      } else {
         sorttype = params.sorttype;
      }
      filters += ` order by ${sortby} ${sorttype}`;
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
      query += operator + ` select projectid from ${component}, ${PROBLEM_TABLE} where projectid = ${project}.projectid 
    and ${component}.problemid = ${PROBLEM_TABLE}.problemid and problemtype='${problemType}' `;
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
         if (table === 'mhfd_projects') {
            query = { q: `SELECT '${table}' as type, ${project_fields}, ${getCounters('mhfd_projects', 'projectid')} FROM ${table} ${newfilter} ` };
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



router.post('/project-by-ids/pdf', async (req, res) => {
   const projectid = req.query.projectid;
   const type = req.query.type;
   const map = req.body.map;
   let data = await getDataByProjectIds(projectid, type, false);
   let components = [];
   if (data.projectid) {
     components = await componentsByEntityId(data.projectid, 'projectid', 'type', 'asc');
   }
   try {
      let pdfObject = await printProject(data, components, map);
      pdfObject.toBuffer(function (err, buffer) {
         if (err) return res.send(err);
         res.type('pdf');
         res.end(buffer, 'binary');
      })
   } catch (e) {
      logger.error(e);
      res.status(500).send({ error: 'Not able to generated PDF.' });
   }
})

router.get('/project-by-ids', async (req, res) => {
   const projectid = req.query.projectid;
   const type = req.query.type;
   try {
      let data = await getDataByProjectIds(projectid, type, false);
      res.status(200).send(data);
   } catch (error) {
      logger.error(error);
      res.status(500).send({ error: 'No there data with ID' });
   }
});

let getDataByProblemId = async (id) => {
   const PROBLEM_SQL = `SELECT ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom, cartodb_id,
    objectid, ${PROPSPROBLEMTABLES.problem_boundary[5]} as ${PROPSPROBLEMTABLES.problems[5]}, ${PROPSPROBLEMTABLES.problem_boundary[6]} as ${PROPSPROBLEMTABLES.problems[6]}, ${PROPSPROBLEMTABLES.problem_boundary[4]} as ${PROPSPROBLEMTABLES.problems[4]}, ${PROPSPROBLEMTABLES.problem_boundary[8]} as ${PROPSPROBLEMTABLES.problems[8]},
    ${PROPSPROBLEMTABLES.problem_boundary[7]} as ${PROPSPROBLEMTABLES.problems[7]}, ${PROPSPROBLEMTABLES.problem_boundary[14]} as ${PROPSPROBLEMTABLES.problems[14]}, ${PROPSPROBLEMTABLES.problem_boundary[13]} as ${PROPSPROBLEMTABLES.problems[13]}, ${PROPSPROBLEMTABLES.problem_boundary[0]} as ${PROPSPROBLEMTABLES.problems[0]}, ${PROPSPROBLEMTABLES.problem_boundary[16]} as ${PROPSPROBLEMTABLES.problems[16]}, ${PROPSPROBLEMTABLES.problem_boundary[1]} as ${PROPSPROBLEMTABLES.problems[1]},
    ${PROPSPROBLEMTABLES.problem_boundary[3]} as ${PROPSPROBLEMTABLES.problems[3]}, ${PROPSPROBLEMTABLES.problem_boundary[9]} as ${PROPSPROBLEMTABLES.problems[9]}, county,${PROPSPROBLEMTABLES.problem_boundary[2]} as ${PROPSPROBLEMTABLES.problems[2]}, ${PROPSPROBLEMTABLES.problem_boundary[15]} as ${PROPSPROBLEMTABLES.problems[15]},
    ${PROPSPROBLEMTABLES.problem_boundary[12]} as ${PROPSPROBLEMTABLES.problems[12]}, ${PROPSPROBLEMTABLES.problem_boundary[11]} as ${PROPSPROBLEMTABLES.problems[11]}, ${PROPSPROBLEMTABLES.problem_boundary[10]} as ${PROPSPROBLEMTABLES.problems[10]}
    FROM ${PROBLEM_TABLE} where ${PROPSPROBLEMTABLES.problem_boundary[5]}='${id}'`;
   const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${PROBLEM_SQL} &api_key=${CARTO_TOKEN}`);
   const data = await needle('get', URL, { json: true });
   if (data.statusCode === 200) {
      const result = data.body.rows[0];
      const resultComponents = await getCoordinatesOfComponents(id, 'problemid');
      return {
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
         component_cost: result.component_cost,
         sourcename: result.sourcename,
         mhfdmanager: result.mhfdmanager,
         servicearea: result.servicearea,
         county: result.county,
         streamname: result.streamname,
         sourcedate: result.sourcedate,
         jurisdiction: result.jurisdiction,
         shape_length: result.shape_length,
         shape_area: result.shape_area,
         components: resultComponents,
         coordinates: JSON.parse(result.the_geom).coordinates
      };
   } else {
      throw new Error('');
   }
}

const getProblemParts = async (id) => {
   const promises = [];
   const tables = ['flood_hazard_polygon_', 'flood_hazard_line_', 'flood_hazard_point_'];
   for (const element of tables) {
     let sql = `SELECT problem_type, problem_part_category, problem_part_subcategory, globalid FROM ${element}
     WHERE problem_id = ${id}`;
     console.log('my sql ', sql);
     sql = encodeURIComponent(sql);
     const URL = `https://denver-mile-high-admin.carto.com/api/v2/sql?q=${sql}&api_key=${CARTO_TOKEN}`;
     promises.push(new Promise((resolve, reject) => {
       https.get(URL, response => {   
         if (response.statusCode == 200) {
           let str = '';
           response.on('data', function (chunk) {
             str += chunk;
           });
           response.on('end', function () {
             const rows = JSON.parse(str).rows;
             console.log(rows);
             resolve(rows);
           });
         } else {
           console.log('status ', response.statusCode, URL);
           resolve([]);
         }
       }).on('error', err => {
         console.log('failed call to ', URL, 'with error ', err);
         resolve([]);
       })})
     );  
   }
   const all = await Promise.all(promises);
   const data = [];
   all.forEach(row => {
      row.forEach(r => data.push(r));
   });
   data.sort((a, b) => {
      if (a.problem_type.localeCompare(b.problem_type) === 0) {
        if (a.problem_part_category.localeCompare(b.problem_part_category) === 0) {
          return a.problem_part_subcategory.localeCompare(b.problem_part_subcategory);
        }
        return a.problem_part_category.localeCompare(b.problem_part_category);
      }
      return a.problem_type.localeCompare(b.problem_type);
    });
   return data;
}

router.post('/problem-by-id/:id/pdf', async (req, res) => {
   const id = req.params.id;
   const map = req.body.map;
   try {
      let data = await getDataByProblemId(id);
      let components = await componentsByEntityId(id, PROPSPROBLEMTABLES.problems[5], 'type', 'asc');
      let problempart = await getProblemParts(id);
      try {
         let pdfObject = await printProblem(data, components, map, problempart);
         pdfObject.toBuffer(function (err, buffer) {
            if (err) return res.send(err);
            res.type('pdf');
            res.end(buffer, 'binary');
         })
      } catch (e) {
         logger.error(e);
         res.status(500).send({ error: 'Not able to generated PDF.' });
      }
   } catch (error) {
      logger.error(error);
      res.status(500).send({ error: 'No there data with ID' });
   }
})

router.get('/problem-by-id/:id', async (req, res) => {
   const id = req.params.id;
   try {
      let data = await getDataByProblemId(id);
      res.status(200).send(data);
   } catch (error) {
      logger.error(error);
      res.status(500).send({ error: 'No there data with ID' });
   }
});
const percentageFormatter = (value) => {
   value = value * 100;
   return Math.round(value * 100) / 100
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

let componentsByEntityId = async (id, typeid, sortby, sorttype) => {
   if (id === '') {
      id = null;
   }
   let table = '';
   let finalcost = '';
   let extraColumnProb = typeid;
   if (typeid === 'projectid') {
      table = 'mhfd_projects';
      finalcost = 'finalcost';
   } else if (typeid === PROPSPROBLEMTABLES.problems[5]) {
      table = PROBLEM_TABLE;
      finalcost = `${PROBLEM_TABLE}.${PROPSPROBLEMTABLES.problem_boundary[0]}`;
      extraColumnProb = PROPSPROBLEMTABLES.problem_boundary[5];
   } else {
      table = PROBLEM_TABLE;
      finalcost = PROPSPROBLEMTABLES.problem_boundary[0];
   }
   let COMPONENTS_SQL = '';
   let union = '';
   for (const component of TABLES_COMPONENTS) {
      COMPONENTS_SQL += union + `SELECT type, count(*), coalesce(sum(original_cost), 0) as estimated_cost, 
     case when cast(${finalcost} as integer) > 0 then coalesce(
        (select sum(original_cost) as aux from ${component} where ${component}.status = 'Complete') ,0)/cast(${finalcost} as integer) else 0 END as original_cost, coalesce(complete_t.sum, 0) as complete_cost
     FROM ${component}, ${table}, ( select sum(estimated_cost) as sum from ${component} where ${component}.status = 'Complete' ) complete_t
     where ${component}.${typeid}=${id} and ${table}.${extraColumnProb}=${id} group by type, ${finalcost}, complete_t.sum`;
      union = ' union ';
   }
   if (sortby) {
      if (!sorttype) {
         sorttype = 'desc';
      }
      COMPONENTS_SQL += ` order by ${sortby} ${sorttype}`;
   }
   const componentQuery = { q: `${COMPONENTS_SQL}` };

   const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
   const data = await needle('post', URL, componentQuery, { json: true });
   if (data.statusCode === 200) {
      let result = data.body.rows.map(element => {
         return {
            type: element.type + ' (' + element.count + ')',
            estimated_cost: element.estimated_cost,
            original_cost: element.original_cost,
            complete_cost: element.complete_cost
         }
      })
      if (sortby === 'percen') {
         result.sort((a, b) => {
            if (sorttype === 'asc') {
               return a.estimated_cost - b.estimated_cost;
            } else {
               return b.estimated_cost - a.estimated_cost;
            }
         })
      }
      let sum = result.reduce((prev, curr) => curr.estimated_cost + prev, 0);
      return result.map((element) => {
         return {
            type: element.type,
            estimated_cost: element.estimated_cost,
            original_cost: element.original_cost,
            percen: percentageFormatter(sum == 0 ? 0 : element.estimated_cost / sum),
            complete_cost: element.complete_cost
         }
      });
   } else {
      console.log('bad status ', response.statusCode, response.body);
      throw new Error('');
   }
}

router.post('/components-by-entityid', async (req, res) => {
   try {
      let id = req.body.id;
      const typeid = req.body.typeid;
      let sortby = req.body.sortby;
      let sorttype = req.body.sorttype;

      let result = await componentsByEntityId(id, typeid, sortby, sorttype);

      return res.status(200).send(result);
   } catch (error) {
      logger.error(error);
      res.status(500).send({ error: error }).send({ error: 'Connection error' });
   }
})

router.post('/get-coordinates', async (req, res) => {
   try {
      const table = req.body.table;
      const value = req.body.value;
      let query = {
         q: `select ST_AsGeoJSON(ST_Envelope(the_geom)) from ${table} 
      where cartodb_id = ${value} `
      };

      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

      const data = await needle('post', URL, query, { json: true });
      let answer = [];
      if (data.statusCode === 200) {
         const result = data.body.rows;
         let all_coordinates = [];
         if (result.length > 0) {
            all_coordinates = JSON.parse(result[0].st_asgeojson).coordinates;
         }

         return res.status(200).send({
            'polygon': all_coordinates
         });
      } else {
         return res.status(data.statusCode).send({ 'error': 'error' });
      }
   } catch (error) {
      logger.error(error);
      res.status(500).send({ error: error }).send({ error: 'Connection error' });
   }
})

router.post('/component-counter', async (req, res) => {
   try {
      const column = req.body.column;
      const value = req.body.value;
      let answer = [];
      if (column === PROPSPROBLEMTABLES.problems[5] || column === PROPSPROBLEMTABLES.problem_boundary[5]) {
         //console.log(column, value);
         if (value === null || value === 0) {
            return res.status(200).send({
               'componentes': counter
            });
         } else {
            const query = {
               q: `select ${PROPSPROBLEMTABLES.problem_boundary[5]} as ${PROPSPROBLEMTABLES.problems[5]}, ${PROPSPROBLEMTABLES.problem_boundary[6]} as ${PROPSPROBLEMTABLES.problems[6]} , ${getCountersProblems(PROBLEM_TABLE, column)} from ${PROBLEM_TABLE} 
                where ${PROPSPROBLEMTABLES.problems[5]} = ${value} `
            };
            const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
            const data = await needle('post', URL, query, { json: true });
            let answer = [];
            if (data.statusCode === 200) {
               const result = data.body.rows;
               const counter = result[0].count_gcs + result[0].count_pa + result[0].count_sip + result[0].count_sil +
                  result[0].count_cia + result[0].count_sia + result[0].count_rl + result[0].count_ra +
                  result[0].count_sd + result[0].count_df + result[0].count_mt + result[0].count_la +
                  result[0].count_la + result[0].count_la1 + result[0].count_cila;
               return res.status(200).send({
                  'componentes': counter
               });
            } else {
               return res.status(data.statusCode).send({ 'error': 'error' });
            }
         }

      } else {
         let counter = 0;
         if (value !== null && value !== 0) {
            for (const table1 of PROJECT_TABLES) {
               const query = {
                  q: `select projectid, projectname, ${getCounters(table1, column)} from ${table1} where ${column} = ${value} `
               };
               //console.log(' PROJECT', table1, query);
               const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

               try {
                  const data = await needle('post', URL, query, { json: true });
                  if (data.statusCode === 200) {
                     const result = data.body.rows;
                     counter += result[0].count_gcs + result[0].count_pa + result[0].count_sip + result[0].count_sil +
                        result[0].count_cia + result[0].count_sia + result[0].count_rl + result[0].count_ra +
                        result[0].count_sd + result[0].count_df + result[0].count_mt + result[0].count_la +
                        result[0].count_la + result[0].count_la1 + result[0].count_cila;
                     //console.log('suma', table1, counter);
                  }
               } catch (error) { }
            }
         }
         return res.status(200).send({
            'componentes': counter
         });
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
      // console.log(table, column);
      const LINE_SQL = `SELECT ${column} FROM ${table} group by ${column} order by ${column}`;
      //console.log(LINE_SQL);
      const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL}&api_key=${CARTO_TOKEN}`);
      //console.log(LINE_URL);
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
   let result = [];
   try {
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
         query += connector + `SELECT max(${column}) as max, min(${column}) as min FROM ${component} `;
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
                     //console.log('STATUS', data.statusCode);
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
      result = await newProm1;

   } catch (error) {
      logger.error(error);
      logger.error(`Quintil By Components, Column ${column} Connection error`);

   }
   return result;
}

async function getValuesByRange(table, column, range, bounds) {
   let result = [];
   try {
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
      const newProm1 = new Promise(async (resolve, reject) => {
         let result2 = [];
         let counter = 0;
         const lenRange = range.length;
         let index = 0;
         for (const values of range) {
            const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
            if (table === PROBLEM_TABLE) {
               const query = { q: `select count(*) from ${table} where (${column} between ${values.min} and ${values.max}) and ${filters} ` };
               const data = await needle('post', URL, query, { json: true });
               let answer = [];
               console.log('STATUS', data.statusCode);
               if (data.statusCode === 200) {
                  const rows = data.body.rows;
                  counter = rows[0].count;
               }
            } else {
               let answer = [];
               counter = 0;
               for (const table1 of PROJECT_TABLES) {
                  const query = {
                     q: `select count(*) from ${table1} where (cast(${column} as real) between ${values.min} and ${values.max})
                and ${filters} `
                  };
                  const data = await needle('post', URL, query, { json: true });
                  if (data.statusCode === 200) {
                     const rows = data.body.rows;
                     counter += rows[0].count;
                  }
               }
            }
            if (index === (lenRange - 1)) {
               result2.push({ min: values.min, max: values.max, counter: counter, last: true });
            } else {
               result2.push({ min: values.min, max: values.max, counter: counter, last: false });
            }

            index++;
         }
         resolve(result2);
      });
      result = await newProm1;
   } catch (error) {
      logger.error(error);
      logger.error(`Range By Value, Column ${column} Connection error`);
   }
   return result;
}

async function getValuesByColumnWithOutCount(table, column, bounds) {
   let result = [];
   try {
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      if (table === PROBLEM_TABLE) {
         const coords = bounds.split(',');
         let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
         filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
         const query = { q: `select ${column} as column from ${table} where ${filters} group by ${column} order by ${column} ` };
         const data = await needle('post', URL, query, { json: true });

         //console.log('STATUS', data.statusCode, query);
         if (data.statusCode === 200) {
            const result1 = data.body.rows;
            //unounounoconsole.log('RESULTADO', result1)
            for (const row of result1) {
               result.push(row.column);
            }
         }
      } else {
         let answer = [];
         const coords = bounds.split(',');
         //console.log('COLUMN', column);
         let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
         filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
         for (const table1 of PROJECT_TABLES) {
            const query = { q: `select ${column} as column from ${table1} where ${filters} group by ${column} order by ${column} ` };
            const data = await needle('post', URL, query, { json: true });

            if (data.statusCode === 200) {
               //const result1 = data.body.rows;
               answer = answer.concat(data.body.rows);
            }
         }
         for (const row of answer) {
            //result.push(row.column);
            const search = result.filter(item => item == row.column);
            if (search.length === 0) {
               result.push(row.column);
            }
         }
         result = result.sort((a, b) => (a > b ? 1 : -1));
      }
   } catch (error) {
      logger.error(error);
      logger.error(`Get Value by Column, Table: ${table} Column: ${column} Connection error`);
   }

   return result;
}

async function getProjectByProblemType(bounds) {
   let result = [];
   try {
      const coords = bounds.split(',');
      //console.log('COLUMN', column);
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
      const problemTypes = ['Human Connection', 'Geomorphology', 'Vegetation', 'Hydrology', 'Hydraulics'];
      for (const type of problemTypes) {
         let counter = 0;
         for (const table of PROJECT_TABLES) {
            const newfilter = createQueryByProblemType(type, table);
            const query = { q: `select count(*) as count from ${table} where ${filters} and ${newfilter} ` };
            const data = await needle('post', URL, query, { json: true });

            if (data.statusCode === 200) {
               counter += data.body.rows[0].count;
            }
         }
         result.push({
            value: type,
            counter: counter
         });
      }
   } catch (error) {
      logger.error(error);
      logger.error(`Error in Project by Problem Type Connection error`);
   }

   return result;
}

async function getValuesByColumn(table, column, bounds) {
   let result = [];
   try {
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      if (table === PROBLEM_TABLE) {
         const coords = bounds.split(',');
         let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
         filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
         const query = { q: `select ${column} as column, count(*) as count from ${table} where ${filters} group by ${column} order by ${column} ` };
         const data = await needle('post', URL, query, { json: true });

         //console.log('STATUS', data.statusCode, query);
         if (data.statusCode === 200) {
            const result1 = data.body.rows;
            //unounounoconsole.log('RESULTADO', result1)
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
         //console.log('COLUMN', column);
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
   } catch (error) {
      logger.error(error);
      logger.error(`Get Value by Column, Table: ${table} Column: ${column} Connection error`);
   }

   return result;
}

async function getCountByYearStudy(values, bounds) {
   let result = [];
   try {
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
   } catch (error) {
      logger.error(error);
      logger.error(`CountByYearStudy, Values: ${values} Connection error`);
   }

   return result;
}

function CapitalLetter(chain) {
   const array = chain.split('_');
   let result = '';
   for (const word of array) {
      result = result + " " + word.charAt(0).toUpperCase() + word.substring(1);
   }
   return result;
}

async function getCounterComponents(bounds) {
   let result = [];
   try {
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      for (const component of TABLES_COMPONENTS) {
         let answer = [];
         let counter = 0;
         const SQL = `SELECT type, count(*) as count FROM ${component} where ${filters} group by type `;

         const query = { q: ` ${SQL} ` };
         const data = await needle('post', URL, query, { json: true });
         if (data.statusCode === 200) {
            answer = data.body.rows;
            if (data.body.rows.length > 0) {
               counter = answer[0].count;
            }
         }
         result.push({
            key: component,
            value: CapitalLetter(component),
            counter: counter
         });
      }

   } catch (error) {
      logger.error(error);
      logger.error(`getCounterComponents Connection error`);
   }

   return result;
}

async function getComponentsValuesByColumnWithCount(column, bounds) {
   let result = [];
   try {
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

      const LINE_SQL = `SELECT ${column} as column FROM grade_control_structure where ${filters} group by ${column} union
      SELECT ${column} as column FROM pipe_appurtenances where ${filters} group by ${column} union
      SELECT ${column} as column FROM special_item_point where ${filters} group by ${column} union
      SELECT ${column} as column FROM special_item_linear where ${filters} group by ${column} union
      SELECT ${column} as column FROM special_item_area where ${filters} group by ${column} union
      SELECT ${column} as column FROM channel_improvements_linear where ${filters} group by ${column} union
      SELECT ${column} as column FROM channel_improvements_area where ${filters} group by ${column} union
      SELECT ${column} as column FROM removal_line where ${filters} group by ${column} union
      SELECT ${column} as column FROM removal_area where ${filters} group by ${column} union
      SELECT ${column} as column FROM storm_drain where ${filters} group by ${column} union
      SELECT ${column} as column FROM detention_facilities where ${filters} group by ${column} union
      SELECT ${column} as column FROM maintenance_trails where ${filters} group by ${column} union
      SELECT ${column} as column FROM land_acquisition where ${filters} group by ${column} union
      SELECT ${column} as column FROM landscaping_area where ${filters} group by ${column} `;
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      //console.log('COLUMN COMPONENT', column, LINE_SQL);
      const query = { q: ` ${LINE_SQL} ` };
      const data = await needle('post', URL, query, { json: true });
      let answer = [];

      //console.log('STATUS', data.statusCode);
      if (data.statusCode === 200) {
         answer = data.body.rows;
      }
      //console.log('RESPUESTA COLUMN COMPONENT', column, answer);
      for (const row of answer) {
         const search = result.filter(item => item == row.column);
         if (search.length === 0) {
            result.push(row.column);
         }
      }
      result = result.sort((a, b) => (a > b ? 1 : -1));
   } catch (error) {
      logger.error(error);
      logger.error(`getComponentsValuesByColumn, Column ${column} Connection error`);
   }

   return result;
}

async function getComponentsValuesByColumn(column, bounds) {

   let result = [];
   try {
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
      console.log('count(*) as countcount(*) as countcount(*) as countcount(*) as countcount(*) as count', LINE_SQL);
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
   } catch (error) {
      logger.error(error);
      logger.error(`getComponentsValuesByColumn, Column ${column} Connection error`);
   }

   return result;
}

async function getCountWorkYear(data, bounds) {
   let result = [];
   try {
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

      for (const value of data) {
         let counter = 0;
         for (const table of PROJECT_TABLES) {
            const query = { q: `select count(*) as count from ${table} where ${filters} and ${value.column} > 0 ` };
            const data = await needle('post', URL, query, { json: true });
            //console.log('STATUS', data.statusCode, query);
            if (data.statusCode === 200) {
               if (data.body.rows.length > 0) {
                  counter += data.body.rows[0].count;
               }
            }
         }
         result.push({
            value: value.year,
            counter: counter
         });
      }
   } catch (error) {
      logger.error(error);
      logger.error(`getCountWorkYear Connection error`);
   }

   return result;
}

async function getCountSolutionStatus(range, bounds) {
   let result = [];
   try {
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      for (const value of range) {
         let endValue = 0;
         if (value === 75) {
            endValue = value + 25;
         } else {
            endValue = value + 24;
         }

         const query = { q: `select count(*) as count from ${PROBLEM_TABLE} where ${filters} and solutionstatus between ${value} and ${endValue} ` };
         const data = await needle('post', URL, query, { json: true });
         let counter = 0;
         if (data.statusCode === 200) {
            if (data.body.rows.length > 0) {
               counter = data.body.rows[0].count;
            }
         }
         result.push({
            value: value,
            count: counter
         });
      }
   } catch (error) {
      logger.error(error);
      logger.error(`getCountSolutionStatus Connection error`);
   }

   return result;
}

async function getCountByArrayColumns(table, column, columns, bounds) {
   let result = [];
   try {
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

      if (table === PROBLEM_TABLE) {
         for (const value of columns) {
            const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
            const query = {
               q: `select ${column} as column, count(*) as count from ${table} 
              where ${column}='${value}' and ${filters} group by ${column} order by ${column} `
            };
            let counter = 0;
            const data = await needle('post', URL, query, { json: true });

            //console.log('STATUS', data.statusCode);
            if (data.statusCode === 200) {
               //const result1 = data.body.rows;
               if (data.body.rows.length > 0) {
                  counter = data.body.rows[0].count
               }

            }
            result.push({
               value: value,
               count: counter
            });
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

               //console.log('STATUS', data.statusCode);
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
   } catch (error) {
      logger.error(error);
      logger.error(`getCountByArrayColumns Table: ${table}, Column: ${column} Connection error`);
   }

   return result;
}

async function getSubtotalsByComponent(table, column, bounds) {
   let result = [];
   try {
      const coords = bounds.split(',');

      const COMPONENTS = ['Grade Control Structure', 'Pipe Appurtenances', 'Special Item Point',
         'Special Item Linear', 'Special Item Area', 'Channel Improvements Linear',
         'Channel Improvements Area', 'Removal Line', 'Removal Area', 'Storm Drain',
         'Detention Facilities', 'Maintenance Trails', 'Land Acquisition', 'Landscaping Area'];

      if (table === PROBLEM_TABLE) {
         let requests = [];
         const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
         for (const tablename of COMPONENTS) {
            const table = tablename.toLowerCase().split(' ').join('_');
            let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), ${table}.the_geom) or `;
            filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), ${table}.the_geom))`;

            const query = { q: `select count(*) from ${table}, ${PROBLEM_TABLE} where ${PROBLEM_TABLE}.${column}= ${table}.${column} and ${filters} ` };
            //requests.push(needle('post', URL, query, { json: true }));
            const data = await needle('post', URL, query, { json: true });
            let counter = 0;
            if (data.statusCode === 200) {
               //console.log('TOTALES ', tablename, data.body.rows);
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
         /* const promises = await Promise.all(requests);
         console.log('RESPUESTAS PROMISE ALL', promises); */
      } else {
         for (const tablename of COMPONENTS) {
            let counter = 0;
            const table = tablename.toLowerCase().split(' ').join('_');
            let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), ${table}.the_geom) or `;
            filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), ${table}.the_geom))`;
            for (const project of PROJECT_TABLES) {

               const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
               const query = { q: `select count(*) from ${table}, ${project} where ${project}.${column}= ${table}.${column} and ${filters} ` };
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
   } catch (error) {
      logger.error(error);
      logger.error(`getSubtotalsByComponent Connection error`);
   }

   return result;
}

router.get('/range', async (req, res) => {
   try {
      bounds = req.query.bounds;
      const rangeMhfdDollarsAllocated = [
         {
            min: 0,
            max: 250000
         },
         {
            min: 250001,
            max: 500000
         },
         {
            min: 500001,
            max: 750000
         },
         {
            min: 750001,
            max: 1000000
         },
         {
            min: 1000001,
            max: 50000000
         }
      ];
      const result = await getValuesByRange('mhfd_projects', 'mhfddollarsallocated', rangeMhfdDollarsAllocated, bounds);
      res.status(200).send(result);
   } catch (error) {
      logger.error(error);
      logger.error(`getSubtotalsByComponent Connection error`);
   }
})

router.get('/params-filters', async (req, res) => {
   try {
      bounds = req.query.bounds;
      //console.log(bounds);
      let requests = [];

      // PROJECTS
      requests.push(getValuesByColumnWithOutCount('mhfd_projects', 'creator', bounds));
      requests.push(getValuesByColumnWithOutCount('mhfd_projects', 'mhfdmanager', bounds));
      requests.push(getCountByArrayColumns('mhfd_projects', 'projecttype', ['Maintenance', 'Study', 'Capital'], bounds));
      requests.push(getCountByArrayColumns('mhfd_projects', 'status', statusList, bounds));
      requests.push(getValuesByColumn('mhfd_projects', 'startyear', bounds));
      requests.push(getValuesByColumn('mhfd_projects', 'completedyear', bounds));
      const rangeMhfdDollarsAllocated = [
         {
            min: 0,
            max: 250000
         },
         {
            min: 250001,
            max: 500000
         },
         {
            min: 500001,
            max: 750000
         },
         {
            min: 750001,
            max: 1000000
         },
         {
            min: 1000001,
            max: 50000000
         }
      ];
      requests.push(getValuesByRange('mhfd_projects', 'mhfddollarsallocated', rangeMhfdDollarsAllocated, bounds));
      //requests.push(getQuintilValues('mhfd_projects', 'mhfddollarsallocated', bounds));
      requests.push(getCountWorkYear([{ year: 2019, column: 'workplanyr1' }, { year: 2020, column: 'workplanyr2' },
      { year: 2021, column: 'workplanyr3' }, { year: 2022, column: 'workplanyr4' }, { year: 2023, column: 'workplanyr5' }], bounds));
      requests.push(getProjectByProblemType(bounds));
      requests.push(getValuesByColumnWithOutCount('mhfd_projects', 'jurisdiction', bounds));
      requests.push(getValuesByColumnWithOutCount('mhfd_projects', 'county', bounds));
      requests.push(getValuesByColumnWithOutCount('mhfd_projects', 'lgmanager', bounds));
      requests.push(getValuesByColumnWithOutCount('mhfd_projects', 'streamname', bounds));
      //requests.push(getQuintilValues('mhfd_projects', 'estimatedcost', bounds));
      const rangeTotalCost = [
         {
            min: 0,
            max: 250000
         },
         {
            min: 250001,
            max: 500000
         },
         {
            min: 500001,
            max: 750000
         },
         {
            min: 750001,
            max: 1000000
         },
         {
            min: 1000001,
            max: 50000000
         }
      ];
      requests.push(getValuesByRange('mhfd_projects', 'estimatedcost', rangeTotalCost, bounds));
      requests.push(getValuesByColumnWithOutCount('mhfd_projects', 'consultant', bounds));
      requests.push(getValuesByColumnWithOutCount('mhfd_projects', 'contractor', bounds));
      requests.push(getValuesByColumnWithOutCount('mhfd_projects', 'servicearea', bounds));

      // PROBLEMS
      let problemTypesConst = ['Human Connection', 'Geomorphology', 'Vegetation', 'Hydrology', 'Hydraulics'];
      requests.push(getCountByArrayColumns(PROBLEM_TABLE, 'problempriority', ['High', 'Medium', 'Low'], bounds));
      requests.push(getCountSolutionStatus([0, 25, 50, 75], bounds));
      requests.push(getValuesByColumn(PROBLEM_TABLE, 'county', bounds));
      requests.push(getValuesByColumnWithOutCount(PROBLEM_TABLE, 'jurisdiction', bounds));
      requests.push(getValuesByColumnWithOutCount(PROBLEM_TABLE, 'mhfdmanager', bounds));
      requests.push(getValuesByColumnWithOutCount(PROBLEM_TABLE, 'source', bounds));
      requests.push(getSubtotalsByComponent(PROBLEM_TABLE, 'problemid', bounds));
      //requests.push(getQuintilValues('problems', 'solutioncost', bounds));
      const rangeSolution = [
         {
            min: 0,
            max: 1000000
         },
         {
            min: 1000001,
            max: 3000000
         },
         {
            min: 3000001,
            max: 5000000
         },
         {
            min: 5000001,
            max: 50000000
         }
      ]
      requests.push(getValuesByRange(PROBLEM_TABLE, 'solutioncost', rangeSolution, bounds));
      requests.push(getValuesByColumnWithOutCount(PROBLEM_TABLE, 'servicearea', bounds));

      // Components
      requests.push(getCounterComponents(bounds));
      requests.push(getComponentsValuesByColumn('status', bounds));
      requests.push(getCountByYearStudy([1970, 1980, 1990, 2000, 2010, 2020], bounds));
      requests.push(getComponentsValuesByColumnWithCount('jurisdiction', bounds));
      requests.push(getComponentsValuesByColumnWithCount('county', bounds));
      requests.push(getComponentsValuesByColumnWithCount('mhfdmanager', bounds));
      requests.push(getQuintilComponentValues('estimated_cost', bounds));
      requests.push(getComponentsValuesByColumnWithCount('servicearea', bounds));


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
            "workplanyear": promises[7], //workplanyear,
            "problemtype": promises[8], //problemtype,
            "jurisdiction": promises[9],
            "county": promises[10],
            "lgmanager": promises[11],
            "streamname": promises[12],
            "estimatedCost": promises[13],
            "consultant": promises[14],
            "contractor": promises[15],
            "servicearea": promises[16]
         },
         "problems": {
            "problemtype": problemTypesConst,
            "priority": promises[17],
            "solutionstatus": promises[18],
            "county": promises[19],
            "jurisdiction": promises[20],
            "mhfdmanager": promises[21],
            "source": promises[22],
            "components": promises[23],
            "cost": promises[24],
            "servicearea": promises[25]
         },
         "components": {
            "component_type": promises[26],
            "status": promises[27],
            "yearofstudy": promises[28],
            "jurisdiction": promises[29],
            "county": promises[30],
            "watershed": promises[31],
            "estimatedcost": promises[32],
            "servicearea": promises[33]
         }
      }
      res.status(200).send(result);
   } catch (error) {
      logger.error(error);
      res.status(500).send({ error: error }).send({ error: 'Connection error' });
   }
});


router.get('/problem_part/:id', async (req, res) => {
   const id = req.params.id;
   const promises = [];
   const tables = ['flood_hazard_polygon_', 'flood_hazard_line_', 'flood_hazard_point_'];
   for (const element of tables) {
     let sql = `SELECT problem_type, problem_part_category, problem_part_subcategory, globalid FROM ${element}
     WHERE problem_id = ${id}`;
     console.log('my sql ', sql);
     sql = encodeURIComponent(sql);
     const URL = `https://denver-mile-high-admin.carto.com/api/v2/sql?q=${sql}&api_key=${CARTO_TOKEN}`;
     promises.push(new Promise((resolve, reject) => {
       https.get(URL, response => {   
         if (response.statusCode == 200) {
           let str = '';
           response.on('data', function (chunk) {
             str += chunk;
           });
           response.on('end', function () {
             const rows = JSON.parse(str).rows;
             console.log(rows);
             resolve(rows);
           });
         } else {
           console.log('status ', response.statusCode, URL);
           resolve([]);
         }
       }).on('error', err => {
         console.log('failed call to ', URL, 'with error ', err);
         resolve([]);
       })})
     );  
   }
   const all = await Promise.all(promises);
   res.send({
      data: all
   });
 });

router.post('/params-filter-components', componentParamFilterRoute)
router.post('/params-filter-projects', projectParamFilterRoute)
router.post('/params-filter-problems', problemParamFilterRoute)

router.post('/project-statistics', projectStatistics)

/* Tab counter routes */
router.post('/problems-counter', problemCounterRoute)
router.post('/projects-counter', projectCounterRoute)
router.post('/components-counter', componentCounterRoute)

module.exports = (router);
