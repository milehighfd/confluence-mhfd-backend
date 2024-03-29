import needle from 'needle';
import {
   CARTO_URL,
   PROBLEM_TABLE,
   MAIN_PROJECT_TABLE
} from 'bc/config/config.js';
import logger from 'bc/config/logger.js';
import { statusList } from 'bc/lib/gallery.constants.js';

const PROJECT_TABLES = [MAIN_PROJECT_TABLE];
const COMPLETE_YEAR_COLUMN = 'completeyear';

const getNewFilter = (filters, body) => {
   if (body.status) {
     let statuses = body.status.split(',');
     let statusesIn = statuses.map(s => `'${s}'`)
     filters += ` and status in (${statusesIn.join(',')})`
   }
   if (body.projecttype) {
      let projecttype = body.projecttype.split(',');
      let projecttypeIn = projecttype.map(s => `'${s}'`)
      filters += ` and projecttype in (${projecttypeIn.join(',')})`
   }
   if (body.mhfddollarsallocated && body.mhfddollarsallocated.length !== 0) {
     let column = 'mhfddollarsallocated';
     let minPair = body.mhfddollarsallocated[0];
     let maxPair = body.mhfddollarsallocated[body.mhfddollarsallocated.length - 1];
     let minimumValue = minPair.split(',')[0];
     let maximumValue = maxPair.split(',')[1];
     filters += ` and cast(${column} as real) between ${minimumValue} and ${maximumValue}`
   }
   if (body.totalcost && body.totalcost.length !== 0) {
      let column = 'estimatedcost';
      let minPair = body.totalcost[0];
      let maxPair = body.totalcost[body.totalcost.length - 1];
      let minimumValue = minPair.split(',')[0];
      let maximumValue = maxPair.split(',')[1];
      filters += ` and cast(${column} as real) between ${minimumValue} and ${maximumValue}`
   }
   if (body.lgmanager) {
      filters += ` and lgmanager = '${body.lgmanager}'`;
   }
   if (body.streamname) {
      filters += ` and streamname = '${body.streamname}'`;
   }
   if (body.contractor) {
      filters += ` and contractor = '${body.contractor}'`;
   }
   if (body.completedyear) {
     let splitted = body.completedyear.split(',');
     let column = COMPLETE_YEAR_COLUMN;
     let minimumValue = splitted[0];
     let maximumValue = splitted[splitted.length - 1];
     filters += `and ${column} between ${minimumValue} and ${maximumValue}`;
   }
   if (body.startyear) {
      let splitted = body.startyear.split(',');
      let column = 'startyear';
      let minimumValue = splitted[0];
      let maximumValue = splitted[splitted.length - 1];
      filters += `and ${column} between ${minimumValue} and ${maximumValue}`;
   }
   if (body.consultant) {
      filters += ` and consultant = '${body.consultant}'`;
    }
   if (body.jurisdiction) {
     filters += ` and jurisdiction = '${body.jurisdiction}'`;
   }
   if (body.mhfdmanager) {
     filters += ` and mhfdmanager = '${body.mhfdmanager}'`;
   }
   if (body.county) {
     let counties = body.county.split(',');
     let countiesIn = counties.map(s => `'${s.trim()}'`)
     filters += ` and county in (${countiesIn.join(',')})`
   }
   if (body.servicearea) {
     let serviceareas = body.servicearea.split(',');
     let serviceareasIn = serviceareas.map(s => `'${s.trim()}'`)
     filters += ` and servicearea in (${serviceareasIn.join(',')})`
   }
   return filters;
 }

