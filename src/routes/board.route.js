import express from 'express';
import needle from 'needle';
import { LexoRank } from 'lexorank';
import auth from 'bc/auth/auth.js';
import { CREATE_PROJECT_TABLE, CARTO_URL } from 'bc/config/config.js';
import logger from 'bc/config/logger.js';
import db from 'bc/config/db.js';
import {
    getCoordsByProjectId,
    getProjectData
} from 'bc/services/mapgallery.service.js';
import { sendBoardNotification } from 'bc/services/user.service.js';
import boardService from 'bc/services/board.service.js';
import projectService from 'bc/services/project.service.js';
import moment from 'moment';
import { isOnWorkspace, isOnFirstYear } from 'bc/services/board-project.service.js';
import sequelize from 'sequelize';
import authOnlyEmail from 'bc/auth/auth-only-email.js';

const { Op } = sequelize;
const router = express.Router();
const Board = db.board;
const User = db.user;
const BoardProject = db.boardProject;
const BoardLocality = db.boardLocality;
const ProjectPartner = db.projectPartner;
const Project = db.project;
const ProjectServiceArea = db.projectServiceArea;
const ProjectCounty = db.projectCounty;
const CodeStateCounty = db.codeStateCounty;
const CodeServiceArea = db.codeServiceArea;
const CodeStatusType = db.codeStatusType;
const BusinessAssociate = db.businessAssociates;
const Configuration = db.configuration;
const BoardProjectCost = db.boardProjectCost;
const ProjectCost = db.projectCost;
const CodeProjectPartnerType = db.codeProjectPartnerType;
const BusinessAssociates = db.businessAssociates;

const insertUniqueObject = (array, idPropertyName, groupPropertyKeyName, object) => {
  const isDuplicate = array.some(item => {
    return item[idPropertyName] === object[idPropertyName] && item[groupPropertyKeyName] === object[groupPropertyKeyName];
  });

  if (!isDuplicate) {
    array.push(object);
  }
}

const DRAFT_STATUS = 1;
const REQUESTED_STATUS = 2;
const APPROVED_STATUS = 3;

router.get('/lexorank-update', async (req, res) => {
    const boards = await Board.findAll();
    const boardProjects = await BoardProject.findAll();
    const updates = {
        rank0: {},
        rank1: {},
        rank2: {},
        rank3: {},
        rank4: {},
        rank5: {}
    };
    const originPositions = ['position0', 'position1', 'position2', 'position3', 'position4', 'position5'];
    const positions =  ['rank0', 'rank1', 'rank2', 'rank3', 'rank4', 'rank5'];
    
    for (const board of boards) {
        let lexoRanks = {
            rank0: LexoRank.middle(),
            rank1: LexoRank.middle(),
            rank2: LexoRank.middle(),
            rank3: LexoRank.middle(),
            rank4: LexoRank.middle(),
            rank5: LexoRank.middle()
        };
        for (const [index, position] of originPositions.entries()) {
            boardProjects.sort((a, b) => {
                if (a[position] == null) return -1;
                if (b[position] == null) return 1;
                return a[position] - b[position];
            });
            for (const bp of boardProjects) {
                if (board.board_id === bp.board_id) {
                    if (bp[position] != null) {
                        const value = lexoRanks[positions[index]].toString();
                        if (!updates[positions[index]][value]) {
                            updates[positions[index]][value] = [];
                        }
                        updates[positions[index]][value].push(bp.board_project_id);
                        lexoRanks[positions[index]] = lexoRanks[positions[index]].genNext();
                    }
                }
            }
        }
    }
    let c = 0;
    console.log(updates);
    const prs = [];
    for (const position of positions) {
        for (const value in updates[position]) {
            c++;
            logger.info(`Updating ${position} to ${value} for ${updates[position][value]}`);
            prs.push(BoardProject.update(
                {
                    [position]: value,
                    last_modified_by: 'system'
                },
                {
                    where: {
                        board_project_id: updates[position][value]
                    }
                }
            ));
        }
    }
    await Promise.all(prs);
    res.send({
        counter: c,
    });
});

router.post('/filters', async (req, res) => {
  const { boardId } = req.body;
  const {
    locality,
    projecttype,
    type,
    year,
  } = boardId;
  const boards = await Board.findAll({
    attributes: ['board_id'],
    where: {
      type,
      year,
      locality,
      projecttype,
    },
  });
  const boardIds = boards.map(b => b.dataValues.board_id);

  logger.info(`Starting endpoint board/:id/filters with params ${JSON.stringify(boardIds, null, 2)}`);
  const boardProjects = (await BoardProject.findAll({
    where: { board_id: { [Op.in]: boardIds } },
    attributes: [
      'project_id',
      'code_status_type_id'
    ],
    include: [
      {
        attributes: ['status_name'],
        model: CodeStatusType,
      }
    ]
  })).map(d => d.dataValues);
  let localitiesData = await Promise.all(
    boardProjects.map(async (boardProject) => {
      let details;
      try {
        details = (await projectService.getLocalityDetails(
          boardProject.project_id
        )).dataValues;
      } catch (e) {
        logger.error(e);
      }
      if (details) {
        details.status = boardProjects.map(
          (psa) => ({
            status_id: psa?.code_status_type_id,
            status_name: psa?.code_status_type?.status_name,
          })
        );                
        if (details.project_service_areas && details.project_service_areas.length > 0) {
          details.project_service_areas = details.project_service_areas.map(
            (psa) => ({
              code_service_area_id: psa?.code_service_area_id,
              service_area_name: psa?.CODE_SERVICE_AREA?.service_area_name,
            })
          );
        }
        if (details.project_counties && details.project_counties.length > 0) {
          details.project_counties = details.project_counties.map(
            (pc) => ({
              state_county_id: pc?.state_county_id,
              county_name: pc?.CODE_STATE_COUNTY?.county_name,
            })
          );
        }
        if (details.project_local_governments && details.project_local_governments.length > 0) {
          details.project_local_governments = details.project_local_governments.map(
            (plg) => {
              return ({
                code_local_government_id: plg?.code_local_government_id,
                local_government_name: plg?.CODE_LOCAL_GOVERNMENT?.local_government_name,
              });
            }
          );
        }
        if (details.currentId && details.currentId.length > 0) {
          details.currentId = details.currentId.map(
            (plg) => {
              return ({
                code_status_type_id: plg?.code_phase_type.code_status_type?.code_status_type_id,
                status_name: plg?.code_phase_type?.code_status_type?.status_name,
              });
            }
          );
        }        
        if (details.project_partners && details.project_partners.length > 0) {
          details.project_partners = details.project_partners.map(
            (plg) => {
              return ({
                partner_id: plg?.business_associate?.business_associates_id,      
                partner_name: plg?.business_associate?.business_name,          
              });
            }
          );
        }
      }
      return details;
    })
  );
  const groupingArray = [
    ['project_counties', 'county_name', 'state_county_id'],
    ['project_service_areas', 'service_area_name', 'code_service_area_id'],
    ['project_local_governments', 'local_government_name', 'code_local_government_id'],
    ['currentId', 'status_name', 'code_status_type_id'],
    ['project_partners', 'partner_name', 'partner_id'],
    ['status', 'status_name', 'status_id']
  ];
  const groupingArrayMap = {
    project_counties: [],
    project_service_areas: [],
    project_local_governments: [],
    currentId: [],
    project_partners: [],
    status: []
  };
  localitiesData.forEach((localityData) => {
    if (!localityData) return;
    groupingArray.forEach(([groupProperty, groupPropertyKeyName, idPropertyName]) => {
      const groupPropertyValue = localityData[groupProperty];
      if (groupPropertyValue == null) return;
      groupPropertyValue.forEach((propertyValueElement) => {
        insertUniqueObject(groupingArrayMap[groupProperty], idPropertyName, groupPropertyKeyName, propertyValueElement);
      });
    })
  });
  groupingArrayMap.project_service_areas.sort((a,b) => (a.code_service_area_id > b.code_service_area_id) ? 1 : ((b.code_service_area_id > a.code_service_area_id) ? -1 : 0))
  groupingArrayMap.project_counties.sort((a,b) => (a.state_county_id > b.state_county_id) ? 1 : ((b.state_county_id > a.state_county_id) ? -1 : 0))
  logger.info(`Finished endpoint for board/:id/filters`);
  res.send(groupingArrayMap);
});

