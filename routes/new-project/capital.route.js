const express = require('express');
const Multer = require('multer');
const needle = require('needle');
const axios = require('axios');
const FormData = require('form-data');
const attachmentService = require('../../services/attachment.service');
const projectComponentService = require('../../services/projectComponent.service');
const indepdendentService = require('../../services/independent.service');
const {
  CARTO_URL,
  CREATE_PROJECT_TABLE,
  COSPONSOR1
} = require('../../config/config');
const db = require('../../config/db');
const auth = require('../../auth/auth');
const logger = require('../../config/logger');
const { addProjectToBoard, getNewProjectId, setProjectID, cleanStringValue, updateProjectsInBoard } = require('./helper');

const router = express.Router();
const IndependentComponent = db.independentComponent;
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

const generateRangom = (low, up) => {
  const u = Math.max(low, up);
  const l = Math.min(low, up);
  const diff = u - l;
  const r = Math.floor(Math.random() * (diff + 1)); //'+1' because Math.random() returns 0..0.99, it does not include 'diff' value, so we do +1, so 'diff + 1' won't be included, but just 'diff' value will be.
  
  return l + r; //add the random number that was selected within distance between low and up to the lower limit.  
}
const createRandomGeomOnARCGIS = (coordinates, projectname, token) => {
  const formData = new FormData();
  // const newGEOM = [{"geometry":{"paths":[ [] ],"spatialReference" : {"wkid" : 4326}},"attributes":{"update_flag":0, "projectName": projectname}}];
  // newGEOM[0].geometry.paths[0] = coordinates;
  formData.append('f', 'json');
  formData.append('token', token);
  formData.append('adds', '[{"geometry":{"paths":[[[-11806858.969765771,4881317.227901084],[-11572350.166986963,4872144.784506868],[-11767417.463170638,4742507.584535271],[-11576630.640570931,4746482.310006099]]],"spatialReference":{"wkid":102100,"latestWkid":3857}},"attributes":{"update_flag":0,"Component_Count":null,"projectId":null,"onbaseId":null,"projectName":"HELO BOOOOOOOO","projectType":null,"projectSubtype":null,"description":null,"status":null,"startYear":null,"completeYear":null,"sponsor":null,"coSponsor1":null,"coSponsor2":null,"coSponsor3":null,"frequency":null,"maintenanceEligibility":null,"ownership":null,"acquisitionAnticipatedDate":null,"acquisitionProgress":null,"additionalCostDescription":null,"overheadCostDescription":null,"consultant":null,"contractor":null,"LGManager":null,"mhfdManager":null,"serviceArea":null,"county":null,"jurisdiction":null,"streamName":null,"taskSedimentRemoval":null,"taskTreeThinning":null,"taskBankStabilization":null,"taskDrainageStructure":null,"taskRegionalDetention":null,"goalFloodRisk":null,"goalWaterQuality":null,"goalStabilization":null,"goalCapRecreation":null,"goalCapVegetation":null,"goalStudyOvertopping":null,"goalStudyConveyance":null,"goalStudyPeakFlow":null,"goalStudyDevelopment":null,"workPlanYr1":null,"workPlanYr2":null,"workPlanYr3":null,"workPlanYr4":null,"workPlanYr5":null,"attachments":null,"coverImage":null,"Component_Cost":null,"CreationDate":null,"Creator":null,"EditDate":null,"Editor":null,"MP_WR_ID":null,"dataSource":null,"currentWorkPlan":null,"mhfdDollarsRequested":null,"mhfdDollarsAllocated":null,"estimatedCost":null,"finalCost":null,"additionalCost":null,"overheadCost":null,"costDewatering":null,"costMobilization":null,"costTraffic":null,"costUtility":null,"costStormwater":null,"costEngineering":null,"costConstruction":null,"costLegal":null,"costContingency":null,"specialDistrict":null,"studyReason":null,"studySubreason":null}}]');
  // THINK HOW TO DO IT EVERYTIME BEFORE REQUEST
  
  return formData;
  // datasets.postDataMultipart('https://gis.mhfd.org/server/rest/services/Confluence/mhfd_projects_created_dev/FeatureServer/0/applyedits', formData).then(res => {
  //   console.log('return create of geom', res);
  // });
};
const getAuthenticationFormData = () => {
  const formData = new FormData();
  formData.append('username', 'ricardo_confluence');
  formData.append('password', 'M!l3H!gh$m$');
  formData.append('client', 'ip');
  // THIS IP IS MOMENTARILY TO TEST TODO: add to env
  formData.append('ip', '10.0.1.97');
  formData.append('expiration', '60');
  formData.append('f', 'pjson');
  formData.append('referer', 'localhost');
  return formData;
}

