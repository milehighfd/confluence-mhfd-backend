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
const generateRangom = (low, up) => {
  const u = Math.max(low, up);
  const l = Math.min(low, up);
  const diff = u - l;
  const r = Math.floor(Math.random() * (diff + 1)); //'+1' because Math.random() returns 0..0.99, it does not include 'diff' value, so we do +1, so 'diff + 1' won't be included, but just 'diff' value will be.
  
  return l + r; //add the random number that was selected within distance between low and up to the lower limit.  
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
        const createRandomGeomOnARCGIS = (coordinates, projectname) => {
          console.log('hello create random geom');
          const formData = new FormData();
          const newGEOM = [{"geometry":{"paths":[ [] ],"spatialReference" : {"wkid" : 4326}},"attributes":{"Date":null,"Name": projectname}}];
          newGEOM[0].geometry.paths[0] = coordinates;
          formData.append('f', 'json');
          formData.append('adds', JSON.stringify(newGEOM));
          // THINK HOW TO DO IT EVERYTIME BEFORE REQUEST
          console.log('form data \n\n', formData);
          const TOKEN = 'aG1t6m3_I642blhwjaaCSdboUrbStlt3ooz3Y9k3hHxcuWmZxVtXDYpr8q7AC7-tFTdLx6zbR5btblThGvsSsKceF0kUJDTtDuYwvYH1yIzlVakHiRVXoBXXPsBpptA6A4SUbG-XQN8Vda7QSJJDmw..';
          formData.append('token', TOKEN);
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
          formData.append('ip', '181.188.178.182');
          formData.append('expiration', '60');
          formData.append('f', 'pjson');
          formData.append('referer', '');
          return formData;
        }
        const URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
        const fd = getAuthenticationFormData();
        console.log('formData', fd);
        axios.post(URL_TOKEN, fd)
        .then((res) => {
          console.log("XXX JSON XXX", res);
        })
        .catch((err) => {
          console.log("XXX JSON XXX", err);
        });
        // const bodyFD = createRandomGeomOnARCGIS(JSON.parse(geom).coordinates,cleanStringValue(projectname));
        // const createOnArcGis = await needle('post', 'https://gis.mhfd.org/server/rest/services/Confluence/mhfd_projects_created_dev/FeatureServer/0/applyedits', bodyFD);
        // console.log(' \n\n\n\n\n\n createonArcgis \n\n\n\n\n', createOnArcGis);
        // console.log('GEOM \n\n', JSON.parse(geom));
        // change sponsor by jurisdiction
        // we can have a lot jurisdiction separated by comma. in a for
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