router.get('/coordinates/:pid', async (req, res) => {
    logger.info(`Starting endpoint board/coordinates/:pid with params ${JSON.stringify(req.params, null, 2)}`);
    let { pid } = req.params;
    logger.info(`Starting function getCoordsByProjectId for endpoint board/coordinates/:pid`);
    let r = await getCoordsByProjectId(pid, true);
    logger.info(`Finished function getCoordsByProjectId for endpoint board/coordinates/:pid`);
    res.send(r);
});

router.get('/', async (req, res) => {
    logger.info(`Starting endpoint board/ with params ${JSON.stringify(req.params, null, 2)}`);
    logger.info(`Starting function findAll for board/`);
    let boards = await Board.findAll();
    logger.info(`Finished function findAll for board/`);
    console.log('boards', boards, boards.length);
    res.send(boards);
});

router.put('/update-budget', [authOnlyEmail], async (req, res) => {
    logger.info(`Starting endpoint board/update-budget/:id with params ${JSON.stringify(req.params, null, 2)}`);
    const { boardId, budget } = req.body;
    const {
      locality,
      projecttype,
      type,
      year,
    } = boardId;
    const board = await Board.findOne({
      where: {
        type,
        year,
        locality,
        projecttype,
      },
      order: [['createdAt', 'ASC']]
    });
    logger.info(`Finished function findByPk for board/update-budget/:id`);
    if (board) {
        board.total_county_budget =  budget;
        board.last_modified_by = req.user.email;
        await board.save();
        res.send(board);
    } else {
        res.status(404).send({ error: 'Not found' });
    }
});

router.get('/projects/:bid', async (req, res) => {
    logger.info(`Starting endpoint board/projects/:bid with params ${JSON.stringify(req.params, null, 2)}`)
    let { bid } = req.params;
    logger.info(`Starting function findAll for board/projects/:bid`);
    let boardProjects = await BoardProject.findAll({
        where: {
            board_id: bid
        }
    });
    logger.info(`Finished function findAll for board/projects/:bid`);
    console.log('boardProjects', boardProjects, boardProjects.length);
    res.send(boardProjects);
});

router.put('/project/:id', [auth], async (req, res) => {
    logger.info(`Starting endpoint board/project/:id with params ${JSON.stringify(req.params, null, 2)}`)
    let { id } = req.params;
    let { 
        originPosition0,
        originPosition1,
        originPosition2,
        originPosition3,
        originPosition4,
        originPosition5
    } = req.body;
    logger.info(`Starting function findOne for board/projects/:id`);
    let boardProject = await BoardProject.findOne({
        where: {
            board_project_id: id
        }
    });
    logger.info(`Finished function findOne for board/projects/:id`);
    boardProject.originPosition0 = originPosition0;
    boardProject.originPosition1 = originPosition1;
    boardProject.originPosition2 = originPosition2;
    boardProject.originPosition3 = originPosition3;
    boardProject.originPosition4 = originPosition4;
    boardProject.originPosition5 = originPosition5;
    boardProject.last_modified_by = req.user.email;
    logger.info(`Starting function save for board/projects/:id`);
    await boardProject.save();
    logger.info(`Finished function save for board/projects/:id`);
    res.send(boardProject);
});

router.post('/projectdata', async (req, res) => {
    logger.info(`Starting endpoint board/projectdata with params ${JSON.stringify(req.params, null, 2)}`)
  let body = req.body;
  let {projectid, projecttype} = body;
  if (!projectid) {
    return res.sendStatus(404);
  }
  let project = null;
  try {
    logger.info(`Starting function getProjectData for board/projectdata`);
      project = await getProjectData(projectid, projecttype);
    logger.info(`Finished function getProjectData for board/projectdata`);
  } catch(e) {
      console.log('Error in project Promises ', e);
  }
  res.send(project);
});

router.post('/get-status', async (req, res) => {
    const { type, year, locality } = req.body;
    let boardWhere = {
      type,
      year,
      locality,
    };
    boardWhere = applyLocalityCondition(boardWhere);
    const boards = await Board.findAll({
      attributes: ['status'],
      where: boardWhere,
    });
    const boardStatus = boards.map(b => b.dataValues.status);
    let isApproved = false;
    boardStatus.forEach((status) => {
      isApproved = isApproved || (status === 'Approved');
    });
    if (isApproved) {
      res.send({
        status: 'Approved',
      });
    } else {
      res.send({
        status: 'Under Review',
      });
    }
});

router.post('/get-or-create', async (req, res) => {
  logger.info(`Starting endpoint board/get-or-create`)
  let body = req.body;
  let { type, year, locality, projecttype } = body;
  let boardWhere = {
    type,
    year,
    locality,
    projecttype,
  }
  boardWhere = applyLocalityCondition(boardWhere);
  let board = await Board.findOne({
    where: boardWhere,
    order: [['createdAt', 'ASC']]
  });
  if (!board) {
    logger.info(`Finished endpoint for board/get-or-create`);
    res.status(404).send({
      error: 'Board Not Found'
    });
  } else {
    logger.info(`Finished endpoint for board/get-or-create`);
    res.send(board);
  }
});

router.post('/get-past-data', async (req, res) => {
  try {
    let { boardId } = req.body;
    const {
      locality,
      projecttype,
      type,
      year,
    } = boardId;
    const boards = await Board.findAll({
      attributes: ['board_id'],
      where: {
        type,
        year: {
          [Op.lt]: year,
        },
        locality,
        projecttype,
      },
    });
    const boardIds = boards.map(b => b.dataValues.board_id);
    const boardProjects = await BoardProject.findAll({
      attributes: ['project_id', 'req1', 'board_id'],
      where: {
        board_id: {
          [Op.in]: boardIds,
        },
      },
    });
    const result = [];
    boardProjects.forEach(item => {
      const existingProject = result.find(proj => proj.project_id === item.project_id);
      if (existingProject) {
        existingProject.totalreq += item.req1;
      } else {
        result.push({ "project_id": item.project_id, "totalreq": item.req1 });
      }
    });
    return res.send(result);
  } catch (error) {
    logger.error('ERROR AT GET-PAST-DATA ' + error)
    return res.status(500).send('Internal server error');
  }
})

