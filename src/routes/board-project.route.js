import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';
import updateRank from 'bc/routes/board-project/update-rank.js';
import updateCost from 'bc/routes/board-project/cost.js';
import authOnlyEmail from 'bc/auth/auth-only-email.js';
import { Op } from 'sequelize';
import getPriorFunding from 'bc/routes/board-project/priorFunding.js';
const Board = db.board;
const BoardProject = db.boardProject;
const BoardProjectCost = db.boardProjectCost;
const Project = db.project;
const ProjectCost = db.projectCost;
const ProjectPartner = db.projectPartner;
const CodeProjectPartnerType = db.codeProjectPartnerType;
const BusinessAssociates = db.businessAssociates;
const ProjectIndependentAction = db.projectIndependentAction;

const router = express.Router();

router.get('/:board_project_id/cost/test', async (req, res) => {
  try {
    const { board_project_id } = req.params;
    const boardProject = await BoardProject.findOne({
      include: [{
        model: Project,
        attributes: ['project_id'],
        as: 'projectData',
        include: [{
          model: ProjectCost,
          attributes: ['cost'],
          as: 'currentCost',
          required: false,
          where: {
            is_active: true
          },
        },
        {
          model: ProjectIndependentAction,
          required: false,
          separate: true,
          attributes: [
            'action_name',
            'project_id',
            'cost',
            'action_status'
          ]
        }]
      },{
        model: Board,
        attributes: ['year']
      }],
      where: {
        board_project_id
      }
    });

    console.log('yeeeeeeear', boardProject.board.year)

    const projectCostValues = await BoardProjectCost.findAll({
      attributes: ['req_position', 'board_project_id'],
      include: [{
        attributes: ['cost', 'project_cost_id', 'project_partner_id', 'code_cost_type_id'],
        model: ProjectCost,
        as: 'projectCostData',
        required: true,
        where: {
          is_active: true,
          project_id: boardProject.projectData.project_id
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
            year: {
              [Op.lt]: boardProject.board.year
            }
          }
        }]
      }],
      where: {
        //board_project_id,
        req_position: 1
      }
    });
    console.log('PROJECT COST VALUES', JSON.stringify(projectCostValues));
    const returnValues = projectCostValues.map((a)=> ({
      year: a.boardProjectData?.board?.year,
      code_cost_type_id: a.projectCostData?.code_cost_type_id,
      business_associates_id: a.projectCostData?.projectPartnerData?.businessAssociateData ? a.projectCostData?.projectPartnerData?.businessAssociateData[0].business_associates_id : null,
      business_name: a.projectCostData?.projectPartnerData?.businessAssociateData ? a.projectCostData?.projectPartnerData?.businessAssociateData[0].business_name : null,
      code_partner_type_id: a.projectCostData?.projectPartnerData?.projectPartnerTypeData.code_partner_type_id,
      pos: a.req_position,
      cost: a.projectCostData.cost,
      // datainside: JSON.stringify(a.projectCostData)
    }));
    console.log('\n\n  ********** \n\n Project Cost \n ', returnValues, '\n\n  ********** \n\n');
    const priorFunding = {};
    returnValues.forEach((item) => {
      if(priorFunding[item.business_name]) {
        priorFunding[item.business_name] += item.cost;
      } else {
        priorFunding[item.business_name] = item.cost;
      }
    });
    console.log('Prior funding', priorFunding);
    const previousSponsorRelations = await ProjectCost.findAll({
      where: {
        project_id: board_project_id,
        is_active: true,
        code_cost_type_id: 22
      },
      include: [{
        model: ProjectPartner,
        as: 'projectPartnerData',
        include: [
          {
            model: CodeProjectPartnerType,
            as: 'projectPartnerTypeData'
          },
          {
            model: BusinessAssociates,
            as: 'businessAssociateData'
          }
        ]
      }]
    });
    console.log('previous sponsor relations', previousSponsorRelations);
    // now we need to get all current project partners
    const currentProjectPartners = await ProjectPartner.findAll({
      where: {
        project_id: board_project_id
      },
      include: [
        {
          model: CodeProjectPartnerType,
          as: 'projectPartnerTypeData'
        },
        {
          model: BusinessAssociates,
          as: 'businessAssociateData'
        }
      ]
    });
    console.log('current project partners', currentProjectPartners);
    res.send([previousSponsorRelations, currentProjectPartners]);
  } catch (error) {
    logger.error('ERROR FROM GET COST ' + error);
    return res.status(500).send({ error: error });
  }
});
router.get('/:board_project_id/cost', async (req, res) => {
  logger.info('get board project cost by id');
  const { board_project_id } = req.params;
  try {
    const boardProject = await BoardProject.findOne({
      include: [{
        model: Project,
        attributes: ['project_id'],
        as: 'projectData',
        include: [{
          model: ProjectCost,
          attributes: ['cost', 'code_cost_type_id', 'modified_by', 'last_modified' ],
          as: 'currentCost',
          required: false,
          where: {
            is_active: true
          },
        },
        {
          model: ProjectIndependentAction,
          required: false,
          separate: true,
          attributes: [
            'action_name',
            'project_id',
            'cost',
            'action_status'
          ]
        }]
      },{
        model: Board,
        attributes: ['year']
      }],
      where: {
        board_project_id
      }
    });
    console.log('______ \n Board PRoject found', JSON.stringify(boardProject), '\n______');
    const projectCostValues = await BoardProjectCost.findAll({
      attributes: ['req_position', 'board_project_id'],
      include: [{
        attributes: ['cost', 'project_cost_id', 'project_partner_id', 'code_cost_type_id'],
        model: ProjectCost,
        as: 'projectCostData',
        required: true,
        where: {
          is_active: true,
          project_id: boardProject.projectData.project_id
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
            year: boardProject.board.year
          }
        }]
      }],
      where: {
        //board_project_id,
        req_position: {
          [Op.gt]: 0
        }
      }
    });
  const priorFunding = await getPriorFunding(boardProject);
  const returnValues = projectCostValues.map((a)=> ({
    code_cost_type_id: a.projectCostData?.code_cost_type_id,
    business_associates_id: a.projectCostData?.projectPartnerData?.businessAssociateData ? a.projectCostData?.projectPartnerData?.businessAssociateData[0].business_associates_id : null,
    business_name: a.projectCostData?.projectPartnerData?.businessAssociateData ? a.projectCostData?.projectPartnerData?.businessAssociateData[0].business_name : null,
    code_partner_type_id: a.projectCostData?.projectPartnerData?.projectPartnerTypeData.code_partner_type_id,
    pos: a.req_position,
    cost: a.projectCostData.cost,
    // datainside: JSON.stringify(a.projectCostData)
  }));
  console.log('\n\n  ********** \n\n Project Cost \n ', returnValues, '\n\n  ********** \n\n');
  
  const groupedData = returnValues.reduce((x, y) => {
    (x[y.business_name] = x[y.business_name] || []).push(y);
    return x;
  }, {});
  const getReqsValues = (currentValues, code_cost_type_id, business_name, priorFunding) => {

    const returnObject = {};
    priorFunding.forEach((pf) => {
      if (pf.business_name == business_name) {
        returnObject['priorFunding'] = pf.cost;
      }
    })
    currentValues?.forEach((v) => {
      const stringPos = 'req'+v.pos;
      if (v.code_cost_type_id == code_cost_type_id) {
        returnObject[stringPos] = v.cost;
      }
    });
    for ( let i = 1 ; i <= 5; ++i) {
      if (returnObject['req' + i] === null || returnObject['req' + i] === undefined) {
        returnObject['req'+i] = null;
      }
    }
    for (let i = 11 ; i <= 12; ++i) {
      if (returnObject['req' + i] === null || returnObject['req' + i] === undefined) {
        returnObject['req'+i] = null;
      }
    }
    //TODO: add years if needed
    return returnObject;
  }
  console.log('Boardproject', boardProject);
    const currentProjectId = boardProject.projectData.project_id;
    const allBusinessNamesRelatedToProject = await ProjectPartner.findAll({
      attributes: ['project_partner_id', 'code_partner_type_id'],
      include: [{
        model: BusinessAssociates,
        attributes: ['business_name', 'business_associates_id'],
        as: 'businessAssociateData'
      }],
      where: {
        project_id: currentProjectId,
        code_partner_type_id: [ 88, 11, 12 ]
      }
    });
    // THIS FILTER IS TO NOT SAVE ANY DATA FOR MHFD SPONSOR
    const allBNWithPartner = allBusinessNamesRelatedToProject.filter((bname) => !(bname.businessAssociateData[0]?.business_name === 'MHFD' && bname.code_partner_type_id === 11)).map((abnrp) => {
      const answer = {
        business_name: abnrp.businessAssociateData ? abnrp.businessAssociateData[0].business_name: null,
        code_partner_type_id: abnrp.code_partner_type_id,
        business_associates_id: abnrp.businessAssociateData ? abnrp.businessAssociateData[0].business_associates_id: null
      };
      return answer;
    });
    const MHFD_CODE_COST_TYPE_ID = 88;
    const SPONSOR_CODE_COST_TYPE_ID = 11;
    const WORK_REQUEST_CODE_COST_TYPE_ID = 22;
    const WORK_PLAN_CODE_COST_TYPE_ID = 21;
    const finalAnswer = allBNWithPartner.map((bnnp) => {
      const bname = bnnp.business_name;
      const bid = bnnp.business_associates_id;
      const current_code_partner_type_id = bnnp.code_partner_type_id;
      const databyBN = groupedData[bname];
      console.log('data filtered for', bname, 'databybn', databyBN, 'current cost type id', databyBN ? databyBN[0].code_cost_type_id: WORK_REQUEST_CODE_COST_TYPE_ID);
      let current_code_cost_type_id; // ALMOST ALL ARE GOING TO BE 22 WORK REQUEST 
      if (current_code_partner_type_id == MHFD_CODE_COST_TYPE_ID || current_code_partner_type_id == SPONSOR_CODE_COST_TYPE_ID) {
        current_code_cost_type_id = WORK_REQUEST_CODE_COST_TYPE_ID;
      } else {
        current_code_cost_type_id = WORK_PLAN_CODE_COST_TYPE_ID;
      }
      return {
        code_cost_type_id: current_code_cost_type_id,
        business_associates_id: bid,
        business_name: bname,
        code_partner_type_id: current_code_partner_type_id,
        values: getReqsValues(databyBN, current_code_cost_type_id,bname,priorFunding)
      }
    });
    const businessMhfd = allBusinessNamesRelatedToProject.find((abnrp) => abnrp.code_partner_type_id === 88);
    if (businessMhfd){
      const bname = businessMhfd.businessAssociateData? businessMhfd.businessAssociateData[0].business_name: null;
      const workplanValues = {
        code_cost_type_id: WORK_PLAN_CODE_COST_TYPE_ID,
        business_associates_id: businessMhfd.businessAssociateData? businessMhfd.businessAssociateData[0].business_associates_id: null,
        business_name: bname,
        code_partner_type_id: businessMhfd.code_partner_type_id,
        values: getReqsValues(groupedData[bname], WORK_PLAN_CODE_COST_TYPE_ID,bname,priorFunding)
      };
      finalAnswer.push(workplanValues);
    }
    // init: added to get cost for sponsor in wr and wp 
    const businessSponsor = allBusinessNamesRelatedToProject.find((abnrp) => abnrp.code_partner_type_id === 11);
    if (businessSponsor){
      const bname = businessSponsor.businessAssociateData? businessSponsor.businessAssociateData[0].business_name: null;
      const workplanValuesForSponsor = {
        code_cost_type_id: WORK_PLAN_CODE_COST_TYPE_ID,
        business_associates_id: businessSponsor.businessAssociateData? businessSponsor.businessAssociateData[0].business_associates_id: null,
        business_name: bname,
        code_partner_type_id: businessSponsor.code_partner_type_id,
        values: getReqsValues(groupedData[bname], WORK_PLAN_CODE_COST_TYPE_ID,bname,priorFunding)
      };
      finalAnswer.push(workplanValuesForSponsor);
    }
    // end: added to get cost for sponsor in wr and wp 
    const filteredAmounts = finalAnswer.filter((item) => {
      return !(item.business_name === 'MHFD' && item.code_partner_type_id === 11);
    });  
    return res.status(200).send({projectCostValues,boardProject, amounts: filteredAmounts, projectData: boardProject.projectData});
 
  } catch (error) {
    logger.error('ERROR FROM GET COST ' + error);
    return res.status(500).send({ error: error });
  }
});

