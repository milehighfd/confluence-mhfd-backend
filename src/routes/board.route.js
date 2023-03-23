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

const router = express.Router();
const Board = db.board;
const User = db.user;
const BoardProject = db.boardProject;
const BoardLocality = db.boardLocality;
const ProjectStatus = db.projectStatus;
const CodePhaseType = db.codePhaseType;

router.get('/coordinates/:pid', async (req, res) => {
    let { pid } = req.params;
    let r = await getCoordsByProjectId(pid, true);
    res.send(r);
});

router.get('/fix', async (req, res) => {
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
    let boards = await Board.findAll(
        {
        where: {
            year: ['2018', '2019', '2020', '2021'],
            type: 'WORK_REQUEST',
            status: 'Approved'
        }
    });
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
    console.log('UPDATED ' + updateBoards);
    let c = 0;
    if (boards) {
        for (const board of boards) { 
            let r = await moveCardsToNextLevel(board);
            c++;
        }
    }
    // let c = 0;
    let updateBoardsPlan = await Board.update(
        {
            "status": "Approved"
        },{
        where: {
            year: ['2018', '2019', '2020', '2021'],
            type: 'WORK_PLAN'
        }
    });
    console.log(updateBoardsPlan);
    console.log('boards', boards, boards.length);
    res.send({boards: boards, count: c});
});
router.get('/', async (req, res) => {
    let boards = await Board.findAll();
    console.log('boards', boards, boards.length);
    res.send(boards);
});

router.put('/update-budget/:id', async (req, res) => {
    const { id } = req.params;
    const budget = req.body.budget;
    const board = await Board.findByPk(id);
    if (board) {
        board.total_county_budget =  budget;
        await board.save();
        res.send(board);
    } else {
        res.status(404).send({ error: 'Not found' });
    }
});

router.get('/board-localities', async (req, res) => {
    let boardLocalities = await BoardLocality.findAll();
    res.send(boardLocalities);
});

router.put('/board-localities/:id', async (req, res) => {
    let { id } = req.params;
    const email = req.body.email;
    let boardLocalities = await BoardLocality.findOne({
        where: {
            id
        }
    });
    if (boardLocalities) {
        boardLocalities.email = email;
        await boardLocalities.save();
        res.send(boardLocalities);
    } else {
        res.status(404).send({error: 'Not found'});
    }
});

router.get('/projects/:bid', async (req, res) => {
    let { bid } = req.params;
    let boardProjects = await BoardProject.findAll({
        where: {
            board_id: bid
        }
    });
    console.log('boardProjects', boardProjects, boardProjects.length);
    res.send(boardProjects);
});

router.put('/project/:id', async (req, res) => {
    let { id } = req.params;
    let { 
        originPosition0,
        originPosition1,
        originPosition2,
        originPosition3,
        originPosition4,
        originPosition5
    } = req.body;
    let boardProject = await BoardProject.findOne({
        where: {
            id
        }
    });
    boardProject.originPosition0 = originPosition0;
    boardProject.originPosition1 = originPosition1;
    boardProject.originPosition2 = originPosition2;
    boardProject.originPosition3 = originPosition3;
    boardProject.originPosition4 = originPosition4;
    boardProject.originPosition5 = originPosition5;
    await boardProject.save();
    res.send(boardProject);
});

router.post('/projectdata', async (req, res) => {
  let body = req.body;
  let {projectid, projecttype} = body;
  if (!projectid) {
    return res.sendStatus(404);
  }
  let project = null;
  try {
      project = await getProjectData(projectid, projecttype);
  } catch(e) {
      console.log('Error in project Promises ', e);
  }
  res.send(project);
});

