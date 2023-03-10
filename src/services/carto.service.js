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

const updateCartoStudy = async (table, project_id, parsedIds) => {
  const geomUpdate = `the_geom = (SELECT ST_Collect(the_geom) FROM mhfd_stream_reaches WHERE unique_mhfd_code IN(${parsedIds}))`;
  const updateQuery = `UPDATE ${table} SET
  ${geomUpdate} WHERE projectid = ${project_id}`;

  const query = {
    q: updateQuery
  };
 try {
  const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode !== 200) logger.error(data.body);
    console.log(data.body);
    logger.info('updated');
    return data.body;
 } catch (error) {
    logger.error('error',error);
 }
}
  export default {
    insertToCarto,
    insertToCartoStudy,
    updateCartoStudy
  };