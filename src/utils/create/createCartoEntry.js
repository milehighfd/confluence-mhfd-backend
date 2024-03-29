import {
  CARTO_URL
} from 'bc/config/config.js';
import needle from 'needle';
import logger from 'bc/config/logger.js';

export const createCartoEntry = async (table, geom, project_id, transaction) => {
  const insertQuery = `INSERT INTO ${table} (the_geom, projectid)
      VALUES(ST_GeomFromGeoJSON('${geom}'), '${project_id}')`;
  const query = {
    q: insertQuery
  };
  try {
    const data = await needle('post', CARTO_URL, query, { json: true, headers: { 'Carto-Transaction-Id': transaction.id } });
    if (data.statusCode === 200) {
      logger.info(JSON.stringify(data.body), 'carto response ')
      console.log(data.body);
    } else {
      logger.error('bad status ' + data.statusCode + '  -- ' + insertQuery + JSON.stringify(data.body, null, 2));
    }
    return data.body;
  } catch (error) {
    logger.error(error, 'at', insertQuery);
  }
};