router.post('/board-for-positions2', async (req, res) => { 
  logger.info(`Starting endpoint board/board-for-positions2 with params ${JSON.stringify(req.body, null, 2)}`)
  try {
    let { boardId, position, filters } = req.body;
    const {
      locality,
      projecttype,
      type,
      year,
    } = boardId;
    const {
      project_priorities,
      status_board
    } = filters || {};
    if (position === undefined || position === null) {
      return res.sendStatus(400);
    }
    let boardWhere = {
      type,
      year,
      locality,
      projecttype,
    };
    boardWhere = applyLocalityCondition(boardWhere);
    const boards = await Board.findAll({
      attributes: ['board_id', 'type'],
      where: boardWhere,
    });
    const boardIds = boards.map(b => b.dataValues.board_id);
    const isWorkPlan = type === 'WORK_PLAN';
    const rankColumnName = `rank${position}`;
    const reqColumnName = `req${position}`;
    const originPositionColumnName = `originPosition${position}`;
    const attributes = [
      'board_project_id',
      'project_id',
      'projectname',
      rankColumnName,
      'origin',
      originPositionColumnName,
      'code_status_type_id',
    ];
    const where = {
      board_id: {[Op.in]: boardIds},
      [rankColumnName]: { [Op.ne]: null }
    };
  
    if(projecttype === 'Maintenance') {
      let maintenanceSubtype = 0;
      switch (position) {
        case 1:
          maintenanceSubtype = 8;
          break;
        case 2:
          maintenanceSubtype = 11;
          break;
        case 3:
          maintenanceSubtype = 9;
          break;
        case 4:
          maintenanceSubtype = 17;
          break;
        case 5:
          maintenanceSubtype = 7;
          break;
        default:
          break;
      } 
      if (maintenanceSubtype !== 0) {
        filters.projecttype = [maintenanceSubtype];
      }
    }
    // THIS is going to be replaced with MHFD owner in PROJECT COST 
    // if (`${position}` !== '0') {
    //   attributes.push(reqColumnName);
    // }
    if (project_priorities && project_priorities.length > 0) {
      const conditions = [];
      const lessThan3Priorities = project_priorities.filter(r => r < 3);
      if (lessThan3Priorities.length !== 0) {
        conditions.push({ [originPositionColumnName]: {[Op.in]: lessThan3Priorities}})
      }
      if (project_priorities.includes(3)) {
        conditions.push({ [originPositionColumnName]: {[Op.gte]: 3} })
      }
      if (project_priorities.includes(4)) {
        conditions.push({[originPositionColumnName]: {[Op.eq]: null}})
      }
      where[Op.or] = conditions;
    }
    if (status_board && status_board.length > 0) {
      where.code_status_type_id = status_board;
    }
    const boardProjects = (await BoardProject.findAll({
      attributes,
      where,
      order: [[rankColumnName, 'ASC']],
    })).map(d => d.dataValues);
    
    if (`${position}` !== '0') {
      const boardProjectIds = boardProjects.map((boardProject) => boardProject.board_project_id);
      const MHFD_FUNDING = 88; // TODO export to constant
      
      const projectIds = boardProjects.map((boardProject) => boardProject.project_id);
      
      const MHFD_Partner = await ProjectPartner.findAll({
        where: {
          project_id: { [Op.in]: projectIds },
          code_partner_type_id: MHFD_FUNDING
        }
      });

      const Mhfd_ids = MHFD_Partner.map((mhfd) => mhfd.project_partner_id);
      const WORK_PLAN_CODE_COST_TYPE_ID = 21;
      const WORK_REQUEST_CODE_COST_TYPE_ID = 22;
      const projectCostValues = await BoardProjectCost.findAll({
        attributes: ['req_position', 'board_project_id'],
        include: [{
          attributes: ['cost', 'project_cost_id', 'project_partner_id', 'project_id'],
          model: ProjectCost,
          as: 'projectCostData',
          where: {
            is_active: true,
            project_partner_id: { [Op.in]: Mhfd_ids },
            code_cost_type_id: isWorkPlan ? WORK_PLAN_CODE_COST_TYPE_ID: WORK_REQUEST_CODE_COST_TYPE_ID
          }
        }],
        where: {
          board_project_id: boardProjectIds,
          req_position: position
        }
      });
      boardProjects.forEach((boardProject) => {
        const projectCostValue = projectCostValues.find((pcv) => pcv.board_project_id === boardProject.board_project_id);
        if (projectCostValue) {
          boardProject[`req${position}`] = projectCostValue.projectCostData.cost;
        }
      });
    }

    console.log('boardProjects', boardProjects, boardProjects.length)
    const projects_filtered = await projectService.filterProjectsBy(filters);
    const projectIds = boardProjects.filter(boardProject => projects_filtered.map(p => p.project_id).includes(boardProject.project_id));
    const lightDetails = await projectService.getLightDetails(projectIds.map(p => p.project_id));   
    let boardProjectsWithData = projectIds.map((boardProject) => {
      let details = lightDetails.find(d => d.project_id === boardProject.project_id);
      if (details) {
        details = details.dataValues;
        if (details.project_service_areas && details.project_service_areas.length > 0) {
          details.project_service_areas = details.project_service_areas.map(
            (psa) => {
              if (psa.CODE_SERVICE_AREA) {
                return {
                  code_service_area_id: psa.code_service_area_id,
                  service_area_name: psa.CODE_SERVICE_AREA.service_area_name,
                };
              } else {
                return {
                  code_service_area_id: psa.code_service_area_id,
                  service_area_name: psa.service_area_name,
                };
              }
            }
          );
        }
        if (details.project_counties && details.project_counties.length > 0) {
          details.project_counties = details.project_counties.map(
            (pc) => {
              if (pc.CODE_STATE_COUNTY) {
                return {
                  state_county_id: pc.state_county_id,
                  county_name: pc.CODE_STATE_COUNTY.county_name,
                };
              } else {
                return {
                  state_county_id: pc.state_county_id,
                  county_name: pc.county_name,
                };
              }
            }
          );
        }
        if (details.project_local_governments && details.project_local_governments.length > 0) {
          details.project_local_governments = details.project_local_governments.map(
            (plg) => {
              if (plg.CODE_LOCAL_GOVERNMENT) {
                return {
                  code_local_government_id: plg.code_local_government_id,
                  local_government_name: plg.CODE_LOCAL_GOVERNMENT.local_government_name,
                };
              } else {
                return {
                  code_local_government_id: plg.code_local_government_id,
                  local_government_name: plg.local_government_name,
                };
              }
            }
          );
        }
        if (details.currentId && details.currentId.length > 0) {
          details.currentId = details.currentId.map(
            (current) => {
              return {
                code_status_type_id: current?.code_phase_type?.code_status_type?.code_status_type_id,
                status_name: current?.code_phase_type?.code_status_type?.status_name,
                code_project_type_id: current?.code_phase_type?.code_project_type?.code_project_type_id,
                code_phase_type_id: current?.code_phase_type?.code_phase_type_id,
                phase_name: current?.code_phase_type?.phase_name
              };
            }
          )
        }
        if (details.project_partners && details.project_partners.length > 0) {
          details.project_partners_for_total = details.project_partners.map(
            (current) => {
              return {
                project_partner_id: current?.project_partner_id,
                business_name: current?.business_associate?.business_name,
              };
            }
          )
        }else{
          details.project_partners_for_total = [{
            business_name: 'No Sponsor'
          }]
        }
      }
      boardProject.projectData = details;
      return boardProject;
    })
    logger.info(`Finished endpoint for board/board-for-positions2`);
    res.send(boardProjectsWithData.filter(r => r.projectData));
  } catch (error) {
    logger.error('ERROR AT POSITIONS2 ' + error);
    return res.status(500).send({ error });
  }
});

