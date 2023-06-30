import express from 'express';
import Multer from 'multer';
import needle from 'needle';
import projectIndependentActionService from 'bc/services/projectIndependentAction.service.js';
import projectProposedActionService from 'bc/services/projectProposedAction.service.js';
import projectService from 'bc/services/project.service.js';
import attachmentService from 'bc/services/attachment.service.js';
import projectStatusService from 'bc/services/projectStatus.service.js';
import cartoService from 'bc/services/carto.service.js';
import {
  CARTO_URL,
  CREATE_PROJECT_TABLE,
  CREATE_PROJECT_TABLE_V2,
  ARCGIS_SERVICE
} from 'bc/config/config.js';
import db from 'bc/config/db.js';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';
import { addProjectToBoard, cleanStringValue, updateProjectsInBoard } from 'bc/routes/new-project/helper.js';
import moment from 'moment';
import projectPartnerService from 'bc/services/projectPartner.service.js';
import costService from 'bc/services/cost.service.js';
import { 
  saveProject, 
  createLocalGovernments, 
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
} from 'bc/utils/create';
import boardService from 'bc/services/board.service.js';


const ProjectLocalGovernment = db.projectLocalGovernment;
const ProjectCounty = db.projectCounty;
const ProjectServiceArea = db.projectServiceArea;
const Project = db.project;
const CodePhaseType = db.codePhaseType;
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
    const LIST_ARCGIS = `${ARCGIS_SERVICE}/query?where=update_flag%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryPolyline&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=projectname%2C+update_flag%2C+projectid%2C+OBJECTID&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=geojson`;
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

