import express from 'express';
import { response } from 'express';
import https from 'https';
import needle from 'needle';
import logger from 'bc/config/logger.js';
import {
   CARTO_URL,
   PROBLEM_TABLE,
   PROPSPROBLEMTABLES,
   MAIN_PROJECT_TABLE,
   COMPLETE_YEAR_COLUMN,
   PROBLEM_PART_TABLES
} from 'bc/config/config.js';
import attachmentService from 'bc/services/attachment.service.js';
import teamService from 'bc/services/teams.service.js';
import {
   componentCounterRoute,
   componentParamFilterRoute,
   componentParamFilterCounter,
   componentFilterIds
} from 'bc/routes/mapgallery.component.route.js';
import {
   projectCounterRoute,
   projectParamFilterRoute,
   projectStatistics,
} from 'bc/routes/mapgallery.project.route.js';
import {
   problemCounterRoute,
   problemParamFilterRoute,
} from 'bc/routes/mapgallery.problem.route.js';
import { printProject, printProblem, newPrintProject } from 'bc/services/mapgallery.print.service.js';
import {
   getDataByProjectIds,
   getProblemByProjectId,
   getCoordinatesOfComponents,
   getDataProblemSql,
   getCountForProblemId,
   getLayersProblemSql,
} from 'bc/services/mapgallery.service.js';
import {
   statusList
} from 'bc/lib/gallery.constants.js';
import ProjectService from 'bc/services/project.service.js';
import db from 'bc/config/db.js';
import sequelize from 'sequelize';
import teamsService from 'bc/services/teams.service.js';
import financialService from 'bc/services/financial.service.js';


const Op = sequelize.Op;
const Grade_control_structure = db.gradeControlStructure;
const Pipe_appurtenances = db.pipeAppurtenances;
const Special_item_point = db.specialItemPoint;
const Special_item_linear = db.specialItemLinear;
const Special_item_area = db.specialItemArea;
const Channel_improvements_linear = db.channelImprovementsLinear;
const Channel_improvements_area = db.channelImprovementsArea;
const Removal_line = db.removalLine;
const Removal_area = db.removalArea;
const Storm_drain = db.stormDrain;
const Detention_facilities = db.detentionFacilities;
const Land_acquisition = db.landAcquisition;
const Landscaping_area = db.landscapingArea;
const Stream_improvement_measure = db.streamImprovementMeasure;
const Maintenance_trails = db.maintenanceTrails;
const ProjectStaff = db.projectStaff;
const Project = db.project;
const BusinessAssociateContact = db.businessAssociateContact;
const BusinessAddress = db.businessAdress;
const BusinessAssociate = db.businessAssociates;

const router = express.Router();
const PROJECT_TABLES = [MAIN_PROJECT_TABLE];
const TABLES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
   'special_item_linear', 'special_item_area', 'channel_improvements_linear',
   'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
   'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area', 'stream_improvement_measure'];

