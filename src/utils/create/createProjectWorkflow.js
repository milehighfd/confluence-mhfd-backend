import {
  CREATE_PROJECT_TABLE,
} from 'bc/config/config.js';
import logger from 'bc/config/logger.js';
import { cleanStringValue } from 'bc/routes/new-project/helper.js';
import { 
  saveProject,
  saveCapital,
  checkCartoandDelete,
  createCartoEntry,
  createAndUpdateStatus,
  createLocalGovernments,
  createCounties,
  createServiceAreas,
  saveActions,
  uploadFiles,
  saveProjectPartner,
  saveCosts,
  insertIntoArcGis,
  addProjectToBoard,
} from 'bc/utils/create';
import db from 'bc/config/db.js';
import { ProjectError, ProjectBoardsError} from 'bc/errors/project.error.js';


const CodeCostType = db.codeCostType

const getOfficialProjectName = async (name) => name + (name === 'Ex: Stream Name @ Location 202X'? ('_' + Date.now()) : '');

export const createProjects = async (body, transaction, type) => {
  const { projectname, description, creator, maintenanceeligibility = null, geom } = body;
  let saveFn = saveProject;
  let createCarto = createCartoEntry;
  let createCartoInputs = [CREATE_PROJECT_TABLE, geom, project_id, transaction];
  let codeProjectTypeId = 0;
  switch(type) {
    case 'capital':
      saveFn = saveCapital;
      codeProjectTypeId = 5;
      break;
    default:
      saveFn = saveProject;
      break;
  };
  try {
    const data = await saveFn(
      cleanStringValue(getOfficialProjectName(projectname)),
      cleanStringValue(description),
      creator,
      maintenanceeligibility,
      transaction
    );
    const { project_id } = data;
    await checkCartoandDelete(
      CREATE_PROJECT_TABLE,
      project_id,
      transaction
    );
    await createCarto(...createCartoInputs);
    const project_statuses = await createAndUpdateStatus(project_id, creator, transaction, codeProjectTypeId);
    const projectData = { ...data, project_statuses };
    return projectData;
  } catch (error) {
    logger.error(error);
    throw new ProjectError('Error creating project or creatings statuses', { cause: error });
  }
};


const splitToArray = (string) => string ? string.split(',').map((item) => item.trim()) : [];
const addToBoard = async (body, user, type, subtype, transaction, project_id) => {
  const { jurisdiction, county, servicearea, year, sendToWR, isWorkPlan = null, projectname } = body;
  const splitedJurisdiction = splitToArray(jurisdiction);
  const splitedCounty = splitToArray(county);
  const splitedServicearea = splitToArray(servicearea);
  const { localitiesBoard, typesList } = createLocalitiesBoard(
    isWorkPlan,
    sendToWR,
    year,
    type,
    splitedJurisdiction,
    splitedCounty,
    splitedServicearea
  );

  try {
    const localNames = await getLocalitiesNames(localitiesBoard, transaction);
    if (isWorkPlan) {
      typesList.push('WORK_PLAN');
      localNames.push('MHFD District Work Plan');
    }
    // TODO: Danilson, please return board data to the next function
    await addProjectToBoard(user,
      servicearea,
      county,
      localNames,
      typesList,
      type,
      project_id,
      year,
      sendToWR,
      isWorkPlan,
      projectname,
      subtype,
      transaction);      
  } catch (error) {      
    logger.error(error);
    throw new ProjectBoardsError('Error adding project to board', { cause: error });
  }
}; 

try {
  await createLocalGovernments(splitedJurisdiction, project_id, user, transaction);
  console.log('Project local governments created successfully');
} catch (error) {
  console.error('Error creating project local governments:', error);
}


const createGeographicInfo = async (data, project_id, user, transaction, creatingFunction) => {
  try {
    await creatingFunction(data, project_id, user, transaction);
  } catch (error) {
    logger.error(error);
    throw error;
  };
};

const parseGeographicInfoAndCreate = async (body, project_id, user, transaction) => {
  const { jurisdiction, county, servicearea } = body;
  const splitedJurisdiction = splitToArray(jurisdiction);
  const splitedCounty = splitToArray(county);
  const splitedServicearea = splitToArray(servicearea);
  try {
    const project_local_governments = await createGeographicInfo(
      splitedJurisdiction,
      project_id,
      user,
      transaction,
      createLocalGovernments
    );
    const project_state_counties = await createGeographicInfo(
      splitedCounty,
      project_id,
      user,
      transaction,
      createCounties
    );
    const project_service_areas = await createGeographicInfo(
      splitedServicearea,
      project_id,
      user,
      transaction,
      createServiceAreas
    );
    return {
      project_local_governments,
      project_state_counties,
      project_service_areas
    }
  } catch(error) {
    logger.error(error);
    throw error;
  }
};

const extraFields = async(type, subtype, body, project_id, transaction, creator) => {
  const {
    additionalcost,
    additionalcostdescription,
    overheadcost,
    independentComponents,
    components,
    projectname,
    geom,
  } = body;
  try {
    const answer = {};
    switch(type) {
      case 'capital':
        // TODO: Danilson refactor the saveActions to get the list of actiosn and return that
        await saveActions(project_id, independentComponents, components, creator, transaction);
        const overhead = overheadcost.split(',').slice(1);
        const dataArcGis = await insertIntoArcGis(
          geom,
          project_id,
          cleanStringValue(projectname)
        );
        answer.dataArcGis = dataArcGis;

        // TODO: Danilson move this logic to his own funciton or functions
        // also you will need to create a proper error handling and throwing
        const overheadcostIds = await CodeCostType.findAll({
          attributes: [
            'code_cost_type_id'
          ],
          where: {
            is_overhead: true
          },
          transaction: transaction
        });
        // TODO: Danilson check this, the old logic seems to not work 
        const filtered = overheadcostIds.filter((element) => element.code_cost_type_id !== 2)
          .map((element) => element.code_cost_type_id).filter(Number);
        //create Costs entries
        const COST_ID = 4;
        // TODO: Danilson return the list of elements
        await saveCosts(project_id, additionalcost, COST_ID, additionalcostdescription, creator, filtered, overhead, transaction);
        
        break;
    };
  } catch (error) {
    throw error;
  }
};
export const createProjectWorkflow = async (body, user, files, type, subtype) => {
  try {
    const transaction = await db.sequelize.transaction();
    const data = await createProjects(body, transaction);
    const { project_id } = data;
    const { cover } = body;
    const project_attachments = await uploadFiles(user, files, project_id, cover, transaction);
    //Create entry for project Partner
    await saveProjectPartner(
      sponsor,
      cosponsor,
      project_id,
      transaction
    )
    await addToBoard(body, user, type, subtype, transaction, project_id);
    const geoInfo = await parseGeographicInfoAndCreate(body, project_id, user, transaction);
    const project_partner = await saveProjectPartner(
      sponsor,
      cosponsor,
      project_id,
      transaction
    );
    const composeData = { ...data, project_attachments, project_partner, ...geoInfo };
    await transaction.commit();
    return composeData;
  } catch (error) {
    logger.error(error);
    throw error;
  };
}