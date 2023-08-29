import express from 'express';
import Multer from 'multer';
import needle from 'needle';
import projectService from 'bc/services/project.service.js';
import {
  CARTO_URL,
  CREATE_PROJECT_TABLE,
  CREATE_PROJECT_TABLE_V2,
  ARCGIS_SERVICE
} from 'bc/config/config.js';
import db from 'bc/config/db.js';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';
import { 
  saveProject, 
  createLocalGovernment, 
  createCounties, 
  createServiceAreas,
  checkCartoandDelete,
  createCartoEntry,
  createAndUpdateStatus,
  uploadFiles,
  getLocalitiesNames,
  createLocalitiesBoard,
  addProjectsToBoard,
  saveProjectPartner,
  saveCosts,
  saveActions,
  insertIntoArcGis,
  updateProject,
  toggleName,
  cleanStringValue,
  updateProjectsInBoard,
  updateProjectPartner,
  updateCosts,
  updateLocalGovernment,
  updateServiceArea,
  updateCounties,
  deleteProposedAction,
  deleteIndependentAction,
  updateActions
} from 'bc/utils/create';

const CodeCostType = db.codeCostType

const router = express.Router();
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

const getTokenArcGis = async () => {
  const URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
  const fd = projectService.getAuthenticationFormData();
  const token_data = await needle('post', URL_TOKEN, fd, { multipart: true });
  const TOKEN = JSON.parse(token_data.body).token;
  return TOKEN;
}

const getGeomsToUpdate = async (TOKEN) => {
  try {
    const LIST_ARCGIS = `${ARCGIS_SERVICE}/query?where=update_flag%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryPolyline&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=update_flag%2C+project_id%2C+OBJECTID&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=geojson`;
    
    var header = {
      headers: {
          'Authorization': `Bearer ${TOKEN}`
      },
      accept: 'application/json',
      content_type: 'application/json'
    };
    const allGeoms = await needle('get', LIST_ARCGIS, header);
    if (allGeoms.statusCode === 200) {
      return {
        success: true,
        geoms: JSON.parse(allGeoms.body).features
      }
    } else {
      return {
        success: false
      }
    }
  } catch(error) {
    console.log('error at geom update', error);
    return {
      success: false,
      error: error
    }
  }
}

const sleep = m => new Promise(r => setTimeout(r, m))

