const express = require('express');
const needle = require('needle');
const router = express.Router();


const auth = require('../auth/auth');
const { CARTO_TOKEN, CREATE_PROJECT_TABLE } = require('../config/config');
const logger = require('../config/logger');


const db = require('../config/db');
const { getCoordsByProjectId, getMidByProjectId, getMinimumDateByProjectId } = require('./mapgallery.service');
const Board = db.board; 
const BoardProject = db.boardProject;
const BoardLocality = db.boardLocality;
const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

router.get('/coordinates/:pid', async (req, res) => {
    let { pid } = req.params;
    let r = await getCoordsByProjectId(pid, true);
    res.send(r);
});

router.get('/', async (req, res) => {
    let boards = await Board.findAll();
    console.log('boards', boards);
    res.send(boards);
});

router.post('/', async (req, res) => {
    let body = req.body;
    let { type, year, locality, projecttype } = body;
    let board = await Board.findOne({
        where: {
            type, year, locality, projecttype
        }
    });
    if (board) {
        let boardProjects = await BoardProject.findAll({
            where: {
                board_id: board._id
            }
        });
        let projectsPromises = boardProjects.map(async (bp) => {
            let project = null;
            try {
                project = await getMidByProjectId(bp.project_id, true);
            } catch(e) {
                console.log('e', e);
            }
            let newObject = {
                project_id: bp.project_id,
                from: bp.from,
                projectData: project,
            }
            for (var i = 0 ; i <= 5; i ++) {
                newObject[`position${i}`] = bp[`position${i}`];
                if (i > 0) {
                    newObject[`req${i}`] = bp[`req${i}`];
                }
            }
            return newObject;
        })
        let resolvedProjects = await Promise.all(projectsPromises);
        resolvedProjects = resolvedProjects.filter(bp => bp.projectData != null);
        let projects = resolvedProjects;
        res.send({
            board,
            projects
        });
    } else {
        let newBoard = new Board({
            type, year, locality, projecttype, status: 'Under Review'
        });
        newBoard.save();
        res.send({
            board: newBoard,
            projects: []
        });
    }
});

const getBoard = async (type, locality, year, projecttype) => {
    let board = await Board.findOne({
        where: {
            type, year, locality, projecttype
        }
    });
    if (board) {
        return board;
    } else {
        let newBoard = new Board({
            type, year, locality, projecttype, status: 'Under Review'
        });
        newBoard.save();
        return newBoard;
    }
}

const sendBoardProjectsToProp = async (boards, prop) => {
    for (var i = 0 ; i < boards.length ; i++) {
        let board = boards[i];
        let boardProjects = await BoardProject.findAll({
            where: {
                board_id: board._id
            }
        });
        for (var j = 0 ; j < boardProjects.length ; j++) {
            let bp = boardProjects[j];
            let p = await getMinimumDateByProjectId(bp.project_id, true);

            let destinyBoard = await getBoard('WORK_PLAN', p[prop], board.year, board.projecttype);
            //TODO: improve to avoid multiple queries to same board

            let newBoardProject = new BoardProject({
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
                from: p[prop],
            })
            await newBoardProject.save();
        }
    }
}

const sendBoardProjectsToDistrict = async (boards) => {
    for (var i = 0 ; i < boards.length ; i++) {
        let board = boards[i];
        let boardProjects = await BoardProject.findAll({
            where: {
                board_id: board._id
            }
        });
        for (var j = 0 ; j < boardProjects.length ; j++) {
            let bp = boardProjects[j];
            let destinyBoard = await getBoard('WORK_PLAN', 'MHFD District Work Plan', board.year, board.projecttype);
            //TODO: improve to avoid multiple queries to same board

            let newBoardProject = new BoardProject({
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
                from: board.locality,
            })
            await newBoardProject.save();
        }
    }
}

const updateBoards = async (board, status, comment) => {
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
        if (!b) {
            let newBoard = new Board({
                ...body,
                status,
                comment
            }); 
            await newBoard.save();
        } else {
            let newFields = {
                status,
                comment
            };
            if (status === 'Approved' && board.status !== status) {
                newFields['submissionDate'] = new Date();
            }
            await b.update(newFields)
        }
    }
}

const moveCardsToNextLevel = async (board) => {
    console.log('moveCardsToNextLevel');
    let boards = await Board.findAll({
        where: {
            type: board.type,
            year: board.year,
            locality: board.locality
        }
    });

    if (board.type === 'WORK_REQUEST') {
        let boardsToCounty = boards.filter((board) => {
            return ['Capital', 'Maintenance'].includes(board.projecttype)
        })
        await sendBoardProjectsToProp(boardsToCounty, 'county');
        let boardsToServiceArea = boards.filter((board) => {
            return ['Study', 'Acquisition', 'Special'].includes(board.projecttype)
        })
        await sendBoardProjectsToProp(boardsToServiceArea, 'servicearea');

        return {}
    } else if (board.type === 'WORK_PLAN') {
        await sendBoardProjectsToDistrict(boards);
        return {}
    }
}

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
        let boardFrom = await Board.findOne({
            where: {
                locality,
                type,
                year: board.year,
                status: 'Approved'
            }
        })
        bids.push({
            locality,
            status: boardFrom ? boardFrom.status : 'Under Review',
            submissionDate: boardFrom ? boardFrom.submissionDate : null
        });
    }
    res.status(200).send({
        boards: bids
    });
})

router.put('/:boardId', [auth], async (req, res) => {
    const { boardId } = req.params;
    const { status, comment } = req.body;
    let board = await Board.findOne({
        where: {
            _id: boardId
        }
    })
    if (board) {
        await updateBoards(board, status, comment);
        let bodyResponse = { status: 'updated' };
        if (status === 'Approved' && board.status !== status) {
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
    //     const data = await needle('post', URL, query, { json: true });
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
        const data = await needle('post', URL, query, { json: true });
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

module.exports = router;
