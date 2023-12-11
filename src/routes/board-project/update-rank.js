import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import boardService from 'bc/services/board.service.js';
import { isOnWorkspace, determineStatusChange } from 'bc/services/board-project.service.js';
import sequelize from 'sequelize';
import { LexoRank } from 'lexorank';
import moment from 'moment';
import { OFFSET_MILLISECONDS, CODE_DATA_SOURCE_TYPE, COST_IDS } from 'bc/lib/enumConstants.js';

const BoardProject = db.boardProject;
const BoardProjectCost = db.boardProjectCost;
const ProjectCost = db.projectCost;
const ProjectPartner = db.projectPartner;
const { Op } = sequelize;

async function getOriginSponsorCosponsor(board_project_id) {
  const SPONSOR_COSPONSOR_CODE = [11,12];
  const results = await BoardProjectCost.findAll({
    attributes: [],
    where: {
      board_project_id
    },
    include: [
      {
        attributes: ['project_partner_id'],
        model: ProjectCost,
        as: 'projectCostData',
        where: {
          is_active: true
        },
        required: true,
        include: [
          {
            attributes: [],
            model: ProjectPartner,
            as: 'projectPartnerData',
            required: true,
            where: {
              code_partner_type_id: {
                [Op.in]: SPONSOR_COSPONSOR_CODE
              }
            }
          }
        ]
      }
    ]
  });
  const projectPartnerIds = results.map(result => result.projectCostData.project_partner_id);
  const uniqueProjectPartnerIds = [...new Set(projectPartnerIds)];
  return uniqueProjectPartnerIds;
}
async function getProjectPartnerMHFD(project_id) {
  const MHFD_CODE_PARTNER_TYPE = 88;
  const results = await ProjectPartner.findAll({
    where: {
      project_id,
      code_partner_type_id: MHFD_CODE_PARTNER_TYPE
    }
  });
  return results;
}
async function getBoardProjectCostMHFD(board_project_id, columnNumber) {
  const MHFD_CODE_PARTNER_TYPE = 88;
  const reqExist = await BoardProjectCost.findOne({
    attributes: ['req_position', 'board_project_id'],
    where: {
      board_project_id,
      req_position: columnNumber
    },
    include: [
      {
        attributes: ['cost', 'code_cost_type_id', 'project_partner_id','project_id','project_cost_id'],
        model: ProjectCost,
        as: 'projectCostData',
        where: {
          is_active: true,
        },
        is_required: true,
        include: [
          {
            model: ProjectPartner,
            as: 'projectPartnerData',
            is_required: true,
            where: {
              code_partner_type_id: MHFD_CODE_PARTNER_TYPE
            }
          }
        ]
      }
    ]
  });
  return reqExist;
}

async function getBoardProjectCostSponsorCosponsor(board_project_id, columnNumber, project_partner_id) {
  const SPONSOR_COSPONSOR_CODE = [11,12];
  const reqExist = await BoardProjectCost.findOne({
    attributes: ['req_position', 'board_project_id'],
    where: {
      board_project_id,
      req_position: columnNumber,
    },
    include: [
      {
        attributes: ['cost', 'code_cost_type_id', 'project_partner_id','project_id','project_cost_id'],
        model: ProjectCost,
        as: 'projectCostData',
        where: {
          is_active: true,
          project_partner_id: project_partner_id
        },
        is_required: true,
        include: [
          {
            model: ProjectPartner,
            as: 'projectPartnerData',
            is_required: true,
            where: {
              code_partner_type_id: {
                [Op.in]: SPONSOR_COSPONSOR_CODE
              }
            }
          }
        ]
      }
    ]
  });
  return reqExist;
}

function getNumberFromRank(otherFields) {
  if (!otherFields) {
    return null;
  }
  for (let i = 0; i <= 5; i++) {
    const rankKey = `rank${i}`;
    if (otherFields.hasOwnProperty(rankKey)) {
      return i;
    }
  }
  return null;
}

