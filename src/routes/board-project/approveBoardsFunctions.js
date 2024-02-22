import db from 'bc/config/db.js';
import { COST_IDS } from 'bc/lib/enumConstants.js';

const Board = db.board;
const ProjectPartner = db.projectPartner;
const Project = db.project;
const BusinessAssociate = db.businessAssociates;

export async function getProjectDetails(boardProject, transaction) {
  const code_project_type = await Project.findOne({
    attributes: ['code_project_type_id'],
    where: {
      project_id: boardProject.project_id
    },
    transaction: transaction
  });

  const partner = await ProjectPartner.findOne({
    attributes: ['business_associates_id'],
    where: {
      project_id: boardProject.project_id,
      code_partner_type_id: COST_IDS.SPONSOR_CODE_COST_TYPE_ID
    },
    transaction: transaction
  });

  const businessAssociate = await BusinessAssociate.findOne({
    attributes: ['business_name'],
    where: {
      business_associates_id: partner.business_associates_id
    },
    transaction: transaction
  });

  const sponsor = businessAssociate.business_name;

  const previousBoard = await Board.findOne({
    attributes: ['projecttype'],
    where: { board_id: boardProject.board_id },
    transaction: transaction
  });

  return {
    code_project_type,
    sponsor,
    previousBoard
  };
}

export async function getOrCreateBoard(newYear, previousBoard, sponsor, creator, transaction) {
  let newBoardParams = {
    year: newYear,
    projecttype: previousBoard.projecttype,
    last_modified_by: creator,
    created_by: creator,
  };

  let sendingToWP = true;
  if (sponsor === 'MHFD') {
    newBoardParams = {
      ...newBoardParams,
      locality: 'MHFD District Work Plan',
      type: 'WORK_PLAN',
    };
  } else {
    newBoardParams = {
      ...newBoardParams,
      locality: sponsor,
      type: 'WORK_REQUEST',
    };
    sendingToWP = false;
  }

  let newBoard = await Board.findOne({
    where: newBoardParams,
    transaction: transaction
  });

  if (!newBoard) {
    newBoard = await Board.create(newBoardParams, { transaction: transaction });
  }

  return { newBoard, sendingToWP };
}

export async function createBoardProject(newBoard, boardProject, sponsor, creator, transaction) {
  const newBoardProjectParams = {
    board_id: newBoard.board_id,
    project_id: boardProject.project_id,
    origin: sponsor,
    code_status_type_id: REQUESTED_STATUS,
    created_by: creator,
    last_modified_by: creator,
  };

  const createdBoardProject = await BoardProject.create(newBoardProjectParams, { transaction: transaction });

  return createdBoardProject;
}
