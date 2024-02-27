import db from 'bc/config/db.js';
import moment from 'moment';
import {
  CODE_DATA_SOURCE_TYPE,
  COST_IDS,
  SPONSOR_COSPONSOR_CODE,
  GAP,
  INITIAL_GAP
} from 'bc/lib/enumConstants.js';
import { saveProjectCost } from 'bc/utils/create';
import sequelize from 'sequelize';

const BoardProjectCost = db.boardProjectCost;
const ProjectCost = db.projectCost;
const ProjectPartner = db.projectPartner;
const BusinessAssociates = db.businessAssociates;
const BoardProject = db.boardProject;
const Board = db.board;
const { Op } = sequelize;

export async function deactivateCosts(board_project_id, previousColumn, isWorkPlanBoolean, user, transaction) {
  try {
    const boardProjectCosts = await BoardProjectCost.findOne({
      where: {
        board_project_id,
        req_position: previousColumn
      },
      include: [
        {
          attibutes: ['project_cost_id'],
          model: ProjectCost,
          as: 'projectCostData',
          required: true,
          where: {
            is_active: true,
            code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID : COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID
          }
        }
      ],
      transaction
    });
    if (boardProjectCosts) {
      const projectCostId = boardProjectCosts.projectCostData.project_cost_id;
      const costUpdateData = {
        is_active: false,
        last_modified: moment().toDate(),
        modified_by: user.email,
        code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_EDITED : COST_IDS.WORK_REQUEST_EDITED,
      };
      const projectCostUpdated = await ProjectCost.update(
        costUpdateData,
        {
          where: {
            project_cost_id: projectCostId
          },
          transaction
        }
      );
    }
  } catch (error) {
    console.error('Error at removeFromPreviousPosition ', error);
    throw error;
  }
}

export async function getProjectPartnerMHFD(project_id, transaction) {
  try {
    const MHFD_CODE_PARTNER_TYPE = 88;
    const results = await ProjectPartner.findAll({
      where: {
        project_id,
        code_partner_type_id: MHFD_CODE_PARTNER_TYPE
      },
      include: [{
        model: BusinessAssociates,
        as: 'businessAssociateData'
      }],
      transaction
    });
    return results;
  } catch (error) {
    console.error('Error at getProjectPartnerMHFD ', error);
    throw error;
  }
}

export async function createCostAndInsert(
  project_id,
  board_project_id,
  cost,
  columnNumber,
  sortOrder,
  isWorkPlan,
  user,
  transaction
) {
  try {
    const projectPartner = await getProjectPartnerMHFD(project_id, transaction);
    const projectPartnerId = projectPartner[0].project_partner_id;

    const dataProjectCost = {
      project_id: project_id,
      cost: cost,
      code_cost_type_id: isWorkPlan ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID : COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID,
      created_by: user.email,
      modified_by: user.email,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      is_active: true,
      code_data_source_type_id: CODE_DATA_SOURCE_TYPE.USER,
      project_partner_id: projectPartnerId,
    };

    const projectCostCreated = await saveProjectCost(dataProjectCost, transaction);
    const project_cost_id = projectCostCreated.dataValues.project_cost_id;

    const newProjectBoardData = {
      board_project_id: board_project_id,
      project_cost_id: project_cost_id,
      req_position: columnNumber,
      created_by: user.email,
      last_modified_by: user.email,
      sort_order: sortOrder,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    const boardProjectCostCreated = await BoardProjectCost.create(newProjectBoardData, { transaction });

    return boardProjectCostCreated;
  } catch (error) {
    console.error('Error at insertCostInColumn ', error);
    throw error;
  }
}

export async function updateSortOrder(board_project_id, previousColumn, isWorkPlanBoolean, newSortOrder, transaction) {
  try {
    const projectCostToUpdate = await BoardProjectCost.findOne({
      where: {
        board_project_id,
        req_position: previousColumn
      },
      include: [
        {
          attributes: ['project_cost_id'],
          model: ProjectCost,
          as: 'projectCostData',
          required: true,
          where: {
            is_active: true,
            code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID : COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID
          }
        }
      ],
      transaction
    });
    console.log('projectCostToUpdate', projectCostToUpdate)
    if (projectCostToUpdate) {
      await BoardProjectCost.update(
        { sort_order: newSortOrder },
        {
          where: {
            board_project_cost_id: projectCostToUpdate.board_project_cost_id
          },
          transaction
        }
      );
    }
  } catch (error) {
    console.error('Error at updateSortOrder ', error);
    throw error;
  }
}

export async function getMHFDProjectCost(board_project_id, columnNumber) {
  const MHFD_CODE_PARTNER_TYPE = 88;
  try {
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
  } catch (error) {
    console.error('Error at getMHFDProjectCost ', error);
    throw error;
  }  
}

export async function updateProjectCosts(originCost, targetCost, user, transaction, isWorkPlanBoolean) {
  try {
    const originCostValue = originCost ? originCost.projectCostData.cost : 0;
    const targetCostValue = targetCost ? targetCost.projectCostData.cost : 0;
    const newFinalCost = originCostValue + targetCostValue;
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
          code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_EDITED : COST_IDS.WORK_REQUEST_EDITED,
        },
        { where: { project_cost_id: originCost.projectCostData.project_cost_id }, transaction },
      )
    ])
  } catch (error) {
    console.error('Error at updateProjectCosts ', error);
    throw error;
  }
}

