import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import { Op } from 'sequelize';

const Board = db.board;
const BoardProject = db.boardProject;
const BoardProjectCost = db.boardProjectCost;
const ProjectCost = db.projectCost;
const ProjectPartner = db.projectPartner;
const CodeProjectPartnerType = db.codeProjectPartnerType;
const BusinessAssociates = db.businessAssociates;

const getPriorFunding = async (boardProject) => {
    logger.info('init function getPriorFunding');
    const MHFDWorkPlan = 'MHFD District Work Plan';
    const projectCostValues = await BoardProjectCost.findAll({
      attributes: ['req_position', 'board_project_id'],
      include: [{
        attributes: ['cost', 'project_cost_id', 'project_partner_id', 'code_cost_type_id'],
        model: ProjectCost,
        as: 'projectCostData',
        required: true,
        where: {
          is_active: true,
          project_id: boardProject.projectData.project_id,
          code_cost_type_id: 21
        },
        include: [{
          model: ProjectPartner,
          as: 'projectPartnerData',
          include: [{
            model: CodeProjectPartnerType,
            as: 'projectPartnerTypeData'
          }, {
            model: BusinessAssociates,
            as: 'businessAssociateData'
          }]
        }]
      },{
        model: BoardProject,
        as: 'boardProjectData',
        attributes: ['board_project_id'],
        required: true,
        include: [{
          model: Board,
          required: true,
          attributes: ['year','board_id'],
          where: {
            locality: MHFDWorkPlan,
            year: {
              [Op.lt]: boardProject.board.year
            }
          }
        }]
      }],
      where: {
        req_position: 1
      }
    });
    const returnValues = projectCostValues.map((a)=> ({
      code_cost_type_id: a.projectCostData?.code_cost_type_id,
      business_associates_id: a.projectCostData?.projectPartnerData?.businessAssociateData ? a.projectCostData?.projectPartnerData?.businessAssociateData[0].business_associates_id : null,
      business_name: a.projectCostData?.projectPartnerData?.businessAssociateData ? a.projectCostData?.projectPartnerData?.businessAssociateData[0].business_name : null,
      code_partner_type_id: a.projectCostData?.projectPartnerData?.projectPartnerTypeData.code_partner_type_id,
      pos: a.req_position,
      cost: a.projectCostData.cost,
    }));
    const priorFunding = Object.values(returnValues.reduce((accumulator, item) => {
      const { business_name, cost, ...rest } = item;
      const key = business_name;
      if (!accumulator[key]) {
        accumulator[key] = { business_name, cost, ...rest };
      } else {
        accumulator[key].cost += cost;
      }
      return accumulator;
    }, {}));
    
    return priorFunding;

}
  export default getPriorFunding;
  