import {
  CREATE_PROJECT_TABLE,
} from 'bc/config/config.js';
import logger from 'bc/config/logger.js';
import { 
  updateProject,
  toggleName,
  uploadFiles,
  checkCartoandDelete,
  updateLocalGovernment,
  updateCounties,
  updateServiceArea,
  updateProjectPartner,
  createCartoEntry,
  getOverheadCostIds,
  updateCosts,
  updateActions,
  deleteIndependentAction,
  deleteProposedAction,
  updateProjectsInBoard,
  cleanStringValue,
  updateProjectDetail,
  updateStudy,
  createCartoStudy,
  updateIntoArcGis,
  parseIds,
  getGeomGeojson
} from 'bc/utils/create';
import db from 'bc/config/db.js';
import { EditProjectError} from '../../errors/project.error.js';
import { deleteStreams } from './deleteStreams.js';
import { updateStreams } from './updateStreams.js';

export const editProjects = async (body, transaction, type, creator, subtype, project_id) => {
  try {
    const { projectname, description, maintenanceeligibility = null, geom, isCountyWide, isSouthPlate } = body;
    let southPlate = 0;
    let countyWide = 0;
    if (isSouthPlate === 'true'){
      southPlate = 1;
    }else{
      southPlate = 0;
    }
    if (isCountyWide === 'true'){
      countyWide = 1;
    }else{
      countyWide = 0;
    }
    let updateFn = updateProject;
    const data = await updateFn(
      project_id,
      cleanStringValue(projectname),
      cleanStringValue(description),
      creator,      
      countyWide,
      southPlate,
      maintenanceeligibility,
      transaction
    );
    await checkCartoandDelete(
      CREATE_PROJECT_TABLE,
      project_id,
      transaction
    );
    const projectData = { project_data: data, project_id: project_id };
    return projectData;
  } catch (error) {
    logger.error(error);
    throw new EditProjectError('Error editing project', { cause: error });
  }
}

const updateGeographicInfo = async (data, project_id, user, transaction, creatingFunction) => {
  try {
    await creatingFunction(project_id, data, user, transaction);
  } catch (error) {
    logger.error(error);
    throw error;
  };
};

const splitToArray = (string) => string ? string.split(',').map((item) => item.trim()) : [];
const parseGeographicInfoAndUpdate = async (body, project_id, user, transaction) => {
  const { jurisdiction, county, servicearea } = body;
  const splitedJurisdiction = splitToArray(jurisdiction);
  const splitedCounty = splitToArray(county);
  const splitedServicearea = splitToArray(servicearea);
  try {
    const project_local_governments = await updateGeographicInfo(
      splitedJurisdiction,
      project_id,
      user,
      transaction,
      updateLocalGovernment
    );
    const project_state_counties = await updateGeographicInfo(
      splitedCounty,
      project_id,
      user,
      transaction,
      updateCounties
    );
    const project_service_areas = await updateGeographicInfo(
      splitedServicearea,
      project_id,
      user,
      transaction,
      updateServiceArea
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

const updateExtraFields = async(type, subtype, body, project_id, transaction, creator) => {
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
    switch (type) {
      case 'capital':
        await createCarto(...createCartoInputs);
        const overheadCostIds = await getOverheadCostIds(transaction);
        const overhead = overheadcost.split(',').slice(1);
        const COST_ID = 4;
        const costRes = await updateCosts(project_id, additionalcost, COST_ID, additionalcostdescription, creator, overheadCostIds, overhead, transaction);
        answer.costRes = costRes;
        const deletePARes = await deleteProposedAction(project_id, transaction);
        answer.deletePARes = deletePARes;
        const deleteIARes = await deleteIndependentAction(project_id, transaction);
        answer.deleteIARes = deleteIARes;
        const actionRes = await updateActions(project_id, independentComponent, components, creator, transaction);        
        answer.actionRes = actionRes;
        await deleteStreams(project_id, transaction);
        const resStreamsCap = await updateStreams(project_id, streams, transaction); 
        answer.resStreams = resStreamsCap;
        break;
      case 'acquisition':        
        await createCarto(...createCartoInputs);
        const resDetails = await updateProjectDetail(project_id, body, creator, transaction);
        answer.resDetails = resDetails;
        break;
      case 'special':
        await createCarto(...createCartoInputs);
        const resSpecial = await updateProjectDetail(project_id, body, creator, transaction);
        answer.resSpecial = resSpecial;
        break;
      case 'study':
        await createCartoStudy(project_id, ids)
        await deleteStreams(project_id, transaction);
        const resStreams = await updateStreams(project_id, streams, transaction); 
        answer.resStreams = resStreams;
        const resStudy = await updateStudy(project_id, studyreason, creator, otherReason || null, transaction);
        answer.resStudy = resStudy;
        break;
      case 'maintenance':
        await createCarto(...createCartoInputs);
        const resMaintenance = await updateProjectDetail(project_id, body, creator, transaction);
        answer.resMaintenance = resMaintenance;
        await deleteStreams(project_id, transaction);
        const resStreamsMain = await updateStreams(project_id, streams, transaction); 
        answer.resStreams = resStreamsMain;
        break;      
    };
    if (type !== 'study') {
      answer.arcgis = await updateIntoArcGis(geom, project_id);
    } else {
      console.log('about to call getGeomGeojson with this ids', ids);
      const geomGeojson = await getGeomGeojson(parseIds(ids));
      console.log('This is the geom for study', geomGeojson);
      answer.arcgis = await updateIntoArcGis(geomGeojson, project_id);
    }
    
    return answer;
  } catch (error) {
    logger.error('error saving extra fields');
    throw error;
  }
};

export const editProjectWorkflow = async (body, user, files, type, subtype, project_id) => {
  try {
    const transaction = await db.sequelize.transaction();
    const data = await editProjects(body, transaction, type, user.email, subtype, project_id);
    const { cover, sponsor, cosponsor, projectname } = body;
    if (cover !== ''){
      await toggleName(cover, project_id, transaction);
    }    
    const project_attachments = await uploadFiles(user, files, project_id, cover, transaction);
    const boardData = await updateProjectsInBoard(project_id, projectname, type, subtype, transaction);
    const geoInfo = await parseGeographicInfoAndUpdate(body, project_id, user, transaction);
    const project_partner = await updateProjectPartner(
      sponsor,
      cosponsor,
      project_id,
      transaction
    );
    const extra_fields = await updateExtraFields(type, subtype, body, project_id, transaction, user.email);
    const composeData = { project_update: data, project_attachments, project_partner, boardData, ...geoInfo, ...extra_fields};   
    await transaction.commit();
    return composeData;
  } catch (error) {
    logger.error(error);
    throw error;
  };
}