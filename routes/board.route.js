const express = require('express');
const needle = require('needle');
const router = express.Router();


const auth = require('../auth/auth');
const { CARTO_TOKEN, CREATE_PROJECT_TABLE } = require('../config/config');
const logger = require('../config/logger');


const db = require('../config/db');
const { getDataByProjectIds } = require('./mapgallery.service');
const Board = db.board; 
const BoardProject = db.boardProject;
const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

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
                project = await getDataByProjectIds(bp.project_id, null, true);
            } catch(e) {
                console.log('e', e);
            }
            let newObject = {
                project_id: bp.project_id,
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
            type, year, locality, projecttype
        });
        newBoard.save();
        res.send({
            board: newBoard,
            projects: []
        });
    }
});

router.put('/:boardId', [auth], async (req, res) => {
    console.log('here')
    const { boardId } = req.params;
    console.log('boardId', boardId)
    const { status, comment } = req.body;
    console.log('status, comment', status, comment)
    let board = await Board.findOne({
        where: {
            _id: boardId
        }
    })
    if (board) {
        await board.update({
            status,
            comment
        })
        res.status(200).send({status: 'updated'})
    } else {
        res.status(404).send({error: 'not found'})
    }

})

router.delete('/project/:projectid', [auth], async (req, res) => {
    const { projectid } = req.params;

    let boardProjects = await BoardProject.findAll({
        where: {
            project_id: projectid
        }
    });
    boardProjects.forEach((bp) => {
        bp.destroy();
    })

    const sql = `DELETE FROM ${CREATE_PROJECT_TABLE} WHERE projectid = ${projectid}`;
    const query = {
        q: sql
    };
    try {
        const data = await needle('post', URL, query, { json: true });
        //console.log('STATUS', data.statusCode);
        if (data.statusCode === 200) {
          result = data.body;
          res.send(result);
        } else {
          logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2));
          return res.status(data.statusCode).send(data.body);
        }
     } catch (error) {
        logger.error(error);
        res.status(500).send(error);
     };
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
    console.log(`boards by type ${type} and year ${year}`, boards.lenght);
    res.send(boards);
});

module.exports = router;
