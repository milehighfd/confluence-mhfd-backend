const express = require('express');
const router = express.Router();

const db = require('../config/db');
const Board = db.board; 

router.get('/', async (req, res) => {
    let boards = await Board.findAll();
    console.log('boards', boards);
    res.send(boards);
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
