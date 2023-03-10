import express from 'express';
import Multer from 'multer';
import needle from 'needle';
import projectComponentService from 'bc/services/projectComponent.service.js';
import projectService from 'bc/services/project.service.js';
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
import { addProjectToBoard, cleanStringValue } from 'bc/routes/new-project/helper.js';
import moment from 'moment';
import projectPartnerService from 'bc/services/projectPartner.service.js';

const ProjectLocalGovernment = db.projectLocalGovernment;
const ProjectCounty = db.projectCounty;
const ProjectServiceArea = db.projectServiceArea;

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

router.post('/', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const { isWorkPlan, projectname, description, servicearea, county, geom,
    overheadcost, overheadcostdescription, additionalcost, additionalcostdescription,
    independetComponent, locality, components, jurisdiction, sponsor, cosponsor, cover, estimatedcost, year, sendToWR, componentcost, componentcount } = req.body;
  const creator = user.email;
  const defaultProjectId = '5';
  const defaultProjectType = 'Capital';
  let result = [];
  const splitedJurisdiction = jurisdiction.split(',');
  const splitedCounty = county.split(',');
  const splitedServicearea = servicearea.split(',');
    try {
      const data = await projectService.saveProject(CREATE_PROJECT_TABLE_V2, cleanStringValue(projectname), cleanStringValue(description), defaultProjectId, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), creator, creator)
      result.push(data)
      const { project_id } = data;
      await cartoService.insertToCarto(CREATE_PROJECT_TABLE, geom, project_id);
      await projectStatusService.saveProjectStatusFromCero(5, project_id, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), 2, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), creator, creator)
      //await attachmentService.uploadFiles(user, req.files, project_id, cover);

      await addProjectToBoard(user, servicearea, county, locality, defaultProjectType, project_id, year, sendToWR, isWorkPlan);
      await projectPartnerService.saveProjectPartner(sponsor, cosponsor, project_id);

      for (const j of splitedJurisdiction) {
        await ProjectLocalGovernment.create({
          code_local_government_id: parseInt(j),
          project_id: project_id,
          shape_length_ft: 0,
          last_modified_by: user.name,
          created_by: user.email
        });
        logger.info('created jurisdiction');
      }
      for (const s of splitedServicearea) {
        await ProjectServiceArea.create({
          project_id: project_id,
          code_service_area_id: s,
          shape_length_ft: 0,
          last_modified_by: user.name,
          created_by: user.email
        });
        logger.info('created service area');
      }
      for (const c of splitedCounty) {
        await ProjectCounty.create({
          state_county_id: c,
          project_id: project_id,
          shape_length_ft: 0
        });
        logger.info('created county');
      }
      console.log(independetComponent);
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
      const dataArcGis = await projectService.insertIntoArcGis(geom, project_id, cleanStringValue(projectname));
      result.push(dataArcGis);
    } catch (error) {
      logger.error(error);
    }
  res.send(result);
});


router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
  const project_id = req.params.projectid;
  const user = req.user;
  const { isWorkPlan, projectname, description, servicearea, county, geom,
    overheadcost, overheadcostdescription, additionalcost, additionalcostdescription,
    independetComponent, locality, components, jurisdiction, sponsor, cosponsor, cover, estimatedcost, year, sendToWR, componentcost, componentcount } = req.body;
  const creator = user.email;
  let result = [];
  const splitedJurisdiction = jurisdiction.split(',');
  const splitedCounty = county.split(',');
  const splitedServicearea = servicearea.split(',');
  try {
    const data = await projectService.updateProject(project_id, cleanStringValue(projectname), cleanStringValue(description), moment().format('YYYY-MM-DD HH:mm:ss'), creator);
    result.push(data)
    await cartoService.updateToCarto(CREATE_PROJECT_TABLE, geom, project_id);
    await projectPartnerService.updateProjectPartner(sponsor, cosponsor, project_id);
    if (splitedJurisdiction) await ProjectLocalGovernment.destroy({
      where: {
        project_id: project_id
      }
    });
    if (splitedServicearea) await ProjectServiceArea.destroy({
      where: {
        project_id: project_id
      }
    });
    if (splitedCounty) await ProjectCounty.destroy({
      where: {
        project_id: project_id
      }
    });
    for (const j of splitedJurisdiction) {
      await ProjectLocalGovernment.create({
        code_local_government_id: parseInt(j),
        project_id: project_id,
        shape_length_ft: 0,
        last_modified_by: user.name,
        created_by: user.email
      });
      logger.info('created jurisdiction');
    }
    for (const s of splitedServicearea) {
      await ProjectServiceArea.create({
        project_id: project_id,
        code_service_area_id: s,
        shape_length_ft: 0,
        last_modified_by: user.name,
        created_by: user.email
      });
      logger.info('created service area');
    }
    for (const c of splitedCounty) {
      await ProjectCounty.create({
        state_county_id: c,
        project_id: project_id,
        shape_length_ft: 0
      });
      logger.info('created county');
    }
    await projectComponentService.deleteByProjectId(project_id);
    for (const independent of JSON.parse(independetComponent)) {
      try {
        const a = await projectComponentService.saveProjectComponent(0, '', independent.name, independent.component_status, project_id);
        console.log(a);
        logger.info('create independent component');
      } catch (error) {
        logger.error('cannot create independent component ' + error);
      }
    }

    for (const component of JSON.parse(components)) { 
      try {
        const b = await projectComponentService.saveProjectComponent(component.objectid, component.table,'','',project_id);
        console.log(b);
        logger.info('create component');
      } catch (error) {
        logger.error('cannot create component ' + error);
      }
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});

export default router;
