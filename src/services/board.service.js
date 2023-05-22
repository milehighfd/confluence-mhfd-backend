import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';
import sequelize from 'sequelize';
import { LexoRank } from 'lexorank';

const BoardProject = db.boardProject;
const { Op } = sequelize;

const saveBoard = async (
  board_id, 
  project_id,
  origin, 
  position0 ,
  projectname,
  projecttype,
  projectsubtype
) => {
  logger.info('create Board ' + JSON.stringify(
    board_id, 
    project_id,
    origin, 
    position0,
    projectname,
    projecttype,
    projectsubtype
  ));
  try {
    const response = await BoardProject.create({
      board_id: board_id,
      project_id: project_id,
      origin: origin,
      position0: position0,
      projectname: projectname,
      projecttype: projecttype,
      projectsubtype: projectsubtype,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    });
    return response;
  } catch(error) {
    throw error;
  }
}

const saveProjectBoard = async (ProjectBoard) => {
  try {
    const response = await BoardProject.create(ProjectBoard);
    logger.info('saved ProjectBoard');
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
    const id = await db.sequelize.query('SELECT MAX(board_id) FROM boards');
    const lastID = Object.values(id[0][0]).length > 0 ? Object.values(id[0][0])[0] : -1;
    const insertQuery = `INSERT INTO boards (board_id, locality, year, projecttype, type, status, createdAt, updatedAt)
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

const specialCreationBoard = async (
  type, 
  year,
  locality, 
  projecttype,
  status,
  comment,
  substatus
) => {
  try {
    const id = await db.sequelize.query('SELECT MAX(board_id) FROM boards');
    const lastID = Object.values(id[0][0]).length > 0 ? Object.values(id[0][0])[0] : -1;
    const insertQuery = `INSERT INTO boards (board_id, locality, year, projecttype, type, status, createdAt, updatedAt, comment, substatus)
    OUTPUT inserted . *
    VALUES('${lastID + 1}', '${locality}', '${year}', '${projecttype}', '${type}', '${status}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${comment}', '${substatus}')`;
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

const reCalculateColumn = async (board_id, column) => {
  const startValue = LexoRank.middle();
  try {
    const boardProjects = await BoardProject.findAll({
      where: {
        board_id: board_id,
        [column]: {
            [Op.ne]: null
          }
      },
      order: [
        [column, 'ASC']
      ]
    });
    const pr = [];
    boardProjects.forEach((project) => {
      const rank = startValue.genNext();
      pr.push(BoardProject.update(
        { [column]: rank.toString() },
        { where: { board_project_id: project.board_project_id } }
      ));
    });
    const solve = await Promise.all(pr);
    return solve;
  } catch (error) {
    throw error;
  }
}

const countByGroup = async (group, board_id) => {
  try {
    const counter = await db.sequelize.query(
      `
      SELECT COUNT(*) as count, ${group} FROM board_project
      WHERE board_id = ${board_id} AND ${group} IS NOT NULL  GROUP BY ${group}
      HAVING COUNT(*) > 1
      `
    );
    return counter;
  } catch(error) {
    throw error;
  }
}

export default {
  saveBoard,
  createNewBoard,
  saveProjectBoard,
  specialCreationBoard,
  countByGroup,
  reCalculateColumn
};
