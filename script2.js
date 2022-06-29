require('dotenv').config()
const needle = require('needle');
const { CARTO_TOKEN, CREATE_PROJECT_TABLE } = require('./config/config');
const URL = 'https://confdevbc.mhfd.org';
const URL_MHFD = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
needle.defaults({ open_timeout: 60000 });
(async () => {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
    let data;
    try {
        data = await needle('get', URL + '/board', { json: true });
    } catch (e) {
        console.log(e);
    }
    let boards = data.body;
    console.log(boards.length);
    let projectsMap = {};
    let statusesList = ['Draft', 'Requested', 'Submitted', 'Approved'];
    for (var i = 0 ; i < boards.length ; i++) {
        let board = boards[i];
        console.log(board._id);
        let data;
        try {
            data = await needle('get', URL + '/board/projects/' + board._id, { json: true });
        } catch (e) {
            console.log(e);
        }
        let boardProjects = data.body;
        console.log(boardProjects.length);
        let isBoardApproved = board.status === 'Approved';
        let isWorkRequest = board.type === 'WORK_REQUEST';
        let isWorkDistrict = board.locality === 'MHFD District Work Plan';
        for (var j = 0 ; j < boardProjects.length ; j++) {
            let bp = boardProjects[j];
            if (!bp.project_id) continue;
            let projectStatusIndex = null;
            if (isWorkRequest) {
                if (!isBoardApproved) {
                    projectStatusIndex = 0;
                } else {
                    projectStatusIndex = 1;
                }
            } else {
                if (!isWorkDistrict) {
                    if (!isBoardApproved) {
                        projectStatusIndex = 1;
                    } else {
                        projectStatusIndex = 2;
                    }
                } else {
                    if (!isBoardApproved) {
                        projectStatusIndex = 2;
                    } else {
                        projectStatusIndex = 3;
                    }
                }
            }
            if (!projectsMap[bp.project_id]) {
                projectsMap[bp.project_id] = statusesList[projectStatusIndex];
            } else {
                projectsMap[bp.project_id] = Math.max(statusesList[projectStatusIndex], statusesList.indexOf(projectsMap[bp.project_id]));
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
            const data = await needle('post', URL_MHFD, query, { json: true });
            if (data.statusCode === 200) {
                result = data.body;
                console.log(result);
            } else {
                console.error('bad status ' + data.statusCode + ' ' +  JSON.stringify(data.body, null, 2))    ;
            }
        } catch(e) {
            continue;
        }
    }
})();
