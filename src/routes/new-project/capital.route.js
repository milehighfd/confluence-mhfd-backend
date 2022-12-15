import express from 'express';
import Multer from 'multer';
import needle from 'needle';
import attachmentService from 'bc/services/attachment.service.js';
import projectComponentService from 'bc/services/projectComponent.service.js';
import projectService from 'bc/services/project.service.js';
import projectStatusService from 'bc/services/projectStatus.service.js';
import cartoService from 'bc/services/carto.service.js';

import indepdendentService from 'bc/services/independent.service.js';
import axios from 'axios';
import {
  CARTO_URL,
  CREATE_PROJECT_TABLE,
  COSPONSOR1,
  CREATE_PROJECT_TABLE_V2
} from 'bc/config/config.js';
import db from 'bc/config/db.js';
import auth from 'bc/auth/auth.js';
import FormData from 'form-data';
import logger from 'bc/config/logger.js';
import { addProjectToBoard, getNewProjectId, setProjectID, cleanStringValue } from 'bc/routes/new-project/helper.js';
import moment from 'moment';

const router = express.Router();
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

const createRandomGeomOnARCGIS = (coordinates, projectname, token, projectid) => {  
  const newGEOM = [{"geometry":{"paths":[ ] ,"spatialReference" : {"wkid" : 4326}},"attributes":{"update_flag":0,"projectName":projectname, "projectId": projectid}}];
  newGEOM[0].geometry.paths = coordinates;
  const formData = {
    'f': 'pjson',
    'token': token,
    'adds': JSON.stringify(newGEOM)
  };
  return formData;
};
const getAuthenticationFormData = () => {
  const formData = {
    'username': 'ricardo_confluence',
    'password': 'M!l3H!gh$m$',
    'client': 'referer',
    'ip': '181.188.178.182',
    'expiration': '60',
    'f': 'pjson',
    'referer': 'localhost'
  };
  return formData;
}

