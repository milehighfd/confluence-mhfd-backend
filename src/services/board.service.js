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
  return await Board.findAll({
    where: {
      type,
      year: {
        [Op.or]: [year + 1, ...extraYears]
      },
      locality,
      projecttype: project_type
    }
  });
};

const determineMissingYears = (allRelevantBoards, year, extraYears) => {
  const boardYears = allRelevantBoards.map(board => parseInt(board.year));
  const allYears = [year + 1, ...extraYears];
  return allYears.filter(y => !boardYears.includes(y));
};

async function createBoardProjects(allYears, year, type, locality, project_type, project_id, extraYears) {
  const createdBoardProjects = [];
  // Handle the gap logic
  if (extraYears.length > 0 && Math.min(...extraYears) - year > 1) {
    for (let extraYear of extraYears) {
        for (let y = year + 1; y <= extraYear; y++) {
            const board = await getBoardForYear(y, type, locality, project_type);
            if (board) {
                let ranks = {};
                const rankNumber = extraYear - y + 1; // This determines the rank based on the difference between the board year and the extraYear
                const rankColumnName = `rank${rankNumber}`;
                ranks[rankColumnName] = await getNextLexoRankValue(board.board_id, rankColumnName);
                createdBoardProjects.push(createBoardProjectEntry(board, ranks));
            }
        }
    }
}

  else if (extraYears.length === 0 || (extraYears.length === 1 && extraYears[0] === year)) {
    const board = await getBoardForYear(year + 1, type, locality, project_type);
    if (board) {
      const rank = { rank0: await getNextLexoRankValue(board.board_id, 'rank0') };
      createdBoardProjects.push(createBoardProjectEntry(board, rank));
    }
  } else {
    for (let boardYear of allYears) {
      if (boardYear !== year) {
        const board = await getBoardForYear(boardYear, type, locality, project_type);
        if (board) {
          let ranks = {};
          let rankNumber = 1;
          for (let extraYear of extraYears) {
            if (extraYear >= boardYear) {
              const rankColumnName = `rank${rankNumber}`;
              ranks[rankColumnName] = await getNextLexoRankValue(board.board_id, rankColumnName);
              rankNumber++;
            }
          }
          createdBoardProjects.push(createBoardProjectEntry(board, ranks));
        }
      }
    }
  }
  return createdBoardProjects;
}

async function getNextLexoRankValue(boardId, rankColumnName) {
  const existingBoardProject = await getBoardProjectByBoardId(boardId);
  if (existingBoardProject && existingBoardProject[rankColumnName]) {
    return computeNextLexoRank(existingBoardProject[rankColumnName]);
  } else {
    return initialLexoRankValue();
  }
}

function createBoardProjectEntry(board, rank) {
  return {
      year: board.year,
      board_id: board.board_id,
      ...rank
  };
}

async function getBoardProjectByBoardId(board_id) {
  return await BoardProject.findOne({
    where: {
      board_id: board_id
    },
    order: [['board_project_id', 'DESC']],
    limit: 1
  });
}

async function getBoardForYear(year, type, locality, project_type) {
  return await Board.findOne({
      where: {
          type,
          year: year,
          locality,
          projecttype: project_type
      }
  });
}


const createMissingBoards = async (missingYears, type, locality, project_type) => {
  const createdYears = [];
  for (let missingYear of missingYears) {
    // await Board.create({
    //   type,
    //   year: missingYear,
    //   locality,
    //   projecttype: project_type
    // });
    createdYears.push(missingYear);
  }
  return createdYears;
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
  computeNextLexoRank
};
