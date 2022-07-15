const { CARTO_URL, PROBLEM_TABLE } = require('../config/config');
const https = require('https');

const getZoomareaFilters = async () => {
  const newProm = new Promise((resolve, reject) => {
    const sql = `select filter, aoi from mhfd_zoom_to_areas group by filter, aoi order by filter, aoi`;
    const URL = encodeURI(`${CARTO_URL}&q=${sql}`);
    let result = [];
    https.get(URL, response => {
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', async function () {
          let data = {};
          let result = JSON.parse(str).rows;
          let group = '';
          let elementGroup = [];

          for (let row of result) {
            if (group === '') {
              group = row.filter;
              elementGroup.push(row.aoi);
            } else {
              if (row.filter === group) {
                elementGroup.push(row.aoi);
              } else {
                if (group !== null) {
                  group = group.split(' ').join('')
                  data[group] = elementGroup;
                }
                group = row.filter;
                elementGroup = [];
              }
            }
          }

          if (group !== null) {
            group = group.split(' ').join('')
            data[group] = elementGroup;
          }

          resolve(data);
        })
      }
    })
  })

  return await newProm;
}

const countZoomareaFilter = async (filter) => {
  const newProm = new Promise((resolve, reject) => {
    const sql = `select mhfd_zoom_to_areas.aoi, count(${PROBLEM_TABLE}.county) as counter
      from mhfd_zoom_to_areas left outer join ${PROBLEM_TABLE} on  
      mhfd_zoom_to_areas.aoi = ${PROBLEM_TABLE}.county 
      where mhfd_zoom_to_areas.filter='${filter}' group by mhfd_zoom_to_areas.aoi`;
    const URL = encodeURI(`${CARTO_URL}&q=${sql}`);
    let result = [];
    https.get(URL, response => {
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', async function () {
          let data = {};
          let result = JSON.parse(str).rows.map(element => {
            return {
              value: element.aoi,
              counter: element.counter
            }
          });

          resolve(result);
        })
      }
    })
  })

  return await newProm;
}

module.exports = {
  getZoomareaFilters,
  countZoomareaFilter
}