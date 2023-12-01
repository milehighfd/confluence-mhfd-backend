import db from 'bc/config/db.js';
import sequelize from 'sequelize';
import { LexoRank } from 'lexorank';

const BoardProject = db.boardProject;
const { Op } = sequelize;

export const reCalculateColumn = async (board_id, column, transaction, creator) => {
  const startValue = LexoRank.middle();
  const boardProjects = await BoardProject.findAll({
    where: {
      board_id: board_id,
      [column]: {
        [Op.ne]: null
      }
    },
    order: [
      [column, 'ASC']
    ],
    transaction: transaction
  });
  const pr = [];
  boardProjects.forEach((project) => {
    // const rank = startValue.genNext();
    pr.push(BoardProject.update(
      { 
        // [column]: rank.toString(), 
        last_modified_by: creator },
      { where: { board_project_id: project.board_project_id }, transaction: transaction }
    ));
  });
  const solve = await Promise.all(pr);
  return solve;
}
