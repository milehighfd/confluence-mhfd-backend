import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';
import sequelize from 'sequelize';
import { LexoRank } from 'lexorank';

const BoardProject = db.boardProject;
const ProjectCost = db.projectCost;
const BoardProjectCost = db.boardProjectCost;
const Project = db.project;
const { Op } = sequelize;

const saveBoard = async (
  board_id, 
  project_id,
  origin, 
  rank0 ,
  projectname,
  projecttype,
  projectsubtype
) => {
  const DRAFT_STATUS = 1;
  logger.info('create Board ' + JSON.stringify(
    board_id, 
    project_id,
    origin, 
    rank0,
    projectname,
    projecttype,
    projectsubtype
  ));
  try {
    const response = await BoardProject.create({
      board_id: board_id,
      project_id: project_id,
      origin: origin,
      rank0: rank0,
      projectname: projectname,
      projecttype: projecttype,
      projectsubtype: projectsubtype,
      code_status_type_id: DRAFT_STATUS,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    });
    return response;
  } catch(error) {
    throw error;
  }
}

const saveProjectBoard = async (ProjectBoard) => {
  try {
    const response = await BoardProject.create(ProjectBoard);
    logger.info('saved ProjectBoard');
    return response;
  } catch(error) {
    throw error;
  }
}

const createNewBoard = async (
  type, 
  year,
  locality, 
  projecttype,
  status 
) => {
  logger.info('create New Board ' + JSON.stringify(
    type, 
    year,
    locality, 
    projecttype,
    status ));
  try {
    const insertQuery = `INSERT INTO boards (locality, year, projecttype, type, status, createdAt, updatedAt)
    OUTPUT inserted . *
    VALUES('${locality}', '${year}', '${projecttype}', '${type}', '${status}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${moment().format('YYYY-MM-DD HH:mm:ss')}')`;
    const data = await db.sequelize.query(
      insertQuery,
      {
        type: db.sequelize.QueryTypes.INSERT,
      });
    return data[0][0];
  } catch(error) {
    throw error;
  }
}

const specialCreationBoard = async (
  type, 
  year,
  locality, 
  projecttype,
  status,
  comment,
  substatus
) => {
  try {
    const insertQuery = `INSERT INTO boards (locality, year, projecttype, type, status, createdAt, updatedAt, comment, substatus)
    OUTPUT inserted . *
    VALUES('${locality}', '${year}', '${projecttype}', '${type}', '${status}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${comment}', '${substatus}')`;
    const data = await db.sequelize.query(
      insertQuery,
      {
        type: db.sequelize.QueryTypes.INSERT,
      });
    return data[0][0];
  } catch(error) {
    throw error;
  }
}

const reCalculateColumn = async (board_id, column) => {
  const startValue = LexoRank.middle();
  try {
    const boardProjects = await BoardProject.findAll({
      where: {
        board_id: board_id,
        [column]: {
            [Op.ne]: null
          }
      },
      order: [
        [column, 'ASC']
      ]
    });
    const pr = [];
    boardProjects.forEach((project) => {
      const rank = startValue.genNext();
      pr.push(BoardProject.update(
        { [column]: rank.toString() },
        { where: { board_project_id: project.board_project_id } }
      ));
    });
    const solve = await Promise.all(pr);
    return solve;
  } catch (error) {
    throw error;
  }
}

const countByGroup = async (group, board_id) => {
  try {
    const counter = await db.sequelize.query(
      `
      SELECT COUNT(*) as count, ${group} FROM board_project
      WHERE board_id = ${board_id} AND ${group} IS NOT NULL  GROUP BY ${group}
      HAVING COUNT(*) > 1
      `
    );
    return counter;
  } catch(error) {
    throw error;
  }
}

