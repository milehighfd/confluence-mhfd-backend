import db from 'bc/config/db.js';

const Board = db.board;

export const getBoard = async (type, locality, year, projecttype, creator, transaction = null) => {
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
      type,
      year,
      locality,
      projecttype,
      status: 'Under Review',
      last_modified_by: creator,
      created_by: creator
    });
    await newBoard.save({ transaction });
    return newBoard;
  }
};