router.post('/', async (req, res) => {
    logger.info(`Starting endpoint board/ with params ${JSON.stringify(req.params, null, 2)}`)
  let body = req.body;
  let { type, year, locality, projecttype } = body;
  if (locality === 'Mile High Flood District') {
    locality = 'MHFD District Work Plan';
  }
  if (!type || !year || !locality || !projecttype) {
    return res.sendStatus(400);
  }
  logger.info('SEARCHING IN BOARD');
  logger.info(`Starting function findOne for board/`);
  const boards = await Board.findAll({
    attributes: ['board_id'],
    where: {
      type,
      year,
      locality,
      projecttype,
    },
  });
  const boardIds = boards.map(b => b.dataValues.board_id);
  logger.info(`Finished function findOne for board/`);
  logger.info(`Starting function findAll for board/`);
  let boardProjects = await BoardProject.findAll({
    where: {
      board_id: { [Op.in]: boardIds },
    },
  });
  logger.info(`Finished function findAll for board/`);
  let projectsPromises = boardProjects
    .filter((bp) => !!bp.project_id)
    .map(async (bp) => {
      let project = null;
      try {
        project = projectService.findProject(+bp.project_id);
        if (!project) {
          logger.info(`${bp.project_id} not found`);
          logger.info(`Starting function getDetails for board/`);
          //project = await projectService.getDetails(bp.project_id);
          logger.info(`Finished function getDetails for board/`);
        }
      } catch (error) {
        console.log('Error in project Promises ', error);
      }
      let newObject = {
        id: bp.id,
        project_id: bp.project_id,
        origin: bp.origin,
        projectData: {},
      };
      for (let i = 0; i <= 5; i++) {
        newObject[`position${i}`] = bp[`position${i}`];
        newObject[`originPosition${i}`] = bp[`originPosition${i}`];
        if (i > 0) {
          newObject[`req${i}`] = bp[`req${i}`];
        }
        if (1 <= i && i <= 2) {
          newObject[`year${i}`] = bp[`year${i}`];
        }
      }
      return !project?.error && newObject;
    });
    logger.info(`Starting function all for board/`);
    let resolvedProjects = await Promise.all(projectsPromises);
    logger.info(`Finished function all for board/`);
    logger.info(`RESOLVERD PROJECTS: `);
    // console.log(resolvedProjects)
    resolvedProjects = resolvedProjects?.filter((bp) => bp.projectData != null);
    let projects = resolvedProjects || [];
    logger.info('FINISHING BOARD REQUEST');
    res.send({
      projects,
    });
});

const getBoard = async (type, locality, year, projecttype, creator) => {
    let board = await Board.findOne({
        where: {
            type, year, locality, projecttype
        }
    });
    if (board) {
        return board;
    } else {
        const newBoard = await boardService.createNewBoard(
          type,
          year,
          locality,
          projecttype,
          'Under Review',
          creator,
          null,
          null
        );
        return newBoard;        
    }
}

const moveBoardProjectsToNewYear = async (boardProjects, newYear, creator) => {
  console.log('moveBoardProjectsToNewYear')
  console.log(newYear)
  await Configuration.update({
    value: newYear,
  }, {
    where: {
      key: 'BOARD_YEAR',
    }
  });
  for (let i = 0 ; i < boardProjects.length ; i++) {
    const boardProject = boardProjects[i];
    console.log('boardProject');
    console.log(boardProject);
    //TODO EDIT AMOUNT: ONLY GETS SPONSOR PARTNER. SHOULD BE MHFD NOW? 
    const partner = await ProjectPartner.findOne({
      attributes: ['business_associates_id'],
      where: {
        project_id: boardProject.project_id,
        code_partner_type_id: 11
      }
    });
    const businessAssociate = await BusinessAssociate.findOne({
      attributes: ['business_name'],
      where: {
        business_associates_id: partner.business_associates_id
      }
    });
    const sponsor = businessAssociate.business_name;
    const previousBoard = await Board.findOne({
      attributes: ['projecttype'],
      where: { board_id: boardProject.board_id }
    })
    let newBoardParams = {
      year: newYear,
      projecttype: previousBoard.projecttype,
    };
    // ???
    if (sponsor === 'MHFD') { // have been created direclty in workplan
      newBoardParams = {
        ...newBoardParams,
        locality: 'MHFD District Work Plan',
        type: 'WORK_PLAN',
      }
    } else {
      newBoardParams = {
        ...newBoardParams,
        locality: sponsor,
        type: 'WORK_REQUEST',
      }
    }

    let newBoard;
    try {
      newBoard = await Board.findOne({
        where: newBoardParams,
      });
    } catch (error) {
      console.log('Error in project Promises ', error);
    }
    newBoardParams = {
      ...newBoardParams,
      last_modified_by: creator,
      created_by: creator,
    };
    if (newBoard === null) {
      const newBoardInstance = new Board(newBoardParams);
      newBoard = await newBoardInstance.save();  
    }
    const onWorkspace = isOnWorkspace(boardProject);
    const onFirstYear = isOnFirstYear(boardProject); // if on first year then move it to workspace

    let newBoardProjectParams = {
      board_id: newBoard.board_id,
      project_id: boardProject.project_id,
      year1: boardProject.year1,
      year2: boardProject.year2,
      origin: sponsor,
      code_status_type_id: REQUESTED_STATUS,
      created_by: creator,
      last_modified_by: creator,
    };
    if (onWorkspace || onFirstYear) {
      // both to workspace
      newBoardProjectParams = {
        ...newBoardProjectParams,
        rank0: boardProject.rank0 || LexoRank.middle(),
      }
    } else {
      // if it has values for years
      newBoardProjectParams = {
        ...newBoardProjectParams,

        rank1: boardProject.rank2,
        req1: boardProject.req2,
  
        rank2: boardProject.rank3,
        req2: boardProject.req3,
  
        rank3: boardProject.rank4,
        req3: boardProject.req4,
  
        rank4: boardProject.rank5,
        req4: boardProject.req5,
        rank5: null,
        req5: null,
      }
    }
    // TODO EDIT AMOUNT: here is where PROJECT COSTS should be added 
    // first check out what happened before with partners. 
    const newBoardProjectInstance = new BoardProject(newBoardProjectParams);
    await newBoardProjectInstance.save();
    // boardproject id from newboardprojectinstatnce
  }
};

const updateProjectStatus = async (boards, creator) => {
  logger.info(`Starting function updateProjectStatus for board/`);
  const prs = [];
  for (const board of boards) {
    prs.push(
      BoardProject.findAll({
        where: {
          board_id: board.board_id,
        },
      })
    );
  }
  let boardProjects = (await Promise.all(prs)).flat();
  return boardProjects.map((boardProject) => {
    if (!isOnWorkspace(boardProject) && boardProject.code_status_type_id !== APPROVED_STATUS) {
      boardProject.code_status_type_id = APPROVED_STATUS;
      boardProject.last_modified_by = creator;
      boardProject.save();
    }
    return boardProject;
  })
};

