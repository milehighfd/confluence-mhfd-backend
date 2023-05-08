import needle from 'needle';
import {
  CARTO_URL,
  PROBLEM_TABLE,
  PROPSPROBLEMTABLES
} from 'bc/config/config.js';
import logger from 'bc/config/logger.js';

const getNewFilter = (filters, body, withPrefix) => {
  let prefix = '';
  if (withPrefix) {
    prefix = `${PROBLEM_TABLE}.`;
  }
  if (body.problemtype) {
    let problemtype = body.problemtype.split(',');
    let problemtypeIn = problemtype.map(s => `'${s}'`)
    filters += ` and ${prefix}${PROPSPROBLEMTABLES.problem_boundary[8]} in (${problemtypeIn.join(',')})`
  }
  if (body.cost && body.cost.length !== 0) {
    let column = `${prefix}${PROPSPROBLEMTABLES.problem_boundary[0]}`;
    let minPair = body.cost[0];
    let maxPair = body.cost[body.cost.length - 1];
    let minimumValue = minPair.split(',')[0];
    let maximumValue = maxPair.split(',')[1];
    filters += ` and ${column} between ${minimumValue} and ${maximumValue}`
  }
  if (body.solutionstatus) {
    const ranges = body.solutionstatus.split(',');
    const statusfilters = [];
    for(let index = 0 ; index < ranges.length; ++index) {
      let endValue = 0;
      let value = +ranges[index];
      if (value === 75) {
        endValue = value + 25;
      } else {
        endValue = value + 24;
      }
      statusfilters.push(`${prefix}${PROPSPROBLEMTABLES.problem_boundary[1]} between ${value} and ${endValue}`);
    }
    filters += ` and (${statusfilters.join(' or ')})`
    
  }
  if (body.priority) {
    let priorities = body.priority.split(',');
    let prioritiesIn = priorities.map(s => `'${s}'`)
    filters += ` and ${prefix}${PROPSPROBLEMTABLES.problem_boundary[7]} in (${prioritiesIn.join(',')})`
  }
  if (body.county) {
    let counties = body.county.split(',');
    let countiesIn = counties.map(s => {
      if (s.includes(' County')) {
        s = s.substring(0, s.length - ' County'.length);
      }
      return `'${s}'`;
    })
    filters += ` and ${prefix}county in (${countiesIn.join(',')})`
  }
  if (body.servicearea) {
    let serviceareas = body.servicearea.split(',');
    let serviceareasIn = serviceareas.map(s => {
      if (s.includes(' Service Area')) {
        s = s.substring(0, s.length - ' Service Area'.length);
      }
      return `'${s}'`
    })
    filters += ` and ${prefix}${PROPSPROBLEMTABLES.problem_boundary[9]} in (${serviceareasIn.join(',')})`
  }
  if (body.jurisdiction) {
    filters += ` and ${prefix}${PROPSPROBLEMTABLES.problem_boundary[2]} = '${body.jurisdiction}'`;
  }
  if (body.mhfdmanager) {
    filters += ` and ${prefix}${PROPSPROBLEMTABLES.problem_boundary[3]} = '${body.mhfdmanager}'`;
  }
  if (body.keyword) {
    filters += ` and ${prefix}${PROPSPROBLEMTABLES.problem_boundary[6]} ilike '%${body.keyword}%'`;
  }
  return filters;
}

export async function getCountByArrayColumnsProblem(table, column, columns, bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters;
    if (coords) {
      filters  = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
    }
    

    filters = getNewFilter(filters, body);

    for (const value of columns) {
      const query = {
        q: `select ${column} as column, count(*) as count from ${table} where ${column}='${value}' and ${filters} group by ${column} order by ${column} `
      };
      let counter = 0;
      logger.info(`Starting function needle for getCountByArrayColumnsProblem`);
      const data = await needle('post', CARTO_URL, query, { json: true });
      logger.info(`Finished function needle for getCountByArrayColumnsProblem`);
      console.log('Query at array column problem', query);
      //console.log('STATUS', data.statusCode);
      if (data.statusCode === 200) {
        //const result1 = data.body.rows;
        if (data.body.rows.length > 0) {
          counter = data.body.rows[0].count
        }

      } else {
        console.log('data.statusCode', data.statusCode);
        console.log('data.body', data.body);
      }
      result.push({
        value: value,
        counter: counter
      });
    }
  } catch (error) {
    logger.error(error);
    logger.error(`getCountByArrayColumns Table: ${table}, Column: ${column} Connection error`);
  }

  return result;
}

