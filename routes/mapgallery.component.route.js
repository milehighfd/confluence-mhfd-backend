const { CARTO_TOKEN } = require('../config/config');
const logger = require('../config/logger');
const needle = require('needle');

const distanceInYears = 1;

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
  if (body.estimatedcost && body.estimatedcost.length !== 0) {
    let column = 'estimated_cost';
    let minPair = body.estimatedcost[0];
    let maxPair = body.estimatedcost[body.estimatedcost.length - 1];
    let minimumValue = minPair.split(',')[0];
    let maximumValue = maxPair.split(',')[1];
    filters += ` and ${column} between ${minimumValue} and ${maximumValue}`
  }
  if (body.yearofstudy) {
    let splitted = body.yearofstudy.split(',');
    let column = 'year_of_study';
    let minimumValue = splitted[0];
    let maximumValue = splitted[splitted.length - 1];
    maximumValue = maximumValue === 2020 ? Number(maximumValue) + 10 : Number(maximumValue) + (distanceInYears - 1)
    filters += `and ${column} between ${minimumValue} and ${maximumValue}`;
  }
  if (body.jurisdiction) {
    filters += ` and jurisdiction = '${body.jurisdiction}'`;
  }
  if (body.mhfdmanager) {
    filters += ` and mhfdmanager = '${body.mhfdmanager}'`;
  }
  if (body.county) {
    let counties = body.county.split(',');
    let countiesIn = counties.map(s => {
      if (s.includes(' County')) {
        s = s.substring(0, s.length - ' County'.length);
      }
      return `'${s}'`;
    })
    console.log('countiesIn', countiesIn.join(','));
    filters += ` and county in (${countiesIn.join(',')})`
  }
  if (body.servicearea) {
    let serviceareas = body.servicearea.split(',');
    let serviceareasIn = serviceareas.map(s => `'${s}'`)
    filters += ` and servicearea in (${serviceareasIn.join(',')})`
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
      const SQL = `SELECT type FROM ${component} where ${filters} group by type `;
      const query = { q: ` ${SQL} ` };
      const data = await needle('post', URL, query, { json: true });
      if (data.statusCode === 200) {
        answer = data.body.rows;
      }
      if (data.statusCode === 400) {
        console.log('data.statusCode 400', data.body);
      }
      result.push({
        key: component,
        value: CapitalLetter(component)
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
      return `SELECT ${column} as column FROM ${t} where ${filters} group by ${column}`
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

async function getCountByYearStudyWithFilter(bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

    let values = [];
    for (var y = 1970; y <= 2030; y += distanceInYears) {
      values.push(y);
    }

    for (const value of values) {
      const initValue = Number(value);
      let endValue = 0;
      if (value === 2030) {
        endValue = initValue + 10;
      } else {
        endValue = initValue + (distanceInYears - 1);
      }

      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
      const SQL = TABLES_COMPONENTS.map((t) => {
        return `SELECT count(*) as count FROM ${t} where ${filters} and year_of_study between ${initValue} and ${endValue}`
      }).join(' union ')

      const query = { q: ` ${SQL} ` };
      const data = await needle('post', URL, query, { json: true });
      let counter = 0;

      if (data.statusCode === 200) {
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

async function getComponentsValuesByColumnWithCountWithFilter(column, bounds, body, needCount) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

    const LINE_SQL = TABLES_COMPONENTS.map((t) => {
      return `SELECT ${needCount ? 'count(*) as count, ': ''} ${column} as column FROM ${t} where ${filters} group by ${column}`
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
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

    let MINMAXSQL = '';

    MINMAXSQL = TABLES_COMPONENTS.map(t => {
      return `SELECT max(${column}) as max, min(${column}) as min FROM ${t} where ${filters}`
    }).join(' union ');
    const lineQuery = { q: ` ${MINMAXSQL} ` };
    const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

    const lineData = await needle('post', LINE_URL, lineQuery, { json: true });

    const lineResult = lineData.body.rows;
    const max = Math.max.apply(Math, lineResult.map(function (element) { return element.max }));
    let min = Math.min.apply(Math, lineResult.map(function (element) { return element.min }));
    let numberOfPartitions = 20;
    const difference = Math.round((max - min) / numberOfPartitions);
    let label = '';
    if (max < 1000000) {
      label = 'K';
    } else {
      label = 'M';
    }
    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

    // for (let i = 0; i < numberOfPartitions; i++) {
    //   let min1 = Math.round(min);
    //   let max1 = 0;
    //   let limitCount = 0;
    //   let counter = 0;

    //   if (i === numberOfPartitions - 1) {
    //     max1 = max;
    //     limitCount = max;
    //   } else {
    //     max1 = Math.round(difference * (i + 1));
    //     limitCount = max1;
    //   }

    //   finalResult.push({ min: min1, max: max1, label: label });
    //   min = (difference * (i + 1));
    // }
    let minRange = 0;
    let maxRange = 50000000;
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

      finalResult.push({ min: values.min, max: values.max, label: 'M' });
    }

  } catch (error) {
    logger.error(error);
    logger.error(`Quintil By Components, Column ${column} Connection error`);

  }
  return finalResult;
}

async function countTotalComponent(bounds, body) {
  const coords = bounds.split(',');
  let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
    filters = getNewFilter(filters, body);

    let COUNTSQL = TABLES_COMPONENTS.map(t => {
      return `SELECT count(*) FROM ${t} where ${filters}`
    }).join(' union ');
    const query = { q: ` ${COUNTSQL} ` };
    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
    const lineData = await needle('post', URL, query, { json: true });
    if (lineData.statusCode === 200) {
      let total = lineData.body.rows.reduce((p, c) => p + c.count, 0)
      return total;
    } else {
      logger.error('countTotalComponent error');
      logger.error(lineData.statusCode);
      logger.error(lineData.body);
    }
}

async function componentCounterRoute(req, res) {
  try {
     const bounds = req.query.bounds;
     const body = req.body;
     let total = await countTotalComponent(bounds, body);
     res.status(200).send({
        total
     });
  } catch (error) {
     logger.error(error);
     logger.error(`countTotalComponent Connection error`);
  }
}

async function componentParamFilterRoute(req, res) {
  try {
     const bounds = req.query.bounds;
     const body = req.body;
     let requests = [];
     requests.push(getCounterComponentsWithFilter(bounds, body));
     requests.push(getComponentsValuesByColumnWithFilter('status', bounds, body));
     requests.push(getCountByYearStudyWithFilter(bounds, body));
     requests.push(getComponentsValuesByColumnWithCountWithFilter('mhfdmanager', bounds, body));
     requests.push(getQuintilComponentValuesWithFilter('estimated_cost', bounds, body));
     requests.push(getComponentsValuesByColumnWithCountWithFilter('jurisdiction', bounds, body));
     requests.push(getComponentsValuesByColumnWithCountWithFilter('county', bounds, body, true));
     requests.push(getComponentsValuesByColumnWithCountWithFilter('servicearea', bounds, body, true));

     const promises = await Promise.all(requests);

     const result = {
        "component_type": promises[0],
        "status": promises[1],
        "yearofstudy": promises[2],
        "watershed": promises[3],
        "estimatedcost": promises[4],
        "jurisdiction": promises[5],
        "county": promises[6],
        "servicearea": promises[7]
     };
     res.status(200).send(result);
  } catch (error) {
     logger.error(error);
     logger.error(`getSubtotalsByComponent Connection error`);
  }
}

module.exports = {
  componentParamFilterRoute,
  componentCounterRoute,
  getCounterComponentsWithFilter,
  getComponentsValuesByColumnWithFilter,
  getCountByYearStudyWithFilter,
  getComponentsValuesByColumnWithCountWithFilter,
  getQuintilComponentValuesWithFilter,
  countTotalComponent,
}
