const { CARTO_TOKEN } = require('../config/config');
const logger = require('../config/logger');
const needle = require('needle');

const TABLES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
  'special_item_linear', 'special_item_area', 'channel_improvements_linear',
  'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
  'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];

function CapitalLetter(chain) {
  return chain.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.substring(1))
    .join(' ');
}

const getNewFilter = (filters, body) => {
  if (body.status) {
    let statuses = body.status.split(',');
    let statusesIn = statuses.map(s => `'${s}'`)
    filters += ` and status in (${statusesIn.join(',')})`
  }
  if (body.component_type) {
    let componentTypes = body.component_type.split(',');
    let componentTypesIn = componentTypes.map(s => `'${CapitalLetter(s)}'`)
    filters += ` and type in (${componentTypesIn.join(',')})`
  }
  return filters;
}

async function getCounterComponentsWithFilter(bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

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
      if (data.statusCode === 400) {
        console.log('data.statusCode 400', data.body);
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

async function getComponentsValuesByColumnWithFilter(column, bounds, body) {

  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

    const LINE_SQL = TABLES_COMPONENTS.map((t) => {
      return `SELECT ${column} as column, count(*) as count FROM ${t} where ${filters} group by ${column}`
    }).join(' union ')

    // const LINE_SQL = `SELECT ${column} as column, count(*) as count FROM grade_control_structure where ${filters} group by ${column} union
    // SELECT ${column} as column, count(*) as count FROM pipe_appurtenances where ${filters} group by ${column} union
    // SELECT ${column} as column, count(*) as count FROM special_item_point where ${filters} group by ${column} union
    // SELECT ${column} as column, count(*) as count FROM special_item_linear where ${filters} group by ${column} union
    // SELECT ${column} as column, count(*) as count FROM special_item_area where ${filters} group by ${column} union
    // SELECT ${column} as column, count(*) as count FROM channel_improvements_linear where ${filters} group by ${column} union
    // SELECT ${column} as column, count(*) as count FROM channel_improvements_area where ${filters} group by ${column} union
    // SELECT ${column} as column, count(*) as count FROM removal_line where ${filters} group by ${column} union
    // SELECT ${column} as column, count(*) as count FROM removal_area where ${filters} group by ${column} union
    // SELECT ${column} as column, count(*) as count FROM storm_drain where ${filters} group by ${column} union
    // SELECT ${column} as column, count(*) as count FROM detention_facilities where ${filters} group by ${column} union
    // SELECT ${column} as column, count(*) as count FROM maintenance_trails where ${filters} group by ${column} union
    // SELECT ${column} as column, count(*) as count FROM land_acquisition where ${filters} group by ${column} union
    // SELECT ${column} as column, count(*) as count FROM landscaping_area where ${filters} group by ${column} `;

    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
    const query = { q: ` ${LINE_SQL} ` };
    const data = await needle('post', URL, query, { json: true });
    let answer = [];

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

async function getCountByYearStudyWithFilter(values, bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

    for (const value of values) {
      const initValue = Number(value);
      let endValue = 0;
      if (value === '2020') {
        endValue = initValue + 10;
      } else {
        endValue = initValue + 9;
      }

      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      const SQL = TABLES_COMPONENTS.map((t) => {
        return `SELECT count(*) as count FROM ${t} where ${filters} and year_of_study between ${initValue} and ${endValue}`
      }).join(' union ')

      const query = { q: ` ${SQL} ` };
      const data = await needle('post', URL, query, { json: true });
      let counter = 0;

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

async function getComponentsValuesByColumnWithCountWithFilter(column, bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

    const LINE_SQL = TABLES_COMPONENTS.map((t) => {
      return `SELECT count(*) as count, ${column} as column FROM ${t} where ${filters} group by ${column}`
    }).join(' union ')

    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

    const query = { q: ` ${LINE_SQL} ` };
    const data = await needle('post', URL, query, { json: true });
    let answer = [];
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

async function getQuintilComponentValuesWithFilter(column, bounds, body) {
  let finalResult = [];
  try {
    let MINMAXSQL = '';

    MINMAXSQL = TABLES_COMPONENTS.map(t => {
      return `SELECT max(${column}) as max, min(${column}) as min FROM ${t}`
    }).join(' union ');
    const lineQuery = { q: ` ${MINMAXSQL} ` };
    const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
    const lineData = await needle('post', LINE_URL, lineQuery, { json: true });


    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    // filters = getNewFilter(filters, body);

    const lineResult = lineData.body.rows;
    const max = Math.max.apply(Math, lineResult.map(function (element) { return element.max }));
    let min = Math.min.apply(Math, lineResult.map(function (element) { return element.min }));
    const difference = Math.round((max - min) / 5);
    let label = '';
    if (max < 1000000) {
      label = 'K';
    } else {
      label = 'M';
    }
    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

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

      let val = `${min1},${max1}`;
      if (!body.estimatedcost || body.estimatedcost.length === 0 || body.estimatedcost.includes(val)) { 
        let query1 = TABLES_COMPONENTS.map(t => {
          return `SELECT count(*) FROM ${t} where (${column} between ${min1} and ${limitCount}) and ${filters}`
        }).join(' union ');

        const query = { q: `${query1} ` };
        const data = await needle('post', URL, query, { json: true });
        if (data.statusCode === 200) {
          const result = data.body.rows;
          for (const row of result) {
            counter += row.count;
          }
        } else {
          console.log('error');
        }
      }
      finalResult.push({ min: min1, max: max1, label: label, counter: counter });
      min = (difference * (i + 1));
    }

  } catch (error) {
    logger.error(error);
    logger.error(`Quintil By Components, Column ${column} Connection error`);

  }
  return finalResult;
}

module.exports = {
  getCounterComponentsWithFilter,
  getComponentsValuesByColumnWithFilter,
  getCountByYearStudyWithFilter,
  getComponentsValuesByColumnWithCountWithFilter,
  getQuintilComponentValuesWithFilter,
}