export async function getSponsorCosponsor(board_project_id, transaction) {  
  try {
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
      ],
      transaction
    });
    const projectPartnerIds = results.map(result => result.projectCostData.project_partner_id);
    const uniqueProjectPartnerIds = [...new Set(projectPartnerIds)];
    return uniqueProjectPartnerIds;
  } catch (error) {
    console.error('Error at getSponsorCosponsor ', error);
    throw error;
  }
}

export async function getBoardCostsForPartnersAndColumns(board_project_id, columns, project_partner_ids, transaction) {
  try {
    return await BoardProjectCost.findAll({
      where: {
        board_project_id,
        req_position: {
          [Op.in]: columns
        },
      },
      include: [{
        model: ProjectCost,
        as: 'projectCostData',
        where: {
          is_active: true,
          project_partner_id: {
            [Op.in]: project_partner_ids
          },
        },
        include: [{
          model: ProjectPartner,
          as: 'projectPartnerData',
          where: {
            code_partner_type_id: {
              [Op.in]: SPONSOR_COSPONSOR_CODE
            }
          }
        }]
      }],
      transaction
    });
  } catch (error) {
    console.error('Error at getBoardCostsForPartnersAndColumns ', error);
    throw error;
  }
}

export async function updateSponsorProjectCosts(
  previousColumn,
  columnNumber,
  user,
  isWorkPlanBoolean,
  board_project_id,
  transaction
) {
  try {
    let targetPromises = [];
    let originPromises = [];

    const sponsorAndCosponsor = await getSponsorCosponsor(board_project_id, transaction);
    const columns = [previousColumn, columnNumber];
    const boardCostsData = await getBoardCostsForPartnersAndColumns(board_project_id, columns, sponsorAndCosponsor, transaction);

    sponsorAndCosponsor.forEach((project_partner_id) => {
      const originSecCost = boardCostsData.find(cost => cost.req_position === previousColumn
        && cost.projectCostData.project_partner_id === project_partner_id);
      const targetSecCost = boardCostsData.find(cost => cost.req_position === columnNumber
        && cost.projectCostData.project_partner_id === project_partner_id);
      if (originSecCost && targetSecCost) {
        const cost = originSecCost.projectCostData.cost + targetSecCost.projectCostData.cost;
        let targetPromise = ProjectCost.update(
          {
            cost: cost,
            last_modified: moment().toDate(),
            modified_by: user.email
          },
          { where: { project_cost_id: targetSecCost.projectCostData.project_cost_id }, transaction }
        );

        let originPromise = ProjectCost.update(
          {
            is_active: false,
            last_modified: moment().toDate(),
            modified_by: user.email,
            code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_EDITED : COST_IDS.WORK_REQUEST_EDITED,
          },
          { where: { project_cost_id: originSecCost.projectCostData.project_cost_id }, transaction }
        );

        targetPromises.push(targetPromise);
        originPromises.push(originPromise);
      } else if (originSecCost) {        
        let originPromise = ProjectCost.update(
          {
            is_active: false,
            last_modified: moment().toDate(),
            modified_by: user.email,
            code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_EDITED : COST_IDS.WORK_REQUEST_EDITED,
          },
          { where: { project_cost_id: originSecCost.projectCostData.project_cost_id }, transaction }
        );
        let targetPromise = ProjectCost.create({
          cost: originSecCost.projectCostData.cost,
          code_cost_type_id: isWorkPlanBoolean ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID : COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID,
          created_by: user.email,
          modified_by: user.email,
          createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
          is_active: true,
          code_data_source_type_id: CODE_DATA_SOURCE_TYPE.USER,
          project_partner_id: originSecCost.projectCostData.project_partner_id,
          project_id: originSecCost.projectCostData.project_id
        }, { transaction }).then((projectCost) => {
          return BoardProjectCost.create({
            board_project_id,
            project_cost_id: projectCost.project_cost_id,
            req_position: columnNumber,
            created_by: user.email,
            last_modified_by: user.email,
            sort_order: originSecCost.sort_order,
            createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
          }, { transaction });
        });        
        originPromises.push(originPromise);
        targetPromises.push(targetPromise);
      }
    });
    await Promise.all([...targetPromises, ...originPromises]);
    console.log('Sponsor project costs updated PromiseAllz')
  } catch (error) {
    console.error('Error at updateSponsorProjectCosts ', error);
    throw error;
  }
}