router.post('/', async (req, res) => {
    let body = req.body;
    console.log("3333333333", body);
    let { type, year, locality, projecttype } = body;
    if (locality === 'Mile High Flood District') {
        locality = 'MHFD District Work Plan'
    }
    if (!type || !year || !locality || !projecttype) {
        return res.sendStatus(400);
    }
    logger.info('SEARCHING IN BOARD');
    let board = await Board.findOne({
        where: {
            type, year, locality, projecttype
        }
    });
    if (board) {
        logger.info(`BOARD INFO: ${JSON.stringify(board)}`);
        let boardProjects = await BoardProject.findAll({
            where: {
              board_id: board._id
            }
        });
        logger.info(`BOARD-PROJECTS ${JSON.stringify(boardProjects)}`);
        let projectsPromises = boardProjects.filter(bp => !!bp.project_id).map(async (bp) => {
            let project = null;
            try {
                project = await projectService.getDetails(bp.project_id);
                if (project.error) {
                    console.log('Error in project Promises ', project.error);
                }
            } catch (error) {
            console.log('Error in project Promises ', error);
            }
            let newObject = {
                id: bp.id,
                project_id: bp.project_id,
                origin: bp.origin,
                projectData: project,
            }
            for (var i = 0 ; i <= 5; i ++) {
                newObject[`position${i}`] = bp[`position${i}`];
                newObject[`originPosition${i}`] = bp[`originPosition${i}`];
                if (i > 0) {
                    newObject[`req${i}`] = bp[`req${i}`];
                }
                if (1 <= i && i <= 2) {
                    newObject[`year${i}`] = bp[`year${i}`];
                }
            }
            return !project.error && newObject;
        })
        let resolvedProjects = await Promise.all(projectsPromises);
        logger.info(`RESOLVERD PROJECTS: ${resolvedProjects}`)
        resolvedProjects = resolvedProjects.filter(bp => bp.projectData != null);
        let projects = resolvedProjects;
        logger.info('FINISHING BOARD REQUEST');
        res.send({
            board,
            projects
        });
    } else {
    logger.info('CREATING NEW BOARD');
    const response = await boardService.createNewBoard(type, year, locality, projecttype, 'Under Review')
    res.send({
        board: response,
        projects: []
    });
    }
});

const getBoard = async (type, locality, year, projecttype) => {
    logger.info(`Trying to insert create or insert(${type}, ${locality}, ${year}, ${projecttype})`);
    let board = await Board.findOne({
        where: {
            type, year, locality, projecttype
        }
    });
    if (board) {
        logger.info('already exists');
        return board;
    } else {
        logger.info('new board');
        const newBoard = await boardService.createNewBoard(type, year, locality, projecttype, 'Under Review')
        return newBoard;
    }
}

const sendBoardProjectsToProp = async (boards, prop) => {
    console.log(boards, prop);
    for (var i = 0 ; i < boards.length ; i++) {
        let board = boards[i];
        let boardProjects = await BoardProject.findAll({
            where: {
                board_id: board._id
            }
        });
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
                let destinyBoard = await getBoard('WORK_PLAN', propVal, board.year, board.projecttype);
                logger.info(`Destiny board by prop ${prop} id is ${destinyBoard !== null ? destinyBoard._id : destinyBoard}`);
                //TODO: improve to avoid multiple queries to same board
                if (destinyBoard === null || destinyBoard._id === null) {
                    logger.info('Destiny board not found');
                }
                let newBoardProject = new BoardProject({
                    board_id: destinyBoard._id,
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
                await newBoardProject.save();
            }
        }
    }
}

const updateProjectStatus = async (boards, status) => {
    for (var i = 0 ; i < boards.length ; i++) {
        let board = boards[i];
        let boardProjects = await BoardProject.findAll({
            where: {
                board_id: board._id
            }
        });
        for (var j = 0 ; j < boardProjects.length ; j++) {
            let bp = boardProjects[j];
            console.log(boardProjects);
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
                            code_phase_type_id: nextCodePhase.code_phase_type_id
                        }, { where: { project_status_id: currentProjectStatus.project_status_id } });
                        logger.info('Updated', bp.project_id);
                }
            } catch(e) {
                logger.error(e);
                continue;
            }
        }
    }
}