const insertGeojsonToCarto = async (geojson, projectId) => {
  let deleteAttemp = 0;
  let tries = 3;
  while(true) {
    try {
      const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectid) VALUES(ST_GeomFromGeoJSON('${geojson}'), ${projectId})`;
      const query = {
        q: insertQuery
      };
      const data = await needle('post', CARTO_URL, query, { json: true });
      if (data.statusCode === 200) {
        return {
          success: true
        }
      } else {
        console.log('FAILED AT INSERT GEOJSON TO CARTO', data.statusCode, data.body);
        if (++deleteAttemp >= tries) {
          return {
            success: false,
            error: data.body
          }
        }
      }
    } catch (error) {
      console.error('Error at insert into carto geojson', error);
      if (++deleteAttemp >= tries) {
        return {
          success: false,
          error: error
        }
      }
    }
    await sleep(1000);
  }
}

const deleteFromCarto = async (projectid) => {
  let deleteAttemp = 0;
  let tries = 3;
  while (true) {
    try {
      const deletequery = `DELETE FROM ${CREATE_PROJECT_TABLE} WHERE projectid = ${projectid}`;
      const query = {
        q: deletequery
      };
      const data = await needle('post', CARTO_URL, query, { json: true });
      if (data.statusCode === 200) {
        return {
          success: true,
          body: data.body
        }
      } else {
        if (++deleteAttemp >= tries) {
          return {
            success: false,
            error: 'Tried 3 attemps'
          }
        }
      }
    } catch (error) {
      if (++deleteAttemp >= tries) {
        return {
          success: false,
          error: error
        }
      }
    }
    await sleep(1000);
  }
}
const updateFlagArcGis = async (objectid, value, TOKEN) => {
  let deleteAttemp = 0;
  let tries = 3;
  while(true) {
    try {
      const URL_UPDATE_ATTRIB = `${ARCGIS_SERVICE}/applyEdits`;
      const formData = {
        'f': 'json',
        'token': TOKEN,
        'updates': JSON.stringify([{"attributes":{"OBJECTID":objectid,"update_flag":value}}])
      };
      const updateFlagAG = await needle('post', URL_UPDATE_ATTRIB, formData, { multipart: true });
      if (updateFlagAG.statusCode === 200 && updateFlagAG.body.updateResults) {
        return {
          success: true,
          updated: updateFlagAG.body.updateResults.success
        }
      } else {
        console.log('Failed at update Flag ArcGis', deleteAttemp, updateFlagAG.body);
        if (++deleteAttemp >= tries) {
          return {
            success: false,
            error: updateFlagAG.body.error
          }
        }
      }
    } catch(error) {
      console.error('error at update flag arcgis', error);
      if (++deleteAttemp >= tries) {
        return {
          success: false,
          error: error
        }
      }
    }
    await sleep(1000);
  }
}

router.get('/sync', async (req, res) => {
  const TOKEN = await getTokenArcGis();
  const geoms = await getGeomsToUpdate(TOKEN); // here I have the geoms in geojson
  let isCorrectSync = false;
  const syncGeoms = [];
  // TODO: save the geom to carto
  console.log(
    'SYNC ******* \n\n Get Geometries from ArcGis',
    geoms.success,
    geoms?.geoms?.length,
    geoms
  );
  try {
    if (geoms.success) {
      const TOTAL_GEOMS = geoms.geoms.length;
      for (let i = 0; i < geoms.geoms.length; ++i) {
        // if (i > 2) break;
        let currentGeojsonToUpdate = geoms.geoms[i];
        const currentProjectId = currentGeojsonToUpdate.properties.project_id;
        const currentObjectId = currentGeojsonToUpdate.properties.OBJECTID;
        const deleteFC = await deleteFromCarto(currentProjectId); // its working, is deleting indeed
        console.log('Delete from Carto ', deleteFC);
        if (deleteFC.success) {
          const inserted = await insertGeojsonToCarto(
            JSON.stringify(currentGeojsonToUpdate.geometry),
            currentProjectId
          );
          console.log('SYNC ******* \n\n Inserted into Carto', inserted);
          if (inserted.success) {
            const upflag = await updateFlagArcGis(currentObjectId, 0, TOKEN);
            console.log('SYNC ******* \n\n Updated in ArcGIS');
            if (upflag.success) {
              console.log('Complete ', i, '/', TOTAL_GEOMS);
              isCorrectSync = true;
              syncGeoms.push({
                projectid: currentProjectId,
                sync: isCorrectSync,
              });
            } else {
              syncGeoms.push({
                projectid: currentProjectId,
                sync: false,
                error: upflag.error ? upflag.error : 'failed at update flag',
              });
            }
          } else {
            console.error('failed at insert into Carto');
            syncGeoms.push({
              projectid: currentProjectId,
              sync: false,
            });
          }
        } else {
          console.error('failed in delete Geom from Carto');
          syncGeoms.push({
            projectid: currentProjectId,
            sync: false,
          });
        }
      }
    }
    return res.send(syncGeoms);
  } catch (error) {
    console.error('error at Syncronization', error);
    return res.send('Failed At Syncronization', error);
  }
});


router.post('/', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const {    
    isWorkPlan,
    projectname,
    description,
    servicearea,
    county,
    geom,
    overheadcost,
    overheadcostdescription,
    additionalcost,
    additionalcostdescription,
    independentComponent,
    locality,
    components,
    jurisdiction,
    sponsor,
    cosponsor,
    cover,
    estimatedcost,
    year,
    sendToWR,
    componentcost,
    componentcount,
  } = req.body;
  const creator = user.email;
  const defaultProjectId = '5';
  const defaultProjectType = 'Capital';
  let result = [];
  const splitedJurisdiction = jurisdiction.split(',');
  const splitedCounty = county ? county.split(',') : [];
  const splitedServicearea = servicearea.split(',');
  const splitedOverheadcost = overheadcost.split(',');
  const filterFrontOverheadCosts = splitedOverheadcost.slice(1);
  const aditionalCostId = 4;
  const transaction = await db.sequelize.transaction();  
  try {    
    //Create entry in project table
    const officialProjectName = projectname + (projectname === 'Ex: Stream Name @ Location 202X'? ('_' + Date.now()) : '')
    const data = await saveProject(
      CREATE_PROJECT_TABLE_V2,
      cleanStringValue(officialProjectName),
      cleanStringValue(description),
      defaultProjectId,
      moment().format('YYYY-MM-DD HH:mm:ss'),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      creator,
      creator,
      null,
      transaction
    );
    result.push(data);
    //Delete geom from carto and insert new one
    const { project_id } = data;
    await checkCartoandDelete(
      CREATE_PROJECT_TABLE,
      project_id,
      transaction
    );
    await createCartoEntry(CREATE_PROJECT_TABLE, geom, project_id,transaction);
    //Obtain first phase for type project, create entry in project status table and update project table
    const CODE_PROJECT_TYPE = 5;
    try {
      const response = await createAndUpdateStatus(project_id, creator, CODE_PROJECT_TYPE, transaction);
      console.log(response);
    } catch (error) {      
      console.error(error);
      throw error;
    } 
    //Create Attachments entry
    let attachmentResponse = {};
    try {
      attachmentResponse = await uploadFiles(user, req.files, project_id, cover, transaction);
      console.log('Attachment response:', attachmentResponse);
    } catch (error) {
      console.error('Failed to upload files:', error);
      throw error;
    }
    result.push(attachmentResponse);
    // Start of Add or Create Board
    const projectsubtype = '';      
    const PROJECT_TYPE = 'Capital';
    const { localitiesBoard, typesList } = createLocalitiesBoard(isWorkPlan, sendToWR, year, PROJECT_TYPE, splitedJurisdiction, splitedCounty, splitedServicearea);
    const localNames = await getLocalitiesNames(localitiesBoard, transaction);
    if (isWorkPlan === 'true'){
      typesList.push('WORK_PLAN');
      localNames.push('MHFD District Work Plan');
    }
    try {
      await addProjectsToBoard(user, servicearea, county, localNames, typesList, defaultProjectType, project_id, year, sendToWR, isWorkPlan, projectname, projectsubtype, transaction);      
    } catch (error) {      
      console.error(error);
      throw error;
    }
    //Create entry for project Partner
    await saveProjectPartner(
      sponsor,
      cosponsor,
      project_id,
      transaction
    );
    //Find Overhead cost and create entry in project cost table
    const overheadcostIds = await CodeCostType.findAll({
      attributes: [
        'code_cost_type_id'
      ],
      where: {
        is_overhead: true
      },
      transaction: transaction
    });
    const filtered = overheadcostIds.map((element) => {
      if (element.code_cost_type_id !== 2) {
        return element.code_cost_type_id
      }
    }).filter(Number);
    //create Costs entries
    try {
      await saveCosts(project_id, additionalcost, aditionalCostId, additionalcostdescription, creator, filtered, filterFrontOverheadCosts, transaction);
    } catch (error) {
      console.error(error);
      throw error;
    }
    //Create entries for jurisdiction
    try {
      await createLocalGovernment(splitedJurisdiction, project_id, user, transaction);
      console.log('Project local governments created successfully');
    } catch (error) {
      console.error('Error creating project local governments:', error);
      throw error;
    }
    //Create entries for service area
    try {
      await createServiceAreas(splitedServicearea, project_id, user, transaction);   
      console.log('Service areas created successfully!');
    } catch (error) {
      console.error('Failed to create service areas:', error);
      throw error;
    }
    //Create entries for county
    try {
      await createCounties(splitedCounty, project_id, transaction); 
      console.log('Counties created successfully!');
    } catch (error) {
      console.error('Failed to create counties:', error);
      throw error;
    }
    //Insert actions and independent actions
    try {
      await saveActions(project_id, independentComponent, components, creator, transaction);
    } catch (error) {
      console.error(error);
      throw error;
    }
    //InsertIntoArcGis
    const dataArcGis = await insertIntoArcGis(
      geom,
      project_id,
      cleanStringValue(projectname)
    );
    await transaction.commit();
    result.push(dataArcGis);
    res.send([1]);
  } catch (error) {
    await transaction.rollback();
    logger.error('error at create capital'+ error);
    res.status(500).send(error)
  }  
});

router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
  const project_id = req.params.projectid;
  const user = req.user;
  const {
    isWorkPlan,
    projectname,
    description,
    servicearea,
    county,
    geom,
    overheadcost,
    overheadcostdescription,
    additionalcost,
    additionalcostdescription,
    independentComponent,
    locality,
    components,
    jurisdiction,
    sponsor,
    cosponsor,
    cover,
    estimatedcost,
    year,
    sendToWR,
    componentcost,
    componentcount,
  } = req.body;
  const creator = user.email;
  let result = [];
  const splitedJurisdiction = jurisdiction.split(',');
  const splitedCounty = county.split(',');
  const splitedServicearea = servicearea.split(',');
  const splitedOverheadcost = overheadcost.split(',').filter((e) => e >= 0);
  const aditionalCostId = 4;
  const transaction = await db.sequelize.transaction(); 
  try {  
    const data = await updateProject(
      project_id,
      cleanStringValue(projectname),
      cleanStringValue(description),
      creator,
      null,
      transaction
    );
    result.push(data);
    await checkCartoandDelete(
      CREATE_PROJECT_TABLE,
      project_id,
      transaction
    );
    await createCartoEntry(CREATE_PROJECT_TABLE, geom, project_id, transaction);
    const projectsubtype = '';
    const projecttype = 'Capital';
    await toggleName(cover, transaction);
    await uploadFiles(user, req.files, project_id, cover, transaction);
    await updateProjectsInBoard(
      project_id,
      cleanStringValue(projectname),
      projecttype,
      projectsubtype,
      transaction
    );
    await updateProjectPartner(
      sponsor,
      cosponsor,
      project_id,
      transaction
    );

    const overheadcostIds = await CodeCostType.findAll({
      attributes: [
        'code_cost_type_id'
      ],
      where: {
        is_overhead: true
      },
    });
    const filtered = overheadcostIds.map((element) => {
      if (element.code_cost_type_id !== 2) {
        return element.code_cost_type_id
      }
    }).filter(Number);
    try {
      await updateCosts(project_id, additionalcost, aditionalCostId, additionalcostdescription, creator, splitedOverheadcost, filtered, transaction);
    } catch (error) {
      console.error(error);
      throw error;
    }
    try {
      await updateLocalGovernment(project_id,splitedJurisdiction, user, transaction);
      console.log('Project local governments created successfully');
    } catch (error) {
      console.error('Error updating project local governments:', error);
      throw error;
    }    
    try {
      await updateServiceArea(project_id, splitedServicearea, user, transaction);
      console.log('Service areas created successfully!');
    } catch (error) {
      console.error('Failed to update service areas:', error);
      throw error;
    }
    try {
      await updateCounties(project_id, splitedCounty, user, transaction);
      console.log('Counties created successfully!');
    } catch (error) {
      console.error('Failed to create counties:', error);
      throw error;
    }
    try {
      await deleteProposedAction(project_id, transaction);
      await deleteIndependentAction(project_id, transaction);    
      console.log('Actions deleted successfully!');
    } catch (error) {
      console.error('Failed to delete actions:', error);
      throw error;
    }     
    try {
      await updateActions(project_id, independentComponent, components, creator, transaction);
      console.log('actions updated successfully!');
    } catch (error) {
      console.error('Failed to update actions:', error);
      throw error;
    }
    await transaction.commit();
    res.send(result);
  } catch (error) {
    await transaction.rollback();
    logger.error(error);
    res.status(500).send({ message: `Error creating project: ${error}` });
  };
});

export default router;