const duplicateBoardProject = async (board_project_id, new_board_id) => {
  const boardProjects = await BoardProject.findAll({
    where: { board_project_id }
  });
  const bp = boardProjects[0];
  console.log('BP', bp);
  if (bp) {
    const duplicatedData = {
      board_id: new_board_id,
      project_id: bp.project_id,
      rank0: bp.rank0,
      rank1: bp.rank1,
      rank2: bp.rank2,
      rank3: bp.rank3,
      rank4: bp.rank4,
      rank5: bp.rank5,
      req1: bp.req1,
      req2: bp.req2,
      req3: bp.req3,
      req4: bp.req4,
      req5: bp.req5,
      year1: bp.year1,
      year2: bp.year2,
      origin: bp.origin,
    };
    const newProjectBoard = await saveProjectBoard(duplicatedData);
    const duplicatedBoardProjectId = newProjectBoard.board_project_id;
    const allBoardProjectCostToDuplicate = await BoardProjectCost.findAll({
      where: {
        board_project_id: board_project_id
      }
    });
    const projectCostIds = allBoardProjectCostToDuplicate.map((abpcd) => abpcd.dataValues.project_cost_id);
    const allProjectCostsActive = await ProjectCost.findAll({
      where: {
        is_active: 1,
        project_cost_id: {[Op.in]: projectCostIds}
      },
      attributes: {exclude: ['last_modified']}
    });
    const costsidsActive = allProjectCostsActive.map((costs) => costs.dataValues.project_cost_id);
    // los allboardprojectcosttoduplicate, filtrados por projectcostsactives
    const boardProjectCostwithCostActive = allBoardProjectCostToDuplicate.filter((boardcost) => costsidsActive.includes(boardcost.dataValues.project_cost_id));
    const offsetMillisecond = 120;
    let mainModifiedDate = new Date();
    // tengo que crear los duplicados de allProjectCostsActive con nuevo id y lastmodified which should be edited ( automatic? )
    // con el nuevo id, insertar
    allProjectCostsActive.forEach(async (projectCostToDup, index) => {
      const {project_cost_id, ...newProjectCost} = projectCostToDup.dataValues;
      const newPC = await ProjectCost.create({
        last_modified: moment(mainModifiedDate).subtract( offsetMillisecond * index).toDate(),
        ...newProjectCost
      });
      // tengo que sacar el board_project_cost que tenga el project_cost_id de projectCostToDup, 
      const BPCToDuplicate = boardProjectCostwithCostActive.filter((boardprojectcost => boardprojectcost.project_cost_id === projectCostToDup.project_cost_id));
      if (BPCToDuplicate.length > 0) {
        const {
          board_project_cost_id,
          board_project_id,
          project_cost_id,
          updatedAt,
          ...toDuplicate
        } = BPCToDuplicate[0].dataValues;
        const newBoardProjectCost = await BoardProjectCost.create({
          board_project_id: duplicatedBoardProjectId,
          project_cost_id: newPC.project_cost_id,
          ...toDuplicate
        });
      }    
    });
  }
}

const updateAndCreateProjectCosts = async (currentColumn, currentCost, currentProjectId, user, board_project_id, lastModifiedDate) => {
  console.log('Update And Create Cost ');
  const countOriginalProject = await Project.count({ where: { project_id: currentProjectId } });
  if (countOriginalProject === 0) {
    logger.error(`Project with id = ${currentProjectId} does not exist`);
    return;
  }
  const CODE_COST_TYPE_ID = 22; // Work Request Code cost type // TODO: verify which code will be correct 
  const currentBoardProjectCosts = await BoardProjectCost.findAll({
    where: {
      board_project_id,
      req_position: currentColumn
    }
  });
  
  const projectsIdsToUpdate = currentBoardProjectCosts.map((cbpc) => cbpc.dataValues.project_cost_id);
  try {
    ProjectCost.update({
      is_active: 0
    }, {
      where: {
        project_cost_id: { [Op.in]: projectsIdsToUpdate }
      }
    }).then(async () => {
      logger.info('PROJECTS TO BE UPDATED'+ projectsIdsToUpdate + ' current PROJECT ID TO INSERT' + currentProjectId);
      logger.info("about to create project cost  "+ currentCost+" project id "+ currentProjectId + " created_by "+ user.email);
      const projectCostCreated = await ProjectCost.create({
        cost: currentCost,
        project_id: currentProjectId,
        code_cost_type_id: CODE_COST_TYPE_ID,
        created_by: user.email,
        modified_by: user.email,
        is_active: 1,
        last_modified: lastModifiedDate
      });
      console.log('PROJECT COST IS CREATED', projectCostCreated);
      const project_cost_id = projectCostCreated.dataValues.project_cost_id;
      await BoardProjectCost.create({
          board_project_id: board_project_id,
          project_cost_id: project_cost_id,
          req_position: currentColumn,
          created_by: user.email,
          last_modified_by: user.email
      });
    });
  } catch (error) {
    logger.error("ERROR AT PROJECT COST is", error)
  }
  
}
export default {
  saveBoard,
  createNewBoard,
  saveProjectBoard,
  specialCreationBoard,
  countByGroup,
  reCalculateColumn,
  duplicateBoardProject,
  updateAndCreateProjectCosts
};
