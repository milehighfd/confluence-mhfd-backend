require('dotenv').config()
const needle = require('needle');
const URL = 'https://confluencebc.mhfd.org';

needle.defaults({ open_timeout: 60000 });
(async () => {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
    let localityData;
    try {
        localityData = await needle('get', URL + '/organizations', { json: true });
    } catch (e) {
        console.log(e);
    }
    const localities = localityData.body.filter(r => r.type !== 'JURISDICTION').map(r => r.name);
    const projecttypes= ['Capital', 'Study', 'Maintenance', 'Acquisition', 'Special'];
    const payload = {
        type: "WORK_PLAN",
        year: "2023"
    };
    for (var i = 0 ; i < localities.length ; i++) {
        const locality = localities[i];
        for (var j = 0 ; j < projecttypes.length ; j++) {
            const projecttype = projecttypes[j];
            // if (projecttype !== 'Maintenance') continue;
            let boardData;
            try {
                boardData = await needle('post', URL + '/board/', {
                    ...payload,
                    locality,
                    projecttype
                }, { json: true });
                console.log(boardData.body.board);
                const { projects } = boardData.body;
                for (var k = 0 ; k < projects.length ; k++) {
                    const project = projects[k];
                    const { origin } = project;
                    try {
                        let boardOriginData = await needle('post', URL + '/board/', {
                            ...payload,
                            type: "WORK_REQUEST",
                            locality: origin,
                            projecttype
                        });
                        if (boardOriginData.body.board === undefined || boardOriginData.body.board.type !== 'WORK_REQUEST') {
                            try {
                                let projectUpdateData = await needle('put', URL + '/board/project/' + project.id, {
                                    originPosition0: -1,
                                    originPosition1: -1,
                                    originPosition2: -1,
                                    originPosition3: -1,
                                    originPosition4: -1,
                                    originPosition5: -1,
                                });
                            } catch (e) {
                                console.log(e);
                            }
                            continue;
                        }
                        
                        const { projects: boardOriginProjects } = boardOriginData.body;
                        let map = {};
                        [0, 1, 2, 3, 4, 5].forEach(index => {
                            let arr = [];
                            for (var j = 0 ; j < boardOriginProjects.length ; j++) {
                                let bp = boardOriginProjects[j];
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
                        console.log("UPDATE!!!!");
                        console.log(map, null, 2);
                        console.log("UPDATE!!!!");
                        if (map[project.project_id]) {
                            try {
                                let projectUpdateData = await needle('put', URL + '/board/project/' + project.id, {
                                    originPosition0: map[project.project_id][0],
                                    originPosition1: map[project.project_id][1],
                                    originPosition2: map[project.project_id][2],
                                    originPosition3: map[project.project_id][3],
                                    originPosition4: map[project.project_id][4],
                                    originPosition5: map[project.project_id][5],
                                }); 
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        };
    };
})();