async function getValuesByColumnWithOutCountProject(column, bounds, body, needCount) {
   let result = [];
   try {
      let answer = [];
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

      filters = getNewFilter(filters, body);
      for (const table1 of PROJECT_TABLES) {
         const query = { q: `select ${needCount ? 'count(*) as counter, ' : ''} ${column} as value from ${table1} where ${filters} group by ${column} order by ${column} ` };
         logger.info(`Starting function needle for mapgallery.project.route/`);
         const data = await needle('post', CARTO_URL, query, { json: true });
         logger.info(`Finished function needle for mapgallery.project.route/`);
         if (data.statusCode === 200) {
            answer = answer.concat(data.body.rows);
         } else {
            console.log('data.statusCode', data.statusCode, column, data.body)
            console.log('query.q', query.q)
         }
      }
      if (column === 'startyear' || column === COMPLETE_YEAR_COLUMN) {
         for (const table1 of PROJECT_TABLES) {
            const query = { q: `select DISTINCT(${column}) as value from ${table1} order by ${column} ` };
            logger.info(`Starting function needle for mapgallery.project.route/`);
            const data = await needle('post', CARTO_URL, query, { json: true });
            logger.info(`Finished function needle for mapgallery.project.route/`);
            if (data.statusCode === 200) {
               answer = answer.concat(data.body.rows
                  .map((r) => {
                     return { value: r.value, counter: 0 }
                  })
               );
               answer = answer.filter(r => r.value >= 2000);
               answer.sort((a, b) => {
                  return a.value - b.value;
               });
               while (answer[answer.length - 1].value < 2030) {
                  answer.push({
                     value: answer[answer.length - 1].value + 1,
                     count: 0
                  });
               }
            }
         }
      }
      
      for (const row of answer) {
         if (row.value) {
            const search = result.filter(item => item.value === row.value);
            let counter = 0;
            if (search.length === 0) {
               counter = answer.filter(item => item.value === row.value).map(item => item.counter).reduce((prev, next) => prev + next, 0);
               result.push({
                  value: row.value,
                  counter
               });
            }
         }
      }
      if (!column.includes('year')) {
         result = result.sort((a, b) => (a > b ? 1 : -1));
      }
   } catch (error) {
      logger.error(error);
      logger.error(`Get Value by Column, Column: ${column} Connection error`);
   }

   return result;
}