router.post('/getCostsMaintenance', async (req, res) => {
  const { board_project_id, isWorkPlan } = req.body;
  const WORK_REQUEST_CODE_COST_TYPE_ID = 22;
  const WORK_PLAN_CODE_COST_TYPE_ID = 21;
  try {
    // const boardProject = await BoardProject.findAll({
    //   attributes: [
    //     'board_project_id',
    //     'req1',
    //     'req2',
    //     'req3',
    //     'req4',
    //     'req5',
    //     'year1',
    //     'year2'
    //   ],
    //   where: {
    //     board_project_id
    //   }
    // });
    // return res.status(200).send(boardProject);

    const boardProject = await BoardProject.findAll({
      include: [{
        model: Project,
        attributes: ['project_id'],
        as: 'projectData',
        include: [{
          model: ProjectCost,
          attributes: ['cost'],
          as: 'currentCost',
          required: false,
          where: {
            is_active: true
          },
        },
        {
          model: ProjectIndependentAction,
          required: false,
          separate: true,
          attributes: [
            'action_name',
            'project_id',
            'cost',
            'action_status'
          ]
        }]
      },{
        model: Board,
        attributes: ['year']
      }],
      where: {
        board_project_id
      }
    });
    const projectsIds = [], projectsBoardYears =[];
    boardProject.forEach((bp) => {
      projectsIds.push(bp.projectData.project_id)
      projectsBoardYears.push(bp.board.year)
    });
    const projectCostValues = await BoardProjectCost.findAll({
      attributes: ['req_position', 'board_project_id'],
      include: [{
        attributes: ['cost', 'project_cost_id', 'project_partner_id', 'code_cost_type_id'],
        model: ProjectCost,
        as: 'projectCostData',
        required: true,
        where: {
          is_active: true,
          project_id: projectsIds,
          code_cost_type_id: isWorkPlan ? WORK_PLAN_CODE_COST_TYPE_ID : WORK_REQUEST_CODE_COST_TYPE_ID
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
          }],
          where: {
            code_partner_type_id: 88
          }
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
            year: projectsBoardYears
          }
        }]
      }],
      where: {
        req_position: {
          [Op.gt]: 0
        }
      }
    });
    const returnValues = projectCostValues.map((a)=> ({
      board_project_id: a.board_project_id,
      code_cost_type_id: a.projectCostData?.code_cost_type_id,
      business_associates_id: a.projectCostData?.projectPartnerData?.businessAssociateData ? a.projectCostData?.projectPartnerData?.businessAssociateData[0].business_associates_id : null,
      business_name: a.projectCostData?.projectPartnerData?.businessAssociateData ? a.projectCostData?.projectPartnerData?.businessAssociateData[0].business_name : null,
      code_partner_type_id: a.projectCostData?.projectPartnerData?.projectPartnerTypeData.code_partner_type_id,
      pos: a.req_position,
      cost: a.projectCostData.cost,
    }));    
    const result = {};
    returnValues.forEach(item => {
      const { board_project_id, pos, cost } = item;
      if (!result[board_project_id]) {
        result[board_project_id] = {
          board_project_id,
          req1: null,
          req2: null,
          req3: null,
          req4: null,
          req5: null,
          req11: null,
          req12: null
        };
      }
      result[board_project_id][`req${pos}`] = cost;
    });
    const finalResult = Object.values(result);
    return res.status(200).send(finalResult);
 
  } catch (error) {
    logger.error('ERROR FROM GET COST ' + error);
    return res.status(500).send({ error: error });
  }
});

router.put('/update-target-cost', [authOnlyEmail], async(req,res) => {
  const {
    boardId,
    targetcost1,
    targetcost2,
    targetcost3,
    targetcost4,
    targetcost5
  } = req.body;
  const {
    locality,
    projecttype,
    type,
    year,
  } = boardId;
  const board = await Board.findOne({
    attributes: ['board_id'],
    where: {
      locality,
      projecttype,
      type,
      year
    },
    sort: [['createdAt', 'DESC']]
  });

  try{
    let boardUpdate = await Board.update(
      {
        targetcost1,
        targetcost2,
        targetcost3,
        targetcost4,
        targetcost5,
        last_modified_by: req.user.email
      },
      {
        where: {
          board_id: board.board_id
        }
      }
    );
    return res.status(200).send(boardUpdate);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

router.put('/:board_project_id/update-rank', [auth], updateRank);
router.put('/:board_project_id/cost', [auth], updateCost); // RESTORE AUTH 

export default router;