const insertGeojsonToCarto = async (geojson, projectId, projectname) => {
  let deleteAttemp = 0;
  let tries = 3;
  while(true) {
    try {
      const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectid, projectname) VALUES(ST_GeomFromGeoJSON('${geojson}'), ${projectId}, '${projectname}')`;
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
    geoms.geoms.length
  );
  try {
    if (geoms.success) {
      const TOTAL_GEOMS = geoms.geoms.length;
      for (let i = 0; i < geoms.geoms.length; ++i) {
        // if (i > 2) break;
        let currentGeojsonToUpdate = geoms.geoms[i];
        const currentProjectId = currentGeojsonToUpdate.properties.projectId;
        const currentObjectId = currentGeojsonToUpdate.properties.OBJECTID;
        const currentProjectName =
          currentGeojsonToUpdate.properties.projectName;
        const deleteFC = await deleteFromCarto(currentProjectId); // its working, is deleting indeed
        console.log('Delete from Carto ', deleteFC);
        if (deleteFC.success) {
          const inserted = await insertGeojsonToCarto(
            JSON.stringify(currentGeojsonToUpdate.geometry),
            currentProjectId,
            currentProjectName
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
                projectname: currentProjectName,
                sync: isCorrectSync,
              });
            } else {
              syncGeoms.push({
                projectid: currentProjectId,
                projectname: currentProjectName,
                sync: false,
                error: upflag.error ? upflag.error : 'failed at update flag',
              });
            }
          } else {
            console.error('failed at insert into Carto');
            syncGeoms.push({
              projectid: currentProjectId,
              projectname: currentProjectName,
              sync: false,
            });
          }
        } else {
          console.error('failed in delete Geom from Carto');
          syncGeoms.push({
            projectid: currentProjectId,
            projectname: currentProjectName,
            sync: false,
          });
        }
      }
    }
    return res.send(syncGeoms);
  } catch (error) {
    return res.send('Failed At Syncronization');
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
    independetComponent,
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
      const response = await createAndUpdateStatus(project_id, creator, transaction, CODE_PROJECT_TYPE);
      console.log(response);
    } catch (error) {
      console.error(error);
    } 
    //Create Attachments entry
    const attachmentResponse = await uploadFiles(user, req.files, project_id, cover, transaction);
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
    }
    //Create entries for jurisdiction
    try {
      await createLocalGovernments(splitedJurisdiction, project_id, user, transaction);
      console.log('Project local governments created successfully');
    } catch (error) {
      console.error('Error creating project local governments:', error);
    }
    //Create entries for service area
    try {
      await createServiceAreas(splitedServicearea, project_id, user, transaction);   
      console.log('Service areas created successfully!');
    } catch (error) {
      console.error('Failed to create service areas:', error);
    }
    //Create entries for county
    try {
      await createCounties(splitedCounty, project_id, transaction); 
      console.log('Counties created successfully!');
    } catch (error) {
      console.error('Failed to create counties:', error);
    }
    //Insert actions and independent actions
    try {
      await saveActions(project_id, independetComponent, components, creator, transaction);
    } catch (error) {
      console.error(error);
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
    independetComponent,
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
  try {
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

    const data = await projectService.updateProject(
      project_id,
      cleanStringValue(projectname),
      cleanStringValue(description),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      creator
    );
    result.push(data);
    await cartoService.checkIfExistGeomThenDelete(
      CREATE_PROJECT_TABLE,
      project_id
    );
    await cartoService.insertToCarto(CREATE_PROJECT_TABLE, geom, project_id);
    const projectsubtype = '';
    const projecttype = 'Capital';
    await attachmentService.toggleName(cover);
    await attachmentService.uploadFiles(user, req.files, project_id, cover);
    await updateProjectsInBoard(
      project_id,
      cleanStringValue(projectname),
      projecttype,
      projectsubtype
    );
    await projectPartnerService.updateProjectPartner(
      sponsor,
      cosponsor,
      project_id
    );
    await costService.setIsActiveToFalse(project_id);
    //update aditional cost
    await costService.updateProjectOverhead(
      {
        project_id: project_id,
        cost: !isNaN(Number(additionalcost)) ? Number(additionalcost) : 0,
        code_cost_type_id: aditionalCostId,
        cost_description: additionalcostdescription || null,
        created_by: creator,
        modified_by: creator,
        is_active: true
      },
      project_id,
      aditionalCostId
    );
    //update overhead cost
    filtered.forEach(async (element, index) => {
      await costService.updateProjectOverhead(
        {
          project_id: project_id,
          cost: !isNaN(Number(splitedOverheadcost[index+1])) ? Number(splitedOverheadcost[index+1]) : 0,
          code_cost_type_id: element,
          created_by: creator,
          modified_by: creator,
          is_active: true
        },
        project_id,
        element
      );
    });
    
    if (splitedJurisdiction)
      await ProjectLocalGovernment.destroy({
        where: {
          project_id: project_id,
        },
      });
    if (splitedServicearea)
      await ProjectServiceArea.destroy({
        where: {
          project_id: project_id,
        },
      });
    if (splitedCounty)
      await ProjectCounty.destroy({
        where: {
          project_id: project_id,
        },
      });
    const promisesJur = splitedJurisdiction
      .filter(j => j)
      .map(j => ProjectLocalGovernment.create({
        code_local_government_id: parseInt(j),
        project_id: project_id,
        shape_length_ft: 0,
        last_modified_by: user.name,
        created_by: user.email,
      }));

    Promise.all(promisesJur)
      .then(() => {
        logger.info('All jurisdictions created successfully');
      })
      .catch((error) => {
        logger.error(`Error creating jurisdictions: ${error}`);
        res.status(500).send({ message: `Error creating jurisdictions: ${error}` });
      });

    const promisesSA = [];

    for (const s of splitedServicearea) {
      if (s) {
        promisesSA.push(ProjectServiceArea.create({
          project_id: project_id,
          code_service_area_id: s,
          shape_length_ft: 0,
          last_modified_by: user.name,
          created_by: user.email,
        }));
      }
    }

    Promise.all(promisesSA)
      .then(() => {
        logger.info('All service areas created successfully');
      })
      .catch((error) => {
        logger.error(`Error creating service areas: ${error}`);
        res.status(500).send({ message: `Error creating service areas: ${error}` });
      });
    const promisesCounty = [];

    for (const c of splitedCounty) {
      if (c) {
        const projectCounty = {
          state_county_id: c,
          project_id: project_id,
          shape_length_ft: 0,
        };
        promisesCounty.push(ProjectCounty.create(projectCounty));
      }
    }

    await Promise.all(promisesCounty)
      .then(() => {
        logger.info('All counties created successfully');
      })
      .catch((error) => {
        logger.error(`Error creating counties: ${error}`);
        res.status(500).send({ message: `Error creating counties: ${error}` });
      });

    await projectProposedActionService.deleteByProjectId(project_id);
    await projectIndependentActionService.deleteByProjectId(project_id);

    for (const independent of JSON.parse(independetComponent)) {
      console.log(independent)
      if (independent && independent.name) {
        await projectIndependentActionService.saveProjectIndependentAction({
          action_name: independent.name,
          project_id: project_id,
          cost: !isNaN(Number(independent.cost)) ? Number(independent.cost) : 0,
          action_status: independent.status,
          last_modified_by: creator,
          created_by: creator,
        });
      } else {
        await projectIndependentActionService.saveProjectIndependentAction({
          action_name: independent.action_name,
          project_id: project_id,
          cost: !isNaN(Number(independent.cost)) ? Number(independent.cost) : 0,
          action_status: independent.action_status,
          last_modified_by: creator,
          created_by: creator,
        });
      }
      logger.info('create independent component');
    }
    const promisesComponents = [];

    for (const component of JSON.parse(components)) {
      const action = {
        project_id: project_id,
        object_id: component.objectid,
        source_table_name: component.table,
        last_modified_by: creator,
        created_by: creator,
      };
      promisesComponents.push(projectProposedActionService.saveProjectAction(action));
    }
    await Promise.all(promisesComponents)
      .then(() => {
        logger.info('All components saved successfully');
      })
      .catch((error) => {
        logger.error(`Error saving components: ${error}`);
        res.status(500).send({ message: `Error creating components: ${error}` });
      });
    res.send(result);
  } catch (error) {
    console.log(error)
    logger.error(error);
    res.status(500).send({ message: `Error creating project: ${error}` });
  };
});

export default router;
