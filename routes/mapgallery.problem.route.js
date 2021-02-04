const { CARTO_TOKEN } = require('../config/config');
const logger = require('../config/logger');
const needle = require('needle');

const getNewFilter = (filters, body, withPrefix) => {
  let prefix = '';
  if (withPrefix) {
    prefix = 'problems.'
  }
  if (body.problemtype) {
    let problemtype = body.problemtype.split(',');
    let problemtypeIn = problemtype.map(s => `'${s}'`)
    filters += ` and ${prefix}problemtype in (${problemtypeIn.join(',')})`
  }
  if (body.cost && body.cost.length !== 0) {
    let column = `${prefix}solutioncost`;
    let minPair = body.cost[0];
    let maxPair = body.cost[body.cost.length - 1];
    let minimumValue = minPair.split(',')[0];
    let maximumValue = maxPair.split(',')[1];
    filters += ` and ${column} between ${minimumValue} and ${maximumValue}`
  }
  if (body.solutionstatus) {
    filters += ` and ${prefix}solutionstatus in (${body.solutionstatus})`
  }
  if (body.priority) {
    let priorities = body.priority.split(',');
    let prioritiesIn = priorities.map(s => `'${s}'`)
    filters += ` and ${prefix}problempriority in (${prioritiesIn.join(',')})`
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
    filters += ` and ${prefix}servicearea in (${serviceareasIn.join(',')})`
  }
  if (body.jurisdiction) {
    filters += ` and jurisdiction = '${body.jurisdiction}'`;
  }
  if (body.mhfdmanager) {
    filters += ` and mhfdmanager = '${body.mhfdmanager}'`;
  }
  return filters;
}

async function getCountByArrayColumnsProblem(table, column, columns, bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

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

async function getCountByColumnProblem(table, column, bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      const query = {
        q: `select ${column} as value, count(*) as counter from ${table} 
             where ${filters} group by ${column} order by ${column} `
      };
      const data = await needle('post', URL, query, { json: true });
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


async function getCountSolutionStatusProblem(range, bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
    for (const value of range) {
      let endValue = 0;
      if (value === 75) {
        endValue = value + 25;
      } else {
        endValue = value + 24;
      }

      const query = { q: `select count(*) as count from problems where ${filters} and solutionstatus between ${value} and ${endValue} ` };
      const data = await needle('post', URL, query, { json: true });
      let counter = 0;
      if (data.statusCode === 200) {
        if (data.body.rows.length > 0) {
          counter = data.body.rows[0].count;
        }
      }
      result.push({
        value: value,
        counter: counter
      });
    }
  } catch (error) {
    logger.error(error);
    logger.error(`getCountSolutionStatus Connection error`);
  }

  return result;
}

async function getSubtotalsByComponentProblem(table, column, bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');

    const COMPONENTS = ['Grade Control Structure', 'Pipe Appurtenances', 'Special Item Point',
      'Special Item Linear', 'Special Item Area', 'Channel Improvements Linear',
      'Channel Improvements Area', 'Removal Line', 'Removal Area', 'Storm Drain',
      'Detention Facilities', 'Maintenance Trails', 'Land Acquisition', 'Landscaping Area'];

    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
    for (const tablename of COMPONENTS) {
      const table = tablename.toLowerCase().split(' ').join('_');
      let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), ${table}.the_geom) or `;
      filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), ${table}.the_geom))`;

      filters = getNewFilter(filters, body, true);

      const query = { q: `select count(*) from ${table}, problems where problems.${column}= ${table}.${column} and ${filters} ` };
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
        counter: counter
      });
    }

  } catch (error) {
    logger.error(error);
    logger.error(`getSubtotalsByComponent Connection error`);
  }

  return result;
}

async function getValuesByRangeProblem(table, column, range, bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
    filters = getNewFilter(filters, body);
    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

    const newProm1 = new Promise(async (resolve, reject) => {
      let minRange, maxRange;
      let bodyColumn = column === 'solutioncost' ? body['cost'] : body[column];
      if (bodyColumn && bodyColumn.length !== 0) {
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
        const query = { q: `select count(*) from ${table} where (${column} between ${values.min} and ${values.max}) and ${filters} ` };
        const data = await needle('post', URL, query, { json: true });
        if (data.statusCode === 200) {
          const rows = data.body.rows;
          counter = rows[0].count;
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

async function countTotalProblems(bounds, body) {
  const coords = bounds.split(',');
  let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
    filters = getNewFilter(filters, body);

    let COUNTSQL = `SELECT count(*) FROM problems where ${filters}`;

    const query = { q: ` ${COUNTSQL} ` };
    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
    const lineData = await needle('post', URL, query, { json: true });

    let total = lineData.body.rows[0].count;
    return total;
}

module.exports = {
  countTotalProblems,
  getCountByArrayColumnsProblem,
  getCountByColumnProblem,
  getCountSolutionStatusProblem,
  getSubtotalsByComponentProblem,
  getValuesByRangeProblem,
}