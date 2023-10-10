import { LexoRank } from 'lexorank';
import sequelize from 'sequelize';
import db from 'bc/config/db.js';
import moment from 'moment';
import logger from 'bc/config/logger.js';
import boardService from 'bc/services/board.service.js';
import { isOnWorkspace, determineStatusChange } from 'bc/services/board-project.service.js';

const BoardProject = db.boardProject;
const BoardProjectCost = db.boardProjectCost;
const ProjectCost = db.projectCost;
const ProjectPartner = db.projectPartner;
const CodeProjectPartnerType = db.codeProjectPartnerType;
const BusinessAssociates = db.businessAssociates;
const { Op } = sequelize;
const getAllPreviousAmounts = async (board_project_id, currentProjectId) => {
  const projectCostValues = await BoardProjectCost.findAll({
    attributes: ['req_position'],
    include: [
      {
        attributes: ['cost', 'project_cost_id', 'project_partner_id'],
        model: ProjectCost,
        as: 'projectCostData',
        where: {
          is_active: true
        },
        include: [
          {
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
          }
        ]
      }
    ],
    where: {
      board_project_id
    }
  });
  const returnValues = projectCostValues.map((a) => ({
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
  const getReqsValues = (currentValues) => {
    const returnObject = {};
    currentValues?.forEach((v) => {
      const stringPos = 'req' + v.pos;
      returnObject[stringPos] = v.cost;
    });
    for (let i = 1; i <= 5; ++i) {
      if (!returnObject['req' + i]) {
        returnObject['req' + i] = null;
      }
    }
    //TODO: add years if needed
    return returnObject;
  };
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
      project_id: currentProjectId
    }
  });
  const allBNWithPartner = allBusinessNamesRelatedToProject.map((abnrp) => ({
    business_name: abnrp.businessAssociateData ? abnrp.businessAssociateData[0].business_name : null,
    code_partner_type_id: abnrp.code_partner_type_id,
    business_associates_id: abnrp.businessAssociateData ? abnrp.businessAssociateData[0]?.business_associates_id : null
  }));
  const allPreviousAmounts = allBNWithPartner.map((bnnp) => {
    const bname = bnnp.business_name;
    const bid = bnnp.business_associates_id;
    const code_partner_type_id = bnnp.code_partner_type_id;
    const databyBN = groupedData[bname];
    if(bname === 'MHFD') {
      console.log('MHFD previous values are:', databyBN);
    }
    return {
      business_associates_id: bid,
      business_name: bname,
      code_partner_type_id: code_partner_type_id,
      values: getReqsValues(databyBN)
    };
  });
  return allPreviousAmounts;
};
const updateCostNew = async (req, res) => {
  logger.info('get board project cost by id');
  try {
    const { board_project_id } = req.params;
    const user = req.user;
    const { amounts, isMaintenance } = req.body; // ALL Amounts by sponsor, mhfd funding and cosponsors
    const beforeUpdate = await BoardProject.findOne({
      where: { board_project_id }
    });
    const board_id = beforeUpdate.board_id;
    const currentProjectId = beforeUpdate.project_id;
    let statusHasChanged;
    const allPreviousAmounts = await getAllPreviousAmounts(board_project_id, currentProjectId);
    console.log( amounts, 'This are All Previous amounts for ', currentProjectId, '\n\n *********** \n ', allPreviousAmounts);
    let columnsChangesMHFD = [0];
    for(let i = 0; i < amounts.length; ++i) {
        const amount = amounts[i];
        let updateFields = {};
        const wasOnWorkspace = isOnWorkspace(beforeUpdate); // based on RANK
        const columnsChanged = [0];
  
        const allCurrentAmounts = {}; // aqui se almacenan todos los reqs amounts
        // Returns all boarcproject cost related to the current board project
        // dentro de estos estan los costos de cada partner
        console.log('All previous amounts', allPreviousAmounts, 'searching for ', amount.business_name);
        const beforeAmounts = allPreviousAmounts.find((a) => a.business_name === amount.business_name);
        // check if exists because it could be a new partner that wasnt in previous amounts
        if (!beforeAmounts) {
          console.log('Jumped save for ', amount.business_name, 'because it doesnt exist');
          continue;
        }
        console.log('Before amounts have b a id  ', beforeAmounts);
        const currentBusinessAssociatesId = beforeAmounts?.business_associates_id;
        const currentPartnerTypeId = beforeAmounts?.code_partner_type_id;
        // EXCLUSIVO PARA MHFD FUNDING // PORQUE ES PARA AGREGAR O QUITAR CARDS DE ALGUNA COLUMNA
        if (amount.code_partner_type_id === 88) {
          for (let pos = 1; pos <= 5; pos++) {
            const reqColumnName = `req${pos}`;
            const rankColumnName = `rank${pos}`;
            const currentReqAmount = amount.values[reqColumnName] ?? null;
            const valueHasChanged = currentReqAmount === null ? true : beforeAmounts.values[reqColumnName] !== currentReqAmount;
            if (valueHasChanged) {
              columnsChanged.push(pos);
              allCurrentAmounts[reqColumnName] = currentReqAmount;
            } else {
              allCurrentAmounts[reqColumnName] = beforeAmounts.values[reqColumnName];
            }
            if (
              (beforeAmounts.values[reqColumnName] === null && currentReqAmount !== null) || // Si antes no habia valor y ahora hay valor nuevo
              (beforeUpdate[rankColumnName] === null && currentReqAmount !== null && valueHasChanged) // Si no hay posicion en el board (estaba vacio en esta columna) y ahora hay un valor nuevo
            ) {
              const where = {
                board_id: beforeUpdate.board_id,
                [rankColumnName]: { [Op.ne]: null } // Not equals null   =>   !== null
              };
              // Get all projects que no tengan un rank
              const projects = await BoardProject.findAll({
                where,
                order: [[rankColumnName, 'DESC']],
                limit: 1
              });
              if (projects.length === 0) {
                // si no hay un project con rank, entonces se le asigna el rank inicial
                updateFields[rankColumnName] = LexoRank.middle().toString();
              } else {
                // si hay projects que no existen en la columna
                // se saca el ultimo de la columna
                const lastProject = projects[0];
                console.log('Last project ', lastProject[rankColumnName]);
                updateFields[rankColumnName] = LexoRank.parse(lastProject[rankColumnName]).genNext().toString();
                // agregamos al final de la columna
              }
            } else if (currentReqAmount === null && !isMaintenance) {
              // Para eliminar de la columna
              updateFields[rankColumnName] = null;
            }
          }
        } else {
          for (let pos = 1; pos <= 5; pos++) {
            const reqColumnName = `req${pos}`;
            const valueHasChanged = beforeAmounts.values[reqColumnName] !== amount.values[reqColumnName];
            if (valueHasChanged) {
              columnsChanged.push(pos);
              allCurrentAmounts[reqColumnName] = amount.values[reqColumnName];
            } else {
              allCurrentAmounts[reqColumnName] = beforeAmounts.values[reqColumnName];
            }
          }
        }
  
        const allPromises = [];
        const offsetMillisecond = 35007;
        let mainModifiedDate = new Date();
        console.log('Columns changed', columnsChanged, 'for ', amount.business_name, 'with id', currentBusinessAssociatesId);
        for (let pos = 0; pos < columnsChanged.length; ++pos) {
          const currentColumn = columnsChanged[pos];
          if (currentColumn !== 0) {
            // NOt workspace
            const reqColumnName = `req${currentColumn}`;
            const currentReqAmount = amount.values[reqColumnName] ?? null;
            const currentCost = currentReqAmount;
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
                  .subtract(offsetMillisecond * pos)
                  .toDate()
              )
            );
          }
        }
        mainModifiedDate = new Date();
        // THIS IS FOR MAINTENANCE REVIEW
        if (isMaintenance) {
          for (let i = 1; i <= 2; ++i) {
            const valueYearHasChanged = beforeUpdate[`year${i}`] !== req.body[`year${i}`];
            if (valueYearHasChanged) {
              const currentColumn = 0; // due to limit in req position this value is whatever.
              const currentCost = req.body[`year${i}`] ? req.body[`year${i}`] : 0;
              allPromises.push(
                boardService.updateAndCreateProjectCosts(
                  currentColumn, // year1 = 6, year2 = 7
                  currentCost,
                  currentProjectId,
                  user,
                  board_project_id,
                  moment(mainModifiedDate)
                    .subtract(offsetMillisecond * (i + columnsChanged.length))
                    .toDate()
                )
              );
            }
          }
        }
  
        await Promise.all(allPromises);
        if (amount.code_partner_type_id === 88) {
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
          console.log('About to update boardproject ranks', updateFields);
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
        if (amount.code_partner_type_id == 88) {
          columnsChangesMHFD = (statusHasChanged ? [0, 1, 2, 3, 4, 5] : columnsChanged);
        }
    }
    const allAmounts = await getAllPreviousAmounts(board_project_id, currentProjectId);
    return res.status(200).send({
      ...allAmounts,
      columnsChanged: columnsChangesMHFD,
    });
  } catch (error) {
    logger.error('ERROR At route cost' + error);
    return res.status(500).send({ error: error });
  }
};
const updateCost = async (req, res) => {
  logger.info('get board project cost by id');
  try {
    const { board_project_id } = req.params;
    const user = req.user;
    const { req1, req2, req3, req4, req5, year1, year2, isMaintenance } = req.body;
    let updateFields = {};
    const beforeUpdate = await BoardProject.findOne({
      where: { board_project_id }
    });
    const wasOnWorkspace = isOnWorkspace(beforeUpdate); // based on RANK
    const board_id = beforeUpdate.board_id;
    const currentProjectId = beforeUpdate.project_id;
    const columnsChanged = [0];
    const allCurrentAmounts = {}; // aqui se almacenan todos los reqs amounts
    for (let pos = 1; pos <= 5; pos++) {
      const reqColumnName = `req${pos}`;
      const rankColumnName = `rank${pos}`;
      const valueHasChanged = beforeUpdate[reqColumnName] !== req.body[reqColumnName];
      if (valueHasChanged) {
        columnsChanged.push(pos);
        allCurrentAmounts[reqColumnName] = req.body[reqColumnName];
      } else {
        allCurrentAmounts[reqColumnName] = beforeUpdate[reqColumnName];
      }
      if (
        (beforeUpdate[reqColumnName] === null && req.body[reqColumnName] !== null) ||
        (beforeUpdate[rankColumnName] === null && req.body[reqColumnName] !== null && valueHasChanged)
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
        if (projects.length === 0) {
          updateFields[rankColumnName] = LexoRank.middle().toString();
        } else {
          const lastProject = projects[0];
          updateFields[rankColumnName] = LexoRank.parse(lastProject[rankColumnName]).genNext().toString();
        }
      } else if (beforeUpdate[reqColumnName] !== null && req.body[reqColumnName] === null && !isMaintenance) {
        updateFields[rankColumnName] = null;
      }
    }
    const allPromises = [];
    const offsetMillisecond = 35007;
    let mainModifiedDate = new Date();
    for (let pos = 0; pos < columnsChanged.length; ++pos) {
      const currentColumn = columnsChanged[pos];
      if (currentColumn !== 0) {
        // Not the workspace
        const reqColumnName = `req${currentColumn}`;
        const currentCost = req.body[reqColumnName] ? req.body[reqColumnName] : 0;
        allPromises.push(
          boardService.updateAndCreateProjectCosts(
            currentColumn,
            currentCost,
            currentProjectId,
            user,
            board_project_id,
            moment(mainModifiedDate)
              .subtract(offsetMillisecond * pos)
              .toDate()
          )
        );
      }
    }
    mainModifiedDate = new Date();
    // MAINTENANCE CASE REVIEW
    for (let i = 1; i <= 2; ++i) {
      const valueYearHasChanged = beforeUpdate[`year${i}`] !== req.body[`year${i}`];
      if (valueYearHasChanged) {
        const currentColumn = 0; // due to limit in req position this value is whatever.
        const currentCost = req.body[`year${i}`] ? req.body[`year${i}`] : 0;
        allPromises.push(
          boardService.updateAndCreateProjectCosts(
            currentColumn, // year1 = 6, year2 = 7
            currentCost,
            currentProjectId,
            user,
            board_project_id,
            moment(mainModifiedDate)
              .subtract(offsetMillisecond * (i + columnsChanged.length))
              .toDate()
          )
        );
      }
    }
    await Promise.all(allPromises);
    let rank0 = null;
    let shouldMoveToWorkspace = true;
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
    console.log('Value of rank0', rank0, 'shpould move', shouldMoveToWorkspace);
    await BoardProject.update(
      {
        rank0,
        req1,
        req2,
        req3,
        req4,
        req5,
        year1,
        year2,
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
    let statusHasChanged;
    [boardProjectUpdated, statusHasChanged] = await determineStatusChange(
      wasOnWorkspace,
      boardProjectUpdated,
      board_id,
      user.email
    );
    return res.status(200).send({
      newCost: {
        req1: boardProjectUpdated.req1,
        req2: boardProjectUpdated.req2,
        req3: boardProjectUpdated.req3,
        req4: boardProjectUpdated.req4,
        req5: boardProjectUpdated.req5,
        year1: boardProjectUpdated.year1,
        year2: boardProjectUpdated.year2
      },
      columnsChanged: statusHasChanged ? [0, 1, 2, 3, 4, 5] : columnsChanged
    });
  } catch (error) {
    logger.error('ERROR At route cost' + error);
    return res.status(500).send({ error: error });
  }
};

export default updateCostNew;