router.get('/token-url', async (req, res) => {
    const URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
    const fd = getAuthenticationFormData();
    // const token_data = await axios.post(URL_TOKEN, fd, { headers: fd.getHeaders() })
    const token_data = await needle('post', URL_TOKEN, fd, { multipart: true });

    const TOKEN = JSON.parse(token_data.body).token;
    
    const bodyFD = createRandomGeomOnARCGIS('non', 'cleanStringValue(projectname)', TOKEN);
    const createOnArcGis = await needle('post','https://gis.mhfd.org/server/rest/services/Confluence/MHFDProjects/FeatureServer/0/applyEdits', bodyFD, { multipart: true });
    console.log('createona', createOnArcGis.statusCode, '\n\n\n\n ************* \n\n', createOnArcGis.body);
    const response = {
      token: TOKEN,
      createStatus: createOnArcGis.statusCode,
      data: createOnArcGis.body,
      geom: '[{"geometry":{"paths":[[[-11806858.969765771,4881317.227901084],[-11572350.166986963,4872144.784506868],[-11767417.463170638,4742507.584535271],[-11576630.640570931,4746482.310006099]]],"spatialReference":{"wkid":102100,"latestWkid":3857}},"attributes":{"update_flag":0,"Component_Count":null,"projectId":null,"onbaseId":null,"projectName":"TEST NEEDLE BOOOOOO222O","projectType":null,"projectSubtype":null,"description":null,"status":null,"startYear":null,"completeYear":null,"sponsor":null,"coSponsor1":null,"coSponsor2":null,"coSponsor3":null,"frequency":null,"maintenanceEligibility":null,"ownership":null,"acquisitionAnticipatedDate":null,"acquisitionProgress":null,"additionalCostDescription":null,"overheadCostDescription":null,"consultant":null,"contractor":null,"LGManager":null,"mhfdManager":null,"serviceArea":null,"county":null,"jurisdiction":null,"streamName":null,"taskSedimentRemoval":null,"taskTreeThinning":null,"taskBankStabilization":null,"taskDrainageStructure":null,"taskRegionalDetention":null,"goalFloodRisk":null,"goalWaterQuality":null,"goalStabilization":null,"goalCapRecreation":null,"goalCapVegetation":null,"goalStudyOvertopping":null,"goalStudyConveyance":null,"goalStudyPeakFlow":null,"goalStudyDevelopment":null,"workPlanYr1":null,"workPlanYr2":null,"workPlanYr3":null,"workPlanYr4":null,"workPlanYr5":null,"attachments":null,"coverImage":null,"Component_Cost":null,"CreationDate":null,"Creator":null,"EditDate":null,"Editor":null,"MP_WR_ID":null,"dataSource":null,"currentWorkPlan":null,"mhfdDollarsRequested":null,"mhfdDollarsAllocated":null,"estimatedCost":null,"finalCost":null,"additionalCost":null,"overheadCost":null,"costDewatering":null,"costMobilization":null,"costTraffic":null,"costUtility":null,"costStormwater":null,"costEngineering":null,"costConstruction":null,"costLegal":null,"costContingency":null,"specialDistrict":null,"studyReason":null,"studySubreason":null}}]'
    };
    return res.status(205).send(response);

});
const getTokenArcGis = async () => {
  const URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
  const fd = getAuthenticationFormData();
  const token_data = await needle('post', URL_TOKEN, fd, { multipart: true });
  const TOKEN = JSON.parse(token_data.body).token;
  return TOKEN;
}
const getGeomsToUpdate = async (TOKEN) => {
  try {
    const LIST_ARCGIS = `https://gis.mhfd.org/server/rest/services/Confluence/MHFDProjects/FeatureServer/0/query?where=update_flag%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryPolyline&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=projectname%2C+update_flag%2C+projectid%2C+OBJECTID&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=geojson`;
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
      const URL_UPDATE_ATTRIB = `https://gis.mhfd.org/server/rest/services/Confluence/MHFDProjects/FeatureServer/0/applyEdits`;
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
  console.log('SYNC ******* \n\n Get Geometries from ArcGis', geoms.success, geoms.geoms.length);
  try {
    if ( geoms.success) {
      const TOTAL_GEOMS = geoms.geoms.length;
      for(let i = 0; i < geoms.geoms.length; ++i) {
        // if (i > 2) break;
        let currentGeojsonToUpdate = geoms.geoms[i];
        const currentProjectId = currentGeojsonToUpdate.properties.projectId;
        const currentObjectId = currentGeojsonToUpdate.properties.OBJECTID;
        const currentProjectName = currentGeojsonToUpdate.properties.projectName;
        const deleteFC = await deleteFromCarto(currentProjectId); // its working, is deleting indeed
        console.log('Delete from Carto ', deleteFC);
        if (deleteFC.success) {
          const inserted = await insertGeojsonToCarto(JSON.stringify(currentGeojsonToUpdate.geometry), currentProjectId, currentProjectName);
          console.log('SYNC ******* \n\n Inserted into Carto', inserted);
          if (inserted.success) {
            const upflag = await updateFlagArcGis(currentObjectId, 0, TOKEN);
            console.log('SYNC ******* \n\n Updated in ArcGIS');
            if (upflag.success) {
              console.log('Complete ', i,'/',TOTAL_GEOMS);
              isCorrectSync = true;
              syncGeoms.push({
                projectid: currentProjectId,
                projectname: currentProjectName,
                sync: isCorrectSync
              });
            } else {
              syncGeoms.push({
                projectid: currentProjectId,
                projectname: currentProjectName,
                sync: false,
                error: upflag.error ? upflag.error : 'failed at update flag'
              });
            }
          } else {
            console.error('failed at insert into Carto');
            syncGeoms.push({
              projectid: currentProjectId,
              projectname: currentProjectName,
              sync: false
            });
          }
        } else {
          console.error('failed in delete Geom from Carto');
          syncGeoms.push({
            projectid: currentProjectId,
            projectname: currentProjectName,
            sync: false
          });
        }  
      };
    }
    return res.send(syncGeoms);

  } catch(error) {
    return res.send('Failed At Syncronization');
  }
});

const insertIntoArcGis = async (geom, projectid, projectname) => {
  try {
    const URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
    const fd = getAuthenticationFormData();
    const token_data = await needle('post', URL_TOKEN, fd, { multipart: true });
    const TOKEN = JSON.parse(token_data.body).token;
    const bodyFD = createRandomGeomOnARCGIS(JSON.parse(geom).coordinates, cleanStringValue(projectname), TOKEN, projectid);
    const createOnArcGis = await needle('post','https://gis.mhfd.org/server/rest/services/Confluence/MHFDProjects/FeatureServer/0/applyEdits', bodyFD, { multipart: true });
    console.log('create on arc gis', createOnArcGis.statusCode, createOnArcGis.body);
    if (createOnArcGis.statusCode == 200) {
      if (createOnArcGis.body.error) {
        return { successArcGis: false, error: createOnArcGis.body.error };  
      }
      return { successArcGis: createOnArcGis.body.addResults[0].success };
    } else {
      return { successArcGis: false };
    }
  } catch(e) {
    console.log('error at insert into arcgis', e);
    return {
      successArcGis: false,
      error: e
    }
  }  
}

