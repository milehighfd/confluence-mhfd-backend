import express from 'express';
import needle from 'needle';
import { LexoRank } from 'lexorank';
import auth from 'bc/auth/auth.js';
import { CREATE_PROJECT_TABLE, CARTO_URL } from 'bc/config/config.js';
import { updateProjectsInBoard }  from 'bc/routes/new-project/helper.js';
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
import projectStatusService from 'bc/services/projectStatus.service.js';
import sequelize from 'sequelize';

const { Op } = sequelize;
const router = express.Router();
const Board = db.board;
const User = db.user;
const BoardProject = db.boardProject;
const BoardLocality = db.boardLocality;
const ProjectStatus = db.projectStatus;
const CodePhaseType = db.codePhaseType;
const Project = db.project;
const ProjectServiceArea = db.projectServiceArea;
const ProjectCounty = db.projectCounty;
const ProjectProposedAction = db.projectProposedAction;
const CodeStateCounty = db.codeStateCounty;
const CodeServiceArea = db.codeServiceArea;
const CodeStatusType = db.codeStatusType;

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
                    [position]: value
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
                    [position]: value
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

router.get('/coordinates/:pid', async (req, res) => {
    logger.info(`Starting endpoint board/coordinates/:pid with params ${JSON.stringify(req.params, null, 2)}`);
    let { pid } = req.params;
    logger.info(`Starting function getCoordsByProjectId for endpoint board/coordinates/:pid`);
    let r = await getCoordsByProjectId(pid, true);
    logger.info(`Finished function getCoordsByProjectId for endpoint board/coordinates/:pid`);
    res.send(r);
});

router.get('/fix', async (req, res) => {
    logger.info(`Starting endpoint board/fix with params ${JSON.stringify(req.params, null, 2)}`);
    logger.info(`Starting function findAll for board/fix`);
    let boards = await Board.findAll(
        {
        where: {
            year: ['2018', '2019', '2020', '2021'],
            type: 'WORK_REQUEST',
            status: 'Approved'
        }
    });
    logger.info(`Finished function findAll for board/fix`);
    logger.info(`Starting function upDate for board/fix`);
    let updateBoards = await Board.update(
        {
            "status": "Approved",
            "substatus": "Capital,Study,Maintenance,Acquisition,Special",
        },{
        where: {
            year: ['2018', '2019', '2020', '2021'],
            type: 'WORK_REQUEST'
        }
    });
    logger.info(`Finished function upDate for board/fix`);
    console.log('UPDATED ' + updateBoards);
    let c = 0;
    if (boards) {
        for (const board of boards) { 
            logger.info(`Starting function moveCardsToNextLevel for board/fix`);
            moveCardsToNextLevel(board);
            logger.info(`Finished function moveCardsToNextLevel for board/fix`);
            c++;
        }
    }
    // let c = 0;
    logger.info(`Starting function update for board/fix`);
    let updateBoardsPlan = await Board.update(
        {
            "status": "Approved"
        },{
        where: {
            year: ['2018', '2019', '2020', '2021'],
            type: 'WORK_PLAN'
        }
    });
    logger.info(`Finished function update for board/fix`);
    console.log(updateBoardsPlan);
    console.log('boards', boards, boards.length);
    res.send({boards: boards, count: c});
});
router.get('/', async (req, res) => {
    logger.info(`Starting endpoint board/ with params ${JSON.stringify(req.params, null, 2)}`);
    logger.info(`Starting function findAll for board/`);
    let boards = await Board.findAll();
    logger.info(`Finished function findAll for board/`);
    console.log('boards', boards, boards.length);
    res.send(boards);
});

router.put('/update-budget', async (req, res) => {
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
        await board.save();
        res.send(board);
    } else {
        res.status(404).send({ error: 'Not found' });
    }
});

router.get('/board-localities', async (req, res) => {
    logger.info(`Starting endpoint board/board-localities with params ${JSON.stringify(req.params, null, 2)}`);
    logger.info(`Starting function findAll for board/board-localities`);
    let boardLocalities = await BoardLocality.findAll();
    logger.info(`Finished function findAll for board/board-localities`);
    res.send(boardLocalities);
});

