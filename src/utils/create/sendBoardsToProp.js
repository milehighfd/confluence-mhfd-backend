import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import { getBoard, countProjectsByRank, reCalculateColumn } from 'bc/utils/create';

const BoardProject = db.boardProject;

export const sendBoardsToProp = async (bp, board, prop, propid, creator, transaction = null) => {
  let propValues = prop.split(',');
  for (let k = 0; k < propValues.length; k++) {
    let propVal = propValues[k];
    if (propid === 'county' && !prop.includes('County')) {
      propVal = propVal.trimEnd().concat(' County');
    } else if (propid === 'servicearea' && !prop.includes(' Service Area')) {
      propVal = propVal.trimEnd().concat(' Service Area');
    }
    let destinyBoard = await getBoard(
      'WORK_PLAN',
      propVal,
      board.year,
      board.projecttype,
      creator,
      transaction
    );
    //TODO: improve to avoid multiple queries to same board
    let newBoardProject = new BoardProject({
      board_id: destinyBoard.board_id,
      project_id: bp.project_id,
      // rank0: bp.rank0,
      // rank1: bp.rank1,
      // rank2: bp.rank2,
      // rank3: bp.rank3,
      // rank4: bp.rank4,
      // rank5: bp.rank5,
      req1: bp.req1 == null ? null : bp.req1 / propValues.length,
      req2: bp.req2 == null ? null : bp.req2 / propValues.length,
      req3: bp.req3 == null ? null : bp.req3 / propValues.length,
      req4: bp.req4 == null ? null : bp.req4 / propValues.length,
      req5: bp.req5 == null ? null : bp.req5 / propValues.length,
      year1: bp.year1,
      year2: bp.year2,
      origin: board.locality,
      created_by: creator,
      last_modified_by: creator,
    });
    await newBoardProject.save({ transaction: transaction }); // associate transaction with the database operation
    const updatePromises = [];
    // for (let i = 0; i < 6; i++) {
    //   const rank = `rank${i}`;
    //   logger.info(`Start count for ${rank} and board ${destinyBoard.board_id}`);
    //   const {counter} = await countProjectsByRank(destinyBoard.board_id, rank, transaction); // associate transaction with the database operation
    //   logger.info(`Finish counter: ${JSON.stringify(counter)}}`);
    //   if (counter) {
    //       updatePromises.push(reCalculateColumn(destinyBoard.board_id, rank, transaction, creator)); // associate transaction with the database operation
    //   }   
    // }
    if (updatePromises.length) {
      await Promise.all(updatePromises).then((values) => {
          logger.info('success on recalculate Columns');
      }).catch((error) => {
          logger.error(`error on recalculate columns ${error}`);
      });
    }
  }
};