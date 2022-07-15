const express = require('express');
const https = require('https');
const needle = require('needle');
const {
  CARTO_URL,
  PROBLEM_TABLE,
  PROPSPROBLEMTABLES,
  MAIN_PROJECT_TABLE
} = require('../config/config');
const { response } = require('../app');

const router = express.Router();
const components = [
  { key: 'grade_control_structure', value: 'Grade Control Structure' },
  { key: 'pipe_appurtenances', value: 'Pipe Appurtenances' },
  { key: 'special_item_point', value: 'Special Item Point' },
  { key: 'special_item_linear', value: 'Special Item Linear' },
  { key: 'special_item_area', value: 'Special Item Area' },
  { key: 'channel_improvements_linear', value: 'Channel Improvements Linear' },
  { key: 'channel_improvements_area', value: 'Channel Improvements Area' },
  { key: 'removal_line', value: 'Removal Line' },
  { key: 'removal_area', value: 'Removal Area' },
  { key: 'storm_drain', value: 'Storm Drain' },
  { key: 'detention_facilities', value: 'Detention Facilities' },
  { key: 'maintenance_trails', value: 'Maintenance Trails' },
  { key: 'land_acquisition', value: 'Land Acquisition' },
  { key: 'landscaping_area', value: 'Landscaping Area' }
];
const PROJECT_TABLES = [MAIN_PROJECT_TABLE];

router.get('/', async (req, res) => {
  const tables = req.query.tables ? req.query.tables.split(',') : [];
  let send = [];
  for (const table of tables) {
    const query = {q: `SELECT DISTINCT problemid FROM ${table}  WHERE problemid is not null`};
    let answer = [];
    try {
      const data = await needle('post', CARTO_URL, query, {json: true});
      if (data.statusCode === 200) {
        answer = data.body.rows.map(element => element.problemid);
      } else {
        console.log('bad status ', response.statusCode, response.body);
      }
    } catch (error) {
      console.log(error);
    };
    send = send.concat(answer);
  }
  res.send([... new Set(send)]);
});

router.get('/project-filter', async (req, res) => {
  const problemtype = req.query.problemtype ? req.query.problemtype : '';
  const problemtypeFilter = problemtype.length ? `AND ${PROBLEM_TABLE}.problemtype IN(` + problemtype.split(',').map(element => `'${element}'`).join(',') + ')' : '';
  if (!problemtype.length) {
    return res.send(null);
  }
  let send = [];
  for (const element of components) {
    const component = element.key;
    for (const table of PROJECT_TABLES) {
      const query = {q: `SELECT DISTINCT ${table}.projectid FROM ${table}, ${PROBLEM_TABLE}, ${component}   WHERE ${table}.projectid = ${component}.projectid and ${PROBLEM_TABLE}.problemid = ${component}.problemid ${problemtypeFilter}`};
      console.log(query.q);
      try {
        send.push(new Promise(resolve => {
          needle('post', CARTO_URL, query, {json: true}).then(response => {
            if (response.statusCode === 200) {
              resolve(response.body.rows.map(element => element.projectid));
            } else {
              console.log('bad status ', response.statusCode, response.body);
              resolve([]);
            }
          }).catch(error => {
            console.log('some error ', error);
            resolve([]);
          });
        }));
      } catch (error) {
        console.log(error);
      };
    }
  }
  const promises =  await Promise.all(send);
  const answer = [];
  for (const element of promises) {
    answer.push(...element);
  }
  if (!answer.length) {
    answer.push(-1);
  }
  res.send([... new Set(answer)]);
});
router.get('/search/:type', async (req, res) => {
  const type = req.params.type;
  const field = req.query.field ? req.query.field : '';
  let data = {};
  if (type === 'problems') {
    const query = {q: `SELECT cartodb_id FROM ${PROBLEM_TABLE} WHERE ${PROPSPROBLEMTABLES.problem_boundary[6]} ILIKE '%${field}%' OR ${PROPSPROBLEMTABLES.problem_boundary[5]}::text ilike '%${field}%'`};
    let answer = [];
    try {
      const data = await needle('post', CARTO_URL, query, {json: true});
      if (data.statusCode === 200) {
        answer = data.body.rows.map(element => element.cartodb_id);
      } else {
        console.log('bad status ', response.statusCode, response.body);
      }
    } catch (error) {
      console.log(error);
    };
    data['problems'] = answer;
  } else {
    for (const project of PROJECT_TABLES) {
      const query = {q: `SELECT cartodb_id FROM ${project} WHERE projectname ILIKE '%${field}%' OR onbaseid::text ilike '%${field}%'`};
      let answer = [];
      try {
        const data = await needle('post', CARTO_URL, query, {json: true});
        if (data.statusCode === 200) {
          answer = data.body.rows.map(element => element.cartodb_id);
        } else {
          console.log('bad status ', response.statusCode, response.body);
        }
      } catch (error) {
        console.log(error);
      };
      console.log(project);
      data[project] = answer;
    }
  }
  return res.send(data);
});

