import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';

const Board = db.board;

export const createNewBoard = async (
  type, 
  year,
  locality, 
  projecttype,
  status,
  transaction = null
) => {
  const t = transaction ? await transaction : null;
  logger.info('create New Board ' + JSON.stringify(
    type, 
    year,
    locality, 
    projecttype,
    status ));
  try {
    const res = await Board.create({
      type,
      year,
      locality,
      projecttype,
      status,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    }, { transaction: t }); // associate transaction with the database operation
    return res;
  } catch(error) {
    throw error;
  }
}