import { addProjectToBoard } from 'bc/utils/create';
import logger from 'bc/config/logger.js';

export const addProjectsToBoard = async (user, servicearea, county, localNames, typesList, defaultProjectType, project_id, year, sendToWR, isWorkPlan, projectname, projectsubtype, transaction) => {
  const promisesLocal = [];
  for (let i = 0; i < localNames.length; i++) {
    const local = localNames[i];
    const type = typesList[i];
    if (local) {
      promisesLocal.push(addProjectToBoard(
        user,
        servicearea,
        county,
        local,
        defaultProjectType,
        project_id,
        year,
        sendToWR,
        isWorkPlan,
        projectname,
        projectsubtype,
        type,
        transaction
      ));
    }
  }
  try {
    await Promise.all(promisesLocal);
    logger.info('All projects added to board successfully');
  } catch (error) {
    logger.error(`Error adding projects to board: ${error}`);
  }
};