import express from 'express';
import Multer from 'multer';
import needle from 'needle';
import attachmentService from 'bc/services/attachment.service.js';
import projectComponentService from 'bc/services/projectComponent.service.js';
import indepdendentService from 'bc/services/independent.service.js';
import axios from 'axios';
import {
  CARTO_URL,
  CREATE_PROJECT_TABLE,
  COSPONSOR1
} from 'bc/config/config.js';
import db from 'bc/config/db.js';
import auth from 'bc/auth/auth.js';
import FormData from 'form-data';
import logger from 'bc/config/logger.js';
import { addProjectToBoard, getNewProjectId, setProjectID, cleanStringValue } from 'bc/routes/new-project/helper.js';

const router = express.Router();
const IndependentComponent = db.independentComponent;
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
const getGeomsToUpdate = async () => {
  try {
    const LIST_ARCGIS = `https://gis.mhfd.org/server/rest/services/Confluence/MHFDProjects/FeatureServer/0/query?where=update_flag%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryPolyline&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=projectname%2C+update_flag%2C+projectid%2C+OBJECTID&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=geojson`;
    const TOKEN = await getTokenArcGis();
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
router.get('/sync', async (req, res) => {
  const geoms = await getGeomsToUpdate();
  return res.send(geoms);
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
  const status = 'Draft';
  const projecttype = 'Capital';
  let notRequiredFields = ``;
  let notRequiredValues = ``;
  if (overheadcostdescription) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += 'overheadcostdescription';
    notRequiredValues += `'${cleanStringValue(overheadcostdescription)}'`;
  }
  if (additionalcost) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += 'additionalcost';
    notRequiredValues += `'${additionalcost}'`;
  }
  if (additionalcostdescription) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += 'additionalcostdescription';
    notRequiredValues += `'${cleanStringValue(additionalcostdescription)}'`;
  }
  if (cosponsor) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
      notRequiredValues += ', ';
    }
    notRequiredFields += COSPONSOR1;
    notRequiredValues += `'${cosponsor}'`;
  }
  if (notRequiredFields) {
    notRequiredFields = `, ${notRequiredFields}`;
    notRequiredValues = `, ${notRequiredValues}`;
  }
  let result = [];
  const overHeadNumbers = overheadcost.split(',');
  let splittedJurisdiction = jurisdiction.split(',');
  if (isWorkPlan) {
    splittedJurisdiction = [locality];
  }
  for (const j of splittedJurisdiction) {
    // ,costdewatering, costmobilization, costtraffic, costutility, coststormwater, costengineering, costconstruction, costlegal, costcontingency, component_cost, component_count

    const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, sponsor, overheadcost ${notRequiredFields} ,projectid, estimatedcost, component_cost, component_count, costdewatering, costmobilization, costtraffic, costutility, coststormwater, costengineering,costlegal, costconstruction, costcontingency)
      VALUES(ST_GeomFromGeoJSON('${geom}'), '${j}', '${cleanStringValue(projectname)}', '${cleanStringValue(description)}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${sponsor}', '${overheadcost}' 
      ${notRequiredValues} ,${-1}, ${estimatedcost}, ${componentcost}, ${componentcount}, ${(overHeadNumbers[0] / 100) * componentcost}, ${(overHeadNumbers[1] / 100) * componentcost}, ${(overHeadNumbers[2] / 100) * componentcost}, ${(overHeadNumbers[3] / 100) * componentcost}, ${(overHeadNumbers[4] / 100) * componentcost}, ${(overHeadNumbers[5] / 100) * componentcost}, ${(overHeadNumbers[6] / 100) * componentcost}, ${(overHeadNumbers[7] / 100) * componentcost}, ${(overHeadNumbers[8] / 100) * componentcost})`;
    console.log('\n\ninsert query here:', insertQuery, '\n\n');
    const query = {
      q: insertQuery
    };
    try {
      const data = await needle('post', CARTO_URL, query, { json: true });
      //console.log('STATUS', data.statusCode);
      if (data.statusCode === 200) {
        result.push(data.body);
        logger.info(JSON.stringify(result));
        let projectId = await getNewProjectId();
        const updateId = await setProjectID(res, projectId);
        if (!updateId) {
          return;
        }
        console.log('about to projectid', projectId);
        const dataArcGis = await insertIntoArcGis(geom, projectId, cleanStringValue(projectname));
        result.push(dataArcGis);
        // change sponsor by jurisdiction
        // we can have a lot jurisdiction separated by comma. in a ford
        // poner if para los dos roles https://trello.com/c/xfBIveVT/1745-create-project-todos-types-agregar-el-checkbox-deseleccionado-por-defecto-y-label-solo-para-usuarios-mhfd-senior-managers-y-mhfd
        await addProjectToBoard(user, servicearea, county, j, projecttype, projectId, year, sendToWR, isWorkPlan);
        await attachmentService.uploadFiles(user, req.files, projectId, cover);
        for (const independent of JSON.parse(independetComponent)) {
          const element = { name: independent.name, cost: independent.cost, status: independent.status, projectid: projectId };
          try {
            IndependentComponent.create(element);
            logger.info('create independent component');
          } catch (error) {
            logger.error('cannot create independent component ' + error);
          }
        }
        for (const component of JSON.parse(components)) {
          const dataComponent = {
            table: component.table,
            projectid: projectId,
            objectid: component.objectid
          };
          projectComponentService.saveProjectComponent(dataComponent);
        }
      } else {
        logger.error('bad status ' + data.statusCode + '  -- ' + insertQuery + JSON.stringify(data.body, null, 2));
        return res.status(data.statusCode).send(data.body);
      }
    } catch (error) {
      logger.error(error, 'at', insertQuery);
    }
  }
  res.send(result);
});

router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
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
});

export default router;
