import db from 'bc/config/db.js';
import moment from 'moment';

const CodePhaseType = db.codePhaseType;
const Project = db.project;
import { 
  saveProjectStatusFromCero
} from 'bc/utils/create';

export const createAndUpdateStatus = async (project_id, creator, CODE_PROJECT_TYPE, transaction = null) => {
  const codePhaseForCapital = await CodePhaseType.findOne({
    where: {
      code_phase_type_id: CODE_PROJECT_TYPE,
    },
    transaction: transaction,
  });
  console.log(codePhaseForCapital)
  const { duration, duration_type } = codePhaseForCapital;
  const formatDuration = duration_type[0].toUpperCase();
  const response = await saveProjectStatusFromCero(
    CODE_PROJECT_TYPE,
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