import db from 'bc/config/db.js';
import moment from 'moment';

const BoardProject = db.boardProject;

export const saveBoard = async (
  board_id, 
  project_id,
  origin, 
  rank0 ,
  projectname,
  projecttype,
  projectsubtype,
  transaction = null
) => {
  const DRAFT_STATUS = 1;
  try {
    const response = await BoardProject.create({
      board_id: board_id,
      project_id: project_id,
      origin: origin,
      rank0: rank0,
      projectname: projectname,
      code_status_type_id: DRAFT_STATUS,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    }, { transaction: transaction });
    return response;
  } catch(error) {
    throw error;
  }
}