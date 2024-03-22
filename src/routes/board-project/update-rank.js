import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import boardService from 'bc/services/board.service.js';
import { isOnWorkspace, determineStatusChange } from 'bc/services/board-project.service.js';
import sequelize from 'sequelize';
import { LexoRank } from 'lexorank';
import moment from 'moment';
import { 
  COST_IDS,
  GAP,
  INITIAL_GAP
} from 'bc/lib/enumConstants.js';
import { createCostAndInsertInPosition, deletePositionInColumn, moveFromPositionOfColumn, movePositionInsideColumn } from './updateSortOrderFunctions.js';
import { 
  deactivateCosts, 
  createCostAndInsert,
  updateSortOrder,
  getMHFDProjectCost,
  updateProjectCosts,
  updateSponsorProjectCosts
} from './rankFunctions.js';

const BoardProject = db.boardProject;
const BoardProjectCost = db.boardProjectCost;
const ProjectCost = db.projectCost;
const ProjectPartner = db.projectPartner;
const BusinessAssociates = db.businessAssociates;
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
    },
    include: [ {
      model: BusinessAssociates,
      as: 'businessAssociateData'
    }]
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

const deactivateCostFromPreviousPosition = async (board_project_id, boardId, previousColumn, isWorkPlanBoolean, user, transaction) => {
  try {
    const boardProjectCosts = await BoardProjectCost.findAll({
      where: {
        board_project_id,
        req_position: previousColumn
      },
      include: [
        {
          model: ProjectCost,
          as: 'projectCostData',
          where: {
            is_active: true,
            code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID: COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID
          }
        }
      ],
      transaction
    });
    if (boardProjectCosts.length > 0) {
      const previousSortOrder = boardProjectCosts[0].sort_order;
      await deletePositionInColumn(boardId, previousColumn, previousSortOrder + 1, transaction);
      const projectCostId = boardProjectCosts[0].projectCostData.project_cost_id;
      const costUpdateData = {
        is_active: false,
        last_modified: moment().toDate(),
        modified_by: user.email,
        code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_EDITED: COST_IDS.WORK_REQUEST_EDITED,
      };
      const projectCostUpdated = await ProjectCost.update(
        costUpdateData,
        { where: { project_cost_id: projectCostId } },
        { transaction }
      );
      console.log('Project cost of ', previousColumn, 'deactivated', projectCostUpdated);
    }  
  } catch (error) {
    console.error('Error at removeFromPreviousPosition ', error);
  }
  
}
const createCostAndInsertIntoColumn = async (
  project_id,
  board_project_id,
  boardId,
  cost,
  columnNumber,
  sortOrder,
  isWorkPlan,
  user,
  transaction
) => {
  try {
    const projectPartner = await getProjectPartnerMHFD(project_id);
    const projectPartnerId = projectPartner[0].project_partner_id;
    await createCostAndInsertInPosition(
      project_id, 
      board_project_id,
      isWorkPlan ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID: COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID,
      projectPartnerId,
      user.email,
      boardId,
      columnNumber,
      sortOrder,
      cost,
      transaction
    );
  } catch (error) {
    console.error('Error at insertCostInColumn ', error); 
  }
}

