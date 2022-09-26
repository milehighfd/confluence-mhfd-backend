require('dotenv').config();

const needle = require('needle');
const URL = 'https://confdevbc.mhfd.org';

needle.defaults({ open_timeout: 60000 });
(async () => {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
    
})();