async function getCountByArrayColumnsProject(column, columns, bounds, body, needsCount) {
   let result = [];
   try {
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

      filters = getNewFilter(filters, body);

      for (const value of columns) {
         let answer = [];
         let counter = 0;
         for (const table1 of PROJECT_TABLES) {
            const query = {
               q: `select ${needsCount? 'count(*) as count, ': ''} ${column} as column from ${table1} 
       where ${column}='${value}' and ${filters} group by ${column} order by ${column} `
            };
            logger.info(`Starting function needle for mapgallery.project.route/`);
            const data = await needle('post', CARTO_URL, query, { json: true });
            logger.info(`Finished function needle for mapgallery.project.route/`);

            if (data.statusCode === 200) {
               if (data.body.rows.length > 0) {
                  answer = answer.concat(data.body.rows);
               }
            } else {
               console.log('data.statusCode', data.statusCode, column, data.body)
               console.log('query.q', query.q)
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

   } catch (error) {
      logger.error(error);
      logger.error(`getCountByArrayColumnsProject Column: ${column} Connection error`);
   }

   return result;
}

async function getValuesByRangeProject(column, bounds, body) {  
   let result = [];
   try {
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
      filters = getNewFilter(filters, body);

      const newProm1 = new Promise(async (resolve, reject) => {
         let minRange, maxRange;
        minRange = 0;
        maxRange = 60000000;
         let intervalWidth = 1000000;
         const lenRange = ( maxRange / intervalWidth ) + 1;
         let result2 = [];
         let epsilon = 0.001;
         for (let i = 0 ; i < lenRange ; i++) {
            const isLast = i === (lenRange - 1);
            let values = {
               min: minRange + i * intervalWidth,
               max: minRange + (i + 1) * intervalWidth - (isLast ? 0 : epsilon)
            }

            result2.push({ min: values.min, max: values.max, last: isLast });
         }
         resolve(result2);
      });
      logger.info(`Starting function newProm1 for mapgallery.project.route/`);
      result = await newProm1;
      logger.info(`Finished function newProm1 for mapgallery.project.route/`);
   } catch (error) {
      logger.error(error);
      logger.error(`Range By Value, Column ${column} Connection error`);
   }
   return result;
}

async function getCountWorkYearProject(data, bounds, body) {
   let result = [];
   try {
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

      filters = getNewFilter(filters, body);

      for (const value of data) {
         let counter = 0;
         if (!body.workplanyear || value.year == `${body.workplanyear}`) {
            for (const table of PROJECT_TABLES) {
               const query = { q: `select count(*) as count from ${table} where ${filters} and ${value.column} > 0 ` };
               logger.info(`Starting function needle for mapgallery.project.route/`);
               const d = await needle('post', CARTO_URL, query, { json: true });
               logger.info(`Finished function needle for mapgallery.project.route/`);
               if (d.statusCode === 200) {
                  if (d.body.rows.length > 0) {
                     counter += d.body.rows[0].count;
                  }
               } else {
                  logger.error('getCountWorkYearProject');
                  logger.error(query.statusCode);
                  logger.error(table);
                  logger.error(value.column);
                  logger.error(data.body);
                  logger.error('query.q');
                  logger.error(query.q);
               }
            }
         }
         result.push({
            value: value.year,
            counter: counter
         });
      }
   } catch (error) {
      logger.error("get count", error);
      logger.error(`getCountWorkYearProject Connection error`);
   }

   return result;
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

async function getProjectByProblemTypeProject(bounds, body) {
   let result = [];
   try {
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
      filters = getNewFilter(filters, body);

      const problemTypes = ['Human Connection', 'Geomorphology', 'Vegetation', 'Hydrology', 'Hydraulics'];
      for (const type of problemTypes) {
         let counter = 0;
         for (const table of PROJECT_TABLES) {
            const newfilter = createQueryByProblemType(type, table);
            const query = { q: `select count(*) as count from ${table} where ${filters} and ${newfilter} ` };
            logger.info(`Starting function needle for mapgallery.project.route/`);
            const data = await needle('post', CARTO_URL, query, { json: true });
            logger.info(`Finished function needle for mapgallery.project.route/`);

            if (data.statusCode === 200) {
               counter += data.body.rows[0].count;
            } else {
               logger.error('Error on getProjectByProblemTypeProject');
               logger.error(data.statusCode);
               logger.error(table);
               if (data.body.error && data.body.hint) {
                  logger.error(data.body.error);
                  logger.error(data.body.hint);
               } else {
                  logger.error(JSON.stringify(data.body));
               }
               logger.error('query.q', query.q);
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

async function countTotalProjects(bounds, body) {
   const coords = bounds.split(',');
   let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
     filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
     filters = getNewFilter(filters, body);
 
     let COUNTSQL = PROJECT_TABLES.map(t => {
       return `SELECT count(*) FROM ${t} where ${filters}`
     }).join(' union ');
     const query = { q: ` ${COUNTSQL} ` };
     try {
      logger.info(`Starting function needle for mapgallery.project.route/`);
      const lineData = await needle('post', CARTO_URL, query, { json: true });
      logger.info(`Finished function needle for mapgallery.project.route/`);
      let total = lineData.body.rows.reduce((p, c) => p + c.count, 0)
      return total;   
     } catch (error) {
      logger.error("Count total projects error ->",error);
     }
     
}

export async function projectCounterRoute(req, res) {
   logger.info(`Starting endpoint mapgallery.project.route/projects-counter with params ${JSON.stringify(req.params, null, 2)}`);
   try {
      const bounds = req.query.bounds;
      const body = req.body;
      logger.info(`Starting function countTotalProjects for mapgallery.project.route/`);
      let total = await countTotalProjects(bounds, body);
      logger.info(`Finished function countTotalProjects for mapgallery.project.route/`);
      res.status(200).send({
         total
      });
   } catch (error) {
      logger.error(error);
      logger.error(`countTotalProjects Connection error`);
   }
}

export async function projectParamFilterRoute(req, res) {
   logger.info(`Starting endpoint mapgallery.project.route/params-filter-projects with params ${JSON.stringify(req.params, null, 2)}`);
   try {
      const bounds = req.query.bounds;
      const body = req.body;

      let requests = [];

      requests.push(getValuesByColumnWithOutCountProject('creator', bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('mhfdmanager', bounds, body));

      requests.push(getCountByArrayColumnsProject('projecttype', ['Maintenance', 'Study', 'Capital'], bounds, body, true));
      requests.push(getCountByArrayColumnsProject('status', statusList, bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('startyear', bounds, body));
      requests.push(getValuesByColumnWithOutCountProject(COMPLETE_YEAR_COLUMN, bounds, body));
      requests.push(getValuesByRangeProject('mhfddollarsallocated', bounds, body));
      requests.push(getCountWorkYearProject([{ year: 2019, column: 'workplanyr1' }, { year: 2020, column: 'workplanyr2' },
      { year: 2021, column: 'workplanyr3' }, { year: 2022, column: 'workplanyr4' }, { year: 2023, column: 'workplanyr5' }], bounds, body));
      requests.push(getProjectByProblemTypeProject(bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('lgmanager', bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('streamname', bounds, body));
      requests.push(getValuesByRangeProject('estimatedcost', bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('consultant', bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('contractor', bounds, body));

      requests.push(getValuesByColumnWithOutCountProject('jurisdiction', bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('county', bounds, body, true));
      requests.push(getValuesByColumnWithOutCountProject('servicearea', bounds, body, true));

      logger.info(`Starting function all for mapgallery.project.route/`);
      const promises = await Promise.all(requests);
      logger.info(`Finished function all for mapgallery.project.route/`);

      const result = {
         "creator": promises[0],
         "mhfdmanager": promises[1],
         "projecttype": promises[2],
         "status": promises[3],
         "startyear": promises[4],
         "completedyear": promises[5],
         "mhfddollarsallocated": promises[6],
         "workplanyear": promises[7],
         "problemtype": promises[8],
         "jurisdiction": promises[14],
         "county": promises[15],
         "lgmanager": promises[9],
         "streamname": promises[10],
         "estimatedCost": promises[11],
         "consultant": promises[12],
         "contractor": promises[13],
         "servicearea": promises[16]
      }
      res.status(200).send(result);
   } catch (error) {
      logger.error(error);
      logger.error(`projectParamFilterRoute Connection error`);
   }
}

export const projectStatistics = async (request, response) => {
   logger.info(`Starting endpoint mapgallery.project.route/params-filter-statitics with params ${JSON.stringify(req.params, null, 2)}`);
   const column = request.query.column;
   const bounds = request.query.bounds;
   const body = request.body;
   if (!column) {
      return response.status(404).send({error: 'Query param "column" is required'});
   }
   const columnsWithoutCount = ['creator', 'mhfdmanager', 'startyear', COMPLETE_YEAR_COLUMN, 'lgmanager', 'streamname', 'consultant', 'contractor', 'jurisdiction', 'county', 'servicearea'];
   const columnsWithCount = ['projecttype', 'status'];
   const columnsWithRanges = ['mhfddollarsallocated', 'estimatedcost'];
   if (columnsWithoutCount.includes(column)) {
      return response.status(200).send(await getValuesByColumnWithOutCountProject(column, bounds, body));
      
   } else if (columnsWithCount.includes(column)) {
      const mapColumnsWithCount = {
         'projecttype': ['Maintenance', 'Study', 'Capital'],
         'status': statusList
      }
      return response.status(200).send(await getCountByArrayColumnsProject(column, mapColumnsWithCount[column], bounds, body))
   } else if (columnsWithRanges.includes(column)) {
      return response.status(200).send(await getValuesByRangeProject(column, bounds, body))
   } else if (column === 'workplanyr') {
      const yearArray = [{ year: 2019, column: 'workplanyr1' }, { year: 2020, column: 'workplanyr2' },
      { year: 2021, column: 'workplanyr3' }, { year: 2022, column: 'workplanyr4' }, { year: 2023, column: 'workplanyr5' }];
      return response.status(200).send(await getCountWorkYearProject(yearArray, bounds, body));
   } else if (column === 'problemtype') {
      return response.status(200).send(await getProjectByProblemTypeProject(bounds, body))
   }
}