const updateRank = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  const { board_project_id } = req.params;
  const {
    columnNumber,
    previousColumn,
    isWorkPlan,
    project_id,
    before,
    after
  } = req.body;
  try {
    const isWorkPlanBoolean = typeof isWorkPlan === 'boolean' ? isWorkPlan : isWorkPlan === 'true' ? true : false;
    const user = req.user;
    let newSortValue;
    if (after != null && before != null) {
      newSortValue = (Math.floor(after + before)) / 2;
    } else if (after != null) {
      newSortValue = after - GAP;
    } else if (before != null) {
      newSortValue = before + GAP;
    } else {
      newSortValue = INITIAL_GAP;
    }
    if (before === newSortValue) {
      //recalculate all data
      console.log(before, after, newSortValue, 'NEEDS TO RECALCULATE')
      return res.status(200).send({message: 'NEEDS TO RECALCULATE'});
    }
    if (columnNumber === 0 || previousColumn === 0) {
      let defaultValue = null;
      if (previousColumn === 0 && columnNumber !== 0) {
        defaultValue = 0;
      }
      //From workspace to workspace
      if (previousColumn === columnNumber) {
        await updateSortOrder(board_project_id, previousColumn, isWorkPlanBoolean, newSortValue, transaction);
      } else{
        //From workspace to column
        console.log('deactivating cost from column');
        const STATUS_REQUESTED = 2;
        const STATUS_DRAFT = 1;
        const statusToUse = columnNumber === 0 ? STATUS_DRAFT : STATUS_REQUESTED;
        await deactivateCosts(board_project_id, previousColumn, isWorkPlanBoolean, user, transaction);
        await createCostAndInsert(
          project_id,
          board_project_id,
          defaultValue,
          columnNumber,
          newSortValue,
          isWorkPlan,
          user,
          transaction
        );
        await BoardProject.update(
          {
            updatedAt: moment().toDate(),
            last_modified_by: user.email,
            code_status_type_id: statusToUse
          },
          {
            where: { board_project_id },
            transaction
          }
        );
      }
    } else if (previousColumn && columnNumber) {
      if (previousColumn === columnNumber) {
        //From column to same column
        console.log(newSortValue, 'UPDATING SORT ORDER')
        await updateSortOrder(board_project_id, previousColumn, isWorkPlanBoolean, newSortValue, transaction);
      } else {
        //From column to different column
        const [originCost, targetCost] = await Promise.all(
          [
            getMHFDProjectCost(board_project_id, previousColumn, transaction),
            getMHFDProjectCost(board_project_id, columnNumber, transaction)
          ]
        );
        if (originCost && targetCost) {
          // update targetCost with the added cost
          await updateProjectCosts(originCost, targetCost, user, transaction, isWorkPlanBoolean);
          logger.info('Updating Sponsor Costs');
          console.log('Previous Column: ' + originCost+ targetCost);
          await updateSponsorProjectCosts(previousColumn, columnNumber, user, isWorkPlanBoolean, board_project_id, transaction);  
        } else {
          // insert cost in column
          const originCostValue = originCost ? originCost.projectCostData.cost : 0;
          await deactivateCosts(board_project_id, previousColumn, isWorkPlanBoolean, user, transaction);                   
          const costCreated = await createCostAndInsert(
            project_id,
            board_project_id,
            originCostValue,
            columnNumber,
            newSortValue,
            isWorkPlan,
            user,
            transaction
          );
          
          await updateSponsorProjectCosts(previousColumn, columnNumber, user, isWorkPlanBoolean, costCreated.board_project_id, transaction);  
        }
      }
    }
    transaction.commit();
    return res.status(200).send({message: 'DONE'});
  } catch (error) {
    console.error('Error at updateRank2 ', error);
    transaction.rollback();
    return res.status(500).send({ error: error });
  }
};