const getOriginPositionMap = (boardProjects) => {
  const columns = [0, 1, 2, 3, 4, 5];
  const originPositionMap = {};
  columns.forEach(columnNumber => {
    const rankName = `rank${columnNumber}`;
    const reqName = `req${columnNumber}`;
    let arr = [];
    for (var j = 0 ; j < boardProjects.length ; j++) {
      let bp = boardProjects[j];
      if (columnNumber === 0) {
        let isEmptyBoardProject = true;
        columns.forEach(cNumber => {
          if (cNumber === 0) return;
          isEmptyBoardProject = isEmptyBoardProject && (!bp[`rank${cNumber}`] && !bp[`req${cNumber}`]);
        })
        if (isEmptyBoardProject) {
          arr.push({
            bp,
            value: bp[rankName]
          });
        }
      } else {
        if (bp[rankName] || bp[reqName]) {
          arr.push({
              bp,
              value: bp[rankName]
          });
        }
      }
    }
    arr.sort();
    arr.forEach((r, arrayIndex) => {
      if (!originPositionMap[r.bp.project_id]) {
          originPositionMap[r.bp.project_id] = {}
      }
      originPositionMap[r.bp.project_id][columnNumber] = arrayIndex;
    });
  });
  return originPositionMap;
}

const sendBoardProjectsToProp = async (boards, prop, creator) => {
  let include;
  let relationshipProp;
  let codeProp;
  if (prop === 'servicearea') {
    relationshipProp = 'project_service_areas';
    codeProp = 'CODE_SERVICE_AREA';
    include = {
      model: ProjectServiceArea,
      separate: true,
      required: false,
      include: {
        model: CodeServiceArea,
        required: false,
        attributes: [
          ['service_area_name', 'name']
        ]
      }
    };
  } else {
    relationshipProp = 'project_counties';
    codeProp = 'CODE_STATE_COUNTY';
    include = {
      model: ProjectCounty,
      required: false,
      separate: true,
      include: {
        model: CodeStateCounty,
        required: false,
        attributes: [
          ['county_name', 'name']
        ]
      },
    }
  }
  for (var i = 0 ; i < boards.length ; i++) {
      let board = boards[i].dataValues;
      let boardProjects = await BoardProject.findAll({ where: { board_id: board.board_id } });
      const originPositionMap = getOriginPositionMap(boardProjects);
      console.log('originPositionMap', originPositionMap);
      for (var j = 0 ; j < boardProjects.length ; j++) {
          let bp = boardProjects[j];
          let p = (await Project.findOne({
            where: { project_id: bp.project_id },
            include
          })).dataValues;
          let propValues = p[relationshipProp];
          for (let k = 0 ; k < propValues.length ; k++) {
              let propVal = propValues[k][codeProp].dataValues.name;
              if (prop === 'county' && !propVal.includes('County')) {
                  propVal = propVal.trimEnd().concat(' County');
              } else if (prop === 'servicearea' && !propVal.includes(' Service Area')) {
                  propVal = propVal.trimEnd().concat(' Service Area');
              }
              let destinyBoard = await getBoard('WORK_PLAN', propVal, board.year, board.projecttype, creator);
              logger.info(`Destiny board by prop ${prop} id is ${destinyBoard !== null ? destinyBoard.board_id : destinyBoard}`);
              if (destinyBoard === null || destinyBoard.board_id === null) {
                logger.info('Destiny board not found');
                continue;
              }
              const countIXConstraint = await BoardProject.count({
                where: {
                  board_id: destinyBoard.board_id,
                  project_id: bp.project_id,
                  origin: board.locality
                }
              });
              console.log('countIXConstraint', countIXConstraint);
              if (countIXConstraint === 0) {
                let newBoardProject = new BoardProject({
                    board_id: destinyBoard.board_id,
                    project_id: bp.project_id,
                    rank0: bp.rank0,
                    rank1: bp.rank1,
                    rank2: bp.rank2,
                    rank3: bp.rank3,
                    rank4: bp.rank4,
                    rank5: bp.rank5,
                    originPosition0: originPositionMap[bp.project_id][0],
                    originPosition1: originPositionMap[bp.project_id][1],
                    originPosition2: originPositionMap[bp.project_id][2],
                    originPosition3: originPositionMap[bp.project_id][3],
                    originPosition4: originPositionMap[bp.project_id][4],
                    originPosition5: originPositionMap[bp.project_id][5],
                    req1: bp.req1 == null ? null : (bp.req1 / propValues.length),
                    req2: bp.req2 == null ? null : (bp.req2 / propValues.length),
                    req3: bp.req3 == null ? null : (bp.req3 / propValues.length),
                    req4: bp.req4 == null ? null : (bp.req4 / propValues.length),
                    req5: bp.req5 == null ? null : (bp.req5 / propValues.length),
                    year1: bp.year1,
                    year2: bp.year2,
                    origin: board.locality,
                    code_status_type_id: REQUESTED_STATUS,
                    created_by: creator,
                    last_modified_by: creator,
                });
                const newBoardProjectCreated = await newBoardProject.save();
                const offsetMillisecond = 35000;
                let mainModifiedDate = new Date();
                console.log('New Board Proejct Created', newBoardProjectCreated, newBoardProjectCreated.board_project_id);
                for (let i = 1 ; i <= 5 ; ++i) {
                  await boardService.updateAndCreateProjectCosts(
                    i,
                    newBoardProject[`req${i}`]? newBoardProject[`req${i}`] : 0,
                    bp.project_id,
                    {email: creator},
                    newBoardProjectCreated.board_project_id,
                    moment(mainModifiedDate).subtract( offsetMillisecond * i).toDate()
                  );
                }
              }
          }
      }
  }
}