export async function getCountByColumnProblem(table, column, bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

      const query = {
        q: `select ${column} as value, count(*) as counter from ${table} where ${filters} group by ${column} order by ${column} `
      };
      console.log('query at array count by', query);
      logger.info(`Starting function needle for getCountByColumnProblem`);
      const data = await needle('post', CARTO_URL, query, { json: true });
      logger.info(`Finished function needle for getCountByColumnProblem`);
      if (data.statusCode === 200) {
        if (data.body.rows.length > 0) {
          result = result.concat(data.body.rows)
        }
      }
  } catch (error) {
    logger.error(error);
    logger.error(`getCountByColumnProblem Table: ${table}, Column: ${column} Connection error`);
  }

  return result;
}


export async function getCountSolutionStatusProblem(range, bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

    for (const value of range) {
      let endValue = 0;
      if (+value === 75) {
        endValue = +value + 25;
      } else {
        endValue = +value + 24;
      }

      const query = { q: `select count(*) as count from ${PROBLEM_TABLE} where ${filters} and ${PROPSPROBLEMTABLES.problem_boundary[1]} between ${value} and ${endValue} ` };
      console.log('query at array solution status ', query);
      logger.info(`Starting function needle for mapgallery.problem.route/`);
      const data = await needle('post', CARTO_URL, query, { json: true });
      logger.info(`Finished function needle for mapgallery.problem.route/`);
      let counter = 0;
      if (data.statusCode === 200) {
        if (data.body.rows.length > 0) {
          counter = data.body.rows[0].count;
        }
      } else {
        logger.error('getCountSolutionStatusProblem error');
        logger.error(data.statusCode);
        logger.error(JSON.stringify(data.body));
      }
      result.push({
        value: value,
        counter: counter
      });
    }
  } catch (error) {
    logger.error(error);
    logger.error(`getCountSolutionStatusProblem Connection error`);
  }

  return result;
}

