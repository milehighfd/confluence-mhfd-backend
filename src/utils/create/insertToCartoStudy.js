import {
  CARTO_URL
} from 'bc/config/config.js';
import needle from 'needle';
import logger from 'bc/config/logger.js';

export const insertToCartoStudy = async (table, project_id, parsedIds) => {
  const insertQuery = `INSERT INTO ${table} (the_geom, projectid)
  (SELECT ST_Collect(the_geom) as the_geom, ${project_id} as projectid FROM mhfd_stream_reaches WHERE unique_mhfd_code  IN(${parsedIds}))`;
  const query = {
    q: insertQuery
  };
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      console.log(data.body);
    } else {
      logger.error('bad status ' + data.statusCode + '  -- ' + insertQuery + JSON.stringify(data.body, null, 2));
    }
    return data.body;
  } catch (error) {
    logger.error(error, 'at', insertQuery);
  }
}

export const getGeomGeojson = async (parsedIds) => {
  const queryGeom = `SELECT ST_AsGeoJSON(ST_union(the_geom)) as the_geom FROM mhfd_stream_reaches WHERE unique_mhfd_code  IN(${parsedIds})`;
  const query = {
    q: queryGeom
  };
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      console.log(data.body);
    } else {
      logger.error('bad status ' + data.statusCode + '  -- ' + insertQuery + JSON.stringify(data.body, null, 2));
    }
    return data.body?.rows[0].the_geom ?? 'nodata';
  } catch(error) {
    logger.error(error, 'at', queryGeom);
  }

}