const sendBoardProjectsToDistrict = async (boards, creator) => {
    try {
        logger.info(`Starting function findAll for board/`, creator, '<- creator should be!!');
        for (let board of boards) {
            console.log(board, "current board");
            let destinyBoard = await getBoard('WORK_PLAN', 'MHFD District Work Plan', board.year, board.projecttype, creator);
            BoardProject.findAll({
                where: {
                    board_id: board.board_id
                }
            }).then((async (boardProjects) => {
                const originPositionMap = getOriginPositionMap(boardProjects);
                const prs = [];
                const WORKPLAN_CODE_COST = 21;
                const projectIdsInOrder = [];
                try {
                for (const bp of boardProjects) {
                    projectIdsInOrder.push(bp.project_id);
                    // prs.push(
                      const boardProjectCreated = await BoardProject.create({
                        board_id: destinyBoard.board_id,
                        project_id: bp.project_id,
                        rank0: bp.rank0,
                        rank1: bp.rank1,
                        rank2: bp.rank2,
                        rank3: bp.rank3,
                        rank4: bp.rank4,
                        rank5: bp.rank5,
                        originPosition0: originPositionMap[bp.project_id][0],
                        originPosition1: originPositionMap[bp.project_id][1],
                        originPosition2: originPositionMap[bp.project_id][2],
                        originPosition3: originPositionMap[bp.project_id][3],
                        originPosition4: originPositionMap[bp.project_id][4],
                        originPosition5: originPositionMap[bp.project_id][5],
                        req1: bp.req1,
                        req2: bp.req2,
                        req3: bp.req3,
                        req4: bp.req4,
                        req5: bp.req5,
                        year1: bp.year1,
                        year2: bp.year2,
                        origin: board.locality,
                        code_status_type_id: bp.code_status_type_id,
                        parent_board_project_id: bp.board_project_id,
                        created_by: creator,
                        last_modified_by: creator,
                    });
                    console.log('Board Project created', boardProjectCreated);
                    const currentProjectId = bp.project_id;
                    const newBoardProjectId = boardProjectCreated.board_project_id;
                    console.log('new board proejct id', newBoardProjectId);
                    // INFO: this project cost copy was commented because now workplan and workrequest have independent costs 
                    // get all project costs related to the current project
                    // const prevCostOfProject = await ProjectCost.findAll({
                    //   where: {
                    //     project_id: currentProjectId,
                    //     is_active: true,
                    //     code_cost_type_id: 22
                    //   },
                    //   include: [{
                    //     model: ProjectPartner,
                    //     as: 'projectPartnerData',
                    //     include: [
                    //       {
                    //         model: CodeProjectPartnerType,
                    //         as: 'projectPartnerTypeData'
                    //       },
                    //       {
                    //         model: BusinessAssociates,
                    //         as: 'businessAssociateData'
                    //       }
                    //     ]
                    //   }]
                    // });
                    // console.log(prevCostOfProject.length, 'prevcostofproject', JSON.stringify(prevCostOfProject), 'forprojectid', currentProjectId);
                    // // create new projectcosts for the new board project copying values of the previous ones but changing the project_partner_id to the new one
                    // let mainModifiedDate = new Date();
                    // const offsetMillisecond = 35007;
                    // for (let j = 0 ; j < prevCostOfProject.length ; j++) {
                    //   console.log('inside for provcostofproject', j, creator);
                    //   const prevCostOfSponsor = prevCostOfProject[j];
                    //   const lastModifiedDate = moment(mainModifiedDate)
                    //   .subtract(offsetMillisecond * j)
                    //   .toDate()
                    //   // here we are duplicating the previous cost with the same partner but with code cost type of workplan
                    //   console.trace(' XXX PROJECTCOST CREATE', currentProjectId, '\n ******** \n', JSON.stringify(prevCostOfSponsor));
                    //   const newProjectCost = await ProjectCost.create({
                    //     project_id: currentProjectId,
                    //     cost: prevCostOfSponsor.cost,
                    //     code_cost_type_id: prevCostOfSponsor.code_cost_type_id,
                    //     project_partner_id: prevCostOfSponsor.projectPartnerData.project_partner_id,
                    //     created_by: creator,
                    //     modified_by: creator,
                    //     is_active: 1,
                    //     last_modified: lastModifiedDate
                    //   });
                    //   console.log('new project cost created', newProjectCost);

                    //   // select req_position of the previous board project cost where prevcostofsponsor is the project_cost_id
                    //   const prevBoardProjectCost = await BoardProjectCost.findOne({
                    //     where: {
                    //       project_cost_id: prevCostOfSponsor.project_cost_id
                    //     }
                    //   });
                    //   console.log('XXX Creating new relation boardporject-cost', newBoardProjectId, newProjectCost.project_cost_id, prevBoardProjectCost.req_position);
                    //   const newBoardProjectCost = await BoardProjectCost.create({
                    //     board_project_id: newBoardProjectId,
                    //     project_cost_id: newProjectCost.project_cost_id,
                    //     created_by: creator,
                    //     last_modified_by: creator,
                    //     req_position: prevBoardProjectCost.req_position,
                    //   });
                    //   console.log('new board project cost created', newBoardProjectCost);
                    // }

                    // );
                }
                
                  // const newBoardProjects = await Promise.all(prs);
                  // console.log(' new boards projects ids should be here ->', newBoardProjects);
                  
                  // for(let i = 0 ; i < newBoardProjects.length ; i++) {
                    
                  // }
                  
                } catch(error) {
                  logger.error(`error on sendBoardProjectsToDistrict ${error}`);
                  throw error;
                }
                logger.info('success on sendBoardProjectsToDistrict');
                const updatePromises = [];
                for (let i = 0; i < 6; i++) {
                    const rank = `rank${i}`;
                    logger.info(`Start count for ${rank} and board ${destinyBoard.board_id}`);
                    updatePromises.push(boardService.reCalculateColumn(destinyBoard.board_id, rank, creator));
                }
                if (updatePromises.length) {
                  try {
                    await Promise.all(updatePromises)
                  } catch(error) {
                    logger.error(`error on recalculate columns ${error}`);
                  }
                  logger.info('success on recalculate Columns');
                }
            }));
        }
        logger.info(`Finished function findAll for board/`);
        logger.info('success on sendBoardProjectsToDistrict');
    } catch (error) {
        console.log(error);
        logger.error(error);
    }
}

const updateBoards = async (board, status, comment, substatus, creator) => {
  logger.info('Updating all boards different project type');
  let projectTypes = [
    'Capital',
    'Maintenance',
    'Study',
    'Acquisition',
    board.year < 2024 ? 'Special' : 'R&D'
  ];
  logger.info(`Starting function findOne for board/`);
  for (const projectType of projectTypes) {
    logger.info(`Project type ${projectType}`);
    let body = {
      type: board.type,
      year: board.year,
      locality: board.locality,
      projecttype: projectType
    };
    let boards = await Board.findAll({
      where: body
    });
    if (boards.length === 0) {
      logger.info(`Creating new board for ${projectType}`);
      await boardService.createNewBoard(
        board.type,
        board.year,
        board.locality,
        projectType,
        status,
        creator,
        comment,
        substatus
      );
    } else {
      // When it reaches here? in what context?
      for (let i = 0 ; i < boards.length ; i++) {
        let board = boards[i];
        if (status === 'Approved' && board.status !== status) {
          body['submissionDate'] = new Date();
        }
        logger.info('Updating board');
        let newFields = {
          status,
          comment,
          substatus,
          last_modified_by: creator,
        };
        if (status === 'Approved' && board.status !== status) {
            newFields['submissionDate'] = new Date();
        }
        await board.update(newFields)
      }
    }
  }
  logger.info(`Finished function findOne for board/`);
}

const moveCardsToNextLevel = async (currentBoard, creator) => {
    logger.info('moveCardsToNextLevel', creator, '<- creator');
    logger.info(`Starting function findAll for board/`);
    let boards = await Board.findAll({
        where: {
            type: currentBoard.type,
            year: currentBoard.year,
            locality: currentBoard.locality
        }
    });
    logger.info(`Finished function findAll for board/`);

    if (currentBoard.type === 'WORK_REQUEST') {
        let boardsToCounty;
        let boardsToServiceArea
        if  (+currentBoard.year < 2024) {
          if (+currentBoard.year < 2022) { 
            boardsToCounty = boards.filter((board) => {
                return ['Capital', 'Maintenance'].includes(board.projecttype)
            });
            boardsToServiceArea = boards.filter((board) => {
                return ['Study', 'Acquisition', 'Special'].includes(board.projecttype)
            });
          } else {
            boardsToCounty = boards.filter((board) => {
                return ['Capital', 'Maintenance', 'Acquisition', 'Special'].includes(board.projecttype)
            });
            boardsToServiceArea = boards.filter((board) => {
                return ['Study'].includes(board.projecttype)
            });
          }
          logger.info(`Sending ${boardsToCounty.length} to county`);
          await sendBoardProjectsToProp(boardsToCounty, 'county', creator);
          logger.info(`Sending ${boardsToServiceArea.length} to service area`);
          await sendBoardProjectsToProp(boardsToServiceArea, 'servicearea', creator);
        }
        logger.info(`Sending ${boards.length} to district`);
        await sendBoardProjectsToDistrict(boards, creator);
        const boardIds = boards.map(board => board.board_id);
        await boardService.updateSubmissionDate(boardIds, creator);
        logger.info(`Update ${boards.length} as Requested`);
        return {}
    } else if (currentBoard.type === 'WORK_PLAN') {
        const boardProjectsUpdated = await updateProjectStatus(boards, creator);
        await moveBoardProjectsToNewYear(boardProjectsUpdated, +currentBoard.year + 1, creator);
        return {}
    }
}

