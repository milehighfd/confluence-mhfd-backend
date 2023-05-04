import needle from 'needle';
import { CARTO_URL } from 'bc/config/config.js';
import logger from 'bc/config/logger.js';
import groupService from 'bc/services/group.service.js';
import { getActions } from 'bc/utils/functionsComponents.js';

const distanceInYears = 1;

const TABLES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
  'special_item_linear', 'special_item_area', 'channel_improvements_linear',
  'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
  'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'
  // TO DO: add stream improvement measure after client modifies table in carto UPDATE using copy of table with columns names fixed
  ,'stream_improvement_measure_copy'
];

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
    let jurisdictions = body.jurisdiction.split(',');
    let jurisdictionsIn = jurisdictions.map(s => `'${s}'`)
    filters += ` and jurisdiction in (${jurisdictionsIn.join(',')})`;
  }
  if (body.mhfdmanager) {
    let mhfdmanagers = body.mhfdmanager.split(',');
    let mhfdmanagersIn = mhfdmanagers.map(s => `'${s}'`)
    filters += ` and mhfdmanager in (${mhfdmanagersIn.join(',')})`;
  }
  if (body.county) {
    let counties = body.county.split(',');
    let countiesIn = counties.map(s => {
      if (s.includes(' County')) {
        s = s.substring(0, s.length - ' County'.length);
      }
      return `'${s}'`;
    })
    filters += ` and county in (${countiesIn.join(',')})`
  }
  if (body.servicearea) {
    let serviceareas = body.servicearea.split(',');
    let serviceareasIn = serviceareas.map(s => `'${s}'`)
    filters += ` and servicearea in (${serviceareasIn.join(',')})`
  }
  console.log('\n\n ****** \n\n FILTERS \n ******* \n', filters);
  return filters;
}

