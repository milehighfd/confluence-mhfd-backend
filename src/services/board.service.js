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
const ProjectPartner = db.projectPartner;
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
  const PROJECT_PARTNER_MHFD = 88; // WRONG CODE  /// MHFD 88 SPONSOR 11 COSPONSOR 12
  const CODE_COST_TYPE_ID = 22; // Work Request Code cost type // TODO: verify which code will be correct 
  const CODE_COST_TYPE_EDITED = 42; // WORK REQUEST EDITED 
  const currentBoardProjectCosts = await BoardProjectCost.findAll({
    where: {
      board_project_id,
      req_position: currentColumn
    }
  });
  
  
  const projectsCostsIdsToUpdate = currentBoardProjectCosts.map((cbpc) => cbpc.dataValues.project_cost_id);
  try {
    // TODO CHECK IF THIS IS WORKING FINE ON CREATE PROJECT OR EDIT COST 
    const MHFD_Partner = await ProjectPartner.findOne({ // THIS IS GOING TO BE AN ARRAY FOR COSPONSOR UNLESS WE SEND BUSINESS ASSOCIATES ID
      where: {
        project_id: currentProjectId,
        code_partner_type_id: PROJECT_PARTNER_MHFD
      }
    });
    console.log('******\n\n ******* \n MHFD_Partner \n *******-*-*------------*********', MHFD_Partner);
    // DESACTIVAR LOS ANTERIORES PROJECT COSTS
    ProjectCost.update({
      is_active: 0,
      code_cost_type_id: CODE_COST_TYPE_EDITED
    }, {
      where: {
        project_cost_id: { [Op.in]: projectsCostsIdsToUpdate }
      }
    }).then(async () => {
      logger.info('PROJECTS TO BE UPDATED'+ projectsCostsIdsToUpdate + ' current PROJECT ID TO INSERT' + currentProjectId);
      logger.info("about to create project cost  "+ currentCost+" project id "+ currentProjectId + " created_by "+ user.email);
      const projectCostCreated = await ProjectCost.create({
        cost: currentCost,
        project_id: currentProjectId,
        code_cost_type_id: CODE_COST_TYPE_ID,
        created_by: user.email,
        modified_by: user.email,
        is_active: 1,
        last_modified: lastModifiedDate,
        project_partner_id: MHFD_Partner.project_partner_id
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
    const boardCurrentYear = await getBoardForYear(year, type, locality, project_type, transaction);
    if (boardCurrentYear) {
      const rankKey = extraYears.includes(year) ? `rank${subtype}` : 'rank0';
      const reqKey = `req${subtype}`;
      const rank = { [rankKey]: await getNextLexoRankValue(boardCurrentYear.board_id, rankKey) };
      if (rankKey === `rank${subtype}`) rank[reqKey] = extraYearsAmounts[0];
      createdBoardProjects.push(createBoardProjectEntry(boardCurrentYear, rank, project_id, 2, userData));
    }
    const targetYear = year + 1;
    const boardNextYear = await getBoardForYear(targetYear, type, locality, project_type, transaction);
    if (boardNextYear) {
      const rank = { rank0: await getNextLexoRankValue(boardNextYear.board_id, 'rank0') };
      createdBoardProjects.push(createBoardProjectEntry(boardNextYear, rank, project_id, 2, userData));
    }
  } else {
    for (let i = 0; i < extraYears.length; i++) {
      const extraYear = extraYears[i];
      const board = await getBoardForYear(extraYear, type, locality, project_type, transaction);
      if (board) {
        const rankColumnName = `rank${subtype}`;
        const amountColumnName = `req${subtype}`;
        const rank = {
          [rankColumnName]: await getNextLexoRankValue(board.board_id, rankColumnName),
          [amountColumnName]: extraYearsAmounts[i]
        };
        const year1Value = extraYearsAmounts[i + 1] || null;
        const year2Value = extraYearsAmounts[i + 2] || null;
        createdBoardProjects.push(createBoardProjectEntry(board, rank, project_id, 2, userData, year1Value, year2Value));
      }
    }
  }
  const currentYearEntry = createdBoardProjects.find(entry => +entry.year === +year);
  console.log('currentYearEntry', currentYearEntry)
  if (currentYearEntry) {
    const mhfdBoard = await getBoardForYear(+year, 'WORK_PLAN', "MHFD District Work Plan", project_type, transaction);
    if (mhfdBoard) {
      const replicatedEntry = { ...currentYearEntry };
      replicatedEntry.origin = "MHFD District Work Plan";
      replicatedEntry.board_id = mhfdBoard.board_id;
      createdBoardProjects.push(replicatedEntry);
    }
  }
  return createdBoardProjects;
}


async function createBoardProjects(allYears, year, type, locality, project_type, project_id, extraYears, extraYearsAmounts, userData, transaction) {
  try {
    const createdBoardProjects = [];
    const boardRanks = {};    
    const statusBoardProject = extraYears.length > 0 ? 2 : 1;
    if (extraYears.length > 0 && Math.min(...extraYears) - year > 1) {
      for (let extraYear of extraYears) {
        for (let y = year; y <= extraYear; y++) {
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
      createdBoardProjects.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    }
    else if (extraYears.length === 0 || (extraYears.length === 1 && extraYears[0] === year)) {
      const boardCurrentYear = await getBoardForYear(year, type, locality, project_type, transaction);
      if (boardCurrentYear) {
        const rankKey = extraYears.length === 0 ? 'rank0' : 'rank1';
        const reqKey = `req${rankKey.charAt(4)}`;        
        const rank = {
          [rankKey]: await getNextLexoRankValue(boardCurrentYear.board_id, rankKey),
          [reqKey]: extraYearsAmounts[0]
        };
        createdBoardProjects.push(createBoardProjectEntry(boardCurrentYear, rank, project_id, statusBoardProject, userData));
      }
      const boardNextYear = await getBoardForYear(year + 1, type, locality, project_type, transaction);
      if (boardNextYear) {
        const rank = { rank0: await getNextLexoRankValue(boardNextYear.board_id, 'rank0') };
        createdBoardProjects.push(createBoardProjectEntry(boardNextYear, rank, project_id, statusBoardProject, userData));
      }
    }
    else {
      if (!createdBoardProjects.some(entry => +entry.year === +year) && !allYears.includes(year)) {
        const boardCurrentYear = await getBoardForYear(year, type, locality, project_type, transaction);
        if (boardCurrentYear) {
          let ranks = {};
          let amounts = {};
          let rankNumber = 2;
          for (let extraYear of extraYears) {
            if (extraYear >= year) {
              const rankColumnName = `rank${rankNumber}`;
              const amountColumnName = `req${rankNumber}`;
              ranks[rankColumnName] = await getNextLexoRankValue(boardCurrentYear.board_id, rankColumnName);
              amounts[amountColumnName] = extraYearsAmounts[extraYears.indexOf(extraYear)];
              rankNumber++;
            }
          }
          createdBoardProjects.push(createBoardProjectEntry(boardCurrentYear, { ...ranks, ...amounts }, project_id, statusBoardProject, userData));
        }
      }
      for (let boardYear of allYears) {
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
    const yearEntry = createdBoardProjects.find(entry => +entry.year === +year);
    if (yearEntry) {
      const mhfdBoard = await getBoardForYear(+year, 'WORK_PLAN', "MHFD District Work Plan", project_type, transaction);
      if (mhfdBoard) {
        const mhfdEntry = {
          ...yearEntry,
          origin: "MHFD District Work Plan",
          board_id: mhfdBoard.board_id
        };
        createdBoardProjects.push(mhfdEntry);
      }
    }
    return createdBoardProjects;
  } catch (error) {
    console.error("Error creating board projects:", error);
    throw error;
  }
}

async function getNextLexoRankValue(boardId, rankColumnName) {
  const existingBoardProject = await getBoardProjectByBoardId(boardId, rankColumnName);
  if (existingBoardProject && existingBoardProject[rankColumnName]) {
    return computeNextLexoRank(existingBoardProject[rankColumnName]);
  } else {
    return initialLexoRankValue();
  }
}

function createBoardProjectEntry(board, rank, project_id, statusBoardProject, userData, year1 = null, year2 = null) {
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
    year1: year1,
    year2: year2,
    ...rank
  };
}

async function getBoardProjectByBoardId(board_id, rankColumnName) {
  try {
    return await BoardProject.findOne({
      where: {
        board_id: board_id,
        [rankColumnName]: {
          [Op.ne]: null  
        }
      },
      order: [[rankColumnName, 'DESC']], 
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
    const createBoardPromises = missingYears.map(missingYear => {
      return Board.create({
        type,
        year: missingYear,
        locality,
        projecttype: project_type,
        status: 'Under Review',
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        last_modified_by: userData.email,
        created_by: userData.email
      }, { transaction: transaction });
    });
    await Promise.all(createBoardPromises);
    const createdYears = missingYears.map(missingYear => ({ missingYear, locality, project_type, type, user: userData.email }));
    return createdYears;
  } catch (error) {
    console.error("Error creating missing boards:", error);
    throw error;
  }
};

function constructProjectCost(boardProject, reqPosition, userData, partnerId, boardType, DateToAvoidRepeated) {
  const costType = boardType === 'WORK_PLAN' ? 21 : 22;
  return {
    project_id: boardProject.project_id,
    cost: boardProject[`req${reqPosition}`],
    code_cost_type_id: costType,
    cost_description: '', 
    project_partner_id: partnerId, 
    cost_project_partner_contribution: null,
    created_by: userData.email,
    modified_by: userData.email,
    created: DateToAvoidRepeated,
    last_modified: DateToAvoidRepeated,
    agreement_number: '', 
    amendment_number: '',
    code_phase_type_id: null, 
    code_scope_of_work_type_id: 20,
    is_active: 1,
    effective_date: ''
  };
}

function constructBoardProjectsCost(boardProject, projectCostId, reqPosition, userData, boardProjectId) {
  return {
    board_project_id: boardProjectId,
    project_cost_id: projectCostId,
    req_position: reqPosition,
    created_by: userData.email,
    last_modified_by: userData.email,
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
  };
}

async function createAllBoardProjectsCost(boardProjectsCreate, transaction) {
  return await Promise.all(boardProjectsCreate.map(cost => BoardProjectCost.create(cost, { transaction })));
}

async function createAllProjectCosts(projectCosts, transaction) {
  return await Promise.all(projectCosts.map(cost => ProjectCost.create(cost, { transaction })));
}

async function cascadeDelete(project_id, createdBoardProjects, type, startYear, locality, project_type, transaction) {
  const boardsToDelete = await getRelevantBoards(type, startYear, Array.from({ length: 4 }, (_, i) => startYear + i), locality, project_type);
  const boardIdsToDelete = boardsToDelete.map(board => board.board_id);
  const createdBoardIds = createdBoardProjects.map(entry => entry.board_id);
  const filteredBoardIdsToDelete = boardIdsToDelete.filter(id => !createdBoardIds.includes(id));
  const boardProjectsToDelete = await BoardProject.findAll({
      where: {
          project_id: project_id,
          board_id: filteredBoardIdsToDelete
      }
  });
  const boardProjectIdsToDelete = boardProjectsToDelete.map(bp => bp.board_project_id);
  const boardProjectsCostToDelete = await BoardProjectCost.findAll({
      where: {
          board_project_id: boardProjectIdsToDelete
      }
  });
  const projectCostIdsToDelete = boardProjectsCostToDelete.map(bpc => bpc.project_cost_id);
  await ProjectCost.destroy({
      where: {
          project_cost_id: projectCostIdsToDelete
      },
      transaction
  });
  await BoardProjectCost.destroy({
      where: {
          board_project_cost_id: boardProjectsCostToDelete.map(bpc => bpc.board_project_cost_id)
      },
      transaction
  });
  await BoardProject.destroy({
      where: {
          project_id: project_id,
          board_id: filteredBoardIdsToDelete
      },
      transaction
  });
}

async function findProjectPartner(projectId) {
  try {
      const projectPartner = await ProjectPartner.findOne({
          where: {
              project_id: projectId,
              code_partner_type_id: 11
          }
      });

      if (projectPartner) {
          return projectPartner.project_partner_id;
      } else {
          console.log("No matching ProjectPartner found.");
          return null;
      }
  } catch (error) {
      console.error("Error fetching ProjectPartner:", error);
      throw error;
  }
}

async function getBoardTypeById(board_id) {
  const board = await Board.findOne({ where: { board_id: board_id } });
  return board ? board.type : null;
}

async function updateProjectCostEntries(project_id, userData, transaction) {
  try {
      const updatedValues = {
          is_active: 0,
          last_modified: moment().format('YYYY-MM-DD HH:mm:ss'),
          modified_by: userData.username
      };

      await ProjectCost.update(updatedValues, {
          where: {
              project_id: project_id,
              code_cost_type_id: [21, 22]
          },
          transaction
      });
  } catch (error) {
      console.error("Error updating ProjectCost entries:", error);
      throw error;
  }
}


const updateAndCreateProjectCostsForAmounts = async (currentColumn, currentCost, currentProjectId, currentBusinessAssociatesId, currentPartnerTypeId, user, board_project_id, lastModifiedDate) => {
  console.log('Update And Create Cost ');
  const countOriginalProject = await Project.count({ where: { project_id: currentProjectId } });
  if (countOriginalProject === 0) {
    logger.error(`Project with id = ${currentProjectId} does not exist`);
    return;
  }
  const PROJECT_PARTNER_ID = currentPartnerTypeId;  /// MHFD 88 SPONSOR 11 COSPONSOR 12
  const CODE_COST_TYPE_ID = 22; // Work Request Code cost type // TODO: verify which code will be correct 
  const CODE_COST_TYPE_EDITED = 42; // WORK REQUEST EDITED 
  try {
    const project_partner = await ProjectPartner.findOne({
      where: {
        project_id: currentProjectId,
        code_partner_type_id: PROJECT_PARTNER_ID,
        business_associates_id: currentBusinessAssociatesId
      }
    });
    console.log('\n\n project partner at projectcost for amounts', project_partner, 'with body', {
      project_id: currentProjectId,
      code_partner_type_id: PROJECT_PARTNER_ID,
      business_associates_id: currentBusinessAssociatesId
    }, '\n\n');
    const currentBoardProjectCosts = await BoardProjectCost.findAll({
      include: [{
        model: ProjectCost,
        as: 'projectCostData',
        where: {
          is_active: 1,
          project_partner_id: {[Op.eq]: null}
        }
      }],
      where: {
        board_project_id,
        req_position: currentColumn
      }
    });
    console.log('IS THIS EMPTY? ->', currentBoardProjectCosts, 'Getting board by', board_project_id, currentColumn);
    const projectsCostsIdsToUpdate = currentBoardProjectCosts.map((cbpc) => cbpc.dataValues.project_cost_id);
    // DESACTIVAR LOS ANTERIORES PROJECT COSTS
    ProjectCost.update({
      is_active: 0,
      code_cost_type_id: CODE_COST_TYPE_EDITED
    }, {
      where: {
        project_cost_id: { [Op.in]: projectsCostsIdsToUpdate } // we need to get the projectcost olds 
      }
    }).then(async () => {
      logger.info('\n\n\n\n\n ************************ \n PROJECTS TO BE UPDATED'+ projectsCostsIdsToUpdate + ' <- \n\n current PROJECT ID TO INSERT' + currentProjectId);
      logger.info("about to create project cost  "+ currentCost+" project id "+ currentProjectId + " created_by "+ user.email);
      if (currentCost) {
        const projectCostCreated = await ProjectCost.create({
          cost: currentCost,
          project_id: currentProjectId,
          code_cost_type_id: CODE_COST_TYPE_ID,
          created_by: user.email,
          modified_by: user.email,
          is_active: 1,
          last_modified: lastModifiedDate,
          project_partner_id: project_partner.project_partner_id
        });
        console.log('PROJECT COST IS CREATED', projectCostCreated.dataValues.project_cost_id);
        const project_cost_id = projectCostCreated.dataValues.project_cost_id;
        await BoardProjectCost.create({
            board_project_id: board_project_id,
            project_cost_id: project_cost_id,
            req_position: currentColumn,
            created_by: user.email,
            last_modified_by: user.email
        });
      }
    });
  } catch (error) {
    logger.error("ERROR AT PROJECT COST is", error)
  }
  
}
export default {
  createNewBoard,
  reCalculateColumn,
  updateAndCreateProjectCosts,
  updateAndCreateProjectCostsForAmounts,
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
  createBoardProjectsMaintenance,
  createAllProjectCosts,
  constructProjectCost,
  constructBoardProjectsCost,
  createAllBoardProjectsCost,
  cascadeDelete,
  findProjectPartner,
  getBoardTypeById,
  updateProjectCostEntries
};
