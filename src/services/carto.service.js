import {
  CARTO_URL
} from 'bc/config/config.js';
import needle from 'needle';
import logger from 'bc/config/logger.js';

const insertToCarto = async (table, geom, project_id) => {
      const insertQuery = `INSERT INTO ${table} (the_geom, projectid)
      VALUES(ST_GeomFromGeoJSON('${geom}'), '${project_id}')`;
      const query = {
        q: insertQuery
      };
     try {
      const data = await needle('post', CARTO_URL, query, { json: true });
        if (data.statusCode === 200) {
          console.log(data.body);
        }else {
          logger.error('bad status ' + data.statusCode + '  -- ' + insertQuery + JSON.stringify(data.body, null, 2));
        }
        return data.body;
     } catch (error) {
        logger.error(error, 'at', insertQuery);
     }
  }

  const insertToCartoStudy = async (table, project_id, parsedIds) => {
    const insertQuery = `INSERT INTO ${table} (the_geom, projectid)
    (SELECT ST_Collect(the_geom) as the_geom, ${project_id} as projectid FROM mhfd_stream_reaches WHERE unique_mhfd_code  IN(${parsedIds}))`;
    const query = {
      q: insertQuery
    };
   try {
    const data = await needle('post', CARTO_URL, query, { json: true });
      if (data.statusCode === 200) {
        console.log(data.body);
      }else {
        logger.error('bad status ' + data.statusCode + '  -- ' + insertQuery + JSON.stringify(data.body, null, 2));
      }
      return data.body;
   } catch (error) {
      logger.error(error, 'at', insertQuery);
   }
}
  
  export default {
    insertToCarto,
    insertToCartoStudy
  };