const updateRank2 = async (req, res) => {
  logger.info('get board project cost by id');
  const transaction = await db.sequelize.transaction();
  const { board_project_id } = req.params;
  let { before, after } = req.body; // lexo values in string // now are integers for sort_order 
  const {
    columnNumber,  // destiny column 
    beforeIndex,  // targetposition -1 
    afterIndex,   // targetposition +1 
    targetPosition,  // target position in destiny column 
    sourcePosition,
    previousColumn, //   previous rankX, that is going to be deleted
    isWorkPlan,
    boardId,
    project_id
  } = req.body;
  const isWorkPlanBoolean = typeof isWorkPlan === 'boolean' ? isWorkPlan : isWorkPlan === 'true' ? true : false;
  const user = req.user;
  if (before === undefined) before = null;
  if (after === undefined) after = null;
  // const rankColumnName = `rank${columnNumber}`;
  const boardProjectBeforeUpdate = await BoardProject.findOne({
    where: {
      board_project_id
    }
  }) || {};
  const wasOnWorkspace = await isOnWorkspace(boardProjectBeforeUpdate);
  const board_id = boardProjectBeforeUpdate.board_id;
  if (before === null && beforeIndex !== -1) {
    logger.error('before is null but beforeIndex is not -1');
  } else if (after === null && afterIndex !== -1) {
    logger.error('after is null but afterIndex is not -1');
  }
  let sortOrderValue = targetPosition + 1; // get the value of the destiny position
  try {
    // remove from previous position, previousColumn
    // so projectCost has to be deactivated     
    let boardProjectUpdated = await BoardProject.findOne({
      where: { board_project_id }
    });
    const destinyIsWorkspace = columnNumber === 0;


    if (destinyIsWorkspace) { // ANYWHERE -> WORKSPACE
      console.log('\n ****************************** \n SENDING TO WORKSPACE \n ****************************** \n');
      await Promise.all([deactivateCostFromPreviousPosition(board_project_id, boardId, previousColumn, isWorkPlanBoolean, user, transaction), 
        createCostAndInsertIntoColumn(
        project_id,
        board_project_id,
        boardId,
        null,
        columnNumber,
        sortOrderValue,
        isWorkPlanBoolean,
        user,
        transaction
      )]);
    } else {
    // is to add costs in the new column with the previous column cost 
      const previousColumnNumber = previousColumn;
      if (previousColumnNumber != 0) { // COLUMN TO COLUMN 
        
        if (previousColumn === columnNumber) {
          console.log('\n ****************************** \n SENDING TO COLUMN TO SAME COLUMNs \n ****************************** \n');
          let direction = 'greater';
          if (sourcePosition < targetPosition) {
            direction = 'lower';
          }
          await movePositionInsideColumn(boardId, previousColumn, sortOrderValue, (sourcePosition + 1), direction, board_project_id, transaction);
        } else {
          if (previousColumn && columnNumber) {
            const [originCost, targetCost] = await Promise.all([getBoardProjectCostMHFD(board_project_id, previousColumn), getBoardProjectCostMHFD(board_project_id, columnNumber)]);
       
            if (originCost && targetCost) {              
              const originCostValue = originCost ? originCost.projectCostData.cost : 0;
              const targetCostValue = targetCost ? targetCost.projectCostData.cost : 0;
              const newFinalCost = originCostValue + targetCostValue;
              // update targetCost with the added cost              
              await Promise.all([
                ProjectCost.update(
                  {
                    cost: newFinalCost,
                    last_modified: moment().toDate(),
                    modified_by: user.email
                  },
                  { where: { project_cost_id: targetCost.projectCostData.project_cost_id }, transaction },
                ),
                ProjectCost.update(
                  {
                    is_active: false,
                    last_modified: moment().toDate(),
                    modified_by: user.email,
                    code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_EDITED: COST_IDS.WORK_REQUEST_EDITED,
                  },
                  { where: { project_cost_id: originCost.projectCostData.project_cost_id }, transaction },
                )
              ])
              // deactivate previous cost of origin column              
              const sponsorAndCosponsor = await getOriginSponsorCosponsor(board_project_id);
              sponsorAndCosponsor.forEach(async (project_partner_id) => {
                const originSecCost = await getBoardProjectCostSponsorCosponsor(board_project_id, previousColumn, project_partner_id);
                const targetSecCost = await getBoardProjectCostSponsorCosponsor(board_project_id, columnNumber, project_partner_id);
                if (originSecCost && targetSecCost) {                
                  const cost = originSecCost.projectCostData.cost + targetSecCost.projectCostData.cost;
                  ProjectCost.update(
                    {
                      cost: cost,
                      last_modified: moment().toDate(),
                      modified_by: user.email
                    },
                    { where: { project_cost_id: targetSecCost.projectCostData.project_cost_id }, transaction }
                  );
                  ProjectCost.update(
                    {
                      is_active: false,
                      last_modified: moment().toDate(),
                      modified_by: user.email,
                      code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_EDITED: COST_IDS.WORK_REQUEST_EDITED,
                    },
                    { where: { project_cost_id: originSecCost.projectCostData.project_cost_id }, transaction }
                  );
                }
              });
            } else {
              const originCostValue = originCost ? originCost.projectCostData.cost : 0;
              console.log('\n ****************************** \n SENDING TO COLUMN WITHOUT COST \n ****************************** \n');
              console.log('starting to insert cost in column');
              console.time();
              await Promise.all([deactivateCostFromPreviousPosition(board_project_id, boardId, previousColumn, isWorkPlanBoolean, user, transaction), 
                createCostAndInsertIntoColumn(
                  project_id,
                  board_project_id,
                  boardId,
                  originCostValue,
                  columnNumber,
                  sortOrderValue,
                  isWorkPlanBoolean,
                  user,
                  transaction
                )]);
              console.log('finished to insert cost in column with no cost THE SLOW POINT');
              console.timeEnd();
            }
          }
        }
       
      } else {
        console.log('\n ****************************** \n SENDING WORKSPACE TO COLUMN \n ****************************** \n');
        // is not workspace and previous column is 0 ->  WORKSPACE to COLUMN  
        await deactivateCostFromPreviousPosition(board_project_id, boardId, previousColumn, isWorkPlanBoolean, user, transaction);
        await createCostAndInsertIntoColumn(
          project_id,
          board_project_id,
          boardId,
          0,
          columnNumber,
          sortOrderValue,
          isWorkPlanBoolean,
          user,
          transaction
        );
      }
    }
    // needs to add transaction
    console.log('starting to insert on column and fix column');
    console.time();
    await determineStatusChange(wasOnWorkspace, boardProjectUpdated, board_id, user.email, transaction);
    console.log('finished to insert on column and fix column');
    console.timeEnd();
    console.log('starting commit');
    console.time();
    await transaction.commit();
    console.log('finished commit');
    console.timeEnd();
    return res.status(200).send({message: 'DONE'});
  } catch (error) {
    logger.error('Error at update rank ' + error);
    await transaction.rollback();
    return res.status(500).send({ error: error });
  }
};

export default updateRank;
