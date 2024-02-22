import db from 'bc/config/db.js';
import { COST_IDS } from 'bc/lib/enumConstants.js';
import sequelize from 'sequelize';

const Board = db.board;
const ProjectPartner = db.projectPartner;
const Project = db.project;
const BusinessAssociate = db.businessAssociates;
const BoardProject = db.boardProject;
const BoardProjectCost = db.boardProjectCost;
const { Op } = sequelize;

const REQUESTED_STATUS = 2;

export async function getProjectsDetails(boardProjects, boardProjectIds, transaction) {
  const projectTypes = await Project.findAll({
    attributes: ['project_id', 'code_project_type_id'],
    where: {
      project_id: { [Op.in]: boardProjects.map(bp => bp.project_id) }
    },
    transaction: transaction
  });

  const partners = await ProjectPartner.findAll({
    attributes: ['project_id', 'business_associates_id'],
    where: {
      project_id: { [Op.in]: boardProjects.map(bp => bp.project_id) },
      code_partner_type_id: COST_IDS.SPONSOR_CODE_COST_TYPE_ID
    },
    transaction: transaction
  });

  const businessAssociates = await BusinessAssociate.findAll({
    attributes: ['business_associates_id', 'business_name'],
    where: {
      business_associates_id: { [Op.in]: partners.map(partner => partner.business_associates_id) }
    },
    transaction: transaction
  });

  const previousBoards = await Board.findAll({
    attributes: ['board_id', 'projecttype'],
    where: {
      board_id: { [Op.in]: boardProjects.map(bp => bp.board_id) }
    },
    transaction: transaction
  });

  return { projectTypes, partners, businessAssociates, previousBoards };
}

export async function getOrCreateBoard(newYear, previousBoard, sponsor, creator, transaction) {
  let newBoardParams = {
    year: newYear,
    projecttype: previousBoard.projecttype,
    last_modified_by: creator,
    created_by: creator,
  };

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
  }

  let newBoard = await Board.findOne({
    where: newBoardParams,
    transaction: transaction
  });

  if (!newBoard) {
    newBoard = await Board.create(newBoardParams, { transaction: transaction });
  }

  return { newBoard };
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
