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

export const getBoard = async (type, locality, year, projecttype) => {
  let board = await Board.findOne({
    where: {
      type, year, locality, projecttype
    }
  });
  if (board) {
    return board;
  } else {
    let newBoard = new Board({
      type, year, locality, projecttype, status: 'Under Review'
    });
    newBoard.save();
    return newBoard;
  }
};

export const sendBoardsToProp = async (bp, board, prop, propid) => {
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
      board.projecttype
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
    await newBoardProject.save();
    const updatePromises = [];
    for (let i = 0; i < 6; i++) {
      const rank = `rank${i}`;
      logger.info(`Start count for ${rank} and board ${destinyBoard.board_id}`);
      const counter = await boardService.countProjectsByRank(destinyBoard.board_id, rank);
      logger.info(`Finish counter: ${JSON.stringify(counter)}}`);
      if (counter[1]) {
          updatePromises.push(boardService.reCalculateColumn(destinyBoard.board_id, rank));
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
  projectsubtype
) => {
  const [dbLocs] = await db.sequelize.query(
    `SELECT name, type FROM Localities WHERE name = '${locality}'`
  );
  let _dbLoc = null;
  if (dbLocs.length > 0) {
    _dbLoc = dbLocs[0];
  }
  const dbLoc = _dbLoc;
  let type = 'WORK_REQUEST';
  if (dbLoc) {
    if (dbLoc.type === 'LOCAL_GOVERNMENT') {
      type = 'WORK_REQUEST';
    } else if (dbLoc.type === 'COUNTY' || dbLoc.type === 'SERVICE_AREA') {
      type = 'WORK_PLAN';
    }
  }
  if (!year) {
    let configuration = await Configuration.findOne({
      where: {
        key: 'BOARD_YEAR',
      },
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
  });
  if (!board) {
    const response = await boardService.createNewBoard(
      type,
      year,
      locality,
      projecttype,
      'Under Review'
    );
    board = response;
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
    order: ['rank0', 'ASC'],
  });
  if (firstProject) {
    boardProjectObject.rank0 = LexoRank.parse(firstProject.rank0)
      .genPrev()
      .toString();
  } else { 
    boardProjectObject.rank0 = LexoRank.middle().toString();
  }
  /*   if (type === 'WORK_PLAN') {
    boardProjectObject.originPosition0 = -1;
    boardProjectObject.originPosition1 = -1;
    boardProjectObject.originPosition2 = -1;
    boardProjectObject.originPosition3 = -1;
    boardProjectObject.originPosition4 = -1;
    boardProjectObject.originPosition5 = -1;
  } */
  // NEW ADITION
  boardProjectObject.projectname = projectname;
  boardProjectObject.projecttype = projecttype;
  boardProjectObject.projectsubtype = projectsubtype;
  let boardProject = new BoardProject(boardProjectObject);
  let boardProjectSaved = boardProject;
  if (sendToWR === 'true' || isWorkPlan) {
    boardProjectSaved = await boardService.saveBoard(
      boardProject.board_id,
      boardProject.project_id,
      boardProject.origin,
      boardProject.rank0,
      boardProject.projectname,
      boardProject.projecttype,
      boardProject.projectsubtype
    );
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
