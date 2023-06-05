import needle from 'needle';
import {
  CARTO_URL,
  PROBLEM_TABLE,
  PROPSPROBLEMTABLES
} from 'bc/config/config.js';
import groupService from 'bc/services/group.service.js';
import logger from 'bc/config/logger.js';
import {
  getDataProblemSql
} from 'bc/services/mapgallery.service.js';
import {
  getFilters
} from 'bc/utils/functionsProblems.js';

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
  // if (body.mhfdmanager) {
  //   filters += ` and ${prefix}${PROPSPROBLEMTABLES.problem_boundary[3]} = '${body.mhfdmanager}'`;
  // }
  if (body.keyword) {
    console.log('filters', filters);
    if (filters.length > 0) {
      filters += ` and (${prefix}${PROPSPROBLEMTABLES.problem_boundary[6]} ilike '%${body.keyword}%' OR ${prefix}${PROPSPROBLEMTABLES.problem_boundary[5]}::text ilike '%${body.keyword}%')`;
    }
    else {
      filters = ` (${prefix}${PROPSPROBLEMTABLES.problem_boundary[6]} ilike '%${body.keyword}%' OR ${prefix}${PROPSPROBLEMTABLES.problem_boundary[5]}::text ilike '%${params.name}%') `;
    }
  }
  if (body.cost.length) {
    
    filters += ` and (${prefix}${PROPSPROBLEMTABLES.problem_boundary[0]} between ${body.cost[0]} and ${ +body.cost[1]-1})`
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
export async function getCountByArrayColumnsProblemWithoutCounter(table, column, columns, bounds, body) {
  let result = [];
  try {
    // const coords = bounds.split(',');
    // let filters;
    // if (coords) {
    //   filters  = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    //   filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
    // }
    

    // filters = getNewFilter(filters, body);

    for (const value of columns) {
    //   const query = {
    //     q: `select ${column} as column, count(*) as count from ${table} where ${column}='${value}' and ${filters} group by ${column} order by ${column} `
    //   };
    //   let counter = 0;
    //   logger.info(`Starting function needle for getCountByArrayColumnsProblem`);
    //   const data = await needle('post', CARTO_URL, query, { json: true });
    //   logger.info(`Finished function needle for getCountByArrayColumnsProblem`);
    //   console.log('Query at array column problem', query);
    //   //console.log('STATUS', data.statusCode);
    //   if (data.statusCode === 200) {
    //     //const result1 = data.body.rows;
    //     if (data.body.rows.length > 0) {
    //       counter = data.body.rows[0].count
    //     }

    //   } else {
    //     console.log('data.statusCode', data.statusCode);
    //     console.log('data.body', data.body);
    //   }
      result.push({
        value: value,
        counter: 0
      });
    }
  } catch (error) {
    logger.error(error);
    logger.error(`getCountByArrayColumns Table: ${table}, Column: ${column} Connection error`);
  }

  return result;
}

export async function getJurisdiction(table, column, bounds, body) {
  let result = [];
  try {
      const query = {
        q: `select distinct ${column} as value from ${table} group by ${column} order by ${column} `
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

export async function getListOfcolumnValues(table, column) {
  let result = [];
  try {
    const query = {
      q: `select distinct ${column} as value from ${table}`
    };
    console.log('QUERY CARTO CHECK', query);
    const data = await needle('post', CARTO_URL, query, { json: true });
    logger.info(`Finished function needle for getCountByColumnProblem`);
    if (data.statusCode === 200) {
      if (data.body.rows.length > 0) {
        result = result.concat(data.body.rows)
      }
    }
  } catch (error) {
    logger.error(error);
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
    // const coords = bounds.split(',');
    // let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    // filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;

    // filters = getNewFilter(filters, body);

    for (const value of range) {
    //   let endValue = 0;
    //   if (+value === 75) {
    //     endValue = +value + 25;
    //   } else {
    //     endValue = +value + 24;
    //   }

      // const query = { q: `select count(*) as count from ${PROBLEM_TABLE} where ${filters} and ${PROPSPROBLEMTABLES.problem_boundary[1]} between ${value} and ${endValue} ` };
      // console.log('query at array solution status ', query);
      // logger.info(`Starting function needle for mapgallery.problem.route/`);
      // const data = await needle('post', CARTO_URL, query, { json: true });
      // logger.info(`Finished function needle for mapgallery.problem.route/`);
      // let counter = 0;
      // if (data.statusCode === 200) {
      //   if (data.body.rows.length > 0) {
          // counter = data.body.rows[0].count;
      //   }
      // } else {
      //   logger.error('getCountSolutionStatusProblem error');
      //   logger.error(data.statusCode);
      //   logger.error(JSON.stringify(data.body));
      // }
      result.push({
        value: value,
        counter: 0
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
    // const coords = bounds.split(',');
    // let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    // filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
    // filters = getNewFilter(filters, body);

    // const newProm1 = new Promise(async (resolve, reject) => {
    //   let result2 = {};
    //   const query = { q: `select count(*) from ${table} where ${filters} ` };
    //     console.log('query ar min max range', query.q);
    //     logger.info(`Starting function needle for mapgallery.problem.route/`);
    //     const data = await needle('post', CARTO_URL, query, { json: true });
    //     logger.info(`Finished function needle for mapgallery.problem.route/`);
    //     if (data.statusCode === 200) {
    //       const rows = data.body.rows;
    //       result2.counter = rows[0].count;
    //     }
    //   resolve(result2);
    // });
    logger.info(`Starting function newProm1 for mapgallery.problem.route/`);
    result = { counter: 0};
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

     let filtersBody = {...req.body, isproblem: true};
     const coords = bounds.split(',');
     let filters;
 
     filters += getFilters(filtersBody);
    filters += `${filters.includes('where')? ' AND ' : ' WHERE '} (ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
     console.log('Filters ', filters);
     let answer = [];
     const PROBLEM_SQL = `SELECT cartodb_id, ${PROPSPROBLEMTABLES.problem_boundary[5]} as ${PROPSPROBLEMTABLES.problems[5]}, ${PROPSPROBLEMTABLES.problem_boundary[8]} as ${PROPSPROBLEMTABLES.problems[8]}, county, ${PROPSPROBLEMTABLES.problem_boundary[9]} FROM ${PROBLEM_TABLE} `;
     const query = { q: `${PROBLEM_SQL} ${filters}` };
     try {
      const data = await needle('post', CARTO_URL, query, { json: true });
      if (data.statusCode === 200) {
        answer = data.body.rows.map(element => {
          return {
            cartodb_id: element.cartodb_id,
            type: 'problem_boundary',
            problemid: element.problemid,
            problemtype: element.problemtype,
            service_area: element.service_area,
            county: element.county,
          }
        })

      } else {
        console.log('bad status', data.statusCode, data.body);
        logger.error('bad status', data.statusCode, data.body);
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

    let problemTypesConst = [ 'Flood Hazard', 'Stream Condition', 'Watershed Change'];
    requests.push(getCountByArrayColumnsProblemWithoutCounter(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[7], ['High', 'Medium', 'Low'], bounds, body)); //0
    requests.push(getCountSolutionStatusProblem([0, 25, 50, 75], bounds, body)); //1
    requests.push(groupService.getMhfdStaff()); //2
    requests.push(getCountByColumnProblem(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[14], bounds, body)); //3
    requests.push(getSubtotalsByComponentProblem(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[5], PROPSPROBLEMTABLES.problems[5], bounds, body)); //4
    requests.push(getValuesByRangeProblem(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[0], rangeSolution, bounds, body)); //5
    requests.push(getJurisdiction(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[2], bounds, body)); //6
    requests.push(getListOfcolumnValues(PROBLEM_TABLE, PROPSPROBLEMTABLES.problem_boundary[9])); //7  
    requests.push(getListOfcolumnValues(PROBLEM_TABLE, 'county')); // 8 

    logger.info(`Starting function all for mapgallery.problem.route/`);
    const promises = await Promise.all(requests);
    logger.info(`Finished function all for mapgallery.problem.route/`);
    let countercounty = [...promises[8]];
    countercounty.forEach((d) => {
      d.counter = queryProblem.reduce((pre, current) => {
        if (current?.county === d.value) {
          return pre + 1;
        }
        return pre;
      }, 0);
    });
    let counterServicearea = [...promises[7]];
    let serviceareaProp = PROPSPROBLEMTABLES.problem_boundary[9];
    counterServicearea.forEach((d) => {
      d.counter = queryProblem.reduce((pre, current) => {
        if (current[serviceareaProp] === d.value) {
          return pre + 1;
        } 
        return pre;
      }, 0);
    });
    let counterProblemType = [{value: problemTypesConst[0]}, {value: problemTypesConst[1]}, {value: problemTypesConst[2]}];
    counterProblemType.forEach((d) => {
      d.counter = queryProblem.reduce((pre, current) => {
        if (current?.problemtype === d?.value) {
          return pre + 1;
        } 
        return pre;
      }, 0);
    });
     const result = {
        "problemtype": counterProblemType,// COUNTER
        "priority": promises[0],
        "solutionstatus": promises[1],
        "county": countercounty,    // COUNTER
        "jurisdiction": promises[6],
        "mhfdmanager": promises[2],
        "source": promises[3],
        "components": promises[4],
        "cost": promises[5],
        "servicearea": counterServicearea // COUNTER
     };
     res.status(200).send(result);
  } catch (error) {
    console.trace("THIS ERROr", error);
     logger.error("error at problem route", error);
     logger.error(`get Error at  Connection error`);
  }
}
