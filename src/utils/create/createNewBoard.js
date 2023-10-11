import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';

const Board = db.board;

export const createNewBoard = async (
  type, 
  year,
  locality, 
  projecttype,
  creator,
  transaction = null
) => {
  const t = transaction ? await transaction : null;
  logger.info('create New Board ' + JSON.stringify(
    type, 
    year,
    locality, 
    projecttype,
  ));
  const boards = await Board.findAll({
    attributes: ['status', 'substatus', 'comment', 'submissionDate'],
    where: {
      type,
      year,
      locality,
    },
    order: [['createdAt', 'ASC']],
    transaction: t
  });
  const boardStatus = boards.map(b => b.dataValues.status);
  const comments = boards.map(b => b.dataValues.comment);
  const substatuses = boards.map(b => b.dataValues.substatus);
  const submissionDates = boards.map(b => b.dataValues.submissionDate);
  let isApproved = false;
  boardStatus.forEach((status) => {
    isApproved = isApproved || (status === 'Approved');
  });
  let comment = null;
  if (comments.length > 0) {
    comment = comments[0];
  }
  let substatus = null;
  if (substatuses.length > 0) {
    substatus = substatuses[0];
  }
  let submissionDate = null;
  if (submissionDates.length > 0) {
    submissionDate = submissionDates[0];
  }
  const res = await Board.create({
    type,
    year,
    locality,
    projecttype,
    status: isApproved ? 'Approved' : 'Under Review',
    comment,
    substatus,
    submissionDate,
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    last_modified_by: creator,
    created_by: creator
  }, { transaction: t }); 
  return res;
}
