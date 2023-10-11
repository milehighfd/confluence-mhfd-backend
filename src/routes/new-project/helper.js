import needle from 'needle';
import db from 'bc/config/db.js';
import { CREATE_PROJECT_TABLE, CARTO_URL } from 'bc/config/config.js';
import logger from 'bc/config/logger.js';

const CodeServiceArea = db.codeServiceArea;
const CodeLocalGoverment = db.codeLocalGoverment;
const CodeStateCounty = db.codeStateCounty;

export const getNewProjectId = async () => {
  const query = {
    q: `SELECT GREATEST(max(projectid + 1), 800000) FROM ${CREATE_PROJECT_TABLE}`
  }
  const data = await needle('post', CARTO_URL, query, { json: true });
  // Project
  return data.body.rows[0].greatest;
};

export const copyProject = async (newProjectId, projectid) => {
  let result = null;
  try {
    const updateQuery = `
      INSERT INTO ${CREATE_PROJECT_TABLE}(the_geom, objectid, onbaseid, projectid, projectname, projecttype, projectsubtype, description, status, startyear, completeyear, sponsor, cosponsor1, cosponsor2, cosponsor3, frequency, maintenanceeligibility, ownership, acquisitionanticipateddate, acquisitionprogress, additionalcostdescription, overheadcostdescription, consultant, contractor, lgmanager, mhfdmanager, servicearea, county, jurisdiction, streamname, tasksedimentremoval, tasktreethinning, taskbankstabilization, taskdrainagestructure, taskregionaldetention, goalfloodrisk, goalwaterquality, goalstabilization, goalcaprecreation, goalcapvegetation, goalstudyovertopping, goalstudyconveyance, goalstudypeakflow, goalstudydevelopment, workplanyr1, workplanyr2, workplanyr3, workplanyr4, workplanyr5, attachments, coverimage, globalid, creationdate, creator, editdate, editor, shape_length, mhfddollarsrequested, mhfddollarsallocated, estimatedcost, finalcost, additionalcost, overheadcost, costdewatering, costmobilization, costtraffic, costutility, coststormwater, costengineering, costconstruction, costlegal, costcontingency, studyreason, studysubreason, component_cost, component_count)
      SELECT the_geom, objectid, onbaseid, ${newProjectId}, projectname, projecttype, projectsubtype, description, status, startyear, completeyear, sponsor, cosponsor1, cosponsor2, cosponsor3, frequency, maintenanceeligibility, ownership, acquisitionanticipateddate, acquisitionprogress, additionalcostdescription, overheadcostdescription, consultant, contractor, lgmanager, mhfdmanager, servicearea, county, jurisdiction, streamname, tasksedimentremoval, tasktreethinning, taskbankstabilization, taskdrainagestructure, taskregionaldetention, goalfloodrisk, goalwaterquality, goalstabilization, goalcaprecreation, goalcapvegetation, goalstudyovertopping, goalstudyconveyance, goalstudypeakflow, goalstudydevelopment, workplanyr1, workplanyr2, workplanyr3, workplanyr4, workplanyr5, attachments, coverimage, globalid, creationdate, creator, editdate, editor, shape_length, mhfddollarsrequested, mhfddollarsallocated, estimatedcost, finalcost, additionalcost, overheadcost, costdewatering, costmobilization, costtraffic, costutility, coststormwater, costengineering, costconstruction, costlegal, costcontingency, studyreason, studysubreason, component_cost, component_count
      FROM ${CREATE_PROJECT_TABLE}
      WHERE projectid = ${projectid}
    `;
    const query = {
      q: updateQuery
    };
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      result = data.body;
      console.log(result);
    } else {
      console.error('bad status ' + data.statusCode + ' ' + JSON.stringify(data.body, null, 2));
    }
  } catch (e) {
    console.error(e);
  }
  return result;
};