async function getLayersInfo (conditionalWhere, typeid, id) {
   let projectLayers = [];
       let grade_control_structure = await Promise.resolve(Grade_control_structure.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type'] 
      }));
      grade_control_structure = grade_control_structure.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      grade_control_structure.action = 'grade_control_structure';
      projectLayers.push(grade_control_structure);


      let pipe_appurtenances = await Promise.resolve(Pipe_appurtenances.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type']
      }))
      pipe_appurtenances = pipe_appurtenances.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      pipe_appurtenances.action = 'pipe_appurtenances';
      projectLayers.push(pipe_appurtenances);


      let special_item_point = await Promise.resolve(Special_item_point.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type']
      }));
      special_item_point = special_item_point.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      special_item_point.action = 'special_item_point';
      projectLayers.push(special_item_point);


      let special_item_linear = await Promise.resolve(Special_item_linear.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type']
      }));
      special_item_linear = special_item_linear.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      special_item_linear.action = 'special_item_linear';
      projectLayers.push(special_item_linear);


      let special_item_area = await Promise.resolve(Special_item_area.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type']
      }));
      special_item_area = special_item_area.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      special_item_area.action = 'special_item_area';
      projectLayers.push(special_item_area);


      let channel_improvements_linear = await Promise.resolve(Channel_improvements_linear.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type']
      }));
      channel_improvements_linear = channel_improvements_linear.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      channel_improvements_linear.action = 'channel_improvements_linear';
      projectLayers.push(channel_improvements_linear);


      let channel_improvements_area = await Promise.resolve(Channel_improvements_area.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type']
      }));
      channel_improvements_area = channel_improvements_area.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      channel_improvements_area.action = 'channel_improvements_area';
      projectLayers.push(channel_improvements_area);


      let removal_line = await Promise.resolve(Removal_line.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type']
      }));
      removal_line = removal_line.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      removal_line.action = 'removal_line';
      projectLayers.push(removal_line);


      let removal_area = await Promise.resolve(Removal_area.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type']
      }));
      removal_area = removal_area.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      removal_area.action = 'removal_area';
      projectLayers.push(removal_area);


      let storm_drain = await Promise.resolve(Storm_drain.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type']
      }));
      storm_drain = storm_drain.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      storm_drain.action = 'storm_drain';
      projectLayers.push(storm_drain);


      let detention_facilities = await Promise.resolve(Detention_facilities.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type']
      }));
      detention_facilities = detention_facilities.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      detention_facilities.action = 'detention_facilities';
      projectLayers.push(detention_facilities);


      let land_acquisition = await Promise.resolve(Land_acquisition.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type']
      }));
      land_acquisition = land_acquisition.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      land_acquisition.action = 'land_acquisition';
      projectLayers.push(land_acquisition);


      let landscaping_area = await Promise.resolve(Landscaping_area.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type']
      }));
      landscaping_area = landscaping_area.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      landscaping_area.action = 'landscaping_area';
      projectLayers.push(landscaping_area);


      let stream_improvement_measure = await Promise.resolve(
        Stream_improvement_measure.findAll({
          where:
            typeid === PROPSPROBLEMTABLES.problems[5]
              ? {
                  problem_id: id,
                }
              : {
                  project_id: id,
                },
            attributes: ['status', 'estimated_cost_base', 'component_type']
        })
      );
      stream_improvement_measure = stream_improvement_measure.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      stream_improvement_measure.action = 'stream_improvement_measure';
      projectLayers.push(stream_improvement_measure);


      let maintenance_trails = await Promise.resolve(Maintenance_trails.findAll({
         where: conditionalWhere,
         attributes: ['status', 'estimated_cost', 'original_cost', 'component_type', 'type']
      }));
      maintenance_trails = maintenance_trails.map(instance => instance.dataValues).filter(arr => Object.keys(arr).length > 0);
      maintenance_trails.action = 'maintenance_trails';
      projectLayers.push(maintenance_trails);

      return projectLayers;
}

