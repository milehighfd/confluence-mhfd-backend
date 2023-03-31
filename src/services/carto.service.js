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
          logger.info(JSON.stringify(data.body), 'carto response ')
          console.log(data.body);
        }else {
          logger.error('bad status ' + data.statusCode + '  -- ' + insertQuery + JSON.stringify(data.body, null, 2));
        }
        return data.body;
     } catch (error) {
        logger.error(error, 'at', insertQuery);
     }
  }

  const insertToAcquistion = async (table, geom, project_id) => {
    const insertQuery = `INSERT INTO ${table} (the_geom, projectid)
    VALUES(ST_GeomFromGeoJSON('${geom}'), '${project_id}')`;
    const query = {
      q: insertQuery
    };
   try {
    const data = await needle('post', CARTO_URL, query, { json: true });
      if (data.statusCode === 200) {
        logger.info(JSON.stringify(data.body), 'carto response ')
        console.log(data.body);
      }else {
        logger.error('bad status ' + data.statusCode + '  -- ' + insertQuery + JSON.stringify(data.body, null, 2));
      }
      return data.body;
   } catch (error) {
      logger.error(error, 'at', insertQuery);
   }
  }
  const updateToCartoAcquistion = async (table, geom, project_id) => {
    const hasGeom = (geom && geom !== 'undefined' && geom !== 'null');
    const geomQuery = hasGeom ? `the_geom = ST_GeomFromGeoJSON('${geom}')` : '';
    const updateQuery = `UPDATE ${table} SET ${geomQuery} WHERE projectid = ${project_id}`;

    const query = {
      q: updateQuery
    };
   try {
    const data = await needle('post', CARTO_URL, query, { json: true });
      if (data.statusCode === 200) {
        console.log(data.body);
      }else {
        logger.error('bad status ' + data.statusCode + '  -- ' + updateQuery + JSON.stringify(data.body, null, 2));
      }
      return data.body;
   } catch (error) {
      logger.error(error, 'at', updateQuery);
   }
}

  const updateToCarto = async (table, geom, project_id) => {
    const hasGeom = (geom && geom !== 'undefined' && geom !== 'null');
    const geomQuery = hasGeom ? `the_geom = ST_GeomFromGeoJSON('${geom}')` : '';
    const updateQuery = `UPDATE ${table} SET ${geomQuery} WHERE projectid = ${project_id}`;

    const query = {
      q: updateQuery
    };
   try {
    const data = await needle('post', CARTO_URL, query, { json: true });
      if (data.statusCode === 200) {
        console.log(data.body);
      }else {
        logger.error('bad status ' + data.statusCode + '  -- ' + updateQuery + JSON.stringify(data.body, null, 2));
      }
      return data.body;
   } catch (error) {
      logger.error(error, 'at', updateQuery);
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
    q: updateQuery,
  };
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode !== 200) logger.error(data.body);
    console.log(data.body);
    logger.info('updated');
    return data.body;
  } catch (error) {
    logger.error('error', error);
  }
};

const checkIfExistGeomThenDelete = async (table, project_id) => {
  const sql = `SELECT ST_AsGeoJSON(ST_Envelope(the_geom)), projectid ${table} WHERE projectid = ${project_id}`;
  const query = {
    q: sql,
  };
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      const sql1 = `DELETE FROM ${CREATE_PROJECT_TABLE} WHERE projectid = ${projectid}`;
      const query2 = {
        q: sql1,
      };
      const data = await needle('delete', CARTO_URL, query2, { json: true });
      if (data.statusCode === 200) {
        logger.info('DELETED 2 or more rows on carto fetch');
      }
    }
  } catch (error) {
    logger.error(error, ' pm fetch');
  }
};

export default {
  insertToCarto,
  insertToCartoStudy,
  updateCartoStudy,
  updateToCarto,
  insertToAcquistion,
  updateToCartoAcquistion,
  checkIfExistGeomThenDelete,
};