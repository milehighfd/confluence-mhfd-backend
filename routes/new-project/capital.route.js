const express = require('express');
const Multer = require('multer');
const needle = require('needle');
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
const { addProjectToBoard, getNewProjectId, setProjectID } = require('./helper');

const router = express.Router();
const IndependentComponent = db.independentComponent;
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

router.post('/', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const { projectname, description, servicearea, county, geom,
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
    notRequiredValues += `'${overheadcostdescription}'`;
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
    notRequiredValues += `'${additionalcostdescription}'`;
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
  const splittedJurisdiction = jurisdiction.split(',');
  for (const j of splittedJurisdiction) {
    // ,costdewatering, costmobilization, costtraffic, costutility, coststormwater, costengineering, costconstruction, costlegal, costcontingency, component_cost, component_count

    const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, sponsor, overheadcost ${notRequiredFields} ,projectid, estimatedcost, component_cost, component_count, costdewatering, costmobilization, costtraffic, costutility, coststormwater, costengineering,costlegal, costconstruction, costcontingency)
      VALUES(ST_GeomFromGeoJSON('${geom}'), '${j}', '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${sponsor}', '${overheadcost}' 
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
        // change sponsor by jurisdiction
        // we can have a lot jurisdiction separated by comma. in a for
        // poner if para los dos roles https://trello.com/c/xfBIveVT/1745-create-project-todos-types-agregar-el-checkbox-deseleccionado-por-defecto-y-label-solo-para-usuarios-mhfd-senior-managers-y-mhfd
        await addProjectToBoard(user, servicearea, county, j, projecttype, projectId, year, sendToWR);
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
    notRequiredFields += `overheadcostdescription = '${overheadcostdescription}'`;
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
    notRequiredFields += `additionalcostdescription = '${additionalcostdescription}'`;
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
   jurisdiction = '${jurisdiction}', projectname = '${projectname}', 
   description = '${description}', servicearea = '${servicearea}', county = '${county}',
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

module.exports = router;
