import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';

const BoardProject = db.boardProject;

const saveBoard = async (
  board_id, 
  project_id,
  origin, 
  position0 
) => {
  logger.info('create Board ' + JSON.stringify(
    board_id, 
    project_id,
    origin, 
    position0 ));
  try {
    const response = await BoardProject.create({
      board_id: board_id,
      project_id: project_id,
      origin: origin,
      position0: position0,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    });
    return response;
  } catch(error) {
    throw error;
  }
}

const createNewBoard = async (
  type, 
  year,
  locality, 
  projecttype,
  status 
) => {
  logger.info('create New Board ' + JSON.stringify(
    type, 
    year,
    locality, 
    projecttype,
    status ));
  try {
    const id = await db.sequelize.query('SELECT MAX(_id) FROM boards');
    const lastID = Object.values(id[0][0]).length > 0 ? Object.values(id[0][0])[0] : -1;
    const insertQuery = `INSERT INTO boards (_id, locality, year, projecttype, type, status, createdAt, updatedAt)
    OUTPUT inserted . *
    VALUES('${lastID + 1}', '${locality}', '${year}', '${projecttype}', '${type}', '${status}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${moment().format('YYYY-MM-DD HH:mm:ss')}')`;
    const data = await db.sequelize.query(
      insertQuery,
      {
        type: db.sequelize.QueryTypes.INSERT,
      });
    return data[0][0];
  } catch(error) {
    throw error;
  }
}

export default {
  saveBoard,
  createNewBoard
};
