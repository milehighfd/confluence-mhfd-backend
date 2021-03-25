const express = require('express');
const router = express.Router();

const db = require('../config/db');
const Board = db.board; 

router.get('/', async (req, res) => {
    let boards = await Board.findAll();
    console.log('boards', boards);
    res.send(boards);
});

router.post('/', async (req, res) => {
    let body = req.body;
    let { type, year, locality } = body;
    let board = await Board.findOne({
        where: {
            type, year, locality
        }
    });
    if (board) {
        res.send(board);
    } else {
        let newBoard = new Board({
            type, year, locality
        });
        newBoard.save();
        res.send(newBoard);
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
