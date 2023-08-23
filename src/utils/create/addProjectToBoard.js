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
  const _projecttype = projecttype.charAt(0).toUpperCase() + projecttype.slice(1);
  let board = await Board.findOne({
    where: {
      type,
      year,
      locality,
      projecttype: _projecttype,
    },
    transaction: transaction,
  });
  if (!board) {
    try {
      const response = await createNewBoard(
        type,
        year,
        locality,
        _projecttype,
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
  const firstProject = await BoardProject.findOne({
    where: {
      board_id: board.board_id,
      rank0: {
        [Op.ne]: null,
      }
    }, 
    order: [['rank0', 'ASC']],
    transaction: transaction,
  });
  if (firstProject) {
    boardProjectObject.rank0 = LexoRank.parse(firstProject.rank0)
      .genPrev()
      .toString();
  } else { 
    boardProjectObject.rank0 = LexoRank.middle().toString();
  }
  boardProjectObject.projectname = projectname;
  boardProjectObject.projecttype = projecttype;
  boardProjectObject.projectsubtype = projectsubtype;
  let boardProject = new BoardProject(boardProjectObject);
  let boardProjectSaved = boardProject;
  if ((sendToWR === 'true' && board.status === 'Under Review') || isWorkPlan) {
    try {
      boardProjectSaved = await saveBoard(
        boardProject.board_id,
        boardProject.project_id,
        boardProject.origin,
        boardProject.rank0,
        boardProject.projectname,
        boardProject.projecttype,
        boardProject.projectsubtype,
        transaction
      );
    } catch (error) {
      logger.error('error in save board ' + error);
      throw error;
    }
  }
  if (['admin', 'staff'].includes(user.designation) && !isWorkPlan && year <= 2024) {
    await sendBoardsToProp(
      boardProjectSaved,
      board,
      servicearea,
      'servicearea'
    );
    await sendBoardsToProp(boardProjectSaved, board, county, 'county');
  }
};