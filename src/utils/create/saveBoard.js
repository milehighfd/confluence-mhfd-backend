import db from 'bc/config/db.js';
import moment from 'moment';

const BoardProject = db.boardProject;

export const saveBoard = async (
  board_id, 
  project_id,
  origin, 
  projectname,
  creator,
  transaction = null
) => {
  const DRAFT_STATUS = 1;
  try {
    const bpdata = {
      board_id: board_id,
      project_id: project_id,
      origin: origin,
      projectname: projectname,
      code_status_type_id: DRAFT_STATUS,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      created_by: creator,
      last_modified_by: creator
    };
    console.log('\n\n\n\n About to create board project  with this data ', bpdata, '\n\n\n\n');
    const response = await BoardProject.create(bpdata, { transaction: transaction });
    return response;
  } catch (error) {
    console.error(`\n\n\n\n\n XXXXXXXXXXXXXXX \n\n\n\n Error saving board project: ${error}`);
    throw error;
  }
}