const getEmailsForWR = async (board) => {
    let emails = [];
    logger.info(`Starting function findAll for board/`);
    let boardLocalities = await BoardLocality.findAll({
        where: {
            fromLocality: board.locality
        }
    });
    logger.info(`Finished function findAll for board/`);
    boardLocalities.forEach((bl) => {
        emails.push(bl.email)
    });
    logger.info(`Starting function findAll for board/`);
    let users = await User.findAll({
        where: {
            organization: board.locality
        }
    })
    logger.info(`Finished function findAll for board/`);
    users.forEach((u) => {
        emails.push(u.email)        
    })
    const finalEmailList = process.env.NODE_ENV === 'prod' ? emails : ['ricardo@vizonomy.com', 'katie@mhfd.org']
    return finalEmailList;
}

const getEmailsForWP = async (board) => {
    //TODO: maybe replace it with a distinct on board localities
    let emails = [];
    let allStaffEmails = ['dskuodas@mhfd.org', 'kbauer@mhfd.org', 'jwatt@mhfd.org', 'bseymour@mhfd.org', 'mlynch@mhfd.org', 'jvillines@mhfd.org', 'bkohlenberg@mhfd.org', 'tpatterson@mhfd.org', 'bchongtoua@mhfd.org']
    allStaffEmails.forEach((ase) => {
        emails.push(ase);
    })
    logger.info(`Starting function findAll for board/`);
    let boardLocalities = await BoardLocality.findAll({
        where: {
            toLocality: board.locality
        }
    });
    logger.info(`Finished function findAll for board/`);
    logger.info(`Starting function findAll for board/`);
    for (let i = 0 ; i < boardLocalities.length ; i++) {
        let bl = boardLocalities[i];
        let jurisdiction = bl.fromLocality;
        let users = await User.findAll({
            where: {
                organization: jurisdiction
            }
        })
        users.forEach((u) => {
            emails.push(u.email)
        })
    }
    return emails;
}
   

const sendMails = async (board, fullName) => {
    let emails = [];
    if (board.type === 'WORK_REQUEST') {
        logger.info(`Starting function getEmailsForWR for board/`);
        emails = await getEmailsForWR(board);
        logger.info(`Finished function getEmailsForWR for board/`);
    } else {
        logger.info(`Starting function getEmailsForWP for board/`);
        emails = await getEmailsForWP(board);
        logger.info(`Finished function getEmailsForWP for board/`);
    }
    emails = emails.filter ((value, index, array) => { 
        return array.indexOf(value) == index;
    });
    emails.forEach((email) => {
        sendBoardNotification(email, board.type, board.locality, board.year, fullName)
    });
}

router.put('/', [auth], async (req, res) => {
    logger.info(`Starting endpoint /board/:boardId params ${JSON.stringify(req.body, null, 2)}`)
    const user = req.user;
    const creator = user.email;
    console.log('Here reached the creator', creator, user);
    const { status, comment, substatus, boardId } = req.body;
    logger.info(`Attempting to update board ${boardId}`);
    const {
      locality,
      projecttype,
      type,
      year,
    } = boardId;
    const board = await Board.findOne({
      where: {
        locality,
        projecttype,
        type,
        year
      },
      sort: [['createdAt', 'DESC']]
    });
    logger.info(`Finished function findOne for board/`);    
    if (board) {
        logger.info(`Starting function updateBoards for board/`);
        await updateBoards(board, status, comment, substatus, creator);
        logger.info(`Finished function updateBoards for board/`);
        let bodyResponse = { status: 'updated' };        
        if (status === 'Approved' && board.status !== status) {
            logger.info(`Approving board ${boardId}`);
            // sendMails(board, req.user.name)
            logger.info(`Starting function moveCardsToNextLevel for board/`);
            let r = await moveCardsToNextLevel(board, creator);
            bodyResponse = {
                ...bodyResponse,
                ...r
            }
            logger.info(`Finished function moveCardsToNextLevel for board/`);
        }
        res.status(200).send(bodyResponse)
    } else {
        res.status(404).send({error: 'not found'})
    }

})

router.delete('/project/:projectid/:namespaceId', [auth], async (req, res) => {
    logger.info(`Starting endpoint board/project/:projectid/:namespaceId with params ${JSON.stringify(req.params, null, 2)}`)
    const { projectid, namespaceId } = req.params;

    logger.info(`Starting function findAll for board/project/:projectid/:namespaceId`);
    let boardProjects = await BoardProject.findAll({
        where: {
            board_id: namespaceId,
            project_id: projectid
        }
    });
    logger.info(`Finished function findAll for board/project/:projectid/:namespaceId`);
    boardProjects.forEach((bp) => {
        bp.destroy();
    });
    if (boardProjects.length === 0) {
        res.status(404).send({ status: 'notfound' })
    } else {
        res.send({ status: 'ok' })
    }
});

router.get('/bbox/:projectid', async (req, res) => {
    logger.info(`Starting endpoint board/bbox/:projectid with params ${JSON.stringify(req.params, null, 2)}, ${CREATE_PROJECT_TABLE}`)
    const { projectid } = req.params;
    const sql = `SELECT ST_AsGeoJSON(ST_Envelope(the_geom)) as bbox FROM ${CREATE_PROJECT_TABLE} WHERE projectid = ${projectid}`;
    const query = {
        q: sql
    };
    logger.info(sql);
    try {
        logger.info(`Starting function needle for board/bbox/:projectid ${sql}`);
        const data = await needle('post', CARTO_URL, query, { json: true });
        logger.info(`Finished function needle for board/bbox/:projectid`, data.statusCode, data.body);
        if (data.statusCode === 200) {
          const result = data.body;
          res.send(result.rows[0]);
        } else {
          logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
          return res.status(data.statusCode).send(data.body);
        }
     } catch (error) {
        logger.error(error);
        res.status(500).send(error);
     }
});

router.get('/:type/:year/', async (req, res) => {
    logger.info(`Starting endpoint board/:type/:year/ with params ${JSON.stringify(req.params, null, 2)}`)
    let { type, year } = req.params;
    logger.info(`Starting function findAll for board/:type/:year/`);
    let boards = await Board.findAll({
        where: {
            type,
            year
        }
    });
    logger.info(`Finished function findAll for board/:type/:year/`);
    res.send(boards);
});

router.post('/status-colors', async (req, res) => {
  try {
    const { type, year, localities, projecttype } = req.body;
    let boards = await Board.findAll({
      attributes: ['locality', 'status'],
      where: {
        type,
        year,
        locality: {
          [Op.in]: localities
        },
        projecttype
      }
    });
    console.log(boards);
    res.send(boards);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' + error });
  }
});