router.post('/', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const { isWorkPlan, projectname, description, servicearea, county, geom,
    overheadcost, overheadcostdescription, additionalcost, additionalcostdescription,
    independetComponent, locality, components, jurisdiction, sponsor, cosponsor, cover, estimatedcost, year, sendToWR, componentcost, componentcount } = req.body;
  const creator = 'sys';
  const defaultProjectId = '5';
  let notRequiredFields = ``;
  let notRequiredValues = ``;
  if (notRequiredFields) {
    notRequiredFields = `, ${notRequiredFields}`;
    notRequiredValues = `, ${notRequiredValues}`;
  }

  let splittedJurisdiction = jurisdiction.split(',');
/*   if (isWorkPlan) {
    splittedJurisdiction = [locality];
  } */
  let result = [];
  for (const j of splittedJurisdiction) {
    try {
      const data = await projectService.saveProject(CREATE_PROJECT_TABLE_V2, j, cleanStringValue(projectname), cleanStringValue(description), defaultProjectId, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), creator, notRequiredFields, notRequiredValues, creator)
      result.push(data)
      const { project_id } = data;
      await cartoService.insertToCarto(CREATE_PROJECT_TABLE, geom, project_id);
      await projectStatusService.saveProjectStatusFromCero(5, project_id, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), 2, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), creator, creator)
      //await addProjectToBoard(user, servicearea, county, j, projecttype, project_id, year, sendToWR, isWorkPlan);
      // TODO: habilitar luego attachment await attachmentService.uploadFiles(user, req.files, projectId, cover);
      for (const independent of JSON.parse(independetComponent)) {
        try {
          await projectComponentService.saveProjectComponent(0, '', independent.name, independent.status, project_id);
          logger.info('create independent component');
        } catch (error) {
          logger.error('cannot create independent component ' + error);
        }
      }

      for (const component of JSON.parse(components)) {
        try {
          await projectComponentService.saveProjectComponent(component.objectid, component.table,'','',project_id);
          logger.info('create component');
        } catch (error) {
          logger.error('cannot create component ' + error);
        }
      }
      const dataArcGis = await insertIntoArcGis(geom, project_id, cleanStringValue(projectname));
      result.push(dataArcGis);

    } catch (error) {
      logger.error(error, 'at', insertQuery);
    }
  }
  res.send(result);
});

/* router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const { projectname, description, servicearea, county, geom,
    overheadcost, overheadcostdescription, additionalcost, additionalcostdescription,
    independetComponent, locality, components, jurisdiction, sponsor, cosponsor, cover, estimatedcost, sendToWR,
    componentcost, componentcount } = req.body;
  const projectid = req.params.projectid;
  const projecttype = 'Capital';
  let notRequiredFields = ``;
  if (overheadcostdescription) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `overheadcostdescription = '${cleanStringValue(overheadcostdescription)}'`;
  }
  if (additionalcost) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `additionalcost = '${additionalcost}'`;
  }
  if (additionalcostdescription) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `additionalcostdescription = '${cleanStringValue(additionalcostdescription)}'`;
  }
  if (cosponsor) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `${COSPONSOR1} = '${cosponsor}'`;
  }
  if (notRequiredFields) {
    notRequiredFields = `, ${notRequiredFields}`;
  }
  const overHeadNumbers = overheadcost.split(',');
  const updateQuery = `UPDATE ${CREATE_PROJECT_TABLE} SET the_geom = ST_GeomFromGeoJSON('${geom}'),
   jurisdiction = '${jurisdiction}', projectname = '${cleanStringValue(projectname)}', 
   description = '${cleanStringValue(description)}', servicearea = '${servicearea}', county = '${county}',
    projecttype = '${projecttype}', sponsor = '${sponsor}', 
    overheadcost = '${overheadcost}', estimatedcost = ${estimatedcost} ,  component_cost = ${componentcost}, component_count = ${componentcount}, costdewatering = ${(overHeadNumbers[0] / 100) * componentcost}, costmobilization = ${(overHeadNumbers[1] / 100) * componentcost}, costtraffic = ${(overHeadNumbers[2] / 100) * componentcost}, costutility = ${(overHeadNumbers[3] / 100) * componentcost}, coststormwater = ${(overHeadNumbers[4] / 100) * componentcost}, costengineering = ${(overHeadNumbers[5] / 100) * componentcost} ,costlegal = ${(overHeadNumbers[6] / 100) * componentcost}, costconstruction = ${(overHeadNumbers[7] / 100) * componentcost}, costcontingency = ${(overHeadNumbers[8] / 100) * componentcost}
     ${notRequiredFields}
    WHERE  projectid = ${projectid}`;
  const query = {
    q: updateQuery
  };
  let result = {};
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(JSON.stringify(result));
      await attachmentService.uploadFiles(user, req.files, projectid, cover);
      await projectComponentService.deleteByProjectId(projectid);
      await indepdendentService.deleteByProjectId(projectid);
      for (const independent of JSON.parse(independetComponent)) {
        const element = { name: independent.name, cost: independent.cost, status: independent.status, projectid: projectid };
        try {
          IndependentComponent.create(element);
          logger.info('create independent component' + JSON.stringify(element));
        } catch (error) {
          logger.error('cannot create independent component ' + error);
        }
      }
      for (const component of JSON.parse(components)) {
        const data = {
          table: component.table,
          projectid: projectid,
          objectid: component.objectid
        };
        projectComponentService.saveProjectComponent(data);
      }
    } else {
      logger.error('bad status ' + data.statusCode + '  -- ' + updateQuery + JSON.stringify(data.body, null, 2));
      return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error, 'at edit capital');
  };
  res.send(result);
}); */

export default router;
