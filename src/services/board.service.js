import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';
import sequelize from 'sequelize';
import { LexoRank } from 'lexorank';

const BoardProject = db.boardProject;
const ProjectCost = db.projectCost;
const BoardProjectCost = db.boardProjectCost;
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
    const id = await db.sequelize.query('SELECT MAX(board_id) FROM boards');
    const lastID = Object.values(id[0][0]).length > 0 ? Object.values(id[0][0])[0] : -1;
    const insertQuery = `INSERT INTO boards (board_id, locality, year, projecttype, type, status, createdAt, updatedAt)
    OUTPUT inserted . *
    VALUES('${lastID + 1}', '${locality}', '${year}', '${projecttype}', '${type}', '${status}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${moment().format('YYYY-MM-DD HH:mm:ss')}')`;
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
    const id = await db.sequelize.query('SELECT MAX(board_id) FROM boards');
    const lastID = Object.values(id[0][0]).length > 0 ? Object.values(id[0][0])[0] : -1;
    const insertQuery = `INSERT INTO boards (board_id, locality, year, projecttype, type, status, createdAt, updatedAt, comment, substatus)
    OUTPUT inserted . *
    VALUES('${lastID + 1}', '${locality}', '${year}', '${projecttype}', '${type}', '${status}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${comment}', '${substatus}')`;
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
  // const newProjectBoard = await saveProjectBoard(duplicatedData);
  // const duplicatedBoardProjectId = newProjectBoard.board_project_id;
  console.log('Duplicated BoardProjectId', board_project_id);
  const allBoardProjectCostToDuplicate = await BoardProjectCost.findAll({
    where: {
      board_project_id: board_project_id
    }
  });
  console.log('This are all project cost to duplicate', allBoardProjectCostToDuplicate);
  const projectCostIds = allBoardProjectCostToDuplicate.map((abpcd) => abpcd.dataValues.project_cost_id);
  console.log('Project cost ids', projectCostIds);
  const allProjectCostsActive = await ProjectCost.findAll({
    where: {
      is_active: 1,
      project_cost_id: {[Op.in]: projectCostIds}
    }
  });
  const costsidsActive = allProjectCostsActive.map((costs) => costs.dataValues.project_cost_id);
  // los allboardprojectcosttoduplicate, filtrados por projectcostsactives
  const projectcostswithCostActive = allBoardProjectCostToDuplicate.filter((boardcost) => costsidsActive.includes(boardcost.dataValues.project_cost_id));

  console.log('This are the costs actives', costsidsActive, 'board project with costs actives are: ', projectcostswithCostActive.map((a)=> a.dataValues));
  
  // tengo que crear los duplicados de projectcosts 
  // insertar los boardprojectcost con los nuevos ids de projectcosts y el nuevo boardprojectid (newprojectboard)

}
export default {
  saveBoard,
  createNewBoard,
  saveProjectBoard,
  specialCreationBoard,
  countByGroup,
  reCalculateColumn,
  duplicateBoardProject
};
