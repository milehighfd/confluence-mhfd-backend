import { LexoRank } from 'lexorank';
import sequelize from 'sequelize';
import db from 'bc/config/db.js';
import moment from 'moment';
import logger from 'bc/config/logger.js';
import { OFFSET_MILLISECONDS, COST_IDS } from 'bc/lib/enumConstants.js';
import boardService from 'bc/services/board.service.js';
import { isOnWorkspace, determineStatusChange } from 'bc/services/board-project.service.js';
import { saveWorkspaceCostInit } from 'bc/utils/create';

const BoardProject = db.boardProject;
const BoardProjectCost = db.boardProjectCost;
const ProjectCost = db.projectCost;
const ProjectPartner = db.projectPartner;
const CodeProjectPartnerType = db.codeProjectPartnerType;
const BusinessAssociates = db.businessAssociates;
const Board = db.board;
const { Op } = sequelize;
const getAllPreviousAmounts = async (boardProject, currentProjectId) => {
  console.trace('GET all PREVIOUS AMOUNTs', JSON.stringify(boardProject));
  const projectCostValues = await BoardProjectCost.findAll({
    attributes: ['req_position', 'board_project_id'],
    include: [{
      attributes: ['cost', 'project_cost_id', 'project_partner_id', 'code_cost_type_id'],
      model: ProjectCost,
      as: 'projectCostData',
      required: true,
      where: {
        is_active: true,
        project_id: boardProject.project_id
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
  const returnValues = projectCostValues.map((a) => ({
    code_cost_type_id: a.projectCostData?.code_cost_type_id,
    business_associates_id: a.projectCostData?.projectPartnerData?.businessAssociateData
      ? a.projectCostData.projectPartnerData.businessAssociateData[0]?.business_associates_id
      : null,
    business_name: a.projectCostData?.projectPartnerData?.businessAssociateData
      ? a.projectCostData.projectPartnerData.businessAssociateData[0].business_name
      : null,
    code_partner_type_id: a.projectCostData?.projectPartnerData?.projectPartnerTypeData.code_partner_type_id,
    pos: a.req_position,
    cost: a.projectCostData.cost
    // datainside: JSON.stringify(a.projectCostData)
  }));
  const groupedData = returnValues.reduce((x, y) => {
    (x[y.business_name] = x[y.business_name] || []).push(y);
    return x;
  }, {});
  const getReqsValues = (currentValues, code_cost_type_id) => {
    const returnObject = {};
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
  const allBusinessNamesRelatedToProject = await ProjectPartner.findAll({
    attributes: ['project_partner_id', 'code_partner_type_id'],
    include: [
      {
        model: BusinessAssociates,
        attributes: ['business_name', 'business_associates_id'],
        as: 'businessAssociateData'
      }
    ],
    where: {
      project_id: currentProjectId,
      code_partner_type_id: [ 88, 11, 12 ]
    }
  });
  console.log('PID', currentProjectId, 'ALL BUSINESS NAMES RELATED PEOJRCET ', JSON.stringify(allBusinessNamesRelatedToProject));
  const allBNWithPartner = allBusinessNamesRelatedToProject.filter((bname) => !(bname.businessAssociateData[0]?.business_name === 'MHFD' && bname.code_partner_type_id === 11)).map((abnrp) => {
    const answer = {
      business_name: abnrp.businessAssociateData ? abnrp.businessAssociateData[0].business_name: null,
      code_partner_type_id: abnrp.code_partner_type_id,
      business_associates_id: abnrp.businessAssociateData ? abnrp.businessAssociateData[0].business_associates_id: null
    };
    console.log('anwser', answer);
    return answer;
  });
  const allPreviousAmounts = allBNWithPartner.map((bnnp) => {
    const bname = bnnp.business_name;
    const bid = bnnp.business_associates_id;
    const current_code_partner_type_id = bnnp.code_partner_type_id;
    const databyBN = groupedData[bname];
    let current_code_cost_type_id; // ALMOST ALL ARE GOING TO BE 22 WORK REQUEST 
    if (current_code_partner_type_id == COST_IDS.MHFD_CODE_COST_TYPE_ID || current_code_partner_type_id == COST_IDS.SPONSOR_CODE_COST_TYPE_ID) {
      current_code_cost_type_id = COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID;
    } else {
      current_code_cost_type_id = COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID;
    }
    return {
      code_cost_type_id: current_code_cost_type_id,
      business_associates_id: bid,
      business_name: bname,
      code_partner_type_id: current_code_partner_type_id,
      values: getReqsValues(databyBN, current_code_cost_type_id)
    }
  });
  const businessMhfd = allBusinessNamesRelatedToProject.find((abnrp) => abnrp.code_partner_type_id === 88);
  if (businessMhfd){
    const bname = businessMhfd.businessAssociateData? businessMhfd.businessAssociateData[0].business_name: null;
    const workplanValues = {
      code_cost_type_id: COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID,
      business_associates_id: businessMhfd.businessAssociateData? businessMhfd.businessAssociateData[0].business_associates_id: null,
      business_name: bname,
      code_partner_type_id: businessMhfd.code_partner_type_id,
      values: getReqsValues(groupedData[bname], COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID)
    };
    allPreviousAmounts.push(workplanValues);
  }
  const businessSponsor = allBusinessNamesRelatedToProject.find((abnrp) => abnrp.code_partner_type_id === 11);
  if (businessSponsor){
    const bname = businessSponsor.businessAssociateData? businessSponsor.businessAssociateData[0].business_name: null;
    const workplanValuesForSponsor = {
      code_cost_type_id: COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID,
      business_associates_id: businessSponsor.businessAssociateData? businessSponsor.businessAssociateData[0].business_associates_id: null,
      business_name: bname,
      code_partner_type_id: businessSponsor.code_partner_type_id,
      values: getReqsValues(groupedData[bname], COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID)
    };
    allPreviousAmounts.push(workplanValuesForSponsor);
  }
  return allPreviousAmounts;
};
const updateCostNew = async (req, res) => {
  logger.info('get board project cost by id');
  
  try {
    const { board_project_id } = req.params;
    const user = req.user; 
    const { amounts, isMaintenance, isWorkPlan, amountsTouched } = req.body; // ALL Amounts by sponsor, mhfd funding and cosponsors
    let columnsChangesMHFD = [0];
    const beforeUpdate = await BoardProject.findOne({
      where: { board_project_id },
      include:[{
        model: Board,
        attributes: ['year']
      }]
    });
    if (beforeUpdate){
    console.log('Board project id', board_project_id, 'beforeupdate', beforeUpdate);
    const board_id = beforeUpdate.board_id;
    const currentProjectId = beforeUpdate.project_id;
    let statusHasChanged;
    const allPreviousAmounts = await getAllPreviousAmounts(beforeUpdate, currentProjectId);
    const currentRanks = await BoardProject.findOne({
      attributes: ['rank0', 'rank1', 'rank2', 'rank3', 'rank4', 'rank5'],
      where: { board_project_id }
    });    
    console.log('HERE ARE THE REAL NEW AMONTS', amounts);
    for(let i = 0; i < amounts.length; ++i) {
        const amount = amounts[i];
        let updateFields = {};
        const wasOnWorkspace = isOnWorkspace(beforeUpdate); // based on RANK
        const columnsChanged = [0];
  
        const allCurrentAmounts = {}; // aqui se almacenan todos los reqs amounts
        // Returns all boarcproject cost related to the current board project
        // dentro de estos estan los costos de cada partner
        console.log('All previous amounts', allPreviousAmounts, 'searching for ', JSON.stringify(amount));
        const beforeAmounts = allPreviousAmounts.find((a) => a.business_name === amount.business_name && a.code_cost_type_id === amount.code_cost_type_id && a.code_partner_type_id === amount.code_partner_type_id);
        // check if exists because it could be a new partner that wasnt in previous amounts
        if (!beforeAmounts) {
          console.log('Jumped save for ', amount.business_name, 'because it doesnt exist');
          continue;
        }
        const currentBusinessAssociatesId = beforeAmounts?.business_associates_id;
        const currentPartnerTypeId = beforeAmounts?.code_partner_type_id;
        // EXCLUSIVO PARA MHFD FUNDING // PORQUE ES PARA AGREGAR O QUITAR CARDS DE ALGUNA COLUMNA
        if (amount.code_partner_type_id === 88 && (isWorkPlan ? amount.code_cost_type_id === 21 : amount.code_cost_type_id === 22)) {
          console.log('MHFD FUNDING', JSON.stringify(amount), isWorkPlan, 'before amount', beforeAmounts);
          for (let pos = 1; pos <= 5; pos++) {
            const reqColumnName = `req${pos}`;
            const rankColumnName = `rank${pos}`;
            const currentReqAmount = amount.values[reqColumnName] ?? null;            
            // const valueHasChanged = (currentReqAmount === null) ? true : beforeAmounts.values[reqColumnName] !== currentReqAmount;
            const valueHasChanged = beforeAmounts.values[reqColumnName] !== currentReqAmount;
            if (valueHasChanged) {
              columnsChanged.push(pos);
              allCurrentAmounts[reqColumnName] = currentReqAmount;
            } else {
              allCurrentAmounts[reqColumnName] = beforeAmounts.values[reqColumnName];
            }
            if (
              (beforeAmounts.values[reqColumnName] === null && currentReqAmount !== null) || 
              (beforeUpdate[rankColumnName] === null && currentReqAmount !== null && valueHasChanged)
            ) {
              const where = {
                board_id: beforeUpdate.board_id,
                [rankColumnName]: { [Op.ne]: null }
              };
              const projects = await BoardProject.findAll({
                where,
                order: [[rankColumnName, 'DESC']],
                limit: 1
              });
              if (currentRanks[rankColumnName] === null) {
                if (projects.length === 0) {
                  updateFields[rankColumnName] = LexoRank.middle().toString();
                } else {
                  const lastProject = projects[0];
                  console.log('Last project ', lastProject[rankColumnName]);
                  updateFields[rankColumnName] = LexoRank.parse(lastProject[rankColumnName]).genNext().toString();
                }
              }             
            } else if (currentReqAmount === null && !isMaintenance) {              
              updateFields[rankColumnName] = null;
            }
          }
        } else if (amount.code_partner_type_id !== 88) {
          for (let pos = 1; pos <= 5; pos++) {
            const reqColumnName = `req${pos}`;
            const valueHasChanged = beforeAmounts.values[reqColumnName] !== amount.values[reqColumnName];
            if (valueHasChanged) {
              console.log(' ========== adding pos', pos, valueHasChanged, amount.values[reqColumnName], beforeAmounts.values[reqColumnName]);
              columnsChanged.push(pos);
              allCurrentAmounts[reqColumnName] = amount.values[reqColumnName];
            } else {
              allCurrentAmounts[reqColumnName] = beforeAmounts.values[reqColumnName];
            }
          }
        }
        console.log('\n\n ________ \n ------------- \n columnsChanged', columnsChanged, JSON.stringify(amount));
        const allPromises = [];
        
        let mainModifiedDate = new Date();
        
        if (
          (
            amount.code_partner_type_id === 12
          ) // NOT MHFD FUNDING
          ||
          (
            amount.code_partner_type_id === 11 && (isWorkPlan ? amount.code_cost_type_id === 21 : amount.code_cost_type_id === 22)
          )
          ||
          ( amount.code_partner_type_id === 88 && (isWorkPlan ? amount.code_cost_type_id === 21 : amount.code_cost_type_id === 22)) // IF MHFD FUNDING FOR WORK PLAN OR WORK REQUEST
        ) {
          console.log(' ------------- \nColumns changed', columnsChanged, 'with id', currentBusinessAssociatesId , '\n\n\n');
          let shouldRemoveWorkspaceReq = false;
          for (let pos = 0; pos < columnsChanged.length; ++pos) {
            const currentColumn = columnsChanged[pos];
            if (currentColumn !== 0) {
              shouldRemoveWorkspaceReq = amount.code_partner_type_id === 88 ? true: false;
              // NOt workspace
              const reqColumnName = `req${currentColumn}`;
              const currentReqAmount = amount.values[reqColumnName] ?? null;
              const currentCost = currentReqAmount;
              console.log('About to update boardprojectcosts', amount, currentColumn, currentCost, currentProjectId, board_project_id, currentPartnerTypeId);
              allPromises.push(
                boardService.updateAndCreateProjectCostsForAmounts(
                  currentColumn,
                  currentCost,
                  currentProjectId,
                  currentBusinessAssociatesId,
                  currentPartnerTypeId,
                  user,
                  board_project_id,
                  moment(mainModifiedDate)
                    .subtract(OFFSET_MILLISECONDS * pos)
                    .toDate(),
                  amount.code_cost_type_id,
                  isWorkPlan,
                  amountsTouched ? amountsTouched[`req${currentColumn}`] : true
                )
              );
            }
          }
          if ( shouldRemoveWorkspaceReq) {
            allPromises.push(
              boardService.updateProjectCostOfWorkspace(
                0,
                user,
                currentBusinessAssociatesId,
                currentPartnerTypeId,
                currentProjectId,
                board_project_id,
                moment().toDate(),
                isWorkPlan,
                amount.code_cost_type_id
              )
            )
          }
          console.log('Should REMOVE WORKSPACE ', shouldRemoveWorkspaceReq);
        }

        mainModifiedDate = new Date();
        console.log('Is Maintenance', isMaintenance);
        // THIS IS FOR MAINTENANCE REVIEW
        if (isMaintenance) {
          console.log('------------- \n Maintenance', columnsChanged);
          for (let pos = 11; pos <= 12; ++pos) {
            const valueYearHasChanged = beforeAmounts.values[`req${pos}`] !== amount.values[`req${pos}`];
            console.log(valueYearHasChanged, JSON.stringify(beforeAmounts.values) ,'value year', JSON.stringify(amount.values), `req${pos}`);
            if (valueYearHasChanged) {
              const currentColumn = pos;
              const currentCost = amount.values[`req${pos}`] ?? null;
              allPromises.push(
                boardService.updateAndCreateProjectCostsForAmounts(
                  currentColumn,
                  currentCost,
                  currentProjectId,
                  currentBusinessAssociatesId,
                  currentPartnerTypeId,
                  user,
                  board_project_id,
                  moment(mainModifiedDate)
                    .subtract(OFFSET_MILLISECONDS * pos)
                    .toDate(),
                  amount.code_cost_type_id,
                  isWorkPlan,
                  amountsTouched ? amountsTouched[`req${currentColumn}`] : true
                )
              );
            }
          }
        }
  
        await Promise.all(allPromises);
        if (( amount.code_partner_type_id === 88 && (isWorkPlan ? amount.code_cost_type_id === 21 : amount.code_cost_type_id === 22))) {
          let rank0 = null;
          let shouldMoveToWorkspace = true;
          // IF NO AMOUNTS MOVE CARD TO WORKSPACE
          for (let currentRank in allCurrentAmounts) {
            if (allCurrentAmounts[currentRank]) {
              shouldMoveToWorkspace = false;
            }
          }
          if (shouldMoveToWorkspace && !isMaintenance) {
            const projects = await BoardProject.findAll({
              where: {
                board_id: beforeUpdate.board_id,
                rank0: { [Op.ne]: null }
              },
              order: [[`rank${0}`, 'ASC']],
              limit: 1
            });
            if (projects.length === 0) {
              rank0 = LexoRank.middle().toString();
            } else {
              const firstProject = projects[0];
              rank0 = LexoRank.parse(firstProject[`rank0`]).genPrev().toString();
            }
          }
          // UPDATE PROJECTCOST WITH ALL NEW VALUES
          await BoardProject.update(
            {
              // rank0, req1, req2, req3, req4, req5, year1, year2,
              ...updateFields,
              last_modified_by: user.email
            },
            { where: { board_project_id } }
          );
  
          const updatedRanks = await BoardProject.findOne({
            attributes: ['rank0', 'rank1', 'rank2', 'rank3', 'rank4', 'rank5'],
            where: { board_project_id }
          });
          let hasSomeRank = false;
          Object.keys(updatedRanks.dataValues).forEach((key) => {
            if (updatedRanks.dataValues[key] !== null) {
              // THE PROJECT BOARD HAS SOME RANK IN SOME COLUMN
              hasSomeRank = true;
            }
          });
          if (!hasSomeRank) {
            await BoardProject.update(
              { rank0: LexoRank.middle().toString(), last_modified_by: user.email },
              { where: { board_project_id } }
            );
          }
          let boardProjectUpdated = await BoardProject.findOne({
            where: { board_project_id }
          });
          [boardProjectUpdated, statusHasChanged] = await determineStatusChange(
            wasOnWorkspace,
            boardProjectUpdated,
            board_id,
            user.email
          );
        }
        if (( amount.code_partner_type_id === 88 && (isWorkPlan ? amount.code_cost_type_id === 21 : amount.code_cost_type_id === 22))) {
          
          columnsChangesMHFD = (statusHasChanged ? [0, 1, 2, 3, 4, 5] : columnsChanged);
        }
    }
    console.log('------------- \n Columns changes final', columnsChangesMHFD);
    const allAmounts = await getAllPreviousAmounts(beforeUpdate, currentProjectId);
    const afterUpdate = await BoardProject.findOne({
      where: { board_project_id },
      include:[{
        model: Board,
        attributes: ['year']
      }]
    });
    const currentIsOnWorkspace = isOnWorkspace(afterUpdate);
    if (currentIsOnWorkspace) {
      const businessData = allAmounts.find((a) => a.code_partner_type_id === 88 && (isWorkPlan ? a.code_cost_type_id === 21 : a.code_cost_type_id === 22));
      // get project partner id
      const projectPartnerId = await ProjectPartner.findOne({
        attributes: ['project_partner_id'],
        where: {
          project_id: currentProjectId,
          business_associates_id: businessData.business_associates_id,
          code_partner_type_id: businessData.code_partner_type_id
        }
      });
      await saveWorkspaceCostInit(
        currentProjectId,
        board_project_id,
        isWorkPlan == 'true' ? COST_IDS.WORK_PLAN_CODE_COST_TYPE_ID: COST_IDS.WORK_REQUEST_CODE_COST_TYPE_ID,
        projectPartnerId.project_partner_id,
        user.email,
        null
      ) 
    }
    return res.status(200).send({
      ...allAmounts,
      columnsChanged: columnsChangesMHFD,
    });
  } else {
    return res.status(200).send({
      amount:[],
      columnsChanged: []
    });
  }
    
  } catch (error) {
    logger.error('ERROR At route cost' + error);
    return res.status(500).send({ error: error });
  }
};

export default updateCostNew;