export async function getSortOrderForUpdate(board_project_id, boardId, currentColumn, isWorkPlan, transaction) {
  try {
    const projectsExist = await BoardProjectCost.findOne({
      attibutes: ['req_position', 'sort_order'],
      where: {
        board_project_id,
        req_position: currentColumn
      },
      include: [
        {
          attributes: ['project_cost_id'],
          model: ProjectCost,
          as: 'projectCostData',
          required: true,
          where: {
            is_active: true,
            code_cost_type_id: isWorkPlan ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID : COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID
          }
        }
      ],
      transaction
    });
    if (projectsExist) {
      const projectSortValue = projectsExist.sort_order;
      return +projectSortValue;
    }
    const {
      locality,
      projecttype,
      type,
      year,
    } = boardId;
    let boardWhere = {
      type,
      year,
      locality,
      projecttype,
    };
    boardWhere = applyLocalityCondition(boardWhere);
    const board_id = await Board.findOne({
      attributes: ['board_id'],
      where: boardWhere,
      transaction
    });
    const boardIdValue = board_id.board_id;
    const maxSortOrder = await BoardProjectCost.findOne({
      attributes: ['sort_order'],
      include: [{
        model: BoardProject,
        required: true,
        as: 'boardProjectData',
        where: {
          board_id: boardIdValue,
        }
      }, {
        model: ProjectCost,
        required: true,
        as: 'projectCostData',
        where: {
          is_active: true,
          code_cost_type_id: isWorkPlan ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID : COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID,
        }
      }],
      where: {
        req_position: currentColumn,
      },
      order: [['sort_order', 'DESC']],
    });
    if (maxSortOrder) {
      if (maxSortOrder.sort_order) {
        return +maxSortOrder.sort_order + GAP;
      } else {
        return INITIAL_GAP;
      }
    } else {
      return INITIAL_GAP;
    }
  } catch (error) {
    console.error('Error at getRankForUpdate ', error);
    throw error;
  }
}

const applyLocalityCondition = (where) => {
  if (where.locality.startsWith('South Platte River')) {
    where.locality = {
      [Op.like]: 'South Platte River%'
    }
  }
  if (where.locality === 'Highlands Ranch Metro District') {
    where.locality = {
      [Op.in]: ['Highlands Ranch', 'Highlands Ranch Metro District']
    }
  }
  return where;
}
