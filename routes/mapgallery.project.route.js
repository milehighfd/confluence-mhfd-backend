const { CARTO_TOKEN } = require('../config/config');
const logger = require('../config/logger');
const needle = require('needle');

const PROJECT_TABLES = ['mhfd_projects'];

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
     let column = 'completedyear';
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
     let countiesIn = counties.map(s => `'${s}'`)
     filters += ` and county1 in (${countiesIn.join(',')})`
   }
   if (body.servicearea) {
     let serviceareas = body.servicearea.split(',');
     let serviceareasIn = serviceareas.map(s => `'${s}'`)
     filters += ` and servicearea in (${serviceareasIn.join(',')})`
   }
   return filters;
 }

async function getValuesByColumnWithOutCountProject(table, column, bounds, body) {
   let result = [];
   try {
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      let answer = [];
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

      filters = getNewFilter(filters, body);

      for (const table1 of PROJECT_TABLES) {
         const query = { q: `select ${column} as value, count(*) as counter from ${table1} where ${filters} group by ${column} order by ${column} ` };
         const data = await needle('post', URL, query, { json: true });
         if (data.statusCode === 200) {
            answer = answer.concat(data.body.rows);
         } else {
            console.log('data.statusCode', data.statusCode, table, column, data.body)
            console.log('query.q', query.q)
         }
      }
      if (column === 'startyear' || column === 'completedyear') {
         for (const table1 of PROJECT_TABLES) {
            const query = { q: `select DISTINCT(${column}) as value from ${table1} order by ${column} ` };
            const data = await needle('post', URL, query, { json: true });
            if (data.statusCode === 200) {
               answer = answer.concat(data.body.rows
                  .map((r) => {
                     return { value: r.value, counter: 0 }
                  })
               );
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
      logger.error(`Get Value by Column, Table: ${table} Column: ${column} Connection error`);
   }

   return result;
}

async function getCountByArrayColumnsProject(table, column, columns, bounds, body) {
   let result = [];
   try {
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

      filters = getNewFilter(filters, body);

      for (const value of columns) {
         let answer = [];
         const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
         let counter = 0;
         for (const table1 of PROJECT_TABLES) {
            const query = {
               q: `select ${column} as column, count(*) as count from ${table1} 
       where ${column}='${value}' and ${filters} group by ${column} order by ${column} `
            };
            const data = await needle('post', URL, query, { json: true });

            if (data.statusCode === 200) {
               if (data.body.rows.length > 0) {
                  answer = answer.concat(data.body.rows);
               }
            } else {
               console.log('data.statusCode', data.statusCode, table, column, data.body)
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
      logger.error(`getCountByArrayColumnsProject Table: ${table}, Column: ${column} Connection error`);
   }

   return result;
}

async function getValuesByRangeProject(table, column, range, bounds, body) {  
   let result = [];
   try {
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
      filters = getNewFilter(filters, body);
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

      const newProm1 = new Promise(async (resolve, reject) => {
         let minRange, maxRange;

         let bodyColumn = column === 'estimatedcost' ? body['totalcost'] : body[column];
         if (bodyColumn && bodyColumn.length !== 0) {
            let minPair = bodyColumn[0];
            let maxPair = bodyColumn[bodyColumn.length - 1];
            let minimumValue = minPair.split(',')[0];
            let maximumValue = maxPair.split(',')[1];
            minRange = +minimumValue;
            maxRange = +maximumValue;
         } else {
            const minMaxQuery = {
               q: PROJECT_TABLES.map(t => {
                  return `SELECT max(${column}) as max, min(${column}) as min FROM ${t} where ${filters}`;
               }).join(' union ')
            }
            const minMaxData = await needle('post', URL, minMaxQuery, { json: true });
            const minMaxResult = minMaxData.body.rows;
            minRange = Math.min.apply(Math, minMaxResult.map(function (element) { return element.min }));
            maxRange = Math.max.apply(Math, minMaxResult.map(function (element) { return element.max }));
         }

         let width = maxRange - minRange;
         const lenRange = 20;
         let intervalWidth = width / lenRange;
         let result2 = [];
         let epsilon = 0.001;

         for (let i = 0 ; i < lenRange ; i++) {
            const isLast = i === (lenRange - 1);
            let values = {
               min: minRange + i * intervalWidth,
               max: minRange + (i + 1) * intervalWidth - (isLast ? 0 : epsilon)
            }

            let counter = 0;
            for (const table1 of PROJECT_TABLES) {
               const query = {
                  q: `select count(*) from ${table1} where (cast(${column} as real) between ${values.min} and ${values.max}) and ${filters}`
               };
               const data = await needle('post', URL, query, { json: true });
               if (data.statusCode === 200) {
                  const rows = data.body.rows;
                  counter += rows[0].count;
               } else {
                  console.log('data.statusCode', data.statusCode, table, column, data.body)
                  console.log('query.q', query.q)
               }
            }

            result2.push({ min: values.min, max: values.max, counter: counter, last: isLast });
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

async function getCountWorkYearProject(data, bounds, body) {
   let result = [];
   try {
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      const coords = bounds.split(',');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

      filters = getNewFilter(filters, body);

      for (const value of data) {
         let counter = 0;
         if (!body.workplanyear || value.year == `${body.workplanyear}`) {
            for (const table of PROJECT_TABLES) {
               const query = { q: `select count(*) as count from ${table} where ${filters} and ${value.column} > 0 ` };
               const d = await needle('post', URL, query, { json: true });
               if (d.statusCode === 200) {
                  if (d.body.rows.length > 0) {
                     counter += d.body.rows[0].count;
                  }
               } else {
                  console.log('data.statusCode', data.statusCode, table, value.column, data.body)
                  console.log('query.q', query.q)
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
      query += operator + ` select projectid from ${component}, problems where projectid = ${project}.projectid 
   and ${component}.problemid = problems.problemid and problemtype='${problemType}' `;
      operator = ' union ';

   }
   query = ` projectid in (${query})`;
   return query;
}

async function getProjectByProblemTypeProject(bounds, body) {
   let result = [];
   try {
      const coords = bounds.split(',');
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
      filters = getNewFilter(filters, body);

      const problemTypes = ['Human Connection', 'Geomorphology', 'Vegetation', 'Hydrology', 'Hydraulics'];
      for (const type of problemTypes) {
         let counter = 0;
         for (const table of PROJECT_TABLES) {
            const newfilter = createQueryByProblemType(type, table);
            const query = { q: `select count(*) as count from ${table} where ${filters} and ${newfilter} ` };
            const data = await needle('post', URL, query, { json: true });

            if (data.statusCode === 200) {
               counter += data.body.rows[0].count;
            } else {
               console.log('data.statusCode', data.statusCode, table, data.body)
               console.log('query.q', query.q)
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
     const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
     const lineData = await needle('post', URL, query, { json: true });
     
     let total = lineData.body.rows.reduce((p, c) => p + c.count, 0)
     return total;
}

async function projectCounterRoute(req, res) {
   try {
      const bounds = req.query.bounds;
      const body = req.body;
      let total = await countTotalProjects(bounds, body);
      res.status(200).send({
         total
      });
   } catch (error) {
      logger.error(error);
      logger.error(`countTotalProjects Connection error`);
   }
}

async function projectParamFilterRoute(req, res) {
   try {
      const bounds = req.query.bounds;
      const body = req.body;

      let requests = [];

      requests.push(getValuesByColumnWithOutCountProject('mhfd_projects', 'creator', bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('mhfd_projects', 'mhfdmanager', bounds, body));

      requests.push(getCountByArrayColumnsProject('mhfd_projects', 'projecttype', ['Maintenance', 'Study', 'Capital'], bounds, body));
      requests.push(getCountByArrayColumnsProject('mhfd_projects', 'status', ['Draft', 'Requested',
         'Approved', 'Idle', 'Initiated', 'Ongoing',
         'Preliminary Design', 'Construction', 'Final Design', 'Permit Monitoring',
         'Hydrology', 'Floodplain', 'Alternatives', 'Conceptual', 'Complete'], bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('mhfd_projects', 'startyear', bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('mhfd_projects', 'completedyear', bounds, body));
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
      requests.push(getValuesByRangeProject('mhfd_projects', 'mhfddollarsallocated', rangeMhfdDollarsAllocated, bounds, body));
      requests.push(getCountWorkYearProject([{ year: 2019, column: 'workplanyr1' }, { year: 2020, column: 'workplanyr2' },
      { year: 2021, column: 'workplanyr3' }, { year: 2022, column: 'workplanyr4' }, { year: 2023, column: 'workplanyr5' }], bounds, body));
      requests.push(getProjectByProblemTypeProject(bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('mhfd_projects', 'lgmanager', bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('mhfd_projects', 'streamname', bounds, body));
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
      requests.push(getValuesByRangeProject('mhfd_projects', 'estimatedcost', rangeTotalCost, bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('mhfd_projects', 'consultant', bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('mhfd_projects', 'contractor', bounds, body));

      requests.push(getValuesByColumnWithOutCountProject('mhfd_projects', 'jurisdiction', bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('mhfd_projects', 'county', bounds, body));
      requests.push(getValuesByColumnWithOutCountProject('mhfd_projects', 'servicearea', bounds, body));

      const promises = await Promise.all(requests);

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
      logger.error(`getSubtotalsByComponent Connection error`);
   }
}

module.exports = {
   projectParamFilterRoute,
   projectCounterRoute,
   countTotalProjects,
   getValuesByColumnWithOutCountProject,
   getCountByArrayColumnsProject,
   getValuesByRangeProject,
   getCountWorkYearProject,
   getProjectByProblemTypeProject
}