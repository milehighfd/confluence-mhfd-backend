const express = require('express');
const db = require('../../config/db');
const logger = require('../../config/logger');
const { getNewProjectId, copyProject } = require('./helper');

const router = express.Router();
const Board = db.board;
const Configuration = db.configuration;
const BoardProject = db.boardProject;

const getBoard = async (type, locality, year, projecttype) => {
  let board = await Board.findOne({
    where: {
      type, year: `${year}`, locality, projecttype
    }
  });
  if (board) {
    logger.info('already exists');
    return board;
  } else {
    logger.info('new board');
    let newBoard = new Board({
      type, year, locality, projecttype, status: 'Under Review'
    });
    await newBoard.save();
    return newBoard;
  }
};

const addProjectToBoard = async (board, project_id, originalLocality) => {
  let boardProjectObject = {
    board_id: board._id,
    project_id: project_id,
    origin: originalLocality
  }
  boardProjectObject.position0 = 0;
  console.log('BOARD PROJECT OBJECT', boardProjectObject);
  const boardProject = new BoardProject(boardProjectObject);
  boardProject.save();
  return boardProject;
};

router.post('/', async (req, res) => {
  const {
    id,
    projectid,
    locality,
    projecttype
  } = req.body;
  let configuration = await Configuration.findOne({
    where: {
      key: 'BOARD_YEAR'
    }
  });
  const year = +configuration.value;
  const boardProjectOriginal = await BoardProject.findOne({
    where: {
      id
    }
  });
  const board = await getBoard('WORK_PLAN', locality, year, projecttype);
  const newProjectId = await getNewProjectId();
  await copyProject(newProjectId, projectid);
  const boardProject = await addProjectToBoard(board, newProjectId, boardProjectOriginal.origin);
  res.send(boardProject);
});

module.exports = router;
