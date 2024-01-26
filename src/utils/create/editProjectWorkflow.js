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
  getGeomProject,
  createLocalitiesBoard,
  getLocalitiesNames,
  addProjectsToBoard,
  saveSubtotalcost,
  saveEstimatedCost,
  processStreamUpdates
} from 'bc/utils/create';
import db from 'bc/config/db.js';
import { EditProjectError, ProjectBoardsError} from '../../errors/project.error.js';
import { deleteStreams } from './deleteStreams.js';
import { updateStreams } from './updateStreams.js';

const BoardProject = db.boardProject;
const Board = db.board;
const BoardProjectCost = db.boardProjectCost;

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

const updateExtraFields = async(type, subtype, body, project_id, transaction, creator, isWorkPlan) => {
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
    subtotalcost,
    estimatedcostInput,
    overheadcostdescription,
    estimatedcostDescription,
    estimatedcost,
    userChangedOverhead,
    userChangedAdditional
  } = body;
  try {
    const PROJECT_TYPES = {
      capital: 'capital',
      acquisition: 'acquisition',
      research: 'research and development',
      study: 'study',
      maintenance: 'maintenance'
    }
    const answer = {};
    let createCartoInputs = [CREATE_PROJECT_TABLE, geom, project_id, transaction];
    let createCarto = createCartoEntry;
    const booleanUserChangedAdditional = userChangedAdditional === 'true';
    switch (type) {
      case PROJECT_TYPES.capital:
        await createCarto(...createCartoInputs);
        const overheadCostIds = await getOverheadCostIds(transaction);
        const overhead = overheadcost.split(',');
        const COST_ID = 4;
        const costRes = await updateCosts(project_id, additionalcost, COST_ID, additionalcostdescription, creator, overheadCostIds, overhead, overheadcostdescription, userChangedOverhead, booleanUserChangedAdditional, transaction);
        answer.costRes = costRes;
        console.log('Before subtotal');
        const saveSubtotal = await saveSubtotalcost(project_id, subtotalcost, creator, transaction);
        console.log('After subtotal');
        answer.saveSubtotal = saveSubtotal;
        let savingEstimatedCostInput = estimatedcost;
        let sourceFromSystem = true;
        if (estimatedcostInput !== 'null' && estimatedcostInput !== null) {
          savingEstimatedCostInput = estimatedcostInput;
          sourceFromSystem = false;
        }
        const saveEstimatedcost = await saveEstimatedCost(project_id, savingEstimatedCostInput, creator, estimatedcostDescription, sourceFromSystem, transaction);
        answer.saveEstimatedcost = saveEstimatedcost;
        // const deletePARes = await deleteProposedAction(project_id, transaction);
        // answer.deletePARes = deletePARes;
        console.log('************* \n\n\n about to call independentttt', independentComponent);
        // const deleteIARes = await deleteIndependentAction(project_id, transaction);
        // answer.deleteIARes = deleteIARes;
        const actionRes = await updateActions(project_id, independentComponent, components, creator, transaction);        
        answer.actionRes = actionRes;
        // await deleteStreams(project_id, transaction);
        // const resStreamsCap = await updateStreams(project_id, streams, creator, transaction); 
        const resStreamsCap = await processStreamUpdates(project_id, streams, creator, transaction);
        answer.resStreams = resStreamsCap;
        break;
      case PROJECT_TYPES.acquisition:       
        await createCarto(...createCartoInputs);
        const resDetails = await updateProjectDetail(project_id, body, creator, transaction);
        answer.resDetails = resDetails;
        break;
      case PROJECT_TYPES.research:
        await createCarto(...createCartoInputs);
        const resSpecial = await updateProjectDetail(project_id, body, creator, transaction);
        answer.resSpecial = resSpecial;
        break;
      case PROJECT_TYPES.study:
        await createCartoStudy(project_id, ids)
        // await deleteStreams(project_id, transaction);
        // const resStreams = await updateStreams(project_id, streams, creator, transaction); 
        const resStreams = await processStreamUpdates(project_id, streams, creator, transaction);
        answer.resStreams = resStreams;
        const resStudy = await updateStudy(project_id, studyreason, creator, otherReason || null, transaction);
        answer.resStudy = resStudy;
        break;
      case PROJECT_TYPES.maintenance:
        await createCarto(...createCartoInputs);
        const resMaintenance = await updateProjectDetail(project_id, body, creator, transaction);
        answer.resMaintenance = resMaintenance;
        // await deleteStreams(project_id, transaction);
        // const resStreamsMain = await updateStreams(project_id, streams, creator, transaction); 
        const resStreamsMain = await processStreamUpdates(project_id, streams, creator, transaction);
        answer.resStreams = resStreamsMain;
        break;      
    };
    console.log('************* \n\n\n finish carto create and about to call updateIntoArcGis', type);

    
    return answer;
  } catch (error) {
    logger.error('error saving extra fields '+error);
    throw error;
  }
};
// commented until next release
const editWRBoard = async (body, user, type, subtype, transaction, project_id) => {
  const { county, servicearea, year, sendToWR, isWorkPlan = null, projectname, sponsorId, sponsor } = body;
  const YEAR_WORKPLAN_V2 = 2024;
  const { localitiesBoard, typesList } = createLocalitiesBoard(
    isWorkPlan,
    sendToWR,
    year,
    type,
    [],
    [],
    [],
    sponsorId
  );
  try {
    const localNames = await getLocalitiesNames(localitiesBoard, transaction);
    if (sponsor === 'MHFD' && year >= YEAR_WORKPLAN_V2) {
      typesList.push('WORK_PLAN');
      localNames.push('MHFD District Work Plan');
    }
    const boardProjectMHFD = await BoardProject.findOne({
      where: {
        project_id: project_id
      },
      include: [
        {
          model: Board,
          attributes: ['locality'],
          where: {
            locality: 'MHFD District Work Plan',
            type: 'WORK_PLAN',
            year: year,
            projecttype: type,
          }
        }
      ],
      transaction
    });    
    const boardProjectOfPId = await BoardProject.findOne({
      where: {
        project_id: project_id
      },
      include: [
        {
          model: Board,
          attributes: ['locality'],
          where: {
            type: 'WORK_REQUEST',
            year: year,
            projecttype: type,
          }
        }
      ],      
      transaction
    });
    if ((boardProjectOfPId || boardProjectMHFD) 
    && !localNames.includes(boardProjectOfPId?.board?.locality) 
    && !localNames.includes(boardProjectMHFD?.board?.locality) 
    && year >= YEAR_WORKPLAN_V2) 
    {      
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
      if (boardProjectOfPId){
        await BoardProjectCost.destroy({
          where: {
            board_project_id : boardProjectOfPId.board_project_id
          },
          transaction
        });
        await boardProjectOfPId.destroy({ transaction });
      }
      if (year >= YEAR_WORKPLAN_V2 && sponsor.toUpperCase() !== 'MHFD' && boardProjectMHFD) {
        await BoardProjectCost.destroy({
          where: {
            board_project_id: boardProjectMHFD.board_project_id
          },
          transaction
        });
        await boardProjectMHFD.destroy({ transaction });
      }
      return 'Board updated successfully';
    }else{
      return 'Board not updated';
    }
  } catch (error) {      
    logger.error(error);
    throw new ProjectBoardsError('Error adding project to board', { cause: error });
  }
}; 

