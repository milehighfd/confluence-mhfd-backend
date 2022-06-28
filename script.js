require('dotenv').config()
const { CARTO_TOKEN, CREATE_PROJECT_TABLE } = require('./config/config');
const db = require('./config/db');
db.sequelize.sync();
const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);

const Board = db.board;
const BoardProject = db.boardProject;

(async () => {
    let boards = await Board.findAll({});
    console.log(boards.length);
    let projectsMap = {};
    let statusesList = ['Draft', 'Requested', 'Submitted', 'Approved'];
    for (var i = 0 ; i < boards.length ; i++) {
        let board = boards[i];
        let boardProjects = await BoardProject.findAll({
            where: {
                board_id: board._id
            }
        });
        let isBoardApproved = board.status === 'Approved';
        let isWorkRequest = board.type === 'WORK_REQUEST';
        for (var j = 0 ; j < boardProjects.length ; j++) {
            let bp = boardProjects[j];
            let projectStatus = null;
            if (isWorkRequest) {
                if (!isBoardApproved) {
                    projectStatus = 0;
                } else {
                    projectStatus = 1;
                }
            } else {
                if (!isBoardApproved) {
                    projectStatus = 2;
                } else {
                    projectStatus = 3;
                }
            }
            if (!projectsMap[bp.project_id]) {
                projectsMap[bp.project_id] = statusesList[projectStatus];
            } else {
                projectsMap[bp.project_id] = Math.max(statusesList[projectStatus], statusesList.indexOf(projectsMap[bp.project_id]));
            }
        }
    }
    console.log(projectsMap);
    let keys = Object.keys(projectsMap);
    for (var i = 0 ; i < keys.length ; i++) {
        let project_id = keys[i];
        console.log('Project: ' + project_id);
        let status = projectsMap[project_id];
        try {
            const updateQuery = `UPDATE ${CREATE_PROJECT_TABLE} SET status = '${status}' WHERE  projectid = ${project_id}`;
            const query = {
                q: updateQuery
            };
            const data = await needle('post', URL, query, { json: true });
            if (data.statusCode === 200) {
                result = data.body;
                logger.log(result);
            } else {
                logger.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2))    ;
            }
        } catch(e) {
            continue;
        }
    }
})();
