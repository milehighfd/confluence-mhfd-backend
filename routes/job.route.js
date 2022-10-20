const express = require('express');
const needle = require('needle');
const projectStreamService = require('../services/projectStream.service');
const logger = require('../config/logger');
const router = express.Router();
const {
  CARTO_URL
} = require('../config/config');


router.get('/fix-study/:projectid', async (req, res) => {
  const { projectid } = req.params;
  const toFix = [projectid];
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
      console.log('data status ', data.statusCode);
      if (data.statusCode === 200) {
        const results = data.body.rows;
        console.log('#############################################');
        console.log(JSON.stringify(results));
        for (const result of results) {
          const tmpnps = await projectStreamService.saveProjectStream({
            projectid: projectid,
            mhfd_code: result.mhfd_code,
            length: result.length,
            drainage: result.drainage,
            jurisdiction: result.jurisdiction,
            str_name: result.str_name || 'Unnamed Streams'
          });
          nps.push(tmpnps);
        }
      } else {
        logger.error('bad status ' + data.statusCode + '  -- ' +  JSON.stringify(data.body, null, 2));
        return res.status(data.statusCode).send(data.body);
      }
    } catch (error) {
      logger.error(error);
      // logger.error(error, 'at', updateQuery);
      return res.status(500).send(error);
    };
  }
  console.log(nps.length);
  res.send(nps);
});

module.exports = (router);