const sendBoardProjectsToDistrict = async (boards) => {
    try {
        for (var i = 0 ; i < boards.length ; i++) {
            let board = boards[i];
            console.log(board, "current board");
            let boardProjects = await BoardProject.findAll({
                where: {
                    board_id: board._id
                }
            });
            for (var j = 0 ; j < boardProjects.length ; j++) {
                let bp = boardProjects[j];
                let destinyBoard = await getBoard('WORK_PLAN', 'MHFD District Work Plan', board.year, board.projecttype);
                console.log(destinyBoard);
                //TODO: improve to avoid multiple queries to same board
                await boardService.saveProjectBoard({
                    board_id: destinyBoard._id,
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
        logger.info('success on sendBoardProjectsToDistrict')
    } catch (error) {
        console.log(error);
        logger.error(error);
    }
}

const updateBoards = async (board, status, comment, substatus) => {
    logger.info('Updating all boards different project type');
    let pjts = ['Capital', 'Maintenance', 'Study', 'Acquisition', 'Special'];
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
}

const moveCardsToNextLevel = async (board) => {
    logger.info('moveCardsToNextLevel');
    let boards = await Board.findAll({
        where: {
            type: board.type,
            year: board.year,
            locality: board.locality
        }
    });

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
        await updateProjectStatus(boards, 2);
        return {}
    } else if (board.type === 'WORK_PLAN') {
        await updateProjectStatus(boards, 3);
        return {}
    }
}
router.get('/test/:id', async (req, res) => {
    const { id } = req.params;
    try {
        
        res.send(response);
    } catch (error) {
        console.log(error);
        res.send(500);
    }
})

router.get('/:boardId/boards/:type', async (req, res) => {
    const { boardId, type } = req.params;
    let board = await Board.findOne({
        where: {
            _id: boardId
        }
    })
    let boardLocalities = await BoardLocality.findAll({
        where: {
            toLocality: board.locality
        }
    });
    let bids = []
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
                        _id : boardFrom._id
                    }
                })
                let boardFrom = await Board.findOne({
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
            status: boardFrom ? boardFrom.status : 'Under Review',
            submissionDate: boardFrom ? boardFrom.submissionDate : null,
            substatus: boardFrom ? boardFrom.substatus : ''
        });
    }
    res.status(200).send({
        boards: bids
    });
})

const getEmailsForWR = async (board) => {
    let emails = [];
    let boardLocalities = await BoardLocality.findAll({
        where: {
            fromLocality: board.locality
        }
    });
    boardLocalities.forEach((bl) => {
        emails.push(bl.email)
    });
    let users = await User.findAll({
        where: {
            organization: board.locality
        }
    })
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
    let boardLocalities = await BoardLocality.findAll({
        where: {
            toLocality: board.locality
        }
    });
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
        emails = await getEmailsForWR(board);
    } else {
        emails = await getEmailsForWP(board);
    }
    emails = emails.filter ((value, index, array) => { 
        return array.indexOf(value) == index;
    });
    emails.forEach((email) => {
        sendBoardNotification(email, board.type, board.locality, board.year, fullName)
    });
}

router.put('/:boardId', [auth], async (req, res) => {
    const { boardId } = req.params;
    logger.info(`Attempting to update board ${boardId}`);
    const { status, comment, substatus } = req.body;
    let board = await Board.findOne({
        where: {
            _id: boardId
        }
    });
    if (board) {
        await updateBoards(board, status, comment, substatus);
        let bodyResponse = { status: 'updated' };
        if (status === 'Approved' && board.status !== status) {
            logger.info(`Approving board ${boardId}`);
            //sendMails(board, req.user.name)
            let r = await moveCardsToNextLevel(board);
            bodyResponse = {
                ...bodyResponse,
                ...r
            }
        }
        res.status(200).send(bodyResponse)
    } else {
        res.status(404).send({error: 'not found'})
    }

})

router.delete('/project/:projectid/:namespaceId', [auth], async (req, res) => {
    const { projectid, namespaceId } = req.params;

    let boardProjects = await BoardProject.findAll({
        where: {
            board_id: namespaceId,
            project_id: projectid
        }
    });
    boardProjects.forEach((bp) => {
        bp.destroy();
    })
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
    const { projectid } = req.params;
    const sql = `SELECT ST_AsGeoJSON(ST_Envelope(the_geom)) as bbox FROM ${CREATE_PROJECT_TABLE} WHERE projectid = ${projectid}`;
    const query = {
        q: sql
    };
    logger.info(sql);
    try {
        const data = await needle('post', CARTO_URL, query, { json: true });
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
    let { type, year } = req.params;
    let boards = await Board.findAll({
        where: {
            type,
            year
        }
    });
    res.send(boards);
});

router.post('/projects-bbox', async (req, res) => {
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
        const data = await needle('post', CARTO_URL, query, { json: true });
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
  const sql = `SELECT projectid, projectname, projecttype, projectsubtype FROM ${CREATE_PROJECT_TABLE}`;
  const query = {
    q: sql
  };
  logger.info(sql);
  try {
    let result;
    const data = await needle('post', CARTO_URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      let allPromises = [];
      for(let i = 0 ; i < result.rows.length ; ++i){
        let projectData = result.rows[i];
        if(projectData.projectid){
          console.log('About to update in board', projectData.projectid, projectData.projectname);
          await updateProjectsInBoard(projectData.projectid, projectData.projectname, projectData.projecttype, projectData.projectsubtype);
          // updateProject
          await sleep(30);
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
