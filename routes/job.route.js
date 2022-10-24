const express = require('express');
const needle = require('needle');
const projectStreamService = require('../services/projectStream.service');
const logger = require('../config/logger');
const router = express.Router();
const db = require('../config/db');
const projectsCarto = db.projectscarto;
const { Op } = require("sequelize");
const projectStream = db.projectStream;
const {
  CARTO_URL
} = require('../config/config');

router.get('/createlist', async(req, res) => {
  const q = `SELECT projectid FROM mhfd_projects_created_prod where projecttype = 'Study'`;
  const query = {
    q: q
  };
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      const results = data.body.rows;
      console.log('############################################# get projectsids');
      console.log(JSON.stringify(results));
      for (const result of results) {
        let projectCarto = {
          projectid: +result.projectid
        };
        const newprojectCarto = new projectsCarto(projectCarto);
        await newprojectCarto.save();
      }
      return res.status(data.statusCode).send(results);
    } else {
      logger.error('bad status ' + data.statusCode + '  -- ' +  JSON.stringify(data.body, null, 2));
      return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error('error at create list', error);
  }
});

router.get('/projectsids', async(req, res) => {
  const projectsListStreams = await projectStream.findAll();
  const ids = projectsListStreams.map((element) => element.dataValues.projectid);
  console.log('ids');
  const projectsToRestore = await projectsCarto.findAll({
    where: {
      projectid: {[Op.notIn]: ids}
    }
  })
  return res.status(200).send(projectsToRestore.map(pr => pr.projectid));
});

router.get('/fix-study/:projectid', async (req, res) => {
  const { projectid } = req.params;
  const toFix = projectid.split(",");
  console.log('ABOUT TO FIX');
  let nps = [];
  for (const projectid of toFix) {
    const q = `SELECT 
      j.jurisdiction, 
      streamsIntersected.str_name, 
      streamsIntersected.cartodb_id,  
      streamsIntersected.mhfd_code,
      streamsIntersected.reach_code,
      streamsIntersected.trib_code1,
      streamsIntersected.trib_code2,
      streamsIntersected.trib_code3,
      streamsIntersected.trib_code4,
      streamsIntersected.trib_code5,
      streamsIntersected.trib_code6,
      streamsIntersected.trib_code7,
      ST_length(ST_intersection(streamsIntersected.the_geom, j.the_geom)::geography) as length
    FROM 
    ( SELECT unique_mhfd_code as mhfd_code, reach_code, trib_code1, trib_code2, trib_code3, trib_code4, trib_code5, trib_code6, trib_code7, 
      cartodb_id, str_name, the_geom FROM mhfd_stream_reaches WHERE ST_DWithin((SELECT ST_ConvexHull(the_geom) as the_geom from mhfd_projects_created_prod where projectid = ${projectid}), the_geom, 0) ) streamsIntersected ,
    jurisidictions j 
    WHERE
    ST_DWithin(streamsIntersected.the_geom, j.the_geom, 0)`;
    const query = {
      q: q
    };
    try {
      const data = await needle('post', CARTO_URL, query, { json: true });
      if (data.statusCode === 200) {
        const body = data.body;
        streamsInfo = body.rows;
        const answer = {};
        body.rows.forEach(row => {
          let str_name = row.str_name?row.str_name:'Unnamed Streams';
          
            if (!answer[str_name]) {
              answer[str_name] = [];
            }
            answer[str_name].push({
              jurisdiction: row.jurisdiction,
              length: row.length,
              cartodb_id: row.cartodb_id,
              mhfd_code: row.mhfd_code,
              str_name: str_name,
              drainage: 0
            });
          
        });
        const promises = [];
        console.log('diff STREAM INFO: \n', JSON.stringify(streamsInfo), '\n\nANSWER\n\n', JSON.stringify(answer));
        for (const stream of streamsInfo) {
          
          const drainageSQL = `
            select
              st_area(
                ST_transform(st_intersection(j.the_geom, union_c.the_geom), 26986)
              ) as area ,
              j.jurisdiction
            from jurisidictions j , (select st_union(the_geom) as the_geom from mhfd_catchments_simple_v1 c where 
           '${stream.reach_code}' is not distinct from c.reach_code 
            ${stream.trib_code1 != null ? `and ${stream.trib_code1} is not distinct from c.trib_code1` : ''} 
            ${stream.trib_code2 != null ? `and ${stream.trib_code2} is not distinct from c.trib_code1` : ''} 
            ${stream.trib_code3 != null ? `and ${stream.trib_code3} is not distinct from c.trib_code1` : ''} 
            ${stream.trib_code4 != null ? `and ${stream.trib_code4} is not distinct from c.trib_code1` : ''} 
            ${stream.trib_code5 != null ? `and ${stream.trib_code5} is not distinct from c.trib_code1` : ''} 
            ${stream.trib_code6 != null ? `and ${stream.trib_code6} is not distinct from c.trib_code1` : ''} 
            ${stream.trib_code7 != null ? `and ${stream.trib_code7} is not distinct from c.trib_code1` : ''} 
            ) union_c 
            where ST_INTERSECTS(ST_SimplifyPreserveTopology(j.the_geom, 0.1), ST_SimplifyPreserveTopology(union_c.the_geom, 0.1)) `;
            const drainageQuery = {
              q: drainageSQL
            };
            const promise = new Promise((resolve, reject) => {
              needle('post', CARTO_URL, drainageQuery, { json: true })
              .then(response => {
                if (response.statusCode === 200) {
                  logger.info('I reached ', JSON.stringify(response.body.rows));
                  resolve({
                    str_name: stream.str_name,
                    drainage: response.body.rows
                  });
                } else {
                  logger.info('for query '+ drainageSQL);
                  logger.error(response.statusCode + ' ' + JSON.stringify(response.body));
                  resolve({
                    str_name: stream.str_name,
                    drainage: []
                  });
                }
              })
              .catch(error => {
                logger.info('crashed');
                reject({
                  str_name: stream.str_name,
                  drainage: []
                });
              });
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async (promiseData) => {
          logger.info('my values '+ JSON.stringify(promiseData));
          promiseData.forEach(bucket => {
            //Disclaimer: I don't create a more optimal solution because we don't have enough time
            // will be work fine for most cases 
            logger.info('bucket ' + JSON.stringify(bucket));
            const str_name = bucket.str_name? bucket.str_name : 'Unnamed Streams';
            for (const array of answer[str_name]) {
              logger.info('array '+ JSON.stringify(array));
              for (const info of bucket.drainage) {
                if (array.jurisdiction === info.jurisdiction) {
                  array.drainage += (info.area * 3.86102e-7);
                }
              }
            }
            
            //answer[value.str_name].push(value.drainage);
          });
          // for (const streamD of streamInfo) {
          //   // save stream data TODO: move after drainage
          //   const tmpnps = await projectStreamService.saveProjectStream({
          //     projectid: projectid,
          //     mhfd_code: streamD.mhfd_code,
          //     length: streamD.length,
          //     drainage: streamD.drainage,
          //     jurisdiction: streamD.jurisdiction,
          //     str_name: streamD.str_name || 'Unnamed Streams'
          //   });
          //   //finish save
          //   nps.push(tmpnps);
          // }
          res.send(answer);
        });
      } else {
        logger.error('bad status ' + data.statusCode + '  -- '+ sql +  JSON.stringify(data.body, null, 2));
        res.status(data.statusCode).send(data);
      }
    } catch (error) {
      logger.error(error, 'at', sql);
      res.status(500).send(error);
    };
  }
});

module.exports = (router);