const addCondition = (conditions, newCondition, connector) => {
  if (conditions) {
    if (newCondition) {
      return conditions + ' ' + connector + ' ' + newCondition;
    }
    return conditions;
  }
  return newCondition;
};

router.post('/by-components', async (req, res) => {
  const body = req.body;
  let componentArray = [];
  const response = {};
  let tables = '';
  if (body.component_type) {
    tables = body.component_type;
    componentArray = tables.split(',');
  }
  for (const type of [PROBLEM_TABLE, ...PROJECT_TABLES]) {
    console.log('my body is b' ,body);
    let conditions = '';
    for (const component of componentArray) {
      console.log('my components ', component);
      if (body.status) {
        let statusConditions = '';
        for (const status of body.status.split(',')) {
          const condition = `${component}.status='${status}'`;
          statusConditions = addCondition(statusConditions, condition, 'OR');
        }
        conditions = addCondition(conditions, '(' + statusConditions + ')', 'AND');
      }
      if (body.year_of_study) {
        let yearConditions = '';
        for (const year of body.year_of_study.split(',')) {
          const condition = `${component}.year_of_study>=${year} AND ${component}.year_of_study<=${+year + 9}`;
          yearConditions = addCondition(yearConditions, condition, 'OR');
        }
        conditions = addCondition(conditions, '(' + yearConditions + ')', 'AND');
      }
      if (body.estimated_cost) {
        let estimated_costConditions = '';
        for (const costRange of body.estimated_cost) {
          const [lower, upper] = costRange.split(',');
          const condition = `${component}.estimated_cost>=${+lower} AND ${component}.estimated_cost<=${+upper}`;
          estimated_costConditions = addCondition(estimated_costConditions, condition, 'OR');
        }
        conditions = addCondition(conditions, '(' + estimated_costConditions + ')', 'AND');
      }
      if (body.jurisdiction) {
        let jurisdictionCondition = `${component}.jurisdiction='${body.jurisdiction}'`;
        conditions = addCondition(conditions, jurisdictionCondition, 'AND');
      }
      if (body.county) {
        let countyCondition = `${component}.county='${body.county}'`;
        conditions = addCondition(conditions, countyCondition, 'AND');
      }
      if (body.mhfdmanager) {
        let mhfdmanagerCondition = `${component}.mhfdmanager='${body.mhfdmanager}'`;
        conditions = addCondition(conditions, mhfdmanagerCondition, 'AND');
      }
      console.log('add the end conditions', conditions);
    }
    let extraConditions = '';
    for (const component of componentArray) {
      if (type === 'problems') {
        const condition = `${PROBLEM_TABLE}.problemid=${component}.problemid`;
        extraConditions = addCondition(extraConditions, condition, 'OR');
      } else {
        const condition = `${type}.projectid=${component}.projectid`;
        extraConditions = addCondition(extraConditions, condition, 'OR');
      }
    }
    conditions = addCondition(conditions, extraConditions, 'AND');
    if (tables && tables[0] !== ',') {
      tables = ',' + tables;
    }
    if (conditions) {
      conditions = 'WHERE ' + conditions;
    }
    const query = `SELECT ${type}.cartodb_id FROM ${type}${tables} ${conditions}`;
    console.log('my query is query ', query);
    const URL = encodeURI(`${CARTO_URL}?q=${query}`);
    const answer = await new Promise(resolve => {
      https.get(URL, response => {
        var str = '';
        if (response.statusCode == 200) {
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', function () {
            var data = JSON.parse(str);
            resolve ( data.rows.map(element => element.cartodb_id));
          });
        } else {
          console.log('Error ', response.statusCode);
          resolve([]);
        }
      });
    });
    response[type] = [...new Set(answer)];
  }
  return res.send(response);
});


