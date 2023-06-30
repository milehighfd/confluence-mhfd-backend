import {
  CARTO_URL
} from 'bc/config/config.js';
import needle from 'needle';
import logger from 'bc/config/logger.js';

export const checkCartoandDelete = async (table, project_id, transaction) => {
  const sql = `DELETE FROM ${table} WHERE projectid = ${project_id}`;
  const query = {
    q: sql,
  };
  try {
    console.log('Delete in this table', table);
    const data = await needle('post', CARTO_URL, query, { json: true, headers: { 'Carto-Transaction-Id': transaction.id } });
    if (data.statusCode === 200) {
      const sql1 = `DELETE FROM ${table} WHERE projectid = ${project_id}`;
      const query2 = {
        q: sql1,
      };
      const delte = await needle('delete', CARTO_URL, query2, { json: true, headers: { 'Carto-Transaction-Id': transaction.id } });
      if (delte.statusCode === 200) {
        logger.info('DELETED 2 or more rows on carto fetch');
      }
    }
  } catch (error) {
    logger.error(error, ' pm fetch');
  }
};