export const setProjectID = async (res, projectId) => {
  const update = `UPDATE ${CREATE_PROJECT_TABLE}
  SET projectid = ${projectId}
  WHERE projectid = -1`;
  const updateQuery = {
    q: update
  };
  logger.info('update projectid query ' + JSON.stringify(updateQuery));
  try {
    const data = await needle('post', CARTO_URL, updateQuery, { json: true });
    console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      return true;
    } else {
      logger.error('bad status on UPDATE projectid ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));
      res.status(data.statusCode).send(data.body);
      return false;
    }
  } catch (error) {
    logger.error(error, 'at', update);
  }
  return true;
};

export const cleanStringValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string' && value.length > 0) {
    return value.replace("'", "''");
  }
  return value;
};

export const getLocalitiesNames = async (localities,transaction) => { 
  const t = transaction ? await transaction : null;
  localities = localities.map(l => parseInt(l));
  const order = []
  const namesServiceArea = await CodeServiceArea.findAll({
    attributes: ['service_area_name', 'code_service_area_id'],
    where: {
      code_service_area_id: localities
    },
    transaction: t
  });
  const namesStateCounty = await CodeStateCounty.findAll({
    attributes: ['county_name', 'state_county_id'],
    where: {
      state_county_id: localities
    },
    transaction: t
  });
  const namesLocalGoverment = await CodeLocalGoverment.findAll({
    attributes: ['local_government_name', 'code_local_government_id'],
    where: {
      code_local_government_id: localities
    },
    transaction: t
  });
  if (namesServiceArea && namesServiceArea.length > 0) {
    order.push(...namesServiceArea.map(sa => ({id: sa.code_service_area_id, name: sa.service_area_name, realName: sa.service_area_name+ ' Service Area'})));
  }
  if (namesStateCounty && namesStateCounty.length > 0) {
    order.push(...namesStateCounty.map(sc => ({id: sc.state_county_id, name: sc.county_name, realName: sc.county_name + ' County'})));
  }
  if (namesLocalGoverment && namesLocalGoverment.length > 0) {
    order.push(...namesLocalGoverment.map(lg => ({id: lg.code_local_government_id, name: lg.local_government_name, realName: lg.local_government_name})));
  }
  order.sort((a, b) => localities.indexOf(a.id) - localities.indexOf(b.id)); 
  return order.map(o => o.realName);
};


export const createLocalitiesBoard = (isWorkPlan, sendToWR, year, PROJECT_TYPE, splitedJurisdiction, splitedCounty, splitedServicearea) => {
  const localitiesBoard = [];
  const typesList = [];
  const YEAR_WORKPLAN = 2021;

  if (isWorkPlan === 'false') {
    for (const j of splitedJurisdiction) {
      if (j) {
        localitiesBoard.push(j);
        typesList.push('WORK_REQUEST');
      }
    }
  } else {
    if (sendToWR === 'true') {
      for (const j of splitedJurisdiction) {
        if (j) {
          localitiesBoard.push(j);
          typesList.push('WORK_REQUEST');
        }
      }
    }
    if (year <= YEAR_WORKPLAN) {
      if (PROJECT_TYPE === 'Capital' || PROJECT_TYPE === 'Maintenance') {
        for (const c of splitedCounty) {
          if (c) {
            localitiesBoard.push(c);
            typesList.push('WORK_PLAN');
          }
        }
      } else {
        for (const s of splitedServicearea) {
          if (s) {
            localitiesBoard.push(s);
            typesList.push('WORK_PLAN');
          }
        }
      }
    } else {
      if (PROJECT_TYPE === 'Study') {
        for (const s of splitedServicearea) {
          if (s) {
            localitiesBoard.push(s);
            typesList.push('WORK_PLAN');
          }
        }
      } else {
        for (const c of splitedCounty) {
          if (c) {
            localitiesBoard.push(c);
            typesList.push('WORK_PLAN');
          }
        }
      }
    }
  }

  return { localitiesBoard, typesList };
}