router.post('/v2/by-components', async (req, res) => {
  const body = req.body;
  let componentArray = [];
  const response = {};
  let tables = '';
  if (body.component_type) {
    tables = body.component_type;
    componentArray = tables.split(',');
  } else {
    return res.send(null);
  }
  const promises = [];
  for (const type of [PROBLEM_TABLE, ...PROJECT_TABLES]) {
    console.log('my body is b' ,body);
    let conditions = '';
    for (const component of componentArray) {
      console.log('my components ', component);
      if (body.status && body.status.length) {
        let statusConditions = '';
        for (const status of body.status.split(',')) {
          const condition = `${component}.status='${status}'`;
          statusConditions = addCondition(statusConditions, condition, 'OR');
        }
        conditions = addCondition(conditions, '(' + statusConditions + ')', 'AND');
      }
      if (body.year_of_study && body.year_of_study.length) {
        let yearConditions = '';
        for (const year of body.year_of_study.split(',')) {
          const condition = `${component}.year_of_study>=${year} AND ${component}.year_of_study<=${+year + 9}`;
          yearConditions = addCondition(yearConditions, condition, 'OR');
        }
        conditions = addCondition(conditions, '(' + yearConditions + ')', 'AND');
      }
      if (body.estimated_cost && body.estimated_cost.length) {
        let estimated_costConditions = '';
        for (const costRange of body.estimated_cost) {
          const [lower, upper] = costRange.split(',');
          const condition = `${component}.estimated_cost>=${+lower} AND ${component}.estimated_cost<=${+upper}`;
          estimated_costConditions = addCondition(estimated_costConditions, condition, 'OR');
        }
        conditions = addCondition(conditions, '(' + estimated_costConditions + ')', 'AND');
      }
      if (body.jurisdiction && body.jurisdiction.length) {
        let jurisdictionCondition = `${component}.jurisdiction='${body.jurisdiction}'`;
        conditions = addCondition(conditions, jurisdictionCondition, 'AND');
      }
      if (body.county && body.county.length) {
        let countyCondition = `${component}.county='${body.county}'`;
        conditions = addCondition(conditions, countyCondition, 'AND');
      }
      if (body.mhfdmanager && body.mhfdmanager.length) {
        let mhfdmanagerCondition = `${component}.mhfdmanager='${body.mhfdmanager}'`;
        conditions = addCondition(conditions, mhfdmanagerCondition, 'AND');
      } 
      let extraConditions = '';
      if (type === 'problems') {
        const condition = `${PROBLEM_TABLE}.problemid=${component}.problemid`;
        extraConditions = addCondition(extraConditions, condition, 'OR');
      } else {
        const condition = `${type}.projectid=${component}.projectid`;
        extraConditions = addCondition(extraConditions, condition, 'OR');
      }
      conditions = addCondition(conditions, extraConditions, 'AND');
      if (conditions) {
        conditions = 'WHERE ' + conditions;
      }
      const query = {q: `SELECT ${type}.cartodb_id FROM ${type},${component} ${conditions}` };
      console.log('my query is ', query);
      promises.push(new Promise(resolve => {
        needle('post', CARTO_URL, query, {json: true}).then(response => {
          if (response.statusCode === 200) {
            resolve(response.body.rows.map(element => element.cartodb_id));
          } else {
            console.log('bad status ', response.statusCode, response.body);
            resolve([]);
          }
        }).catch(error => {
          console.log(error);
          resolve([]);
        });
      }));
      console.log('add the end conditions', conditions);
      conditions = '';
    }
    let answer = await Promise.all(promises); 
    const array = [];
    for (const ans of answer) {
      array.push(...ans);
    }
    if (!array.length) {
      array.push(-1);
    }
    response[type] = [...new Set(array)];
    
  }
  return res.send(response);
});
module.exports = router;
