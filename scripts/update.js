require('dotenv').config()
const needle = require('needle');
const URL = 'https://confluencebc.mhfd.org';

needle.defaults({ open_timeout: 60000 });
(async () => {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
    const localities = [
        {"name":"Arvada","type":"JURISDICTION"},
        {"name":"Broomfield","type":"JURISDICTION"},
        {"name":"Castle Pines","type":"JURISDICTION"},
        {"name":"Centennial","type":"JURISDICTION"},
        {"name":"Aurora","type":"JURISDICTION"},
        {"name":"Boulder","type":"JURISDICTION"},
        {"name":"Brighton","type":"JURISDICTION"},
        {"name":"Mountain View","type":"JURISDICTION"},
        {"name":"Northglenn","type":"JURISDICTION"},
        {"name":"Parker","type":"JURISDICTION"},
        {"name":"Cherry Hills Village","type":"JURISDICTION"},
        {"name":"Erie","type":"JURISDICTION"},
        {"name":"Unincorporated Arapahoe County","type":"JURISDICTION"},
        {"name":"Unincorporated Adams County","type":"JURISDICTION"},
        {"name":"Commerce City","type":"JURISDICTION"},
        {"name":"Denver","type":"JURISDICTION"},
        {"name":"Englewood","type":"JURISDICTION"},
        {"name":"Littleton","type":"JURISDICTION"},
        {"name":"Lochbuie","type":"JURISDICTION"},
        {"name":"Lone Tree","type":"JURISDICTION"},
        {"name":"Louisville","type":"JURISDICTION"},
        {"name":"Federal Heights","type":"JURISDICTION"},
        {"name":"Greenwood Village","type":"JURISDICTION"},
        {"name":"Lafayette","type":"JURISDICTION"},
        {"name":"Lakeside","type":"JURISDICTION"},
        {"name":"Lakewood","type":"JURISDICTION"},
        {"name":"Unincorporated Jefferson County","type":"JURISDICTION"},
        {"name":"SEMSWA","type":"JURISDICTION"},
        {"name":"Golden","type":"JURISDICTION"},
        {"name":"Unincorporated Boulder County","type":"JURISDICTION"},
        {"name":"Unincorporated Douglas County","type":"JURISDICTION"},
        {"name":"Sheridan","type":"JURISDICTION"},
        {"name":"Superior","type":"JURISDICTION"},
        {"name":"Thornton","type":"JURISDICTION"},
        {"name":"Wheat Ridge","type":"JURISDICTION"},
        {"name":"Westminster","type":"JURISDICTION"},
        {"name":"Foxfield","type":"JURISDICTION"},
        {"name":"Bow Mar","type":"JURISDICTION"},
        {"name":"Glendale","type":"JURISDICTION"},
        {"name":"Edgewater","type":"JURISDICTION"},
        {"name":"Columbine Valley","type":"JURISDICTION"},
        {"name":"Morrison","type":"JURISDICTION"},
        {"name":"North Service Area","type":"SERVICE_AREA"},
        {"name":"South Service Area","type":"SERVICE_AREA"},
        {"name":"Northeast Service Area","type":"SERVICE_AREA"},
        {"name":"Boulder Creek Service Area","type":"SERVICE_AREA"},
        {"name":"Cherry Creek Service Area","type":"SERVICE_AREA"},
        {"name":"West Service Area","type":"SERVICE_AREA"},
        {"name":"Sand Creek Service Area","type":"SERVICE_AREA"},
        {"name":"Southwest Service Area","type":"SERVICE_AREA"},
        {"name":"Adams County","type":"COUNTY"},
        {"name":"Arapahoe County","type":"COUNTY"},
        {"name":"Boulder County","type":"COUNTY"},
        {"name":"Broomfield County","type":"COUNTY"},
        {"name":"Denver County","type":"COUNTY"},
        {"name":"Douglas County","type":"COUNTY"},
        {"name":"Jefferson County","type":"COUNTY"},
        {"name":"MHFD District Work Plan","type":"SERVICE_AREA"},
        {"name":"South Platte River County","type":"COUNTY"}
    ];
    const years = [2023, 2024, 2025, 2026];
    const projecttypes = ['Capital', 'Study', 'Maintenance', 'Acquisition', 'Special']
    const types = ['WORK_REQUEST', 'WORK_PLAN'];
    for (var i = 0 ; i < localities.length ; i++) {
        let locality = localities[i];
        let type = locality.type === "JURISDICTION" ? types[0] : types[1];
        for (var j = 0 ; j < years.length ; j++){
            var year = years[j];
            for (var k = 0 ; k < projecttypes.length ; k++) {
                var projecttype = projecttypes[k];
                try {
                    let data;
                    data = await needle('post', URL + '/board',
                    {
                        type, year, locality: locality.name, projecttype
                    },
                    { json: true });
                    await new Promise(resolve => setTimeout(resolve, 300));
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }
})();
