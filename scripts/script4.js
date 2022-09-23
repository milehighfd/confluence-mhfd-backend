require('dotenv').config()
const needle = require('needle');
const { CARTO_URL, CREATE_PROJECT_TABLE } = require('./config/config');
const URL = 'https://confluencebc.mhfd.org';

needle.defaults({ open_timeout: 60000 });
(async () => {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
    let usersData;
    try {
        usersData = await needle('get', URL + '/users', { json: true });
    } catch (e) {
        console.log(e);
    }
    let users = usersData.body.filter(r => r.status === 'pending');
    for (var i = 0 ; i < users.length ; i++) {
        let user = users[i];
        let updateData;
        try {
            updateData = await needle.delete(URL + `/admin/delete-user/${user._id}`, {}, { json: true, headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiMjQ3ZWMxMC1lZDJjLTQ5NWEtYjUwZi1hZjAwY2FlNjBmZmIiLCJpYXQiOjE2NjA2NTY5NTQsImV4cCI6MTY2MDc0MzM1NH0.3yAsriEMDuHGWd5awFnrkXJXW1r0cpp9Zmae6_AOZMA'
            } });
        } catch (e) {
            console.log(e);
        }
        console.log(updateData.body);
    }
})();
