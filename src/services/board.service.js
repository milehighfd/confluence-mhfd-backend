import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';
import sequelize from 'sequelize';
import { LexoRank } from 'lexorank';

const BoardProject = db.boardProject;
const ProjectCost = db.projectCost;
const BoardProjectCost = db.boardProjectCost;
const Project = db.project;
const Board = db.board;
const { Op } = sequelize;

const createNewBoard = async (
  type, 
  year,
  locality, 
  projecttype,
  status,
  creator,
  comment,
  substatus,
  transaction = null
) => {
  const t = transaction ? await transaction : null;
  logger.info('create New Board ' + JSON.stringify(
    type, 
    year,
    locality, 
    projecttype,
    status)
  );
  const res = await Board.create({
    type,
    year,
    locality,
    projecttype,
    status,
    comment,
    substatus,
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    created_by: creator,
    last_modified_by: creator
  }, { transaction: t }); // associate transaction with the database operation
  return res;
}

const reCalculateColumn = async (board_id, column, creator) => {
  const startValue = LexoRank.middle();
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
  let rank = startValue;
  boardProjects.forEach((project) => {      
    pr.push(BoardProject.update(
      { [column]: rank.toString(), last_modified_by: creator },
      { where: { board_project_id: project.board_project_id } }
    ));
    rank = rank.genNext();
  });
  const solve = await Promise.all(pr);
  return solve;
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

function computeNextLexoRank(lastRank) {
  return LexoRank.parse(lastRank).genNext().toString();
}

function initialLexoRankValue() {
  return LexoRank.middle().toString();
}

const getRelevantBoards = async (type, year, extraYears, locality, project_type) => {
  try {
    let allYears;
    if (!extraYears || extraYears.length === 0) {
      allYears = [year + 1];
    } else {
      allYears = Array.from({ length: Math.max(...extraYears) - year + 1 }, (_, i) => year + i);
    }
    return await Board.findAll({
      where: {
        type,
        year: {
          [Op.in]: allYears
        },
        locality,
        projecttype: project_type
      }
    });
  } catch (error) {
    console.error("Error fetching relevant boards:", error);
    throw error;
  }
};


const determineMissingYears = (allRelevantBoards, year, extraYears) => {
  const boardYears = allRelevantBoards.map(board => parseInt(board.year));
  let endYear = extraYears.length > 0 ? Math.max(...extraYears) : year + 1;
  const allYears = Array.from({ length: endYear - year }, (_, i) => year + 1 + i);
  return allYears.filter(y => !boardYears.includes(y));
};

async function createBoardProjectsMaintenance(allYears, year, type, locality, project_type, project_id, extraYears, extraYearsAmounts, userData, subtype, transaction) {
  const createdBoardProjects = [];
  if (extraYears.length === 0 || (extraYears.length === 1 && extraYears[0] === year)) {
      const targetYear = year + 1;
      const board = await getBoardForYear(targetYear, type, locality, project_type, transaction);
      if (board) {
          const rank = { rank0: await getNextLexoRankValue(board.board_id, 'rank0') };
          createdBoardProjects.push(createBoardProjectEntry(board, rank, project_id, 2, userData));
      }
  }
  for (let i = 0; i < extraYears.length; i++) {
      const extraYear = extraYears[i];
      if (extraYear !== year) { 
          const board = await getBoardForYear(extraYear, type, locality, project_type, transaction);
          if (board) {
              const rankColumnName = `rank${subtype}`;
              const amountColumnName = `req${subtype}`;
              const rank = { 
                  [rankColumnName]: await getNextLexoRankValue(board.board_id, rankColumnName),
                  [amountColumnName]: extraYearsAmounts[i]
              };
              createdBoardProjects.push(createBoardProjectEntry(board, rank, project_id, 2, userData));
          }
      }
  }
  return createdBoardProjects;
}




async function createBoardProjects(allYears, year, type, locality, project_type, project_id, extraYears, extraYearsAmounts, userData, transaction) {
  try {
    const createdBoardProjects = [];
    const boardRanks = {};
    const yearIndex = extraYears.indexOf(year);
    if (yearIndex !== -1) {
      extraYears.splice(yearIndex, 1);
      extraYearsAmounts.splice(yearIndex, 1);
    }
    const statusBoardProject = extraYears.length > 0 ? 2 : 1;
    if (extraYears.length > 0 && Math.min(...extraYears) - year > 1) {
      for (let extraYear of extraYears) {
        for (let y = year + 1; y <= extraYear; y++) {
          const board = await getBoardForYear(y, type, locality, project_type, transaction);
          if (board) {
            if (!boardRanks[board.board_id]) {
              boardRanks[board.board_id] = {
                board: board,
                ranks: {},
                amounts: {}
              };
            }
            const rankNumber = extraYear - y + 1;
            const rankColumnName = `rank${rankNumber}`;
            const amountColumnName = `req${rankNumber}`;
            boardRanks[board.board_id].ranks[rankColumnName] = await getNextLexoRankValue(board.board_id, rankColumnName);
            boardRanks[board.board_id].amounts[amountColumnName] = extraYearsAmounts[extraYears.indexOf(extraYear)];
          }
        }
      }
      for (const boardId in boardRanks) {
        createdBoardProjects.push(createBoardProjectEntry(
          boardRanks[boardId].board,
          { ...boardRanks[boardId].ranks, ...boardRanks[boardId].amounts },
          project_id,
          statusBoardProject,
          userData
        ));
      }
    }
    else if (extraYears.length === 0 || (extraYears.length === 1 && extraYears[0] === year)) {
      const board = await getBoardForYear(year + 1, type, locality, project_type, transaction);
      if (board) {
        const rank = { rank0: await getNextLexoRankValue(board.board_id, 'rank0') };
        createdBoardProjects.push(createBoardProjectEntry(board, rank, project_id, statusBoardProject, userData));
      }
    } else {
      for (let boardYear of allYears) {
        if (boardYear > year) {
          const board = await getBoardForYear(boardYear, type, locality, project_type, transaction);
          if (board) {
            let ranks = {};
            let amounts = {};
            let rankNumber = 1;
            for (let extraYear of extraYears) {
              if (extraYear >= boardYear) {
                const rankColumnName = `rank${rankNumber}`;
                const amountColumnName = `req${rankNumber}`;
                ranks[rankColumnName] = await getNextLexoRankValue(board.board_id, rankColumnName);
                amounts[amountColumnName] = extraYearsAmounts[extraYears.indexOf(extraYear)];
                rankNumber++;
              }
            }
            createdBoardProjects.push(createBoardProjectEntry(board, { ...ranks, ...amounts }, project_id, statusBoardProject));
          }
        }
      }

    }
    return createdBoardProjects;
  } catch (error) {
    console.error("Error creating board projects:", error);
    throw error;
  }
}

async function getNextLexoRankValue(boardId, rankColumnName) {
  const existingBoardProject = await getBoardProjectByBoardId(boardId);
  if (existingBoardProject && existingBoardProject[rankColumnName]) {
    return computeNextLexoRank(existingBoardProject[rankColumnName]);
  } else {
    return initialLexoRankValue();
  }
}

function createBoardProjectEntry(board, rank, project_id, statusBoardProject, userData) {
  let email = userData?.email;
  return {
      year: board.year,
      board_id: board.board_id,
      origin: board.locality,
      project_id,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      code_status_type_id: statusBoardProject,
      created_by: email,
      last_modified_by: email,
      ...rank
  };
}

async function getBoardProjectByBoardId(board_id) {
  try {
    return await BoardProject.findOne({
      where: {
        board_id: board_id
      },
      order: [['board_project_id', 'DESC']],
      limit: 1,
    });
  } catch (error) {
    console.error("Error fetching board project by board ID:", error);
    throw error;
  }
}


async function getBoardForYear(year, type, locality, project_type, transaction) {
  try {
    return await Board.findOne({
      where: {
        type,
        year: year,
        locality,
        projecttype: project_type
      },
      transaction: transaction
    });
  } catch (error) {
    console.error("Error fetching board for year:", error);
    throw error;
  }
}



const createMissingBoards = async (missingYears, type, locality, project_type, userData, transaction) => {
  try {
    // const createBoardPromises = missingYears.map(missingYear => {
    //   return Board.create({
    //     type,
    //     year: missingYear,
    //     locality,
    //     projecttype: project_type,
    //     status: 'Under Review',
    //     createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    //     updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    //     last_modified_by: userData.email,
    //     created_by: userData.email
    //   }, { transaction: transaction });
    // });
    // await Promise.all(createBoardPromises);
    const createdYears = missingYears.map(missingYear => ({ missingYear, locality, project_type, type, user: userData.email }));
    return createdYears;
  } catch (error) {
    console.error("Error creating missing boards:", error);
    throw error;
  }
};



export default {
  createNewBoard,
  reCalculateColumn,
  updateAndCreateProjectCosts,
  createMissingBoards,
  getBoardForYear,
  getBoardProjectByBoardId,
  createBoardProjectEntry,
  getNextLexoRankValue,
  createBoardProjects,
  determineMissingYears,
  getRelevantBoards,
  initialLexoRankValue,
  computeNextLexoRank,
  createBoardProjectsMaintenance
};