router.post('/', async (req, res) => {
  logger.info(`Starting endpoint mapgallery.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    console.log('enter here', req.body.isproblem);
    if (req.body.isproblem) {
      let filters = '';
      filters = getFilters(req.body);
      console.log('filters', filters);
      const PROBLEM_SQL = `SELECT cartodb_id, ${PROPSPROBLEMTABLES.problem_boundary[5]} as ${PROPSPROBLEMTABLES.problems[5]}, ${PROPSPROBLEMTABLES.problem_boundary[6]} as ${PROPSPROBLEMTABLES.problems[6]} , ${PROPSPROBLEMTABLES.problem_boundary[0]} as ${PROPSPROBLEMTABLES.problems[0]}, ${PROPSPROBLEMTABLES.problem_boundary[16]} as ${PROPSPROBLEMTABLES.problems[16]}, ${PROPSPROBLEMTABLES.problem_boundary[17]},  ${PROPSPROBLEMTABLES.problem_boundary[2]} as ${PROPSPROBLEMTABLES.problems[2]}, ${PROPSPROBLEMTABLES.problem_boundary[7]} as ${PROPSPROBLEMTABLES.problems[7]}, ${PROPSPROBLEMTABLES.problem_boundary[1]} as ${PROPSPROBLEMTABLES.problems[1]}, ${PROPSPROBLEMTABLES.problem_boundary[8]} as ${PROPSPROBLEMTABLES.problems[8]}, county, ${getCountersProblems(PROBLEM_TABLE, PROPSPROBLEMTABLES.problems[5], PROPSPROBLEMTABLES.problem_boundary[5])}, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM ${PROBLEM_TABLE} `;
      const query = { q: `${PROBLEM_SQL} ${filters}` };
      let answer = [];
      try {
        const data = await needle('post', CARTO_URL, query, { json: true });
        if (data.statusCode === 200) {
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
      const problemIds = answer.map(element => element.problemid);      
      let queryProblem = await getDataProblemSql(problemIds,answer);
      if (req.body?.mhfdmanager?.length > 0) {
        queryProblem = queryProblem.filter((qp) => { 
          let booleanCheck = qp.modelData.some((md) => {
            const managerstotest = req.body?.mhfdmanager;
            let booleantest = false;
            for(let i = 0 ; i < managerstotest.length; ++i) {
              if (md?.project_staffs && !booleantest) {
                booleantest = md.project_staffs.some((ps) => {
                  return ps.business_associate_contact_id == managerstotest[i]
                });
              }
            }
            return booleantest;
          });
          return booleanCheck;
        });
      }
      res.send(queryProblem);
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
          if (table === MAIN_PROJECT_TABLE) {
            query = { q: `SELECT '${table}' as type, ${PROJECT_FIELDS}, ${getCounters(MAIN_PROJECT_TABLE, 'projectid')}, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM ${table} ${filters} ` };

          }
          let answer = [];
          try {
            const data = await needle('post', CARTO_URL, query, { json: true });
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
         let name = params.name;
         if (!Number.isInteger(Number(name))) {
            name += ' ';
          }
         if (filters.length > 0) {
            filters = filters = ` and (${PROPSPROBLEMTABLES.problem_boundary[6]} ilike '%${name}%' OR ${PROPSPROBLEMTABLES.problem_boundary[5]}::text ilike '%${name}%')`;
         }
         else {
            filters = ` (${PROPSPROBLEMTABLES.problem_boundary[6]} ilike '%${name}%' OR ${PROPSPROBLEMTABLES.problem_boundary[5]}::text ilike '%${name}%') `;
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

  //  if (params.watershed) {
  //     const values = createQueryForIn(params.watershed.split(','));
  //     let query = '';
  //     let operator = '';
  //     //for (const value of values) {
  //     for (const component of VALUES_COMPONENTS) {
  //        query += operator +
  //           ` ${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid} and mhfdmanager in (${values})) `;
  //        operator = ' or ';
  //     }
  //     //}

  //     if (filters.length > 0) {
  //        filters += ` AND (${query})`;
  //     } else {
  //        filters = ` (${query})`;
  //     }
  //  }

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
    filters += ` ${filters.length > 0 ? 'and': ''}  (${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[0] : PROPSPROBLEMTABLES.problems[0]} between ${params.cost[0]} and ${ +params.cost[1]-1})`;
   }

   if (params.servicearea) {
      const query = createQueryForIn(params.servicearea.split(','));
      if (filters.length > 0) {
         filters += ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[9] : PROPSPROBLEMTABLES.problems[9]} in (${query})`;
      } else {
         filters = ` ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[9] : PROPSPROBLEMTABLES.problems[9]} in (${query})`;
      }
   }

   //TODO here is the filter that needs to be related to DB
  //  if (params.mhfdmanager) {
  //     const query = createQueryForIn(params.mhfdmanager.split(','));
  //     if (filters.length > 0) {
  //        filters = filters + ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[3] : PROPSPROBLEMTABLES.problems[3]} in (${query})`;
  //     } else {
  //        filters = `${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[3] : PROPSPROBLEMTABLES.problems[3]} in (${query})`;
  //     }
  //  }

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
         filters = filters + ` and ${COMPLETE_YEAR_COLUMN} = ${params.completedyear} `;
      } else {
         filters = ` ${COMPLETE_YEAR_COLUMN} = ${params.completedyear} `;
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

         if (table === MAIN_PROJECT_TABLE) {
            query = { q: `SELECT '${table}' as type, ${project_fields}, ${getCounters(MAIN_PROJECT_TABLE, 'projectid')} FROM ${table} ${newfilter} ` };
         }

         const data = await needle('post', CARTO_URL, query, { json: true });
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
   logger.info(`Starting endpoint mapgallery.route/project-by-ids/pdf with params ${JSON.stringify(req.params, null, 2)}`);
   const projectid = req.query.projectid;
   const map = req.body.map;
   let data = await getDataByProjectIds(projectid, false);
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
   logger.info(`Starting endpoint mapgallery.route/project-by-ids with params ${JSON.stringify(req.params, null, 2)}`);
   const projectid = req.query.projectid;
   try {
      let data = await getDataByProjectIds(projectid, false);
      res.status(200).send(data);
   } catch (error) {
      logger.error(error);
      res.status(500).send({ error: 'No there data with ID' });
   }
});

