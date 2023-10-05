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
const updateAndCreateProjectCostsForAmounts = async (currentColumn, currentCost, currentProjectId, currentBusinessAssociatesId, currentPartnerTypeId, user, board_project_id, lastModifiedDate) => {
  console.log('Update And Create Cost ');
  const countOriginalProject = await Project.count({ where: { project_id: currentProjectId } });
  if (countOriginalProject === 0) {
    logger.error(`Project with id = ${currentProjectId} does not exist`);
    return;
  }
  const PROJECT_PARTNER_ID = currentPartnerTypeId; // WRONG CODE  /// MHFD 88 SPONSOR 11 COSPONSOR 12
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
    const project_partner = await ProjectPartner.findOne({
      where: {
        project_id: currentProjectId,
        code_partner_type_id: PROJECT_PARTNER_ID,
        business_associates_id: currentBusinessAssociatesId
      }
    });
    console.log('******\n\n ******* \n MHFD_Partner \n *******-*-*------------*********', project_partner);
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
        project_partner_id: project_partner.project_partner_id
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
  createNewBoard,
  reCalculateColumn,
  updateAndCreateProjectCosts,
  updateAndCreateProjectCostsForAmounts
};