export const editProjectWorkflow = async (body, user, files, type, subtype, project_id) => {
  const transaction = await db.sequelize.transaction();
  try {    
    const data = await editProjects(body, transaction, type, user.email, subtype, project_id);
    const { cover, sponsor, cosponsor, projectname, isWorkPlan } = body;
    if (cover !== ''){
      await toggleName(cover, project_id, transaction);
    }    
    console.log('XA');
    const project_attachments = await uploadFiles(user, files, project_id, cover, transaction);
    console.log('XB');
    const updateBoardWR = await editWRBoard(body, user, type, subtype, transaction, project_id);
    console.log('XX');
    const boardData = await updateProjectsInBoard(project_id, projectname, type, subtype, transaction);
    console.log('XD');
    const geoInfo = await parseGeographicInfoAndUpdate(body, project_id, user, transaction);
    console.log('XE');
    const project_partner = await updateProjectPartner(
      sponsor,
      cosponsor,
      project_id,
      transaction,
      isWorkPlan
    );
    console.log('************* \n\n\n about to call extra fields');
    const extra_fields = await updateExtraFields(type, subtype, body, project_id, transaction, user.email, isWorkPlan);
    const composeData = { project_update: data, project_attachments, project_partner, boardData, ...geoInfo, ...extra_fields, updateBoardWR};   
    await transaction.commit();
    return composeData;
  } catch (error) {    
    await transaction.rollback();
    logger.error('Error at Edit project workflow ' + error);
    throw error;
  };
}

export const updateProjectArcgis = async( body ) => {
  try {
    const { geom, project_id, ids, type} = body;
    let arcgis;
    if (type !== 'study') {
      arcgis = await updateIntoArcGis(geom, project_id);
    } else {
      console.log('about to call getGeomGeojson with this ids', ids);
      const geomGeojson = await getGeomProject(project_id);
      console.log('This is the geom for study', geomGeojson);
      arcgis = await updateIntoArcGis(geomGeojson, project_id);
    }
    return arcgis;
  } catch(error){
    logger.error(error);
    throw error;
  }
}