let getEnvelopeOfProblemAndProblemParts = (problem_id) => {
   let querypart = [`select the_geom from ${PROBLEM_TABLE} where ${PROPSPROBLEMTABLES.problem_boundary[5]}='${problem_id}'`];
   const tables = PROBLEM_PART_TABLES;
   for (const element of tables) {
      querypart.push(`select the_geom from ${element} where ${PROPSPROBLEMTABLES.problem_boundary[5]}='${problem_id}'`);
   }

   return `ST_Envelope(ST_collect(array(${querypart.join(' union ')})))`;
}
let getDataByProblemId = async (id) => {
   const PROBLEM_SQL = `SELECT ST_AsGeoJSON(${getEnvelopeOfProblemAndProblemParts(id)}) as the_geom, cartodb_id,
    objectid, ${PROPSPROBLEMTABLES.problem_boundary[5]} as ${PROPSPROBLEMTABLES.problems[5]}, ${PROPSPROBLEMTABLES.problem_boundary[6]} as ${PROPSPROBLEMTABLES.problems[6]}, ${PROPSPROBLEMTABLES.problem_boundary[4]} as ${PROPSPROBLEMTABLES.problems[4]}, ${PROPSPROBLEMTABLES.problem_boundary[8]} as ${PROPSPROBLEMTABLES.problems[8]},
    ${PROPSPROBLEMTABLES.problem_boundary[7]} as ${PROPSPROBLEMTABLES.problems[7]}, ${PROPSPROBLEMTABLES.problem_boundary[14]} as ${PROPSPROBLEMTABLES.problems[14]}, ${PROPSPROBLEMTABLES.problem_boundary[13]} as ${PROPSPROBLEMTABLES.problems[13]}, ${PROPSPROBLEMTABLES.problem_boundary[0]} as ${PROPSPROBLEMTABLES.problems[0]}, ${PROPSPROBLEMTABLES.problem_boundary[16]} as ${PROPSPROBLEMTABLES.problems[16]}, ${PROPSPROBLEMTABLES.problem_boundary[1]} as ${PROPSPROBLEMTABLES.problems[1]},
    ${PROPSPROBLEMTABLES.problem_boundary[3]} as ${PROPSPROBLEMTABLES.problems[3]}, ${PROPSPROBLEMTABLES.problem_boundary[9]} as ${PROPSPROBLEMTABLES.problems[9]}, county,${PROPSPROBLEMTABLES.problem_boundary[2]} as ${PROPSPROBLEMTABLES.problems[2]}, ${PROPSPROBLEMTABLES.problem_boundary[15]} as ${PROPSPROBLEMTABLES.problems[15]},
    ${PROPSPROBLEMTABLES.problem_boundary[12]} as ${PROPSPROBLEMTABLES.problems[12]}, ${PROPSPROBLEMTABLES.problem_boundary[11]} as ${PROPSPROBLEMTABLES.problems[11]}, ${PROPSPROBLEMTABLES.problem_boundary[10]} as ${PROPSPROBLEMTABLES.problems[10]}
    FROM ${PROBLEM_TABLE} where ${PROPSPROBLEMTABLES.problem_boundary[5]}='${id}'`;
   console.log('PROBLEM SQL', PROBLEM_SQL);
   const URL = encodeURI(`${CARTO_URL}&q=${PROBLEM_SQL}`);
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
   const tables = PROBLEM_PART_TABLES;
   for (const element of tables) {
      let sql = `SELECT problem_type, problem_part_category, problem_part_subcategory, globalid FROM ${element}
     WHERE problem_id = ${id}`;
      console.log('my sql ', sql);
      sql = encodeURIComponent(sql);
      const URL = `${CARTO_URL}&q=${sql}`;
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
         })
      })
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
router.post('/project-pdf/:id', async (req, res) => {
   logger.info(`Starting endpoint mapgallery.route/project-pdf/:id with params ${JSON.stringify(req.params, null, 2)}`);
   const { id } = req.params
   const { appUser } = req.body
   const mapImage = req.body.mapImage;
   const roadMap = req.body.roadMap;

   try {
      const data = await ProjectService.getDetails(id);
      const components = await componentsByEntityId(
         id,
         'projectid',
         'type',
         'asc'
      );
      const financialData = await financialService.getFinancialInformation(id, []);
      const attachments = await attachmentService.listAttachments(1, 10, 'created_date', 'asc', id);
      let pdfObject = await newPrintProject(data, components, mapImage, roadMap, attachments, financialData);
      pdfObject.toBuffer(function (err, buffer) {
         if (err) return res.send(err);
         res.type('pdf');
         res.end(buffer, 'binary');
      });
   } catch (error) {
      logger.error(error);
      res.send({ error: 'No there data with ID' });
   }
});

