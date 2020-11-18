const { CARTO_TOKEN } = require('../config/config');
const https = require('https');

const getZoomareaFilters = async () => {
  const newProm = new Promise((resolve, reject) => {
    const sql = `select filter, aoi from mhfd_zoom_to_areas group by filter, aoi order by filter, aoi`;
    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${sql}&api_key=${CARTO_TOKEN}`);
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
    const sql = `select mhfd_zoom_to_areas.aoi, count(problems.county) as counter
      from mhfd_zoom_to_areas left outer join problems on  
      mhfd_zoom_to_areas.aoi = problems.county 
      where mhfd_zoom_to_areas.filter='${filter}' group by mhfd_zoom_to_areas.aoi`;
    const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${sql}&api_key=${CARTO_TOKEN}`);
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