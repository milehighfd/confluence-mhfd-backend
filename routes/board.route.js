const express = require('express');
const router = express.Router();

const db = require('../config/db');
const { getDataByProjectIds } = require('./mapgallery.service');
const Board = db.board; 
const BoardProject = db.boardProject;

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
            let project = await getDataByProjectIds(bp.project_id, null, true);
            return {
                project_id: bp.project_id,
                column: bp.column,
                position: bp.position,
                project
            }
        })
        let resolvedProjects = await Promise.all(projectsPromises);
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
})

module.exports = router;