router.post('/problem-by-id/:id/pdf', async (req, res) => {
   logger.info(`Starting endpoint mapgallery.route/problem-by-id/:id/pdf with params ${JSON.stringify(req.params, null, 2)}`);
   const id = req.params.id;
   const map = req.body.mapImage;
   try {
      let data = await getDataByProblemId(id);
      let components = await componentsByEntityId(id, PROPSPROBLEMTABLES.problems[5], 'type', 'asc');
      let problempart = await getProblemParts(id);
      let teamsProblems = await teamsService.getTeamsByEntityId(id);
      try {
         let pdfObject = await printProblem(data, components, map, problempart, teamsProblems);
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
   logger.info(`Starting endpoint mapgallery.route/problem-by-id/:id with params ${JSON.stringify(req.params, null, 2)}`);
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
   logger.info(`Starting endpoint mapgallery.route/problems-by-projectid with params ${JSON.stringify(req.params, null, 2)}`);
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

let componentsByEntityId = async (id, typeid) => {
  if (id === '') {
    id = null;
  }
  let conditionalWhere = {};

  if (typeid === PROPSPROBLEMTABLES.problems[5]) {
    conditionalWhere = {
      problemid: id,
    };
  } else {
    conditionalWhere = {
      projectid: id,
    };
  }
  const projectLayers = await getLayersProblemSql(conditionalWhere, typeid, id);
  console.log('projectLayers', projectLayers);
  let costs = [];
  let totalCost = 0;
  let original_Cost = 0;
  projectLayers.forEach((element) => {
    if (element.length > 0) {
      element.forEach((subElement) => {
        if (element.action === 'stream_improvement_measure') {
          if (element.status === 'Constructed') {
            original_Cost += subElement.estimated_cost_base;
          }
          totalCost += subElement.estimated_cost_base;
        } else {
          if (element.status === 'Constructed') {
            original_Cost += subElement.original_cost;
          }
          totalCost += subElement.original_cost;
        }
      });
      return totalCost;
    }
  });

  projectLayers.forEach((element) => {
    if (element.length > 0) {
      let actionName = '';
      let estimated_cost = 0;
      let countOfProjectActions = 0;
      let countCompletedActions = 0;
      element.forEach((subElement) => {
        actionName =
          element.action === 'stream_improvement_measure'
            ? subElement.component_type
            : subElement.type;
        countOfProjectActions++;
        if (subElement.status === 'Constructed') {
          countCompletedActions++;
        }
        if (element.action === 'stream_improvement_measure') {
          estimated_cost += subElement.estimated_cost_base;
        } else {
          estimated_cost += subElement.original_cost;
        }
      });
      costs.push({
        type: actionName + ' (' + countOfProjectActions + ')',
        complete_cost: (countCompletedActions / countOfProjectActions) * 100,
        component_count_complete: countCompletedActions,
        component_count_total: countOfProjectActions,
        estimated_cost: estimated_cost,
        original_cost: original_Cost,
        percen: Math.round((estimated_cost / totalCost) * 10000) / 100,
      });
    }
  });
  return costs;
};

router.post('/components-by-entityid', async (req, res) => {
   logger.info(`Starting endpoint mapgallery.route/components-by-entityid with params ${JSON.stringify(req.params, null, 2)}`);
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

router.post('/teams-by-entityid', async (req, res) => {
  logger.info(`Starting endpoint mapgallery.route/teams-by-entityid with params ${JSON.stringify(req.params, null, 2)}`);
  try {
      let id = req.body.id;
      const teamsProject = await teamService.getTeamsByEntityId(id);
      logger.info(`${JSON.stringify(teamsProject)}`);
      return res.status(200).send(teamsProject);
  } catch (error) {
     logger.error(error);
     res.status(500).send({ error: error }).send({ error: 'Connection error' });
  }
})

router.post('/get-coordinates', async (req, res) => {
   logger.info(`Starting endpoint mapgallery.route/get-coordinates with params ${JSON.stringify(req.params, null, 2)}`);
   try {
      const table = req.body.table;
      const value = req.body.value;
      let query = {
         q: `select ST_AsGeoJSON(ST_Envelope(the_geom)) from ${table} 
      where cartodb_id = ${value} `
      };
      const data = await needle('post', CARTO_URL, query, { json: true });
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
   logger.info(`Starting endpoint mapgallery.route/component-counter with params ${JSON.stringify(req.params, null, 2)}`);
   try {
      const column = req.body.column;
      const value = req.body.value;
      let counter = 0;
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
            const data = await needle('post', CARTO_URL, query, { json: true });
            let answer = [];
            if (data.statusCode === 200) {
               const result = data.body.rows;
               counter = result[0].count_gcs + result[0].count_pa + result[0].count_sip + result[0].count_sil +
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
         counter = 0;
         if (value !== null && value !== 0) {
            for (const table1 of PROJECT_TABLES) {
               const query = {
                  q: `select projectid, projectname, ${getCounters(table1, column)} from ${table1} where ${column} = ${value} `
               };
               try {
                  const data = await needle('post', CARTO_URL, query, { json: true });
                  if (data.statusCode === 200) {
                     const result = data.body.rows;
                     counter += result[0].count_gcs + result[0].count_pa + result[0].count_sip + result[0].count_sil +
                        result[0].count_cia + result[0].count_sia + result[0].count_rl + result[0].count_ra +
                        result[0].count_sd + result[0].count_df + result[0].count_mt + result[0].count_la +
                        result[0].count_la + result[0].count_la1 + result[0].count_cila;
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
      res.status(500).send({ error: error });
   }
})

router.post('/group-by', async (req, res) => {
   logger.info(`Starting endpoint mapgallery.route/group-by with params ${JSON.stringify(req.params, null, 2)}`);
   try {
      const table = req.body.table;
      const column = req.body.column;
      const LINE_SQL = `SELECT ${column} FROM ${table} group by ${column} order by ${column}`;
      const LINE_URL = encodeURI(`${CARTO_URL}&q=${LINE_SQL}`);
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
      const LINE_URL = encodeURI(`${CARTO_URL}&q=${query}`);

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
                  let finalResult = [];
                  for (let i = 0; i < 5; i += 1) {
                     let min1 = Math.round(min);
                     let max1 = 0;
                     let limitCount = 0;
                     let counter = 0;

                     if (i === 4) {
                        max1 = max;
                        limitCount = max;
                     } else {
                        max1 = Math.round(difference * (i + 1));
                        limitCount = max1;
                     }

                     let query1 = '';
                     let union = '';
                     for (const table1 of TABLES_COMPONENTS) {
                        query1 += union + `select count(*) from ${table1} where (${column} between ${min1} and ${limitCount}) 
              and ${filters} `;
                        union = ' union ';
                     }

                     const query = { q: `${query1} ` };
                     const data = await needle('post', CARTO_URL, query, { json: true });
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
            if (table === PROBLEM_TABLE) {
               const query = { q: `select count(*) from ${table} where (${column} between ${values.min} and ${values.max}) and ${filters} ` };
               const data = await needle('post', CARTO_URL, query, { json: true });
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
                  const data = await needle('post', CARTO_URL, query, { json: true });
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
      if (table === PROBLEM_TABLE) {
         const coords = bounds.split(',');
         let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
         filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
         const query = { q: `select ${column} as column from ${table} where ${filters} group by ${column} order by ${column} ` };
         const data = await needle('post', CARTO_URL, query, { json: true });

         if (data.statusCode === 200) {
            const result1 = data.body.rows;
            for (const row of result1) {
               result.push(row.column);
            }
         }
      } else {
         let answer = [];
         const coords = bounds.split(',');
         let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
         filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
         for (const table1 of PROJECT_TABLES) {
            const query = { q: `select ${column} as column from ${table1} where ${filters} group by ${column} order by ${column} ` };
            const data = await needle('post', CARTO_URL, query, { json: true });

            if (data.statusCode === 200) {
               answer = answer.concat(data.body.rows);
            }
         }
         for (const row of answer) {
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
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
      const problemTypes = ['Human Connection', 'Geomorphology', 'Vegetation', 'Hydrology', 'Hydraulics'];
      for (const type of problemTypes) {
         let counter = 0;
         for (const table of PROJECT_TABLES) {
            const newfilter = createQueryByProblemType(type, table);
            const query = { q: `select count(*) as count from ${table} where ${filters} and ${newfilter} ` };
            const data = await needle('post', CARTO_URL, query, { json: true });

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
      if (table === PROBLEM_TABLE) {
         const coords = bounds.split(',');
         let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
         filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
         const query = { q: `select ${column} as column, count(*) as count from ${table} where ${filters} group by ${column} order by ${column} ` };
         const data = await needle('post', CARTO_URL, query, { json: true });
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
            const data = await needle('post', CARTO_URL, query, { json: true });

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
         const query = { q: ` ${SQL} ` };
         const data = await needle('post', CARTO_URL, query, { json: true });
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
      for (const component of TABLES_COMPONENTS) {
         let answer = [];
         let counter = 0;
         const SQL = `SELECT type, count(*) as count FROM ${component} where ${filters} group by type `;

         const query = { q: ` ${SQL} ` };
         const data = await needle('post', CARTO_URL, query, { json: true });
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
      const query = { q: ` ${LINE_SQL} ` };
      const data = await needle('post', CARTO_URL, query, { json: true });
      let answer = [];
      if (data.statusCode === 200) {
         answer = data.body.rows;
      }
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
      console.log('count(*) as countcount(*) as countcount(*) as countcount(*) as countcount(*) as count', LINE_SQL);
      const query = { q: ` ${LINE_SQL} ` };
      const data = await needle('post', CARTO_URL, query, { json: true });
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
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

      for (const value of data) {
         let counter = 0;
         for (const table of PROJECT_TABLES) {
            const query = { q: `select count(*) as count from ${table} where ${filters} and ${value.column} > 0 ` };
            const data = await needle('post', CARTO_URL, query, { json: true });
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
      for (const value of range) {
         let endValue = 0;
         if (value === 75) {
            endValue = value + 25;
         } else {
            endValue = value + 24;
         }

         const query = { q: `select count(*) as count from ${PROBLEM_TABLE} where ${filters} and solutionstatus between ${value} and ${endValue} ` };
         const data = await needle('post', CARTO_URL, query, { json: true });
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
            const query = {
               q: `select ${column} as column, count(*) as count from ${table} 
              where ${column}='${value}' and ${filters} group by ${column} order by ${column} `
            };
            let counter = 0;
            const data = await needle('post', CARTO_URL, query, { json: true });

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
            let counter = 0;
            for (const table of PROJECT_TABLES) {
               const query = {
                  q: `select ${column} as column, count(*) as count from ${table} 
        where ${column}='${value}' and ${filters} group by ${column} order by ${column} `
               };
               const data = await needle('post', CARTO_URL, query, { json: true });

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
         for (const tablename of COMPONENTS) {
            const table = tablename.toLowerCase().split(' ').join('_');
            let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), ${table}.the_geom) or `;
            filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), ${table}.the_geom))`;

            const query = { q: `select count(*) from ${table}, ${PROBLEM_TABLE} where ${PROBLEM_TABLE}.${column}= ${table}.${column} and ${filters} ` };
            const data = await needle('post', CARTO_URL, query, { json: true });
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
            const table = tablename.toLowerCase().split(' ').join('_');
            let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), ${table}.the_geom) or `;
            filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), ${table}.the_geom))`;
            for (const project of PROJECT_TABLES) {
               const query = { q: `select count(*) from ${table}, ${project} where ${project}.${column}= ${table}.${column} and ${filters} ` };
               const data = await needle('post', CARTO_URL, query, { json: true });
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
   logger.info(`Starting endpoint mapgallery.route/range with params ${JSON.stringify(req.params, null, 2)}`);
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
      const result = await getValuesByRange(MAIN_PROJECT_TABLE, 'mhfddollarsallocated', rangeMhfdDollarsAllocated, bounds);
      res.status(200).send(result);
   } catch (error) {
      logger.error(error);
      logger.error(`/range Connection error`);
   }
})

router.get('/params-filters', async (req, res) => {
   logger.info(`Starting endpoint mapgallery.route/params-filters with params ${JSON.stringify(req.params, null, 2)}`);
   try {
      bounds = req.query.bounds;
      //console.log(bounds);
      let requests = [];

      // PROJECTS
      requests.push(getValuesByColumnWithOutCount(MAIN_PROJECT_TABLE, 'creator', bounds));
      requests.push(getValuesByColumnWithOutCount(MAIN_PROJECT_TABLE, 'mhfdmanager', bounds));
      requests.push(getCountByArrayColumns(MAIN_PROJECT_TABLE, 'projecttype', ['Maintenance', 'Study', 'Capital'], bounds));
      requests.push(getCountByArrayColumns(MAIN_PROJECT_TABLE, 'status', statusList, bounds));
      requests.push(getValuesByColumn(MAIN_PROJECT_TABLE, 'startyear', bounds));
      requests.push(getValuesByColumn(MAIN_PROJECT_TABLE, COMPLETE_YEAR_COLUMN, bounds));
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
      requests.push(getValuesByRange(MAIN_PROJECT_TABLE, 'mhfddollarsallocated', rangeMhfdDollarsAllocated, bounds));
      //requests.push(getQuintilValues(MAIN_PROJECT_TABLE, 'mhfddollarsallocated', bounds));
      requests.push(getCountWorkYear([{ year: 2019, column: 'workplanyr1' }, { year: 2020, column: 'workplanyr2' },
      { year: 2021, column: 'workplanyr3' }, { year: 2022, column: 'workplanyr4' }, { year: 2023, column: 'workplanyr5' }], bounds));
      requests.push(getProjectByProblemType(bounds));
      requests.push(getValuesByColumnWithOutCount(MAIN_PROJECT_TABLE, 'jurisdiction', bounds));
      requests.push(getValuesByColumnWithOutCount(MAIN_PROJECT_TABLE, 'county', bounds));
      requests.push(getValuesByColumnWithOutCount(MAIN_PROJECT_TABLE, 'lgmanager', bounds));
      requests.push(getValuesByColumnWithOutCount(MAIN_PROJECT_TABLE, 'streamname', bounds));
      //requests.push(getQuintilValues(MAIN_PROJECT_TABLE, 'estimatedcost', bounds));
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
      requests.push(getValuesByRange(MAIN_PROJECT_TABLE, 'estimatedcost', rangeTotalCost, bounds));
      requests.push(getValuesByColumnWithOutCount(MAIN_PROJECT_TABLE, 'consultant', bounds));
      requests.push(getValuesByColumnWithOutCount(MAIN_PROJECT_TABLE, 'contractor', bounds));
      requests.push(getValuesByColumnWithOutCount(MAIN_PROJECT_TABLE, 'servicearea', bounds));

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
      logger.error('/params-filters error');
      logger.error(error);
      res.status(500).send({ error: error }).send({ error: 'Connection error' });
   }
});


router.get('/problem_part/:id', async (req, res) => {
   logger.info(`Starting endpoint mapgallery.route/problem_part/:id with params ${JSON.stringify(req.params, null, 2)}`);
   const id = req.params.id;
   const promises = [];
   const tables = PROBLEM_PART_TABLES;
   for (const element of tables) {
      let sql = `SELECT problem_type, problem_part_category, problem_part_subcategory, globalid FROM ${element}
     WHERE problem_id = ${id}`;
      console.log('my sql ', sql);
      sql = encodeURIComponent(sql);
      const URL = `${CARTO_URL}&q=${sql}`;
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
         })
      })
      );
   }
   const all = await Promise.all(promises);
   res.send({
      data: all
   });
});
const getcountForProblem = async (req, res) => {
   const problemid = req.params['problemid'];
   const totalCount = await getCountForProblemId(problemid);
   res.send({
      data: totalCount
   });
}

router.post('/params-filter-components', componentParamFilterRoute)
router.post('/params-filter-components-db', componentParamFilterCounter)
router.post('/params-filter-components-ids', componentFilterIds)
router.post('/params-filter-projects', projectParamFilterRoute)
router.post('/params-filter-problems', problemParamFilterRoute)
router.get('/count-for-problem/:problemid', getcountForProblem);

router.post('/project-statistics', projectStatistics)

/* Tab counter routes */
router.post('/problems-counter', problemCounterRoute)
router.post('/projects-counter', projectCounterRoute)
router.post('/components-counter', componentCounterRoute)

export default router;
