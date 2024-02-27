import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';
import sequelize, { col } from 'sequelize';
import { LexoRank } from 'lexorank';
import { CODE_DATA_SOURCE_TYPE, COST_IDS, INITIAL_GAP } from 'bc/lib/enumConstants.js';
import { getBoardProjectsOfBoardOfColumn, getSortOrderValue } from 'bc/routes/board-project/updateSortOrderFunctions.js';
import { getSortOrderForUpdate } from 'bc/routes/board-project/rankFunctions.js';

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
  try {
    console.log('create New Board ' + type, year, locality, projecttype, status, creator, comment, substatus);
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
    }, { transaction }); // associate transaction with the database operation
    return res;
  } catch (error) {
    logger.error("ERROR AT CREATE NEW BOARD", error);
    throw error;
  }
}

const reCalculateSortOrderForColumn = async (board_id, toWorkPlan, column, creator, transaction) => {
  try {
  
  const boardProjects = await getBoardProjectsOfBoardOfColumn(board_id, toWorkPlan, column, transaction);
  console.log(column, ' All board projects to recalculate', board_id, JSON.stringify(boardProjects));
  let startValue = 1;
  const pr = [];
  if (boardProjects.length) {
    for(let i = 0 ; i < boardProjects.length ; ++i) {
      const bp = boardProjects[i];
      const boardProjectCostToUpdate = await BoardProjectCost.findOne({
        where: {
          board_project_cost_id: bp.boardProjectToCostData[0]?.board_project_cost_id
        },
        transaction: transaction
      });
      if (boardProjectCostToUpdate) {
        boardProjectCostToUpdate.sort_order = startValue++;
        boardProjectCostToUpdate.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
        boardProjectCostToUpdate.last_modified_by = creator;
        pr.push(boardProjectCostToUpdate.save({transaction: transaction}));
      }
    }
    const solve = await Promise.all(pr);
    console.log(' Solved all boardprojectcosts updated after recaulculate sort order values');
    return solve;
  } else {
    console.log('Solved without data');
    return [];
  }

  } catch (error) {
    logger.error("ERROR AT RECALCULATE SORT ORDER", error);
  }
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
  // let rank = startValue;
  boardProjects.forEach((project) => {      
    pr.push(BoardProject.update(
      { 
        // [column]: rank.toString(), 
        last_modified_by: creator },
      { where: { board_project_id: project.board_project_id } }
    ));
    // rank = rank.genNext();
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
    ProjectCost.update({
      is_active: 0,
      code_cost_type_id: CODE_COST_TYPE_EDITED,
      last_modified: lastModifiedDate,
      modified_by: user.email
    }, {
      where: {
        project_cost_id: { [Op.in]: projectsCostsIdsToUpdate }
      }
    }).then(async () => {
      const newProjectCostData = {
        cost: currentCost,
        project_id: currentProjectId,
        code_cost_type_id: CODE_COST_TYPE_ID,
        created_by: user.email,
        modified_by: user.email,
        is_active: 1,
        last_modified: lastModifiedDate,
        project_partner_id: MHFD_Partner.project_partner_id,
        code_data_source_type_id: CODE_DATA_SOURCE_TYPE.USER
      };
      const projectCostCreated = await ProjectCost.create(newProjectCostData);
      const project_cost_id = projectCostCreated.dataValues.project_cost_id;
      const newBoardProjectCostData = {
        board_project_id: board_project_id,
        project_cost_id: project_cost_id,
        req_position: currentColumn,
        created_by: user.email,
        last_modified_by: user.email,
        sort_order: 0
      };
      await BoardProjectCost.create(newBoardProjectCostData);
    });
  } catch (error) {
    logger.error("ERROR AT PROJECT COST is", error)
  }  
}

function updateSubmissionDate(board_ids, creator, transaction) {
  const promises = board_ids.map(board_id => {
    try {
      return Board.update({
        submissionDate: moment().format('YYYY-MM-DD HH:mm:ss'),
        last_modified_by: creator
      }, {
        where: {
          board_id: board_id
        },
        transaction
      });
    } catch (error) {
      logger.error(`Error updating submission date for board ${board_id}: ${error}`);
    }
  });
  return Promise.all(promises);
}

function computeNextLexoRank(lastRank) {
  return LexoRank.parse(lastRank).genNext().toString();
}

function computePrevLexoRank(lastRank) {
  return LexoRank.parse(lastRank).genPrev().toString();
}

function initialLexoRankValue() {
  return LexoRank.middle().toString();
}

const getRelevantBoards = async (type, year, locality, project_type) => {
  try {
    const targetYear = year + 1;
    return await Board.findOne({
      where: {
        type,
        year: targetYear,
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
  const targetYear = year + 1;
  const boardNextYear = await getBoardForYear(targetYear, type, locality, project_type, transaction);
  if (boardNextYear) {
    let amountColumnName = `req0`;    
    let amountIndex = 1;
    if (extraYears.includes(year)) {
      amountColumnName = `req${subtype}`;
    } 
    createdBoardProjects.push(createBoardProjectEntry(boardNextYear, project_id, 2, userData));
  }  
  const currentYearEntry = createdBoardProjects.find(entry => +entry.year === +year);  
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
    const statusBoardProject = extraYears.length > 0 ? 2 : 1;
    if (extraYears.includes(year)) {
      extraYears = extraYears.filter(eYear => eYear !== year);
    }
    const nextYear = year + 1;
    const boardNextYear = await getBoardForYear(nextYear, type, locality, project_type, transaction);
    if (boardNextYear) {
      return createBoardProjectEntry(boardNextYear, project_id, statusBoardProject, userData);
    }
    return null;
  } catch (error) {
    console.error("Error creating board projects:", error);
    throw error;
  }
}

async function getNextLexoRankValue(boardId, rankColumnName) {
  const existingBoardProject = await getBoardProjectByBoardId(boardId, rankColumnName);
  if (existingBoardProject && existingBoardProject[rankColumnName]) {
    console.log(computeNextLexoRank(existingBoardProject[rankColumnName]), 'COMPUTE NEXT LEXO RANK');
    return computeNextLexoRank(existingBoardProject[rankColumnName]);
  } else {
    console.log(initialLexoRankValue(), 'INITIAL LEXO RANK VALUE');
    return initialLexoRankValue();
  }
}



async function getPrevLexoRankValue(boardId, rankColumnName) {
  const existingBoardProject = await getFirstBoardProjectById(boardId, rankColumnName);
  if (existingBoardProject && existingBoardProject[rankColumnName]) {
    console.log(computePrevLexoRank(existingBoardProject[rankColumnName]), 'COMPUTE PREV LEXO RANK');
    return computePrevLexoRank(existingBoardProject[rankColumnName]);
  } else {
    console.log(initialLexoRankValue(), 'INITIAL LEXO RANK VALUE');
    return initialLexoRankValue();
  }
}

export async function deactivateCosts(result, sponsor, userData, transaction) {
  const boardProjectCosts = await BoardProjectCost.findAll({
    where: {
      board_project_id: result.board_project_id,
    },
    include: [
      {
        attibutes: ['project_cost_id'],
        model: ProjectCost,
        as: 'projectCostData',
        required: true,
        where: {
          is_active: true,
          code_cost_type_id: sponsor === 'MHFD' ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID : COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID
        }
      }
    ],
    transaction
  });

  let promises = boardProjectCosts.map(boardProjectCost => {
    const projectCostId = boardProjectCost.projectCostData.project_cost_id;
    const costUpdateData = {
      is_active: false,
      last_modified: moment().toDate(),
      modified_by: userData.email,
      code_cost_type_id: sponsor === 'MHFD' ? COST_IDS.WORK_PLAN_EDITED : COST_IDS.WORK_REQUEST_EDITED,
    };
    return ProjectCost.update(
      costUpdateData,
      {
        where: {
          project_cost_id: projectCostId
        },
        transaction
      }
    );
  });

  await Promise.all(promises);
  return;
}

function createBoardProjectEntry(board, project_id, statusBoardProject, userData, year1 = null, year2 = null) {
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
    year2: year2
  };
}

async function getBoardProjectByBoardId(board_id, rankColumnName) {
  try {
    return await BoardProject.findOne({
      where: {
        board_id: board_id,
        // [rankColumnName]: {
        //   [Op.ne]: null  
        // }
      },
      // order: [[rankColumnName, 'DESC']], 
      limit: 1,
    });
  } catch (error) {
    console.error("Error fetching board project by board ID:", error);
    throw error;
  }
}

async function getFirstBoardProjectById(board_id, rankColumnName) {
  try {
    const boardProjectFirst = await BoardProject.findOne({
      where: {
        board_id: board_id,
        // [rankColumnName]: {
        //   [Op.ne]: null  
        // }
      },
      // order: [[rankColumnName, 'ASC']], 
      limit: 1,
    });
    console.log('BOARD PROJECT FIRST', boardProjectFirst)
    return boardProjectFirst;
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



const createMissingBoards = async (year, type, locality, project_type, userData, transaction) => {
  try {
    const targetYear = year + 1;
    await Board.create({
      type,
      year: targetYear,
      locality,
      projecttype: project_type,
      status: 'Under Review',
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      last_modified_by: userData.email,
      created_by: userData.email
    }, { transaction: transaction });
    return {
      year: targetYear,
      locality,
      project_type,
      type,
      user: userData.email
    };
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
    cost_description: null, 
    project_partner_id: partnerId, 
    cost_project_partner_contribution: null,
    created_by: userData.email,
    modified_by: userData.email,
    created: DateToAvoidRepeated,
    last_modified: DateToAvoidRepeated,
    agreement_number: null, 
    amendment_number: null,
    code_phase_type_id: null, 
    code_scope_of_work_type_id: 20,
    is_active: 1,
    effective_date: null,
    code_data_source_type_id: CODE_DATA_SOURCE_TYPE.USER
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
  console.log('\n *************\n*************\n*************\n**************\n************ IS DESTROYING BOARD PROJECT \n***************\n***********\n', project_id, 'filteredBoardIdsToDelete', filteredBoardIdsToDelete);
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
    const SPONSOR = 11;
    const MHFD = 88;
    const projectPartner = await ProjectPartner.findOne({
      where: {
        project_id: projectId,
        code_partner_type_id: MHFD
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
async function updateProjectCostOfWorkspace (activeValue, user, currentBusinessAssociatesId,currentPartnerTypeId, currentProjectId, board_project_id, lastModifiedDate, isWorkPlan, codeCostTypeId) {
  try {
    const WR_CODE_COST_TYPE_EDITED = 42;
    const WP_CODE_COST_TYPE_EDITED = 41;
    const PROJECT_PARTNER_ID = currentPartnerTypeId;  /// MHFD 88 SPONSOR 11 COSPONSOR 12
    const project_partner = await ProjectPartner.findOne({
      where: {
        project_id: currentProjectId,
        code_partner_type_id: PROJECT_PARTNER_ID,
        business_associates_id: currentBusinessAssociatesId
      }
    });
    const currentBoardProjectCosts = await BoardProjectCost.findAll({
      include: [{
        model: ProjectCost,
        as: 'projectCostData',
        where: {
          is_active: 1,
          [Op.or]: [
            { project_partner_id: project_partner.project_partner_id },
            { project_partner_id: null }
          ],
          code_cost_type_id: codeCostTypeId
        }
      }],
      where: {
        board_project_id,
        req_position: 0
      }
    });
    const projectsCostsIdsToUpdate = currentBoardProjectCosts.map((cbpc) => cbpc.dataValues.project_cost_id);
    // DESACTIVAR LOS ANTERIORES PROJECT COSTS
    const projectCostUpdated = await ProjectCost.update({
      is_active: activeValue,
      code_cost_type_id: isWorkPlan? WP_CODE_COST_TYPE_EDITED: WR_CODE_COST_TYPE_EDITED,
      last_modified: lastModifiedDate,
      modified_by: user.email,
    }, {
      where: {
        project_cost_id: { [Op.in]: projectsCostsIdsToUpdate }
      }
    });
    return Promise.resolve(projectCostUpdated);
  } catch (error){
    logger.error("ERROR at Workspace update", error)
    throw error;
  }
}
async function updateProjectCostEntries(project_id, userData, code_cost_type_id, projectPartnerId, transaction) {
  const edit_cost_type = code_cost_type_id === 21 ? 41 : 42;
  try {
    const projectCostEntries = await ProjectCost.findAll({
      where: {
        project_id: project_id,
        code_cost_type_id: code_cost_type_id,
        project_partner_id: projectPartnerId,
        is_active: 1
      },
      transaction
    });
    for (let i = 0; i < projectCostEntries.length; i++) {
      const offsetDate = moment().add(i, 'seconds').format('YYYY-MM-DD HH:mm:ss');
      const updatedValues = {
        is_active: 0,
        last_modified: offsetDate,
        modified_by: userData.username,
        code_cost_type_id: edit_cost_type
      };
      await projectCostEntries[i].update(updatedValues, { transaction });
    }
  } catch (error) {
    console.error("Error updating ProjectCost entries:", error);
    throw error;
  }
}


const updateAndCreateProjectCostsForAmounts = async (
  currentColumn,
  currentCost,
  currentProjectId,
  currentBusinessAssociatesId,
  currentPartnerTypeId,
  user,
  board_project_id,
  lastModifiedDate,
  codeCostTypeId,
  isWorkPlan,
  amountTouched,
  currentSortOrder,
  boardId
) => {
  console.log('YY1 Update And Create Cost column, cost, pid ', currentColumn, currentCost, currentProjectId);
  const countOriginalProject = await Project.count({ where: { project_id: currentProjectId } });
  if (countOriginalProject === 0) {
    logger.error(`Project with id = ${currentProjectId} does not exist`);
    return;
  }
  const PROJECT_PARTNER_ID = currentPartnerTypeId;  /// MHFD 88 SPONSOR 11 COSPONSOR 12
  const WR_CODE_COST_TYPE_EDITED = 42; // WORK REQUEST EDITED 
  const WP_CODE_COST_TYPE_EDITED = 41;
  try {
    const project_partner = await ProjectPartner.findOne({
      where: {
        project_id: currentProjectId,
        code_partner_type_id: PROJECT_PARTNER_ID,
        business_associates_id: currentBusinessAssociatesId
      }
    });
    const currentBoardProjectCosts = await BoardProjectCost.findAll({
      include: [{
        model: ProjectCost,
        as: 'projectCostData',
        where: {
          is_active: 1,
          [Op.or]: [
            { project_partner_id: project_partner.project_partner_id },
            { project_partner_id: null }
          ],
          code_cost_type_id: codeCostTypeId
        }
      }],
      where: {
        board_project_id,
        req_position: currentColumn
      }
    });
    console.log('all Current Board Project Costs', currentBoardProjectCosts);
    const projectsCostsIdsToUpdate = currentBoardProjectCosts.map((cbpc) => cbpc.dataValues.project_cost_id);
    // DESACTIVAR LOS ANTERIORES PROJECT COSTS
    const projectCostUpdated = await ProjectCost.update({
      is_active: 0,
      code_cost_type_id: isWorkPlan? WP_CODE_COST_TYPE_EDITED: WR_CODE_COST_TYPE_EDITED,
      last_modified: lastModifiedDate,
      modified_by: user.email
    }, {
      where: {
        project_cost_id: { [Op.in]: projectsCostsIdsToUpdate } // we need to get the projectcost olds 
      }
    })
    if (currentCost !== null && currentCost !== undefined) {
      const hasBeenTouched = (project_partner.code_partner_type_id !== 88) ? true : amountTouched;
      const costToCreate = {
        cost: currentCost,
        project_id: currentProjectId,
        code_cost_type_id: codeCostTypeId,
        created_by: user.email,
        modified_by: user.email,
        is_active: 1,
        last_modified: lastModifiedDate,
        created: lastModifiedDate,
        project_partner_id: project_partner.project_partner_id,
        code_data_source_type_id: hasBeenTouched ? CODE_DATA_SOURCE_TYPE.USER: CODE_DATA_SOURCE_TYPE.SYSTEM
      };
      const projectCostCreated = await ProjectCost.create(costToCreate);
      const project_cost_id = projectCostCreated.dataValues.project_cost_id;
      let currentSortOrderInBoard = INITIAL_GAP;
      if ( project_partner.code_partner_type_id === 88) {
        currentSortOrderInBoard = currentSortOrder;   
        if ( currentColumn <= 5 && currentSortOrder === null) {
          console.log('sent parameteres ' , boardId, board_project_id, currentColumn, isWorkPlan, null)
          currentSortOrderInBoard = await getSortOrderForUpdate(board_project_id, boardId, currentColumn, isWorkPlan, null);
        }
      }
      // missing to check sponsor and cosponsor if this is working fine
      const bpcreated = await BoardProjectCost.create({
          board_project_id: board_project_id, 
          project_cost_id: project_cost_id,
          req_position: currentColumn,
          created_by: user.email,
          last_modified_by: user.email,
          sort_order: currentSortOrderInBoard ?? 0
      });
      console.log('Board project cost created ',JSON.stringify(bpcreated));
      return Promise.resolve(bpcreated);
    };
  } catch (error) {
    logger.error("ERROR AT PROJECT COST is", error);
    throw error;
  }  
}

const updateBoards = async (board, status, comment, substatus, creator, transaction) => {
  logger.info('Updating all boards different project type');
  let projectTypes = [
    'Capital',
    'Maintenance',
    'Study',
    'Acquisition',
    board.year < 2024 ? 'Special' : 'R&D'
  ];
  logger.info(`Starting function findOne for board/`);
  for (const projectType of projectTypes) {
    logger.info(`Project type ${projectType}`);
    let body = {
      type: board.type,
      year: board.year,
      locality: board.locality,
      projecttype: projectType
    };
    let boards = await Board.findAll({
      where: body
    });
    if (boards.length === 0) {
      logger.info(`Creating new board for ${projectType}`);
      await createNewBoard(
        board.type,
        board.year,
        board.locality,
        projectType,
        status,
        creator,
        comment,
        substatus,
        transaction
      );
    } else {
      // When it reaches here? in what context?
      for (let i = 0 ; i < boards.length ; i++) {
        let board = boards[i];
        if (status === 'Approved' && board.status !== status) {
          body['submissionDate'] = new Date();
        }
        logger.info('Updating board');
        let newFields = {
          status,
          comment,
          substatus,
          last_modified_by: creator,
        };
        if (status === 'Approved' && board.status !== status) {
            newFields['submissionDate'] = new Date();
        }
        await board.update(newFields, { transaction })
      }
    }
  }
  logger.info(`Finished function findOne for board/`);
}

export default {
  createNewBoard,
  reCalculateSortOrderForColumn,
  reCalculateColumn,
  updateAndCreateProjectCosts,
  updateAndCreateProjectCostsForAmounts,
  createMissingBoards,
  getBoardForYear,
  getBoardProjectByBoardId,
  createBoardProjectEntry,
  getNextLexoRankValue,
  getPrevLexoRankValue,
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
  updateProjectCostEntries,
  updateSubmissionDate,
  updateBoards,
  updateProjectCostOfWorkspace
};
