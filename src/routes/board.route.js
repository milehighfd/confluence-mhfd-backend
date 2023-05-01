import express from 'express';
import needle from 'needle';
import auth from 'bc/auth/auth.js';
import { CREATE_PROJECT_TABLE, CARTO_URL } from 'bc/config/config.js';
import { updateProjectsInBoard }  from 'bc/routes/new-project/helper.js';
import logger from 'bc/config/logger.js';
import db from 'bc/config/db.js';
import {
    getCoordsByProjectId,
    getMidByProjectIdV2,
    getMinimumDateByProjectId,
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
   /* let boards = await Board.update(
        {
            "status": "Under Review",
            "substatus": "",
        },{
        where: {
            year: ['2018', '2019', '2020', '2021'],
            type: 'WORK_REQUEST'
        }
    });*/
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
            let r = await moveCardsToNextLevel(board);
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

router.put('/update-budget/:id', async (req, res) => {
    logger.info(`Starting endpoint board/update-budget/:id with params ${JSON.stringify(req.params, null, 2)}`);
    const { id } = req.params;
    const budget = req.body.budget;
    logger.info(`Starting function findByPk for board/update-budget/:id`);
    const board = await Board.findByPk(id);
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

router.post('/board-for-positions', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
    logger.info(`Starting endpoint board/board-for-positions with params ${JSON.stringify(req.params, null, 2)}`)
  
  let body = req.body;
  let { type, year, locality, projecttype, position } = body;
  if (locality === 'Mile High Flood District') {
    locality = 'MHFD District Work Plan';
  }
  if (!type || !year || !locality || !projecttype) {
    return res.sendStatus(400);
  }
  logger.info('SEARCHING IN BOARD');
  logger.info(`Starting function findOne for board/board-for-positions`);
  let board = await Board.findOne({
    where: {
      type,
      year,
      locality,
      projecttype,
    },
  });
  logger.info(`Finished function findOne for board/board-for-positions`);
  let boardProjects = [];
  if (board) {
    logger.info(`BOARD INFO: ${JSON.stringify(board)}`);
    logger.info(`Starting function count for board/board-for-positions`);
    let totalItems = await BoardProject.count({
      where: {
        board_id: board.board_id,
        [position]: { [Op.ne]: null },
      },
    });
    logger.info(`Finished function count for board/board-for-positions`);
    logger.info(`Starting function findAll for board/board-for-positions`);
    boardProjects = await BoardProject.findAll({
      limit: +limit,
      offset: (+page - 1) * limit,
      where: {
        board_id: board.board_id,
        [position]: { [Op.ne]: null },
      },
      raw: true,
      nest: true,
    });
    logger.info(`Finished function findAll for board/board-for-positions`);
    logger.info(`Starting function all for board/board-for-positions`);
    let projectIds = await Promise.all(
      boardProjects.map(async (boardProject) => {
        boardProject.projectData = await projectService.getDetails(
          boardProject.project_id
        );
        return await boardProject;
      })
    );

    res.send({ projects: projectIds, board, limit, page, totalItems });
  } else {
    logger.info('CREATING NEW BOARD');
    logger.info(`Starting function createNewBoard for board/board-for-positions`);
    const response = await boardService.createNewBoard(
      type,
      year,
      locality,
      projecttype,
      'Under Review'
    );
    logger.info(`Finished function createNewBoard for board/board-for-positions`);
    res.send({
      board: response,
      projects: [],
    });
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
  let board = await Board.findOne({
    where: {
      type,
      year,
      locality,
      projecttype,
    },
  });
  logger.info(`Finished function findOne for board/`);
  if (board) {
    logger.info(`BOARD INFO: ${JSON.stringify(board)}`);
    logger.info(`Starting function findAll for board/`);
    let boardProjects = await BoardProject.findAll({
      where: {
        board_id: board.board_id,
      },
    });
    logger.info(`Finished function findAll for board/`);
    logger.info(`BOARD-PROJECTS ${JSON.stringify(boardProjects)}`);
    let projectsPromises = boardProjects
      .filter((bp) => !!bp.project_id)
      .map(async (bp) => {
        let project = null;
        try {
          project = projectService.findProject(+bp.project_id);
          if (!project) {
            logger.info(`${bp.project_id} not found`);
            logger.info(`Starting function getDetails for board/`);
            project = await projectService.getDetails(bp.project_id);
            logger.info(`Finished function getDetails for board/`);
          }
        } catch (error) {
          console.log('Error in project Promises ', error);
        }
        let newObject = {
          id: bp.id,
          project_id: bp.project_id,
          origin: bp.origin,
          projectData: project,
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
    logger.info(`RESOLVERD PROJECTS: ${resolvedProjects}`);
    resolvedProjects = resolvedProjects.filter((bp) => bp.projectData != null);
    let projects = resolvedProjects;
    logger.info('FINISHING BOARD REQUEST');
    res.send({
      board,
      projects,
    });
  } else {
    logger.info('CREATING NEW BOARD');
    logger.info(`Starting function createNewBoard for board/`);
    const response = await boardService.createNewBoard(
      type,
      year,
      locality,
      projecttype,
      'Under Review'
    );
    logger.info(`Finished function createNewBoard for board/`);
    res.send({
      board: response,
      projects: [],
    });
  }
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

const sendBoardProjectsToProp = async (boards, prop) => {
    console.log(boards, prop);
    logger.info(`Starting function findAll for board/`);
    for (var i = 0 ; i < boards.length ; i++) {
        let board = boards[i];
        logger.info(`Starting function findAll for board/`);
        let boardProjects = await BoardProject.findAll({
            where: {
                board_id: board.board_id
            }
        });
        logger.info(`Finished function findAll for board/`);
        let map = {};
        [0, 1, 2, 3, 4, 5].forEach(index => {
            let arr = [];
            for (var j = 0 ; j < boardProjects.length ; j++) {
                let bp = boardProjects[j];
                if (bp[`position${index}`] != null) {
                    arr.push({
                        bp,
                        value: bp[`position${index}`]
                    });
                }
            };
            arr.sort((a, b) => {
                return a.value - b.value;
            });
            arr
                .forEach((r, i) => {
                    if (!map[r.bp.project_id]) {
                        map[r.bp.project_id] = {}
                    }
                    map[r.bp.project_id][index] = i;
                });
        });
        for (var j = 0 ; j < boardProjects.length ; j++) {
            let bp = boardProjects[j];
            let p;
            try {
                p = await getMinimumDateByProjectId(bp.project_id);
            } catch(e) {
                logger.info(`Project not found ${bp.project_id}`);
                continue;
            }
            if (!p[prop]) {
                logger.info(`Property not found ${prop}`);
                continue;
            }
            let propValues = p[prop].split(',');
            for (let k = 0 ; k < propValues.length ; k++) {
                let propVal = propValues[k];
                if (prop === 'county' && !propVal.includes('County')) {
                    propVal = propVal.trimEnd().concat(' County');
                } else if (prop === 'servicearea' && !propVal.includes(' Service Area')) {
                    propVal = propVal.trimEnd().concat(' Service Area');
                }
                logger.info(`Starting function getBoard for board/`);
                let destinyBoard = await getBoard('WORK_PLAN', propVal, board.year, board.projecttype);
                logger.info(`Finished function getBoard for board/`);
                logger.info(`Destiny board by prop ${prop} id is ${destinyBoard !== null ? destinyBoard.board_id : destinyBoard}`);
                //TODO: improve to avoid multiple queries to same board
                if (destinyBoard === null || destinyBoard.board_id === null) {
                    logger.info('Destiny board not found');
                }
                let newBoardProject = new BoardProject({
                    board_id: destinyBoard.board_id,
                    project_id: bp.project_id,
                    position0: bp.position0,
                    position1: bp.position1,
                    position2: bp.position2,
                    position3: bp.position3,
                    position4: bp.position4,
                    position5: bp.position5,
                    originPosition0: map[bp.project_id][0],
                    originPosition1: map[bp.project_id][1],
                    originPosition2: map[bp.project_id][2],
                    originPosition3: map[bp.project_id][3],
                    originPosition4: map[bp.project_id][4],
                    originPosition5: map[bp.project_id][5],
                    req1: bp.req1 == null ? null : (bp.req1 / propValues.length),
                    req2: bp.req2 == null ? null : (bp.req2 / propValues.length),
                    req3: bp.req3 == null ? null : (bp.req3 / propValues.length),
                    req4: bp.req4 == null ? null : (bp.req4 / propValues.length),
                    req5: bp.req5 == null ? null : (bp.req5 / propValues.length),
                    year1: bp.year1,
                    year2: bp.year2,
                    origin: board.locality,
                });
                logger.info(`Starting function save for board/`);
                await newBoardProject.save();
                logger.info(`Finished function getBoard for board/`);
            }
        }
    }

}

const updateProjectStatus = async (boards, status, creator) => {
    for (var i = 0 ; i < boards.length ; i++) {
        let board = boards[i];
        logger.info(`Starting function findAll for board/`);
        let boardProjects = await BoardProject.findAll({
            where: {
                board_id: board.board_id
            }
        });
        logger.info(`Finished function findAll for board/`);
        logger.info(`Starting function findOne for board/`);
        for (var j = 0 ; j < boardProjects.length ; j++) {
            let bp = boardProjects[j];
            try {
                if (bp.position0 === null) {
                    const currentProjectStatus = await ProjectStatus.findOne({
                        where: {
                            project_id: bp.project_id
                        },
                        include: {
                            model: CodePhaseType,
                            required: true,
                            attributes:['code_project_type_id', 'code_phase_type_id']
                        },
                        raw: true,
                        nest: true,
                        });
                        const nextCodePhase = await CodePhaseType.findOne({
                            where:{
                                code_status_type_id: status,
                                code_project_type_id: currentProjectStatus?.code_phase_type?.code_project_type_id
                            }
                        });
                        await ProjectStatus.update({            
                            actual_end_date: moment().format('YYYY-MM-DD HH:mm:ss')
                        }, { where: { project_status_id: currentProjectStatus.project_status_id } });

                        const { duration, duration_type } = nextCodePhase;
                        const formatDuration = duration_type[0].toUpperCase();
                        const responseOfNewStatus = await projectStatusService.saveProjectStatusFromCero(
                            nextCodePhase.code_phase_type_id, 
                            bp.project_id,
                            moment().format('YYYY-MM-DD HH:mm:ss'), 
                            moment().add(1, 'd').format('YYYY-MM-DD HH:mm:ss'),
                            moment().format('YYYY-MM-DD HH:mm:ss'), 
                            moment().add(Number(duration), formatDuration).format('YYYY-MM-DD HH:mm:ss'), 
                            moment().format('YYYY-MM-DD HH:mm:ss'), 
                            Number(duration), 
                            moment().format('YYYY-MM-DD HH:mm:ss'), 
                            moment().format('YYYY-MM-DD HH:mm:ss'), 
                            creator, 
                            creator
                        );
                        const resres = await Project.update({
                            current_project_status_id: responseOfNewStatus.project_status_id
                          },{ where: { project_id: bp.project_id }});
                        console.log(resres);
                        logger.info('Updated', bp.project_id);

                        if(status === 3 ){
                        const currentStatusForType = await CodePhaseType.findAll({
                            where:{
                                code_project_type_id: currentProjectStatus?.code_phase_type?.code_project_type_id,
                                code_status_type_id: {
                                    [Op.not]: [1, 2, 3],
                                }
                            }
                        });
                        for (const statusType of currentStatusForType) {
                            try {
                                await projectStatusService.saveProjectStatusFromCero(
                                    statusType.code_phase_type_id, 
                                    bp.project_id,
                                    moment().format('YYYY-MM-DD HH:mm:ss'), 
                                    moment().format('YYYY-MM-DD HH:mm:ss'), 
                                    moment().format('YYYY-MM-DD HH:mm:ss'), 
                                    moment().format('YYYY-MM-DD HH:mm:ss'),  
                                    moment().format('YYYY-MM-DD HH:mm:ss'), 
                                    Number(duration), 
                                    moment().format('YYYY-MM-DD HH:mm:ss'), 
                                    moment().format('YYYY-MM-DD HH:mm:ss'), 
                                    creator, 
                                    creator
                                );   
                                logger.info ('status created', statusType.code_phase_type_id)
                            } catch (error) {
                                logger.info (error, 'can not create status')
                            }
                        }
                        }
                        await projectService.updateProjectOnCache(bp.project_id);
            }
            } catch(e) {
                logger.error(e);
                continue;
            }
        }
        logger.info(`Finished function findOne for board/`);
    }
}

const sendBoardProjectsToDistrict = async (boards) => {
    try {
        logger.info(`Starting function findAll for board/`);
        for (var i = 0 ; i < boards.length ; i++) {
            let board = boards[i];
            console.log(board, "current board");
            let boardProjects = await BoardProject.findAll({
                where: {
                    board_id: board.board_id
                }
            });
            for (var j = 0 ; j < boardProjects.length ; j++) {
                let bp = boardProjects[j];
                let destinyBoard = await getBoard('WORK_PLAN', 'MHFD District Work Plan', board.year, board.projecttype);
                console.log(destinyBoard);
                //TODO: improve to avoid multiple queries to same board
                await boardService.saveProjectBoard({
                    board_id: destinyBoard.board_id,
                    project_id: bp.project_id,
                    position0: bp.position0,
                    position1: bp.position1,
                    position2: bp.position2,
                    position3: bp.position3,
                    position4: bp.position4,
                    position5: bp.position5,
                    req1: bp.req1,
                    req2: bp.req2,
                    req3: bp.req3,
                    req4: bp.req4,
                    req5: bp.req5,
                    year1: bp.year1,
                    year2: bp.year2,
                    origin: board.locality,
                })
            }
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
    for (var i = 0 ; i < pjts.length ; i++) {
        let pjt = pjts[i];
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
             await boardService.specialCreationBoard(board.type, board.year, board.locality, pjt, status, comment, substatus)
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
            await b.update(newFields)
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
        //await sendBoardProjectsToProp(boardsToCounty, 'county');
        logger.info(`Sending ${boardsToServiceArea.length} to service area`);
        //await sendBoardProjectsToProp(boardsToServiceArea, 'servicearea');
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
        
        if(boardFrom && 'status' in boardFrom && boardFrom.status !== 'Approved'){
            try {
                await Board.update({
                    status : "Approved"
                },{
                    where : {
                        board_id : boardFrom.board_id
                    }
                })
                boardFrom = await Board.findOne({
                    where: {
                        locality,
                        type,
                        year: board.year,
                        status: "Approved"
                    }
                })
            } catch (error) {
                logger.error('update error:', error);
                throw error;
            }
            
        }

        logger.info (`BOARD FROM: ${boardFrom}`);
        bids.push({
            locality,
            status: boardFrom ? boardFrom.status : 'Approved',
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

router.put('/:boardId', [auth], async (req, res) => {
    logger.info(`Starting endpoint /board/:boardId params ${JSON.stringify(req.params, null, 2)}`)
    const { boardId } = req.params;
    const user = req.user;
    const creator = user.email;
    logger.info(`Attempting to update board ${boardId}`);
    const { status, comment, substatus } = req.body;
    logger.info(`Starting function findOne for board/`);
    let board = await Board.findOne({
        where: {
            board_id: boardId
        }
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
    // const sql = `DELETE FROM ${CREATE_PROJECT_TABLE} WHERE projectid = ${projectid}`;
    // const query = {
    //     q: sql
    // };
    // try {
    //     const data = await needle('post', CARTO_URL, query, { json: true });
    //     //console.log('STATUS', data.statusCode);
    //     if (data.statusCode === 200) {
    //       result = data.body;
    //       res.send(result);
    //     } else {
    //       logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
    //       return res.status(data.statusCode).send(data.body);
    //     }
    //  } catch (error) {
    //     logger.error(error);
    //     res.status(500).send(error);
    //  };
});

router.get('/bbox/:projectid', async (req, res) => {
    logger.info(`Starting endpoint board/bbox/:projectid with params ${JSON.stringify(req.params, null, 2)}`)
    const { projectid } = req.params;
    const sql = `SELECT ST_AsGeoJSON(ST_Envelope(the_geom)) as bbox FROM ${CREATE_PROJECT_TABLE} WHERE projectid = ${projectid}`;
    const query = {
        q: sql
    };
    logger.info(sql);
    try {
        logger.info(`Starting function needle for board/bbox/:projectid`);
        const data = await needle('post', CARTO_URL, query, { json: true });
        logger.info(`Finished function needle for board/bbox/:projectid`);
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
        //console.log('STATUS', data.statusCode);
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
    //console.log('STATUS', data.statusCode);
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