export async function getSubtotalsByComponentProblem(table, columnA, columnB, bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');

    const COMPONENTS = ['Grade Control Structure', 'Pipe Appurtenances', 'Special Item Point',
      'Special Item Linear', 'Special Item Area', 'Channel Improvements Linear',
      'Channel Improvements Area', 'Removal Line', 'Removal Area', 'Storm Drain',
      'Detention Facilities', 'Maintenance Trails', 'Land Acquisition', 'Landscaping Area'];

    for (const tablename of COMPONENTS) {
      const table = tablename.toLowerCase().split(' ').join('_');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), ${table}.the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), ${table}.the_geom))`;

      filters = getNewFilter(filters, body, true);

      const query = { q: `select count(*) from ${table}, ${PROBLEM_TABLE} where ${PROBLEM_TABLE}.${columnA}= ${table}.${columnB} and ${filters} ` };
      console.log('Query at xxx', query.q);
      logger.info(`Starting function needle for getSubtotalsByComponentProblem fn`);
      const data = await needle('post', CARTO_URL, query, { json: true });
      logger.info(`Finished function needle for getSubtotalsByComponentProblem fn`);
      let counter = 0;
      if (data.statusCode === 200) {
        if (data.body.rows.length > 0) {
          counter = data.body.rows[0].count;
        }
      } else {
        logger.error('getSubtotalsByComponentProblem error');
        logger.error(data.statusCode);
        logger.error(data.body);
      }
      result.push({
        key: table,
        value: tablename,
        counter: counter
      });
    }

  } catch (error) {
    logger.error(`getSubtotalsByComponentProblem Connection error`);
    logger.error(error);
  }

  return result;
}

export async function getValuesByRangeProblem(table, column, range, bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
    filters = getNewFilter(filters, body);

    const newProm1 = new Promise(async (resolve, reject) => {
      let minRange, maxRange;
      let bodyColumn = column === PROPSPROBLEMTABLES.problem_boundary[0] ? body['cost'] : body[column];
      if (column === PROPSPROBLEMTABLES.problem_boundary[0]) {
        minRange = 0;
        maxRange = 12000000;
      } else if (bodyColumn && bodyColumn.length !== 0) {
        let minPair = bodyColumn[0];
        let maxPair = bodyColumn[bodyColumn.length - 1];
        let minimumValue = minPair.split(',')[0];
        let maximumValue = maxPair.split(',')[1];
        minRange = +minimumValue;
        maxRange = +maximumValue;
      } else {
        const minMaxQuery = {
            q: `SELECT max(${column}) as max, min(${column}) as min FROM ${table} where ${filters}`
        }
        console.log('query ar min max', minMaxQuery);
        logger.info(`Starting function needle for mapgallery.problem.route/`);
        const minMaxData = await needle('post', CARTO_URL, minMaxQuery, { json: true });
        logger.info(`Finished function needle for mapgallery.problem.route/`);
        const minMaxResult = minMaxData.body.rows || [];
        minRange = Math.min.apply(Math, minMaxResult.map(function (element) { return element.min }));
        maxRange = Math.max.apply(Math, minMaxResult.map(function (element) { return element.max }));
      }

      let width = maxRange - minRange;
      const lenRange = column === PROPSPROBLEMTABLES.problem_boundary[0] ? 13 : 20;
      let intervalWidth = column === PROPSPROBLEMTABLES.problem_boundary[0] ? 1000000 : width / lenRange;
      let result2 = [];
      let epsilon = 0.001;

      for (let i = 0 ; i < lenRange ; i++) {
        const isLast = i === (lenRange - 1);
        let values = {
           min: minRange + i * intervalWidth,
           max: minRange + (i + 1) * intervalWidth - (isLast ? 0 : epsilon)
        }
        let counter = 0;
        const query = { q: `select count(*) from ${table} where (${column} between ${values.min} and ${values.max}) and ${filters} ` };
        console.log('query ar min max range', query.q);
        logger.info(`Starting function needle for mapgallery.problem.route/`);
        const data = await needle('post', CARTO_URL, query, { json: true });
        logger.info(`Finished function needle for mapgallery.problem.route/`);
        if (data.statusCode === 200) {
          const rows = data.body.rows;
          counter = rows[0].count;
        }

        result2.push({ min: values.min, max: values.max, counter: counter, last: isLast });

      }
      resolve(result2);
    });
    logger.info(`Starting function newProm1 for mapgallery.problem.route/`);
    result = await newProm1;
    logger.info(`Finished function newProm1 for mapgallery.problem.route/`);
  } catch (error) {
    logger.error(error);
    logger.error(`Range By Value, Column ${column} Connection error`);
  }
  return result;
}

export async function countTotalProblems(bounds, body) {
  const coords = bounds.split(',');
  let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
    filters = getNewFilter(filters, body);

    let COUNTSQL = `SELECT count(*) FROM ${PROBLEM_TABLE} where ${filters}`;

    const query = { q: ` ${COUNTSQL} ` };
    logger.info(`Starting function needle for mapgallery.problem.route/`);
    const lineData = await needle('post', CARTO_URL, query, { json: true });
    logger.info(`Finished function needle for mapgallery.problem.route/`);

    let total = lineData.body.rows[0].count;
    return total;
}

export async function problemCounterRoute(req, res) {
  logger.info(`Starting endpoint mapgallery.problem.route/problems-counter with params ${JSON.stringify(req.params, null, 2)}`);
  try {
     const bounds = req.query.bounds;
     const body = req.body;
     logger.info(`Starting function countTotalProblems for mapgallery.problem.route/`);
     let total = await countTotalProblems(bounds, body);
     logger.info(`Finished function countTotalProblems for mapgallery.problem.route/`);
     res.status(200).send({
        total
     });
  } catch (error) {
     logger.error(error);
     logger.error(`countTotalProblems Connection error`);
  }
}

export async function problemParamFilterRoute(req, res) {
  logger.info(`Starting endpoint mapgallery.problem.route/params-filter-problems with params ${JSON.stringify(req.params, null, 2)}`);
  try {
     const bounds = req.query.bounds;
     const body = req.body;
     let requests = [];
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
     let problemTypesConst = [ 'Flood Hazard', 'Stream Function', 'Watershed Change'];
     requests.push(getCountByArrayColumnsProblem(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[7], ['High', 'Medium', 'Low'], bounds, body)); //0
     requests.push(getCountSolutionStatusProblem([0, 25, 50, 75], bounds, body)); //1
     requests.push(getCountByColumnProblem(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[3], bounds, body)); //2
     requests.push(getCountByColumnProblem(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[14], bounds, body)); //3
     requests.push(getSubtotalsByComponentProblem(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[5], PROPSPROBLEMTABLES.problems[5], bounds, body)); //4
     requests.push(getValuesByRangeProblem(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[0], rangeSolution, bounds, body)); //5
     requests.push(getCountByColumnProblem(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[2], bounds, body)); //6
     requests.push(getCountByColumnProblem(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[9], bounds, body)); //7
     requests.push(getCountByColumnProblem(PROBLEM_TABLE, 'county', bounds, body)); // 8
     requests.push(getCountByArrayColumnsProblem(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[8], problemTypesConst, bounds, body)); //9

     logger.info(`Starting function all for mapgallery.problem.route/`);
     const promises = await Promise.all(requests);
     logger.info(`Finished function all for mapgallery.problem.route/`);
     const result = {
        "problemtype": promises[9],
        "priority": promises[0],
        "solutionstatus": promises[1],
        "county": promises[8],
        "jurisdiction": promises[6],
        "mhfdmanager": promises[2],
        "source": promises[3],
        "components": promises[4],
        "cost": promises[5],
        "servicearea": promises[7]
     };
     res.status(200).send(result);
  } catch (error) {
     logger.error("error at problem route", error);
     logger.error(`get Error at  Connection error`);
  }
}