export async function getCounterComponentsWithFilter(bounds, body) {
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

    for (const component of TABLES_COMPONENTS) {
      let answer = [];
      const SQL = `SELECT type FROM ${component} where ${filters} group by type `;
      const query = { q: ` ${SQL} ` };
      logger.info(`Starting function needle for mapgallery.components.route/`);
      const data = await needle('post', CARTO_URL, query, { json: true });
      logger.info(`Finished function needle for mapgallery.components.route/`);
      if (data.statusCode === 200) {
        answer = data.body.rows;
      } else if (data.statusCode === 400) {
        logger.error('data.statusCode 400', data.body);
      } else {
        logger.error('Error on getCounterComponentsWithFilter');
        logger.error(data.statusCode);
        logger.error(data.body);
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

export async function getComponentsValuesByColumnWithFilter(column, bounds, body) {

  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

    const LINE_SQL = TABLES_COMPONENTS.map((t) => {
      return `SELECT ${column} as column FROM ${t} where ${filters} group by ${column}`
    }).join(' union ')

    const query = { q: ` ${LINE_SQL} ` };
    logger.info(`Starting function needle for mapgallery.components.route/`);
    const data = await needle('post', CARTO_URL, query, { json: true });
    logger.info(`Finished function needle for mapgallery.components.route/`);
    let answer = [];

    if (data.statusCode === 200) {
      answer = data.body.rows;
    } else {
      logger.error('Error on getComponentsValuesByColumnWithFilter');
      logger.error(data.statusCode);
      logger.error(data.body);
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
    logger.error(`getComponentsValuesByColumnWithFilter, Column ${column} Connection error`);
  }

  return result;
}

export async function getCountByYearStudyWithFilter(bounds, body) {
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

      const SQL = TABLES_COMPONENTS.map((t) => {
        return `SELECT count(*) as count FROM ${t} where ${filters} and year_of_study between ${initValue} and ${endValue}`
      }).join(' union ')

      const query = { q: ` ${SQL} ` };
      logger.info(`Starting function needle for mapgallery.components.route/`);
      const data = await needle('post', CARTO_URL, query, { json: true });
      logger.info(`Finished function needle for mapgallery.components.route/`);
      let counter = 0;

      if (data.statusCode === 200) {
        result.push({
          value: value,
          count: counter
        });
      } else {
        logger.error('Error on getCountByYearStudyWithFilter');
        logger.error(data.statusCode);
        logger.error(data.body);
      }
    }
  } catch (error) {
    logger.error(error);
    logger.error(`CountByYearStudy, Values: ${values} Connection error`);
  }

  return result;
}

export async function getComponentsValuesByColumnWithCountWithFilter(column, bounds, body, needCount) {
  console.log('column', column)
  let result = [];
  try {
    const coords = bounds.split(',');
    let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    filters = getNewFilter(filters, body);

    const LINE_SQL = TABLES_COMPONENTS.map((t) => {
      return `SELECT ${needCount ? 'count(*) as count, ': ''} ${column} as column FROM ${t} where ${filters} group by ${column}`
    }).join(' union ')

    const query = { q: ` ${LINE_SQL} ` };
    console.log('queryyyyyyyyyy', query)
    logger.info(`Starting function needle for mapgallery.components.route/`);
    const data = await needle('post', CARTO_URL, query, { json: true });
    logger.info(`Finished function needle for mapgallery.components.route/`);
    console.log('dataaaaaaaaaaa: ', data.body)
    let answer = [];
    if (data.statusCode === 200) {
      answer = data.body.rows;
    } else {
      logger.error('Error on getComponentsValuesByColumnWithCountWithFilter');
      logger.error(data.statusCode);
      logger.error(data.body);
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
    logger.error(`getComponentsValuesByColumnWithCountWithFilter, Column ${column} Connection error`);
  }

  return result;
}

export async function getQuintilComponentValuesWithFilter(column, bounds, body) {
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

    logger.info(`Starting function needle for mapgallery.components.route/`);
    const lineData = await needle('post', CARTO_URL, lineQuery, { json: true });
    logger.info(`Finished function needle for mapgallery.components.route/`);

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

export async function countTotalComponent(bounds, body) {
  const coords = bounds.split(',');
  let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
    filters = getNewFilter(filters, body);

    let COUNTSQL = TABLES_COMPONENTS.map(t => {
      return `SELECT count(*) FROM ${t} where ${filters}`
    }).join(' union ');
    console.log('COUNTES AL', COUNTSQL);
    const query = { q: ` ${COUNTSQL} ` };
    logger.info(`Starting function needle for mapgallery.components.route/`);
    const lineData = await needle('post', CARTO_URL, query, { json: true });
    logger.info(`Finished function needle for mapgallery.components.route/`);
    if (lineData.statusCode === 200) {
      let total = lineData.body.rows.reduce((p, c) => p + c.count, 0)
      return total;
    } else {
      logger.error('countTotalComponent error');
      logger.error(lineData.statusCode);
      logger.error(lineData.body);
    }
}

export async function componentCounterRoute(req, res) {
  logger.info(`Starting endpoint mapgallery.route/components-counter with params ${JSON.stringify(req.params, null, 2)}`);
  try {
     const bounds = req.query.bounds;
     const body = req.body;
     logger.info(`Starting function countTotalComponent for mapgallery.components.route/`);
     let total = await countTotalComponent(bounds, body);
     logger.info(`Finished function countTotalComponent for mapgallery.components.route/`);
     res.status(200).send({
        total
     });
  } catch (error) {
     logger.error(error);
     logger.error(`countTotalComponent Connection error`);
  }
}

  let actionStatuses = [
    {value: "TBD", id: 1},
    {value: "Proposed", id: 2},
    {value: "Existing", id: 3},
    {value: "Complete", id: 4},
    {value: "Completed", id: 5},
    {value: "Constructed", id: 6},
    {value: "Archived", id: 7}
  ];

  let componentTypes = [
    {value: "Grade Control Structure"},
    {value: "Pipe Appurtenances"},
    {value: "Special Item Point"},
    {value: "Special Item Linear"},
    {value: "Special Item Area"},
    {value: "Channel Improvements Lin"},
    {value: "Channel Improvements Area"},
    {value: "Removal Line"},
    {value: "Removal Area"},
    {value: "Storm Drain"},
    {value: "Detention Facilities"},
    {value: "Maintenance Trails"},
    {value: "Land Acquisition"},
    {value: "Landscaping Area"},
    {value: "Stream Improvement"}
  ]

export async function componentFilterIds(req, res) {
  try {
    const bounds = req.query.bounds;
    const body = req.body;
    const data = {};    
    const allActions = await getActions(body);  
    // console.log('All Actions', allActions);
    const actionsIds = allActions.map(value => ({
      ...value,
      actions: value.actions.map(act => act.component_id)
    }));
    res.status(200).send(actionsIds);
  } catch (error) {
    logger.error('Error at' + error);
  }
}

export async function componentParamFilterCounter(req, res) {
  try {
    const bounds = req.query.bounds;
    const body = req.body;
    const data = {};
    let dataPromises = [
      groupService.getJurisdiction(),   //0
      groupService.getCounty(),         //1
      groupService.getServiceArea(),    //2
      groupService.getMhfdStaff(),      //3
    ];
    //TODO: action type is the list of all actions

    let resolvedPromises = await Promise.all(dataPromises);

    data.status = actionStatuses;
    data.jurisdiction = resolvedPromises[0];
    data.county = resolvedPromises[1];
    data.servicearea = resolvedPromises[2];
    data.mhfdmanager = resolvedPromises[3];
    data.estimatedCost = [];
    data.yearofstudy = [];
    data.actiontype = []; //TODO: list of actions
    
    const filters = {
      ...body,
      servicearea: body.servicearea ? body.servicearea.split(','): '',
      county: body.county ? body.county.split(','): '',
      component_type: body.component_type ? body.component_type.split(','): '',
      status: body.status ? body.status.split(','): '',
      jurisdiction: body.jurisdiction ? body.jurisdiction.split(','): '',
      mhfdmanager: body.mhfdmanager ? body.mhfdmanager.split(','): '' 
    };
    console.log('filters', filters);
    const allActions = await getActions(filters, bounds);

    const result = {
      "component_type":  componentTypes,
      "status":  actionStatuses,
      "yearofstudy":  null,
      "mhfdmanager":  data.mhfdmanager,
      "estimatedcost":  null,
      "jurisdiction":  data.jurisdiction,
      "county":  data.county,
      "servicearea":  data.servicearea
    };

    let allActionCounter = allActions.map((group) => group.actions);
    let newAllactionCounter =[].concat.apply([], allActionCounter);
    
    result.county.forEach((d) => {
        d.counter = newAllactionCounter.reduce((pre, current) => {
          if (current?.county=== d.value) {
            return pre + 1;
          }
          return pre;
        }, 0);
    });
    result.servicearea.forEach((d) => {
      d.counter = newAllactionCounter.reduce((pre, current) => {
        if (current.servicearea && current?.servicearea === d.value) {
          return pre + 1;
        } 
        if (current.service_area && current?.service_area === d.value) {
          return pre + 1;
        } 
        return pre;
      }, 0);
    });
    const actionsIds = allActions.map(value => ({
      ...value,
      actions: value.actions.map(act => act.component_id)
    }));
    res.status(200).send({
      filtersData: result,
      actionsIds: actionsIds
    });
  } catch (error) {
    logger.error(error);
  } 
}
export async function componentParamFilterRoute(req, res) {
  logger.info(`Starting endpoint mapgallery.component.route/params-filter-components with params ${JSON.stringify(req.params, null, 2)}`);
  try {
     const bounds = req.query.bounds;
     const body = req.body;
     console.log('bodyyyyyyyyyyyyyyy', body)
     let requests = [];
     requests.push(getCounterComponentsWithFilter(bounds, body));
     requests.push(getComponentsValuesByColumnWithFilter('status', bounds, body));
     requests.push(getCountByYearStudyWithFilter(bounds, body));
     requests.push(getComponentsValuesByColumnWithCountWithFilter('mhfdmanager', bounds, body));
     requests.push(getQuintilComponentValuesWithFilter('estimated_cost', bounds, body));
     requests.push(getComponentsValuesByColumnWithCountWithFilter('jurisdiction', bounds, body));
     requests.push(getComponentsValuesByColumnWithCountWithFilter('county', bounds, body, true));
     requests.push(getComponentsValuesByColumnWithCountWithFilter('servicearea', bounds, body, true));

     logger.info(`Starting function allSettled for mapgallery.components.route/`);
     const promises = await Promise.allSettled(requests);
     logger.info(`Finished function allSettled for mapgallery.components.route/`);

     const result = {
        "component_type": promises[0].status === 'fulfilled' ? promises[0].value : null,
        "status": promises[1].status === 'fulfilled' ? promises[1].value : null,
        "yearofstudy": promises[2].status === 'fulfilled' ? promises[2].value : null,
        "watershed": promises[3].status === 'fulfilled' ? promises[3].value : null,
        "estimatedcost": promises[4].status === 'fulfilled' ? promises[4].value : null,
        "jurisdiction": promises[5].status === 'fulfilled' ? promises[5].value : null,
        "county": promises[6].status === 'fulfilled' ? promises[6].value : null,
        "servicearea": promises[7].status === 'fulfilled' ? promises[7].value : null
     };
     res.status(200).send(result);
  } catch (error) {
     logger.error(error);
     logger.error(`getSubtotalsByComponent Connection error`);
  }
}