router.put('/board-localities/:id', async (req, res) => {
    logger.info(`Starting endpoint /board/board-localities/:id with params ${JSON.stringify(req.params, null, 2)}`);
    let { id } = req.params;
    const email = req.body.email;
    logger.info(`Starting function findOne for board/board-localities/:id`);
    let boardLocalities = await BoardLocality.findOne({
        where: {
            id
        }
    });
    logger.info(`Finished function findOne for board/board-localities/:id`);
    if (boardLocalities) {
        boardLocalities.email = email;
        logger.info(`Starting function save for board/board-localities/:id`);
        await boardLocalities.save();
        logger.info(`Finished function save for board/board-localities/:id`);
        res.send(boardLocalities);
    } else {
        res.status(404).send({error: 'Not found'});
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

router.put('/project/:id', async (req, res) => {
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
    if (locality === 'Highlands Ranch Metro District') {
      boardWhere.locality = 'Highlands Ranch';code_local_government_id
    }
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
  if (locality === 'Highlands Ranch Metro District') {
    boardWhere.locality = 'Highlands Ranch';
  }
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
    let { boardId, projectIds } = req.body;
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
    if (locality === 'Highlands Ranch Metro District') {
      boardWhere.locality = 'Highlands Ranch';
    }
    const boards = await Board.findAll({
      attributes: ['board_id'],
      where: boardWhere,
    });
    const boardIds = boards.map(b => b.dataValues.board_id);
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
  
    if (`${position}` !== '0') {
      attributes.push(reqColumnName);
    }
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
    console.log(resolvedProjects)
    resolvedProjects = resolvedProjects?.filter((bp) => bp.projectData != null);
    let projects = resolvedProjects || [];
    logger.info('FINISHING BOARD REQUEST');
    res.send({
      projects,
    });
});

const getBoard = async (type, locality, year, projecttype) => {
    logger.info(`Trying to insert create or insert(${type}, ${locality}, ${year}, ${projecttype})`);
    logger.info(`Starting function findOne for board/`);
    let board = await Board.findOne({
        where: {
            type, year, locality, projecttype
        }
    });
    logger.info(`Finished function findOne for board/`);
    if (board) {
        logger.info('already exists');
        return board;
    } else {
        logger.info('new board');
        logger.info(`Starting function createNewBoard for board/`);
        const newBoard = await boardService.createNewBoard(type, year, locality, projecttype, 'Under Review');
        logger.info(`Finished function createNewBoard for board/`);
        return newBoard;        
    }
}

const updateProjectStatus = async (boards, status, creator) => {
  logger.info(`Starting function updateProjectStatus for board/`);
  const DRAFT_STATUS = 1;
  const REQUESTED_STATUS = 2;
  const APPROVED_STATUS = 3;
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
  if (status === APPROVED_STATUS) {
    for (const boardProject of boardProjects) {
      boardProject.code_status_type_id = APPROVED_STATUS;
      boardProject.save();
    }
  }
  const prs2 = [];
  for (const boardProject of boardProjects) {
    if (boardProject.position0 === null) {
      prs2.push(
        ProjectStatus.findOne({
          where: {
            project_id: boardProject.project_id,
          },
          include: {
            model: CodePhaseType,
            required: true,
            attributes: ["code_project_type_id", "code_phase_type_id"],
          },
          raw: true,
          nest: true,
        })
      );
    } else {
      prs2.push(Promise.resolve(null));
    }
  }
  const projectStatuses = await Promise.all(prs2);
  const prs3 = [];
  const updatedProjectsStatuses = [];
  for (const projectStatus of projectStatuses) {
    if (projectStatus) {
      prs3.push(
        CodePhaseType.findOne({
          where: {
            code_status_type_id: status,
            code_project_type_id:
              projectStatus?.code_phase_type?.code_project_type_id,
          },
        })
      );
      updatedProjectsStatuses.push(
        ProjectStatus.update(
          {
            actual_end_date: moment().format("YYYY-MM-DD HH:mm:ss"),
          },
          {
            where: {
              project_status_id: projectStatus.project_status_id,
            },
          }
        )
      );
    } else {
      prs3.push(Promise.resolve(null));
    }
  }
  await Promise.all(updatedProjectsStatuses).then(() => {
    logger.info("Project statuses are updated");
  });
  const nextCodePhases = await Promise.all(prs3);
  const prs4 = [];
  for (let i = 0; i < boardProjects.length; i++) {
    const boardProject = boardProjects[i];
    if (boardProject.position0 == null && nextCodePhases[i] != null) {
      const { duration, duration_type } = nextCodePhases[i];
      const formatDuration = duration_type[0].toUpperCase();
      prs4.push(
        projectStatusService.saveProjectStatusFromCero(
          nextCodePhases[i].code_phase_type_id,
          boardProject.project_id,
          moment().format("YYYY-MM-DD HH:mm:ss"),
          moment().add(1, "d").format("YYYY-MM-DD HH:mm:ss"),
          moment().format("YYYY-MM-DD HH:mm:ss"),
          moment()
            .add(Number(duration), formatDuration)
            .format("YYYY-MM-DD HH:mm:ss"),
          moment().format("YYYY-MM-DD HH:mm:ss"),
          Number(duration),
          moment().format("YYYY-MM-DD HH:mm:ss"),
          moment().format("YYYY-MM-DD HH:mm:ss"),
          creator,
          creator
        )
      );
    } else {
      prs4.push(Promise.resolve(null));
    }
  }
  const newProjectStatuses = await Promise.all(prs4);
  const prs5 = [];
  for (let i = 0; i < boardProjects.length; i++) {
    if (boardProjects[i].position0 == null) {
      let promise;
      if (newProjectStatuses[i] !== null) {
        promise = Project.update(
          {
            current_project_status_id: newProjectStatuses[i].project_status_id,
          },
          {
            where: { project_id: boardProjects[i].project_id },
          }
        );
      } else {
        promise = Promise.resolve();
      }
      prs5.push(promise);
    }
  }
  await Promise.all(prs5).then(() => {
    logger.info("Projects are updated");
  });
  const dontUseThis = true;
  if (status === APPROVED_STATUS && !dontUseThis) {
    const currentProjectStatusesPromises = [];
    for (const bp of boardProjects) {
      currentProjectStatusesPromises.push(
        ProjectStatus.findOne({
          where: {
            project_id:
              bp.project_id /* TODO: Addis should find which bp to use in this code */,
          },
          include: {
            model: CodePhaseType,
            required: true,
            attributes: ["code_project_type_id", "code_phase_type_id"],
          },
          raw: true,
          nest: true,
        })
      );
    }
    const currentProjectStatuses = await Promise.all(
      currentProjectStatusesPromises
    );
    const notDoneStatusesPromises = [];
    for (const currentProjectStatus of currentProjectStatuses) {
      notDoneStatusesPromises.push(
        CodePhaseType.findAll({
          where: {
            code_project_type_id:
              currentProjectStatus?.code_phase_type?.code_project_type_id,
            code_status_type_id: {
              [Op.not]: [DRAFT_STATUS, REQUESTED_STATUS, APPROVED_STATUS],
            },
          },
        })
      );
    }
    const notDoneStatuses = await Promise.all(notDoneStatusesPromises);
    const prs6 = [];
    for (let i = 0; i < boardProjects.length; i++) {
      const bp = boardProjects[i];
      const dataValues = notDoneStatuses[i].map(status => status.dataValues);
      for (const statusType of dataValues) {
        try {
          prs6.push(
            projectStatusService.saveProjectStatusFromCero(
              statusType.code_phase_type_id,
              bp.project_id,
              moment().format("YYYY-MM-DD HH:mm:ss"),
              moment().format("YYYY-MM-DD HH:mm:ss"),
              moment().format("YYYY-MM-DD HH:mm:ss"),
              moment().format("YYYY-MM-DD HH:mm:ss"),
              moment().format("YYYY-MM-DD HH:mm:ss"),
              Number(statusType.duration),
              moment().format("YYYY-MM-DD HH:mm:ss"),
              moment().format("YYYY-MM-DD HH:mm:ss"),
              creator,
              creator
            )
          );
          logger.info("status created", statusType.code_phase_type_id);
        } catch (error) {
          logger.info(error, "can not create status");
        }
      }
    }
    await Promise.all(prs6).then(() => {
      logger.info("new statuses  are created");
    });
    logger.info(`Ending function updateProjectStatus`);
  }
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
    };
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
              let destinyBoard = await getBoard('WORK_PLAN', propVal, board.year, board.projecttype);
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
                    code_status_type_id: REQUESTED_STATUS
                });
                //TODO: Jorge create the relationship on cost table
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

const sendBoardProjectsToDistrict = async (boards) => {
    try {
        logger.info(`Starting function findAll for board/`);
        for (let board of boards) {
            console.log(board, "current board");
            let destinyBoard = await getBoard('WORK_PLAN', 'MHFD District Work Plan', board.year, board.projecttype);
            BoardProject.findAll({
                where: {
                    board_id: board.board_id
                }
            }).then((async (boardProjects) => {
                const originPositionMap = getOriginPositionMap(boardProjects);
                const prs = [];
                for (const bp of boardProjects) {
                    prs.push(
                    boardService.saveProjectBoard({
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
                        code_status_type_id: REQUESTED_STATUS
                    }));
                }
                await Promise.all(prs).then((values) => {
                    logger.info('success on sendBoardProjectsToDistrict');
                }).catch((error) => {
                    logger.error(`error on sendBoardProjectsToDistrict ${error}`);
                });
                const updatePromises = [];
                for (let i = 0; i < 6; i++) {
                    const rank = `rank${i}`;
                    logger.info(`Start count for ${rank} and board ${destinyBoard.board_id}`);
                    updatePromises.push(boardService.reCalculateColumn(destinyBoard.board_id, rank));
                }
                if (updatePromises.length) {
                    await Promise.all(updatePromises).then((values) => {
                        logger.info('success on recalculate Columns');
                    }).catch((error) => {
                        logger.error(`error on recalculate columns ${error}`);
                    });
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

const updateBoards = async (board, status, comment, substatus) => {
    logger.info('Updating all boards different project type');
    let pjts = ['Capital', 'Maintenance', 'Study', 'Acquisition', 'Special'];
    logger.info(`Starting function findOne for board/`);
    for (const pjt of pjts) {
        let body = {
            type: board.type,
            year: board.year,
            locality: board.locality,
            projecttype: pjt
        };
        let b = await Board.findOne({
            where: body
        });
        if (status === 'Approved' && board.status !== status) {
            body['submissionDate'] = new Date();
        }
        logger.info(`Project type ${pjt}`);
        if (!b) {
            logger.info(`Creating new board for ${pjt}`);
            await boardService.specialCreationBoard(board.type, board.year, board.locality, pjt, status, comment, substatus);
        } else {
            logger.info('Updating board');
            let newFields = {
                status,
                comment,
                substatus
            };
            if (status === 'Approved' && board.status !== status) {
                newFields['submissionDate'] = new Date();
            }
            b.update(newFields)
        }
    }
    logger.info(`Finished function findOne for board/`);
}

const moveCardsToNextLevel = async (board, creator) => {
    logger.info('moveCardsToNextLevel');
    logger.info(`Starting function findAll for board/`);
    let boards = await Board.findAll({
        where: {
            type: board.type,
            year: board.year,
            locality: board.locality
        }
    });
    logger.info(`Finished function findAll for board/`);

    if (board.type === 'WORK_REQUEST') {
        let boardsToCounty;
        let boardsToServiceArea
        if  (+board.year < 2024) {
          if (+board.year < 2022) { 
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
        await sendBoardProjectsToDistrict(boards);
        logger.info(`Update ${boards.length} as Requested`);
        await updateProjectStatus(boards, 2, creator);
        return {}
    } else if (board.type === 'WORK_PLAN') {
        await updateProjectStatus(boards, 3, creator);
        return {}
    }
}

router.get('/:boardId/boards/:type', async (req, res) => {
    logger.info(`Starting endpoint /board/:boardId/boards/:type with params ${JSON.stringify(req.params, null, 2)}`)
    const { boardId, type } = req.params;
    logger.info(`Starting function findOne for board/`);
    let board = await Board.findOne({
        where: {
            board_id: boardId
        }
    })
    logger.info(`Finished function findOne for board/`);
    logger.info(`Starting function findAll for board/`);
    let boardLocalities = await BoardLocality.findAll({
        where: {
            toLocality: board.locality
        }
    });
    logger.info(`Finished function findOne for board/`);
    let bids = []
    logger.info(`Starting function findOne for board/`);
    for (var i = 0 ; i < boardLocalities.length ; i++) {
        let bl = boardLocalities[i];
        let locality = bl.fromLocality;
        logger.info(`BOARDS INFO locality: ${locality} type: ${type} year: ${board.year} status: Approved`);
        let boardFrom = await Board.findOne({
            where: {
                locality,
                type,
                year: board.year
            }
        })
        logger.info (`BOARD FROM: ${boardFrom}`);
        bids.push({
            locality,
            status: boardFrom ? boardFrom.status : 'Under Review',
            submissionDate: boardFrom ? boardFrom.submissionDate : null,
            substatus: boardFrom ? boardFrom.substatus : ''
        });
    }
    logger.info(`Finished function findOne for board/`);
    res.status(200).send({
        boards: bids
    });
})

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
    return emails;
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
    logger.info(`Starting endpoint /board/:boardId params ${JSON.stringify(req.params, null, 2)}`)
    const user = req.user;
    const creator = user.email;
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
        await updateBoards(board, status, comment, substatus);
        logger.info(`Finished function updateBoards for board/`);
        let bodyResponse = { status: 'updated' };        
        if (status === 'Approved' && board.status !== status) {
            logger.info(`Approving board ${boardId}`);
            //sendMails(board, req.user.name)
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
     };
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

router.post('/projects-bbox', async (req, res) => {
    logger.info(`Starting endpoint board/projects-bbox with params ${JSON.stringify(req.params, null, 2)}`)
    const { projects } = req.body;
    console.log(projects);
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
          result = data.body;
          res.send(result.rows[0]);
        } else {
          logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
          return res.status(data.statusCode).send(data.body);
        }
     } catch (error) {
        logger.error(error);
        res.status(500).send(error);
     };
});
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
router.get('/sync', async (req,res) => {
    logger.info(`Starting endpoint board/sync with params ${JSON.stringify(req.params, null, 2)}`);
  const sql = `SELECT projectid, projectname, projecttype, projectsubtype FROM ${CREATE_PROJECT_TABLE}`;
  const query = {
    q: sql
  };
  logger.info(sql);
  try {
    let result;
    logger.info(`Starting function needle for board/sync`);
    const data = await needle('post', CARTO_URL, query, { json: true });
    logger.info(`Finished function needle for board/sync`);
    if (data.statusCode === 200) {
      result = data.body;
      let allPromises = [];
      for(let i = 0 ; i < result.rows.length ; ++i){
        let projectData = result.rows[i];
        if(projectData.projectid){
          console.log('About to update in board', projectData.projectid, projectData.projectname);
          logger.info(`Starting function updateProjectsinBoard for board/sync`);
          await updateProjectsInBoard(projectData.projectid, projectData.projectname, projectData.projecttype, projectData.projectsubtype);
          logger.info(`Finished function updateProjectsinBoard for board/sync`);
          // updateProject
          logger.info(`Starting function sleep for board/sync`);
          await sleep(30);
          logger.info(`Starting function sleep for board/sync`);
        }
      }
      res.send(result.rows);
    } else {
      logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
      return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
      logger.error('Error at sync projectname, type, subtype', error);
      res.status(500).send(error);
  };

});

export default router;