const insertOnColumnAndFixColumn = async (columnNumber, board_id, targetPosition, otherFields, board_project_id, user) => {
  
  const reqColumnName = `req${columnNumber}`;
  const rankColumnName = `rank${columnNumber}`;
  const where = { board_id };
  let reqExist = null;
  if (`${columnNumber}` !== '0') {
    reqExist = await getBoardProjectCostMHFD(board_project_id, columnNumber);
    console.log('reqExist', reqExist)
    //where[reqColumnName] = { [Op.ne]: null };
    if (reqExist) {
      where['board_project_id'] = reqExist.board_project_id;
    }
  } else {
    where[rankColumnName] = { [Op.ne]: null }
  }
  const projects = await BoardProject.findAll({
    where,
    order: [[rankColumnName, 'ASC']],
  });
  let lastLexo = null;
  const proms = projects.map(async (project, index) => {
    if (lastLexo === null) {
      lastLexo = LexoRank.middle().toString();
    } else {
      lastLexo = LexoRank.parse(lastLexo).genNext().toString();
    }
    if (index === targetPosition) {
      lastLexo = LexoRank.parse(lastLexo).genNext().toString();
      await BoardProject.update(
        { ...otherFields, [rankColumnName]: lastLexo },
        { where: { board_project_id: board_project_id } }
      );
      let mainModifiedDate = new Date();
      let multiplicator = 0;
      for (const keys in otherFields) {
        if (keys.includes('req')) {
          const costToUpdate = otherFields[keys] ? otherFields[keys] : 0;
          const columnToEdit = keys.match(/[0-9]+/);
          await boardService.updateAndCreateProjectCosts(
            columnToEdit,
            costToUpdate,
            project.project_id,
            user,
            board_project_id,
            moment(mainModifiedDate).subtract(OFFSET_MILLISECONDS * multiplicator).toDate()
          );
          multiplicator++;
        }
      }
    }   
    return await BoardProject.update(
      { [rankColumnName]: lastLexo },
      { where: { board_project_id: project.board_project_id } }
    );
  });
  let originCost = null;
  let targetCost = null;
  if (getNumberFromRank(otherFields) && columnNumber) {
    originCost = await getBoardProjectCostMHFD(board_project_id, getNumberFromRank(otherFields));
    targetCost = await getBoardProjectCostMHFD(board_project_id, columnNumber);
    if (originCost && targetCost) {
      const cost = originCost.projectCostData.cost + targetCost.projectCostData.cost;
      proms.push(ProjectCost.update(
        { cost: cost },
        { where: { project_cost_id: targetCost.projectCostData.project_cost_id } }
      ));
      proms.push(ProjectCost.update(
        { is_active: false },
        { where: { project_cost_id: originCost.projectCostData.project_cost_id } }
      ));
      const sponsorAndCosponsor = await getOriginSponsorCosponsor(board_project_id);
      sponsorAndCosponsor.forEach(async (project_partner_id) => {
        const originSecCost = await getBoardProjectCostSponsorCosponsor(board_project_id, getNumberFromRank(otherFields), project_partner_id);
        const targetSecCost = await getBoardProjectCostSponsorCosponsor(board_project_id, columnNumber, project_partner_id);
        if (originSecCost && targetSecCost) {
          const cost = originSecCost.projectCostData.cost + targetSecCost.projectCostData.cost;
          proms.push(
            ProjectCost.update(
              {
                cost: cost,
                last_modified: moment().toDate(),
                modified_by: user.email,
              },
              { where: { project_cost_id: targetSecCost.projectCostData.project_cost_id } }
            )
          );
          
          proms.push(
            ProjectCost.update(
              {
                is_active: false,
                last_modified: moment().toDate(),
                modified_by: user.email,
                code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_EDITED: COST_IDS.WORK_REQUEST_EDITED,
              },
              { where: { project_cost_id: originSecCost.projectCostData.project_cost_id } }
            )
          );
        }
      });
    }
  }  
  try {
    const results = await Promise.all(proms);
    console.log('results', results);
  } catch (error) {
    console.error(`Error updating ranks: ${error}`);
  }  
};

