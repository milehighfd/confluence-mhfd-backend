import {
  CREATE_PROJECT_TABLE,
} from 'bc/config/config.js';
import logger from 'bc/config/logger.js';
import { 
  saveProject,
  saveCapital,
  checkCartoandDelete,
  createCartoEntry,
  createAndUpdateStatus,
  createLocalGovernment,
  createCounties,
  createServiceAreas,
  saveActions,
  uploadFiles,
  saveProjectPartner,
  saveCosts,
  insertIntoArcGis,
  addProjectsToBoard,
  createLocalitiesBoard,
  getLocalitiesNames,
  getOverheadCostIds,
  saveProjectDetails,
  saveAcquisition,
  saveSpecial,
  saveProjectStreams,
  saveStudy,
  createCartoStudy,
  saveStudyP,
  saveRestoration,
  saveRoutineTrash,
  saveSedimentRemoval,
  saveMinorRepairs,
  saveVegetationManagement,
  cleanStringValue
} from 'bc/utils/create';
import db from 'bc/config/db.js';
import { ProjectError, ProjectBoardsError} from '../../errors/project.error.js';


const CodeCostType = db.codeCostType

const getOfficialProjectName = (name) => name + (name === 'Ex: Stream Name @ Location 202X'? ('_' + Date.now()) : '');

export const createProjects = async (body, transaction, type, creator, subtype) => {
  console.log(subtype, 'type')
  const { projectname, description, maintenanceeligibility = null, geom } = body;
  let saveFn = saveProject;  
  let codeProjectTypeId = 0;
  switch(type) {
    case 'capital':
      saveFn = saveCapital;
      codeProjectTypeId = 5;
      break;
    case 'acquisition':
      saveFn = saveAcquisition;
      codeProjectTypeId = 13;
      break;
    case 'special':
      saveFn = saveSpecial;
      codeProjectTypeId = 15;
      break;
    case 'study':
      saveFn = saveStudyP;
      codeProjectTypeId = 1;
      break;
    case 'maintenance':
      switch (subtype){
        case 'Restoration':
          saveFn = saveRestoration;
          codeProjectTypeId = 7;
          break;
        case 'Routine Trash and Debris':
          saveFn = saveRoutineTrash;
          codeProjectTypeId = 8;
          break;
        case 'Sediment Removal':
          saveFn = saveSedimentRemoval;
          codeProjectTypeId = 9;
          break;
        case 'Minor Repairs':
          saveFn = saveMinorRepairs;
          codeProjectTypeId = 17;
          break;
        case 'Vegetation Management':
          saveFn = saveVegetationManagement;
          codeProjectTypeId = 11;
          break;
      }
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
    const project_statuses = await createAndUpdateStatus(project_id, creator, codeProjectTypeId, transaction);
    const projectData = { project_data: data, project_statuses, project_id: project_id };
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
    if (isWorkPlan === 'true') {
      typesList.push('WORK_PLAN');
      localNames.push('MHFD District Work Plan');
    }
    // TODO: Danilson, please return board data to the next function
    await addProjectsToBoard(user,
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
      createLocalGovernment
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
    independentComponent,
    components,
    projectname,
    geom,
    ids,
    streams,
    studyreason,
    otherReason,
  } = body;
  try {
    const answer = {};
    let createCartoInputs = [CREATE_PROJECT_TABLE, geom, project_id, transaction];
    let createCarto = createCartoEntry;
    switch(type) {
      case 'capital':                
        await createCarto(...createCartoInputs);
        const resActions = await saveActions(project_id, independentComponent, components, creator, transaction);
        answer.resActions = resActions;
        const overhead = overheadcost.split(',').slice(1);
        const dataArcGis = await insertIntoArcGis(
          geom,
          project_id,
          cleanStringValue(projectname)
        );
        answer.dataArcGis = dataArcGis;
        const overheadCostIds = await getOverheadCostIds(transaction);  
        const COST_ID = 4;
        const resCost = await saveCosts(project_id, additionalcost, COST_ID, additionalcostdescription, creator, overheadCostIds, overhead, transaction);
        answer.resCost = resCost;
        break;
      case 'acquisition':        
        await createCarto(...createCartoInputs);
        const resDetails = await saveProjectDetails(project_id, body, creator, transaction);
        answer.resDetails = resDetails;
        break;
      case 'special':
        await createCarto(...createCartoInputs);
        const resSpecial = await saveProjectDetails(project_id, body, creator, transaction);
        answer.resSpecial = resSpecial;
        break;
      case 'study':
        await createCartoStudy(project_id, ids)
        const resStreams = await saveProjectStreams(project_id, streams, transaction); 
        answer.resStreams = resStreams;
        const resStudy = await saveStudy(project_id, studyreason, creator, otherReason || null, transaction);
        answer.resStudy = resStudy;
        break;
      case 'maintenance':
        await createCarto(...createCartoInputs);
        const resMaintenance = await saveProjectDetails(project_id, body, creator, transaction);
        answer.resMaintenance = resMaintenance;
        break;      
    };
    return answer;
  } catch (error) {
    logger.error('error saving extra fields');
    throw error;
  }
};
export const createProjectWorkflow = async (body, user, files, type, subtype) => {
  try {
    const transaction = await db.sequelize.transaction();
    const data = await createProjects(body, transaction, type, user.email, subtype);
    const { project_id } = data;
    const { cover, sponsor, cosponsor } = body;
    const project_attachments = await uploadFiles(user, files, project_id, cover, transaction);
    await addToBoard(body, user, type, subtype, transaction, project_id);
    const geoInfo = await parseGeographicInfoAndCreate(body, project_id, user, transaction);
    const project_partner = await saveProjectPartner(
      sponsor,
      cosponsor,
      project_id,
      transaction
    );
    const extra_fields = await extraFields(type, subtype, body, project_id, transaction, user.email);
    const composeData = { ...data, project_attachments, project_partner, ...geoInfo, extra_fields};
    await transaction.commit();
    return composeData;
  } catch (error) {
    logger.error(error);
    throw error;
  };
}