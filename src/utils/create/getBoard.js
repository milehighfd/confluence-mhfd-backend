import db from 'bc/config/db.js';

const Board = db.board;

export const getBoard = async (type, locality, year, projecttype, transaction = null) => {
  let board = await Board.findOne({
    where: {
      type, year, locality, projecttype
    },
    transaction: transaction, 
  });
  if (board) {
    return board;
  } else {
    let newBoard = new Board({
      type, year, locality, projecttype, status: 'Under Review'
    });
    await newBoard.save({ transaction: t });
    return newBoard;
  }
};