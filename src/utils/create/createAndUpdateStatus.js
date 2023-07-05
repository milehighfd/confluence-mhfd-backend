import db from 'bc/config/db.js';
import moment from 'moment';

const CodePhaseType = db.codePhaseType;
const Project = db.project;
import { 
  saveProjectStatusFromCero
} from 'bc/utils/create';

export const createAndUpdateStatus = async (project_id, creator, CODE_PROJECT_TYPE, transaction = null) => {
  let codePhaseType = await CodePhaseType.findOne({
    where: {
      code_project_type_id: CODE_PROJECT_TYPE,
    },
    transaction: transaction,
  });
  if (!codePhaseType) {
    codePhaseType = await CodePhaseType.findOne();
  }
  console.log(codePhaseType)
  const { duration, duration_type } = codePhaseType;
  const formatDuration = duration_type[0].toUpperCase();
  const response = await saveProjectStatusFromCero(
    codePhaseType.code_phase_type_id,
    project_id,    
    Number(duration),
    formatDuration,
    creator,    
    transaction
  );
  await Project.update(
    {
      current_project_status_id: response.project_status_id,
    },
    {
      where: { project_id: project_id },
      transaction: transaction,
    }
  );
  return response;
};