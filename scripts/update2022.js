require('dotenv').config()
const { CARTO_URL, CREATE_PROJECT_TABLE } = require('../config/config');
const db = require('../config/db');
db.sequelize.sync();

const Board = db.board;
const BoardProject = db.boardProject;

(async () => {
    await new Promise(res => {
        setTimeout(() => {
            res();
        }, 5000);
    });
    let boards = await Board.findAll({
        where: {
            year: '2022',
            type: 'WORK_PLAN'
        }
    });
    let district = boards.filter(r => {
        return r.locality === 'MHFD District Work Plan';
    });
    boards = boards.filter(r => {
        return r.locality !== 'MHFD District Work Plan';
    });
    console.log(`DISTRICT ${district.length}`);
    console.log(`OTHER ${boards.length}`);
    if (district.length !== 5) {
        console.log(`CHECK DISTRICT ${district.length}`);
        return;
    }
    district.sort((a,b) => {
        return a.projecttype.localeCompare(b.projecttype);
    });
    let labels = district.map(r => r.projecttype);
    for (var i = 0 ; i < district.length ; i++) {
        let board = district[i];
        let boardProjects = await BoardProject.findAll({
            where: {
                board_id: board._id
            }
        });
        for (var j = 0 ; j < boardProjects.length ; j++) {
            let bp = boardProjects[j];
            await bp.destroy();
        }
    }
    for (var i = 0 ; i < boards.length ; i++) {
        let board = boards[i];
        if (board.locality === 'MHFD District Work Plan') {
            continue;
        }
        let boardProjects = await BoardProject.findAll({
            where: {
                board_id: board._id
            }
        });
        let destiny_board_id = district[labels.indexOf(board.projecttype)]._id;
        for (var j = 0 ; j < boardProjects.length ; j++) {
            let bp = boardProjects[j];
            let newObject = {
                board_id: destiny_board_id,
                project_id: bp.project_id,
                position0: bp.position0,
                position1: bp.position1,
                position2: bp.position2,
                position3: bp.position3,
                position4: bp.position4,
                position5: bp.position5,
                originPosition0: bp.originPosition0,
                originPosition1: bp.originPosition1,
                originPosition2: bp.originPosition2,
                originPosition3: bp.originPosition3,
                originPosition4: bp.originPosition4,
                originPosition5: bp.originPosition5,
                req1: bp.req1,
                req2: bp.req2,
                req3: bp.req3,
                req4: bp.req4,
                req5: bp.req5,
                year1: bp.year1,
                year2: bp.year2,
                origin: board.locality,
            };
            try {
                const x = new BoardProject(newObject);
                await x.save();
            } catch (e) {
                console.log(e);
            }
        }
    }
})();