router.post('/update-boards-approved', [auth], async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    let { project_type, year, extraYears, sponsor, project_id, extraYearsAmounts, subtype } = req.body;
    let userData = req.user;
    year = parseInt(year);
    const type = sponsor === 'MHFD' ? 'WORK_PLAN' : 'WORK_REQUEST';
    const locality = sponsor === 'MHFD' ? 'MHFD District Work Plan' : sponsor;    
    const allRelevantBoards = await boardService.getRelevantBoards(type, year, extraYears, locality, project_type);
    const missingYears = boardService.determineMissingYears(allRelevantBoards, year, extraYears);
    const createdBoards = await boardService.createMissingBoards(missingYears, type, locality, project_type, userData, transaction);    
    const startYear = year;
    const endYear = year + 4;
    let allYears = new Set();
    if (extraYears.includes(year + 1)) {
      allYears.add(year + 1);
    }
    extraYears.forEach(y => allYears.add(y));
    allYears = [...allYears];
    allYears = [...allYears].sort((a, b) => a - b);
    let createdBoardProjects = [];
    if (!subtype && project_type !== 'Maintenance'){
      createdBoardProjects = await boardService.createBoardProjects(allYears, year, type, locality, project_type, project_id, extraYears, extraYearsAmounts, userData, transaction);   
    }else{
      createdBoardProjects = await boardService.createBoardProjectsMaintenance(allYears, year, type, locality, project_type, project_id, extraYears, extraYearsAmounts, userData, subtype, transaction);
    }
    const createOrUpdatePromises = createdBoardProjects.map(async (created) => {
      const existingEntry = await BoardProject.findOne({
        where: {
          project_id: created.project_id,
          board_id: created.board_id
        },
        transaction
      });    
      if (existingEntry) {
        const resetRanks = {};
        const resetReq = {};
        for (let i = 0; i <= 5; i++) {
          resetRanks[`rank${i}`] = null;
          if (i > 0){
            resetReq[`req${i}`] = null;
          }
        }
        const updatedValues = { ...resetRanks, ...created };
        await existingEntry.update(updatedValues, { transaction });
        const updatedEntry = await BoardProject.findOne({ where: { project_id: created.project_id, board_id: created.board_id }, transaction });
        return updatedEntry;
      } else {
        return BoardProject.create(created, { transaction });
      }
    });
    const results = await Promise.all(createOrUpdatePromises);
    const createdBoardProjectsArray = Object.values(createdBoardProjects);
    const projectCostsToCreate = [];
    const boardProjectsCostsToConstruct = [];
    const projectPartnerId = await boardService.findProjectPartner(project_id);
    const offsetMillisecond = 35007;
    let mainModifiedDate = new Date();
    for (const boardProject of createdBoardProjects) {
      const boardType = await boardService.getBoardTypeById(boardProject.board_id);
      for (let reqPosition = 1; reqPosition <= 5; reqPosition++) {
        const DateToAvoidRepeated = moment(mainModifiedDate)
        .subtract(offsetMillisecond * reqPosition)
        .toDate()
        if (boardProject[`req${reqPosition}`]) {
          const projectCost = boardService.constructProjectCost(boardProject, reqPosition, userData, projectPartnerId, boardType, DateToAvoidRepeated);
          projectCostsToCreate.push(projectCost);
        }
      }
    }
    boardService.updateProjectCostEntries(project_id, userData, transaction)
    const createdProjectCosts = await boardService.createAllProjectCosts(projectCostsToCreate, transaction);
    const createdProjectCostIds = createdProjectCosts.map(entry => entry.project_cost_id);
    let index = 0;
    for (let i = 0; i < createdBoardProjects.length; i++) {
      const boardProject = createdBoardProjects[i];
      const boardProjectId =  [...results][i].board_project_id;
      for (let reqPosition = 1; reqPosition <= 5; reqPosition++) {
        if (boardProject[`req${reqPosition}`]) {
          const boardProjectsCost = boardService.constructBoardProjectsCost(boardProject, createdProjectCostIds[index], reqPosition, userData, boardProjectId);
          boardProjectsCostsToConstruct.push(boardProjectsCost);
          index++;
        }
      }
    }
    await boardService.createAllBoardProjectsCost(boardProjectsCostsToConstruct, transaction);
    await boardService.cascadeDelete(project_id, createdBoardProjects, type, startYear, locality, project_type, transaction);
    await transaction.commit();
    res.send({
      createdBoardProjects: createdBoardProjectsArray,
      createdBoards,
      projectCostsToCreate,
      boardProjectsCostsToConstruct
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).send({
      error,
      message: 'An error occurred while updating the boards',
    });
  }
});

router.post('/send-to-workplan', [auth], async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    let { project_type, year, board_project_id } = req.body;
    let userData = req.user;
    year = parseInt(year);
    const type = 'WORK_PLAN';
    const locality = 'MHFD District Work Plan';
    const MhfdBoard = await Board.findOne({
      where: {
        type,
        year: year,
        locality,
        projecttype: project_type
      }
    }, { transaction });
    let createdBoards = [];
    let targetBoardId;
    if (!MhfdBoard || Object.keys(MhfdBoard).length === 0) {
      await transaction.rollback();
      return res.status(404).send({ error: 'No board found' });
    } else {
      targetBoardId = MhfdBoard.board_id;
    }
    const boardProject = await BoardProject.findOne({
      where: {
        board_project_id
      }
    }, { transaction });
    const updatedRanks = {};
    for (let i = 0; i <= 5; i++) {
      const rankColumnName = `rank${i}`;
      const nextLexoRankValue = await boardService.getNextLexoRankValue(targetBoardId, rankColumnName);
      updatedRanks[rankColumnName] = nextLexoRankValue;
    }
    const newBoardProject = await BoardProject.create({
      ...boardProject.dataValues,
      board_project_id: undefined,
      board_id: targetBoardId,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      last_modified_by: userData.email,
      created_by: userData.email,
    }, { transaction });
    await transaction.commit();
    return res.json({ message: 'Boards created successfully', createdBoards, newBoardProject });
  } catch (error) {
    await transaction.rollback();
    console.error(`Error creating boards: ${error}`);
    return res.status(500).json({ error: 'An error occurred while creating boards' });
  }
});

router.post('/projects-bbox', async (req, res) => {
    logger.info(`Starting endpoint board/projects-bbox with params ${JSON.stringify(req.params, null, 2)}`)
    const { projects } = req.body;
    // console.log(projects);
    let projectsParsed = '';
    for (const project of projects) {
        if (projectsParsed) {
            projectsParsed += ',';
        }
        projectsParsed += project;
    }
    const sql = `SELECT ST_AsGeoJSON(ST_Envelope(ST_Collect(the_geom))) as bbox FROM ${CREATE_PROJECT_TABLE} WHERE projectid IN (${projectsParsed})`;
    const query = {
        q: sql
    };
    logger.info(sql);
    try {
        logger.info(`Starting function needle for board/projects-bbox`);
        const data = await needle('post', CARTO_URL, query, { json: true });
        logger.info(`Finished function needle for board/projects-bbox`);
        if (data.statusCode === 200) {
          const result = data.body;
          res.send(result.rows[0]);
        } else {
          logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
          return res.status(data.statusCode).send(data.body);
        }
     } catch (error) {
        logger.error(error);
        res.status(500).send(error);
     }
});

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

router.get('/update-88', async(req, res)=> {
  const allProjectPartner = await ProjectPartner.findAll({
    where: {
      code_partner_type_id: 88
    }
  });
  allProjectPartner.forEach(async (pc) => {
    await ProjectCost.update(
      {
        project_partner_id: pc.project_partner_id
      },
      {
        where: {
          project_id: pc.project_id,
          code_cost_type_id: 22
        }
      }
    );
  });
  
  res.send('ok'); 
});
export default router;
