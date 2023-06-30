import needle from 'needle';
import { LexoRank } from 'lexorank';
import sequelize from 'sequelize';
import db from 'bc/config/db.js';
import { CREATE_PROJECT_TABLE, CARTO_URL } from 'bc/config/config.js';
import logger from 'bc/config/logger.js';
import boardService from 'bc/services/board.service.js';

const { Op } = sequelize;
const Configuration = db.configuration;
const Board = db.board;
const BoardProject = db.boardProject;
const Project = db.project;
const CodeServiceArea = db.codeServiceArea;
const CodeLocalGoverment = db.codeLocalGoverment;
const CodeStateCounty = db.codeStateCounty;

export const getBoard = async (type, locality, year, projecttype, transaction = null) => {
  let board = await Board.findOne({
    where: {
      type, year, locality, projecttype
    },
    transaction: transaction, // associate transaction with the database operation
  });
  if (board) {
    return board;
  } else {
    let newBoard = new Board({
      type, year, locality, projecttype, status: 'Under Review'
    });
    await newBoard.save({ transaction: t }); // associate transaction with the database operation
    return newBoard;
  }
};

export const sendBoardsToProp = async (bp, board, prop, propid, transaction = null) => {
  const t = transaction ? await transaction : null;
  let propValues = prop.split(',');
  for (let k = 0; k < propValues.length; k++) {
    let propVal = propValues[k];
    if (propid === 'county' && !prop.includes('County')) {
      propVal = propVal.trimEnd().concat(' County');
    } else if (propid === 'servicearea' && !prop.includes(' Service Area')) {
      propVal = propVal.trimEnd().concat(' Service Area');
    }
    let destinyBoard = await getBoard(
      'WORK_PLAN',
      propVal,
      board.year,
      board.projecttype,
      t // associate transaction with the database operation
    );
    //TODO: improve to avoid multiple queries to same board
    let newBoardProject = new BoardProject({
      board_id: destinyBoard.board_id,
      project_id: bp.project_id,
      rank0: bp.rank0,
      rank1: bp.rank1,
      rank2: bp.rank2,
      rank3: bp.rank3,
      rank4: bp.rank4,
      rank5: bp.rank5,
      req1: bp.req1 == null ? null : bp.req1 / propValues.length,
      req2: bp.req2 == null ? null : bp.req2 / propValues.length,
      req3: bp.req3 == null ? null : bp.req3 / propValues.length,
      req4: bp.req4 == null ? null : bp.req4 / propValues.length,
      req5: bp.req5 == null ? null : bp.req5 / propValues.length,
      year1: bp.year1,
      year2: bp.year2,
      origin: board.locality,
    });
    await newBoardProject.save({ transaction: t }); // associate transaction with the database operation
    const updatePromises = [];
    for (let i = 0; i < 6; i++) {
      const rank = `rank${i}`;
      logger.info(`Start count for ${rank} and board ${destinyBoard.board_id}`);
      const {counter} = await boardService.countProjectsByRank(destinyBoard.board_id, rank, t); // associate transaction with the database operation
      logger.info(`Finish counter: ${JSON.stringify(counter)}}`);
      if (counter) {
          updatePromises.push(boardService.reCalculateColumn(destinyBoard.board_id, rank, t)); // associate transaction with the database operation
      }   
    }
    if (updatePromises.length) {
      await Promise.all(updatePromises).then((values) => {
          logger.info('success on recalculate Columns');
      }).catch((error) => {
          logger.error(`error on recalculate columns ${error}`);
      });
    }
  }
};
export const updateProjectsInBoard = async (
  project_id,
  projectname,
  projecttype,
  projectsubtype
) => {
  let projectToUpdate = await BoardProject.findAll({
    where: {
      project_id: project_id,
    },
  });
  if (projectToUpdate.length) {
    for (let i = 0; i < projectToUpdate.length; ++i) {
      let currentProj = projectToUpdate[i];
      await currentProj.update({
        projectname: projectname,
        projecttype: projecttype,
        projectsubtype: projectsubtype,
      });
    }
  }
  return true;
};

export const updateProjectInBoard = async (
  project_id,
  projectname,
  projecttype,
  projectsubtype
) => {
  let projectToUpdate = await BoardProject.findOne({
    where: {
      project_id: project_id,
    },
  });
  console.log('project about to be updated');
  await projectToUpdate.update({
    projectname: projectname,
    projecttype: projecttype,
    projectsubtype: projectsubtype,
  });
  console.log('project updated in projectboard');
};
export const addProjectToBoard = async (
  user,
  servicearea,
  county,
  locality,
  projecttype,
  project_id,
  year,
  sendToWR,
  isWorkPlan,
  projectname,
  projectsubtype,
  type,
  transaction = null
) => {  
  const t = transaction ? await transaction : null;
  if (!year) {
    let configuration = await Configuration.findOne({
      where: {
        key: 'BOARD_YEAR',
      },
      transaction: t,
    });
    year = +configuration.value;
  }
  let board = await Board.findOne({
    where: {
      type,
      year,
      locality,
      projecttype,
    },
    transaction: t,
  });
  if (!board) {
    try {
      const response = await boardService.createNewBoard(
        type,
        year,
        locality,
        projecttype,
        'Under Review',
        transaction
      );
      board = response;
    } catch (e) {
      logger.error('error in create new board '+e);
      throw e;
    }    
    logger.info('BOARD CREATED');
  }
  let boardProjectObject = {
    board_id: board.board_id,
    project_id: project_id,
    origin: locality,
  };
  const firstProject = await BoardProject.findOne({
    where: {
      board_id: board.board_id,
      rank0: {
        [Op.ne]: null,
      }
    }, 
    order: [['rank0', 'ASC']],
    transaction: t,
  });
  if (firstProject) {
    boardProjectObject.rank0 = LexoRank.parse(firstProject.rank0)
      .genPrev()
      .toString();
  } else { 
    boardProjectObject.rank0 = LexoRank.middle().toString();
  }
  boardProjectObject.projectname = projectname;
  boardProjectObject.projecttype = projecttype;
  boardProjectObject.projectsubtype = projectsubtype;
  let boardProject = new BoardProject(boardProjectObject);
  let boardProjectSaved = boardProject;
  if (sendToWR === 'true' || isWorkPlan) {
    try {
      boardProjectSaved = await boardService.saveBoard(
        boardProject.board_id,
        boardProject.project_id,
        boardProject.origin,
        boardProject.rank0,
        boardProject.projectname,
        boardProject.projecttype,
        boardProject.projectsubtype,
        transaction
      );
    } catch (error) {
      logger.error('error in save board ' + error);
      throw error;
    }
  }
  if (['admin', 'staff'].includes(user.designation) && !isWorkPlan) {
    await sendBoardsToProp(
      boardProjectSaved,
      board,
      servicearea,
      'servicearea'
    );
    await sendBoardsToProp(boardProjectSaved, board, county, 'county');
  }
};

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
    logger.error(error, 'at', sql);
  };
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