const updateRank = async (req, res) => {
  logger.info('get board project cost by id');
  const { board_project_id } = req.params;
  let { before, after } = req.body; // lexo values in string
  const {
    columnNumber,  // destiny column 
    beforeIndex,  // targetposition -1 
    afterIndex,   // targetposition +1 
    targetPosition,  // target position in destiny column 
    otherFields, //   previous rankX, that is going to be deleted
    isWorkPlan
  } = req.body;
  const isWorkPlanBoolean = typeof isWorkPlan === 'boolean' ? isWorkPlan : isWorkPlan === 'true' ? true : false;
  const WORK_PLAN_CODE_COST_TYPE_ID = 21;
  const WORK_REQUEST_CODE_COST_TYPE_ID = 22;  
  const WORK_REQUEST_EDITED = 42;
  const WORK_PLAN_EDITED = 41;
  const user = req.user;
  if (before === undefined) before = null;
  if (after === undefined) after = null;
  const rankColumnName = `rank${columnNumber}`;
  const boardProjectBeforeUpdate = await BoardProject.findOne({
    where: {
      board_project_id
    }
  }) || {};
  const wasOnWorkspace = isOnWorkspace(boardProjectBeforeUpdate);
  const board_id = boardProjectBeforeUpdate.board_id;
  const columnCountWhere = {
    board_id,
    [rankColumnName]: { [Op.ne]: null }
  };
  const count = await BoardProject.count({ where: columnCountWhere }); // count all projects in the destiny column  
  if (
    before === null &&
    after === null &&   /// if before and after are null, it means there is no project in that destiny column
    count > 0   // but if in DB it exists, is going to fix the error
  ) {
    const results = await insertOnColumnAndFixColumn(
      columnNumber,
      board_id,
      targetPosition,
      otherFields,
      board_project_id,
      user
    );
    return res.status(201).send(results);
  }
  if (before === null && beforeIndex !== -1) {
    logger.error('before is null but beforeIndex is not -1');
  } else if (after === null && afterIndex !== -1) {
    logger.error('after is null but afterIndex is not -1');
  }
  let lexo; // get the value of the destiny position
  if (count === 0) {
    lexo = LexoRank.middle().toString();
  } else if (before === null) {
    lexo = LexoRank.parse(after).genPrev().toString();
  } else if (after === null) {
    lexo = LexoRank.parse(before).genNext().toString();
  } else {
    if (before === after) {
      lexo = before; //TODO: change as this should not happen
    } else {
      lexo = LexoRank.parse(before).between(LexoRank.parse(after)).toString();
    }
  }
  try {
    // update boardproject with the new lexo for rank of destiny and from other fields, remove previous position
    const boardProjectUpdatedStatus = await BoardProject.update(
      { [rankColumnName]: lexo, ...otherFields },
      { where: { board_project_id } }
    );
    // get the boardproject updated
    let boardProjectUpdated = await BoardProject.findOne({
      where: { board_project_id }
    });
    // check if now is on workspace
    const onWorkspace = isOnWorkspace(boardProjectUpdated);
    if (onWorkspace) {
      // deactiva all costs related to this board_project_id
      const costUpdateData = {
        is_active: false,
        last_modified: moment().toDate(),
        last_modified_by: user.email,
        code_cost_type_id: isWorkPlanBoolean ? WORK_PLAN_EDITED: WORK_REQUEST_EDITED,
      };
      await ProjectCost.update(
        costUpdateData,
        { where: { 
          is_active: true,
          project_id: boardProjectUpdated.project_id,
          code_cost_type_id: isWorkPlanBoolean ? WORK_PLAN_CODE_COST_TYPE_ID: WORK_REQUEST_CODE_COST_TYPE_ID
        } }
      );
      const projectPartnerMHFD = await getProjectPartnerMHFD(boardProjectUpdated.project_id);
      // create a new cost with null value for project partner mhfd 
      const project_partner_id = projectPartnerMHFD[0].project_partner_id;
      const newProjectCost = {
        project_id: boardProjectUpdated.project_id,
        project_partner_id: project_partner_id,
        cost: null,
        created_by: user.email,
        modified_by: user.email,
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        code_cost_type_id: isWorkPlanBoolean ? WORK_PLAN_CODE_COST_TYPE_ID: WORK_REQUEST_CODE_COST_TYPE_ID,
        code_data_source_type_id: CODE_DATA_SOURCE_TYPE.SYSTEM,
      };
      const createdProjectCost = await ProjectCost.create(newProjectCost);
      // create a null cost with req_position  = 0
      const newBoardProjectCost = {
        board_project_id: board_project_id,
        req_position: 0,
        project_cost_id: createdProjectCost.project_cost_id, 
        created_by: user.email,
        last_modified_by: user.email,
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        code_data_source_type_id: CODE_DATA_SOURCE_TYPE.SYSTEM,
      };
      await BoardProjectCost.create(newBoardProjectCost);
    } else {
    // is to add costs in the new column with the previous column cost 
      for (const key in otherFields) {
        if (key != 'rank0') {
          let originCost = null;
          let targetCost = null;    
          if (getNumberFromRank(otherFields) && columnNumber) {
            originCost = await getBoardProjectCostMHFD(board_project_id, getNumberFromRank(otherFields));
            targetCost = await getBoardProjectCostMHFD(board_project_id, columnNumber);
            if (originCost && targetCost) {
              const cost = originCost.projectCostData.cost + targetCost.projectCostData.cost;
              // update targetCost with the added cost
              ProjectCost.update(
                {
                  cost: cost,
                  last_modified: moment().toDate(),
                  modified_by: user.email
                },
                { where: { project_cost_id: targetCost.projectCostData.project_cost_id } }
              );
              // deactivate previous cost of origin column
              ProjectCost.update(
                {
                  is_active: false,
                  last_modified: moment().toDate(),
                  last_modified_by: user.email,
                  code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_EDITED: COST_IDS.WORK_REQUEST_EDITED,
                },
                { where: { project_cost_id: originCost.projectCostData.project_cost_id } }
              );
              const sponsorAndCosponsor = await getOriginSponsorCosponsor(board_project_id);
              sponsorAndCosponsor.forEach(async (project_partner_id) => {
                const originSecCost = await getBoardProjectCostSponsorCosponsor(board_project_id, getNumberFromRank(otherFields), project_partner_id);
                const targetSecCost = await getBoardProjectCostSponsorCosponsor(board_project_id, columnNumber, project_partner_id);
                if (originSecCost && targetSecCost) {                
                  const cost = originSecCost.projectCostData.cost + targetSecCost.projectCostData.cost;
                  ProjectCost.update(
                    {
                      cost: cost,
                      last_modified: moment().toDate(),
                      modified_by: user.email
                    },
                    { where: { project_cost_id: targetSecCost.projectCostData.project_cost_id } }
                  );
                  ProjectCost.update(
                    {
                      is_active: false,
                      last_modified: moment().toDate(),
                      modified_by: user.email,
                      code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_EDITED: COST_IDS.WORK_REQUEST_EDITED,
                    },
                    { where: { project_cost_id: originSecCost.projectCostData.project_cost_id } }
                  );
                }
              });
            }
          }
        } else {

          const costUpdateData = {
            is_active: false,
            last_modified: moment().toDate(),
            last_modified_by: user.email,
            code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_EDITED: COST_IDS.WORK_REQUEST_EDITED,
          };
          const updatevalue = await ProjectCost.update(
            costUpdateData,
            { where: { 
              is_active: true,
              project_id: boardProjectUpdated.project_id,
              code_cost_type_id: isWorkPlanBoolean ? WORK_PLAN_CODE_COST_TYPE_ID: WORK_REQUEST_CODE_COST_TYPE_ID
            } }
          );
          const projectPartnerMHFD = await getProjectPartnerMHFD(boardProjectUpdated.project_id);
          // create a new cost with null value for project partner mhfd 
          const project_partner_id = projectPartnerMHFD[0].project_partner_id;
          const newProjectCost = {
            project_id: boardProjectUpdated.project_id,
            project_partner_id: project_partner_id,
            cost: 0,
            created_by: user.email,
            modified_by: user.email,
            createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            code_cost_type_id: isWorkPlanBoolean ? WORK_PLAN_CODE_COST_TYPE_ID: WORK_REQUEST_CODE_COST_TYPE_ID,
            code_data_source_type_id: CODE_DATA_SOURCE_TYPE.SYSTEM,
          };
          const createdProjectCost = await ProjectCost.create(newProjectCost);

          const newBoardProjectCost = {
            board_project_id: board_project_id,
            req_position: columnNumber,
            project_cost_id: createdProjectCost.project_cost_id, 
            created_by: user.email,
            last_modified_by: user.email,
            createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
          };
          await BoardProjectCost.create(newBoardProjectCost);
        }
      }
    }

    [boardProjectUpdated, ] = await determineStatusChange(wasOnWorkspace, boardProjectUpdated, board_id, user.email);
    return res.status(200).send(boardProjectUpdatedStatus);
  } catch (error) {
    logger.error('Error at update rank' + error);
    return res.status(500).send({ error: error });
  }
};

export default updateRank;