router.get('/token-url', async (req, res) => {
    const URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
    const fd = getAuthenticationFormData();
    const token_data = await axios.post(URL_TOKEN, fd, { headers: fd.getHeaders() })
    const TOKEN = token_data.data.token;
    
    const bodyFD = createRandomGeomOnARCGIS('non', 'cleanStringValue(projectname)', TOKEN);
    const createOnArcGis = await axios.post('https://gis.mhfd.org/server/rest/services/Confluence/MHFDProjects/FeatureServer/0/applyEdits', bodyFD, bodyFD.getHeaders());
    const response = {
      token: TOKEN,
      createStatus: createOnArcGis.status,
      data: createOnArcGis.data,
      geom: '[{"geometry":{"paths":[[[-11806858.969765771,4881317.227901084],[-11572350.166986963,4872144.784506868],[-11767417.463170638,4742507.584535271],[-11576630.640570931,4746482.310006099]]],"spatialReference":{"wkid":102100,"latestWkid":3857}},"attributes":{"update_flag":0,"Component_Count":null,"projectId":null,"onbaseId":null,"projectName":"HELO BOOOOOOOO","projectType":null,"projectSubtype":null,"description":null,"status":null,"startYear":null,"completeYear":null,"sponsor":null,"coSponsor1":null,"coSponsor2":null,"coSponsor3":null,"frequency":null,"maintenanceEligibility":null,"ownership":null,"acquisitionAnticipatedDate":null,"acquisitionProgress":null,"additionalCostDescription":null,"overheadCostDescription":null,"consultant":null,"contractor":null,"LGManager":null,"mhfdManager":null,"serviceArea":null,"county":null,"jurisdiction":null,"streamName":null,"taskSedimentRemoval":null,"taskTreeThinning":null,"taskBankStabilization":null,"taskDrainageStructure":null,"taskRegionalDetention":null,"goalFloodRisk":null,"goalWaterQuality":null,"goalStabilization":null,"goalCapRecreation":null,"goalCapVegetation":null,"goalStudyOvertopping":null,"goalStudyConveyance":null,"goalStudyPeakFlow":null,"goalStudyDevelopment":null,"workPlanYr1":null,"workPlanYr2":null,"workPlanYr3":null,"workPlanYr4":null,"workPlanYr5":null,"attachments":null,"coverImage":null,"Component_Cost":null,"CreationDate":null,"Creator":null,"EditDate":null,"Editor":null,"MP_WR_ID":null,"dataSource":null,"currentWorkPlan":null,"mhfdDollarsRequested":null,"mhfdDollarsAllocated":null,"estimatedCost":null,"finalCost":null,"additionalCost":null,"overheadCost":null,"costDewatering":null,"costMobilization":null,"costTraffic":null,"costUtility":null,"costStormwater":null,"costEngineering":null,"costConstruction":null,"costLegal":null,"costContingency":null,"specialDistrict":null,"studyReason":null,"studySubreason":null}}]'
    };
    return res.status(createOnArcGis.status).send(response);

})

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
  // if (isWorkPlan) {
  //  splittedJurisdiction = [locality];
  // }
  for (const j of splittedJurisdiction) {
    // ,costdewatering, costmobilization, costtraffic, costutility, coststormwater, costengineering, costconstruction, costlegal, costcontingency, component_cost, component_count

    const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, sponsor, overheadcost ${notRequiredFields} ,projectid, estimatedcost, component_cost, component_count, costdewatering, costmobilization, costtraffic, costutility, coststormwater, costengineering,costlegal, costconstruction, costcontingency)
      VALUES(ST_GeomFromGeoJSON('${geom}'), '${j}', '${cleanStringValue(projectname)}', '${cleanStringValue(description)}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${sponsor}', '${overheadcost}' 
      ${notRequiredValues} ,${-1}, ${estimatedcost}, ${componentcost}, ${componentcount}, ${(overHeadNumbers[0] / 100) * componentcost}, ${(overHeadNumbers[1] / 100) * componentcost}, ${(overHeadNumbers[2] / 100) * componentcost}, ${(overHeadNumbers[3] / 100) * componentcost}, ${(overHeadNumbers[4] / 100) * componentcost}, ${(overHeadNumbers[5] / 100) * componentcost}, ${(overHeadNumbers[6] / 100) * componentcost}, ${(overHeadNumbers[7] / 100) * componentcost}, ${(overHeadNumbers[8] / 100) * componentcost})`;
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
        // change sponsor by jurisdiction
        // we can have a lot jurisdiction separated by comma. in a for
        // poner if para los dos roles https://trello.com/c/xfBIveVT/1745-create-project-todos-types-agregar-el-checkbox-deseleccionado-por-defecto-y-label-solo-para-usuarios-mhfd-senior-managers-y-mhfd
        let toBoard = j;
        if (eval(isWorkPlan)) {
          toBoard = locality;
        }
        const projectsubtype = '';
        await addProjectToBoard(user, servicearea, county, toBoard, projecttype, projectId, year, sendToWR, isWorkPlan, cleanStringValue(projectname), projectsubtype);
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
  const projectsubtype = '';
  updateProjectsInBoard(projectid, cleanStringValue(projectname), projecttype, projectsubtype);
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

module.exports = router;
