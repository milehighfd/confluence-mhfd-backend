import { LexoRank } from 'lexorank';
import sequelize from 'sequelize';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import { createNewBoard, saveBoard, sendBoardsToProp } from 'bc/utils/create';

const { Op } = sequelize;
const Configuration = db.configuration;
const Board = db.board;
const BoardProject = db.boardProject;

export const addProjectToBoard = async (
  user,
  servicearea,
  county,
  locality,
  projecttype,
  project_id,
  year,
  sendToWR,
  isWorkPlan,
  projectname,
  projectsubtype,
  type,
  transaction = null
) => {
  if (!year) {
    let configuration = await Configuration.findOne({
      where: {
        key: 'BOARD_YEAR',
      },
      transaction: transaction,
    });
    year = +configuration.value;
  }  
  let _projecttype = projecttype.charAt(0).toUpperCase() + projecttype.slice(1);
  if (projecttype.toLowerCase() === 'research and development') {
    _projecttype = 'Research and Development';
  }
  let board = await Board.findOne({
    where: {
      type,
      year,
      locality,
      projecttype: _projecttype,
    },
    transaction: transaction,
  });
  console.log('\n\n ===================== \n\n search board', {
    type,
    year,
    locality,
    projecttype: _projecttype,
  }, '\n\n ===================== \n\n', board ? board.dataValues : 'NOT FOUND');
  if (!board) {
    try {
      console.log('About to create new Board because havent found one', type, year, locality, _projecttype);
      const response = await createNewBoard(
        type,
        year,
        locality,
        _projecttype,
        user.email,
        transaction
      );
      board = response;
    } catch (e) {
      logger.error('error in create new board '+e);
      throw e;
    }    
    logger.info('BOARD CREATED');
  }
  let boardProjectObject = {
    board_id: board.board_id,
    project_id: project_id,
    origin: locality,
  };
  boardProjectObject.projectname = projectname;
  boardProjectObject.projecttype = projecttype;
  boardProjectObject.projectsubtype = projectsubtype;
  console.log('\n HERE BOARD PROJECT OBJECT \n', boardProjectObject, '\n\n\n\n');
  let boardProject = new BoardProject(boardProjectObject);
  console.log('HAS BEEN CREATED ', boardProject, ' -> ',boardProject.board_id);
  let boardProjectSaved = boardProject;
  if ((sendToWR === 'true' && board.status === 'Under Review') || isWorkPlan) {
    try {
      console.log('About to save Board ');
      boardProjectSaved = await saveBoard(
        boardProject.board_id,
        boardProject.project_id,
        boardProject.origin,
        boardProject.projectname,
        user.email,
        transaction
      );
    } catch (error) {
      logger.error(' \n\n error in save board ' + error);
      throw error;
    }
  }
  if (['admin', 'staff'].includes(user.designation) && !isWorkPlan && year <= 2024) {
    await sendBoardsToProp(
      boardProjectSaved,
      board,
      servicearea,
      'servicearea',
      user.email,
    );
    await sendBoardsToProp(boardProjectSaved, board, county, 'county', user.email);
  }
};