import db from 'bc/config/db.js';

const BoardProject = db.boardProject;

export const countProjectsByRank = async (board_id, rank, transaction = null) => {
  try {
    const counter = await BoardProject.count({
      where: {
        board_id,
        [rank]: {
          [Op.ne]: null
        }
      },
      transaction
    });
    return counter;
  } catch(error) {
    throw error;
  }
}