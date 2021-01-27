const express = require('express');
const db = require('../config/db');
const logger = require('../config/logger');

const User = db.user;
const Favorites = db.favorites;
const favoritesService = require('../services/favorites.service');
const attachmentService = require('../services/attachment.service');

const router = express.Router();
const PROJECT_TABLES = ['projects_line_1', 'projects_polygon_'];
const { CARTO_TOKEN } = require('../config/config');
const needle = require('needle');


function getFilters(params) {
   //console.log('PARAMS', params);
   let filters = '';
   let tipoid = '';
   let hasProjectType = false;
   const VALUES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
      'special_item_linear', 'special_item_area', 'channel_improvements_linear',
      'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
      'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];

   if (params.isproblem) {
      console.log('PROBLEMS');
      tipoid = 'problemid';
      if (params.name) {
         if (filters.length > 0) {
            filters = filters = ` and problemname ilike '%${params.name}%'`;
         }
         else {
            filters = ` problemname ilike '%${params.name}%' `;
         }
      }

      if (params.problemtype) {
         const query = createQueryForIn(params.problemtype.split(','));
         if (filters.length > 0) {
            filters = filters + ` and problemtype in (${query}) `;
         } else {
            filters = ` problemtype in (${query}) `;
         }
      }
   } else {
      console.log('PROJECTS');
      tipoid = 'projectid';
      if (params.name) {
         if (filters.length > 0) {
            filters = ` and projectname ilike '%${params.name}%' `;
         } else {
            filters = ` projectname ilike '%${params.name}%' `;
         }
      }

      if (params.problemtype) {

      }
   }

   // components




   // ALL FILTERS
   // PROBLEMS 
   if (params.priority) {
      const query = createQueryForIn(params.priority.split(','));
      if (filters.length > 0) {
         filters = filters + ` and problempriority in (${query})`;
      } else {
         filters = ` problempriority in (${query})`;
      }
   }

 

   // PROJECTS
   if (params.projecttype) {
      const query = createQueryForIn(params.projecttype.split(','));
      if (filters.length > 0) {
         filters = filters + ` and projecttype in (${query})`;
      } else {
         filters = `projecttype in (${query})`;
      }
      hasProjectType = true;
   }


   if (filters.length > 0) {
      filters = ' where ' + filters;
   }

   if (params.sortby) {
      let sorttype = '';
      let sortby = params.sortby;
      if (params.sortby === 'estimatedcost') {
         sortby = ` (coalesce(${params.sortby}::real, 0)) `;
      }

      if (params.sortby === 'projectname') {
         sortby = ` coalesce(projectname, '')`;
      }

      if (!params.sorttype) {
         sorttype = 'desc';
      } else {
         sorttype = params.sorttype;
      }
      filters += ` order by ${sortby} ${sorttype}`;
   }
   if (params.limit && params.page) {
      filters = ` limit= ${limit} offset=${params.page * params.limit}`
   }
   return filters;
}



function getCounters(table, column) {
  return ` (select count(*) from grade_control_structure where ${column} = cast(${table}.${column} as integer) ) as count_gcs, 
     (select count(*) from pipe_appurtenances where ${column} = cast(${table}.${column} as integer) ) as count_pa,
     (select count(*) from special_item_point where ${column} = cast(${table}.${column} as integer) ) as count_sip, 
     (select count(*) from special_item_linear where ${column} = cast(${table}.${column} as integer) ) as count_sil, 
     (select count(*) from special_item_area where ${column} = cast(${table}.${column} as integer) ) as count_sia, 
     (select count(*) from channel_improvements_linear where ${column} = cast(${table}.${column} as integer) ) as count_cila, 
     (select count(*) from channel_improvements_area where ${column} = cast(${table}.${column} as integer) ) as count_cia, 
     (select count(*) from  removal_line where ${column} = cast(${table}.${column} as integer) ) as count_rl, 
     (select count(*) from removal_area where ${column} = cast(${table}.${column} as integer) ) as count_ra, 
     (select count(*) from storm_drain where ${column} = cast(${table}.${column} as integer) ) as count_sd, 
     (select count(*) from detention_facilities where ${column} = cast(${table}.${column} as integer) ) as count_df, 
     (select count(*) from maintenance_trails where ${column} = cast(${table}.${column} as integer) ) as count_mt, 
     (select count(*) from land_acquisition where ${column} = cast(${table}.${column} as integer) ) as count_la, 
     (select count(*) from landscaping_area where ${column} = cast(${table}.${column} as integer) ) as count_la1 `;
}

router.get('/list', async (req, res) => {
  try {
     const list = await favoritesService.getAll();
     return res.send(list);
  } catch (error) {
     res.status(500).send({error: error});
  }
});

router.get('/', async (req, res) => {
  const email = req.query.email;
  console.log('my email ', email);
  const user = await User.findByEmail(email);
  try {  
    console.log(user);
    const favorite = await favoritesService.getFavorites(user._id);
    return res.send(favorite);
  } catch(error) {
    res.send(500);
  }
});

router.get('/create', async (req, res) => {
  const {email, table, cartodb_id} = req.query;
  console.log('entro aca');
  const user = await User.findByEmail(email);
  try {
    const favorite = {
      user_id: user._id,
      table: table,
      cartodb_id: cartodb_id
    };
    console.log('the user ', user);
    console.log('the favorite ', favorite);
    const savedFavorite = await favoritesService.saveFavorite(favorite);
    res.send(savedFavorite);

  } catch(error) {
    res.status(500).send('error found ', error);
  }
});
router.delete('/', async (req, res) => {
  const {email, table, cartodb_id} = req.body;
  const user = await User.findByEmail(email);
  try {
    const favorite = {
      user_id: user._id,
      table: table,
      cartodb_id: cartodb_id
    };
    const selectedFavorite = await favoritesService.getOne(favorite);
    selectedFavorite.destroy();
    res.send('deleted');

  } catch(error) {
    res.status(500).send('error found ' + error);
  }
});
router.post('/favorite-list', async (req, res) => {
  try {
     console.log('enter here');
     if (req.body.isproblem) {
      let filters = '';
      filters = getFilters(req.body);
        // 
        const PROBLEM_SQL = `SELECT cartodb_id, problemid, problemname, solutioncost, jurisdiction, problempriority, solutionstatus, problemtype, county, ${getCounters('problems', 'problemid')}, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM problems `;
        //const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${PROBLEM_SQL} ${filters} &api_key=${CARTO_TOKEN}`);
        const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
        const query = { q: `${PROBLEM_SQL}  ${filters} ` };
        let answer = [];
        try {
           const data = await needle('post', URL, query, { json: true });
           //console.log('status', data.statusCode);
           if (data.statusCode === 200) {
              /* let coordinates = [];
              if (JSON.parse(element.the_geom).coordinates) {
                coordinates = JSON.parse(element.the_geom).coordinates;
              } */
              answer = data.body.rows.map(element => {
                 return {
                    cartodb_id: element.cartodb_id,
                    type: 'problems',
                    problemid: element.problemid,
                    problemname: element.problemname,
                    solutioncost: element.solutioncost,
                    jurisdiction: element.jurisdiction,
                    problempriority: element.problempriority,
                    solutionstatus: element.solutionstatus,
                    problemtype: element.problemtype,
                    county: element.county,
                    totalComponents: element.count_gcs + element.count_pa + element.count_sip + element.count_sil +
                       element.count_cia + element.count_sia + element.count_rl + element.count_ra +
                       element.count_sd + element.count_df + element.count_mt + element.count_la +
                       element.count_la + element.count_la1 + element.count_cila,
                    coordinates: JSON.parse(element.the_geom).coordinates ? JSON.parse(element.the_geom).coordinates : []
                 }
              })
           } else {
              console.log('bad status', response.statusCode, response.body);
              logger.error('bad status', response.statusCode, response.body);
           }
        } catch (error) {
           console.log('Error', error);
        }

        const email = req.body.email;
        console.log('my email ', email);
        const user = await User.findByEmail(email);
        try {  
          
         const favorite = await favoritesService.getFavorites(user._id);
          const ids = favorite.map(fav => {
            return {cartodb_id: fav.cartodb_id, table: fav.table};
          });
          console.log('my ids ', ids);
          answer = answer.filter(element => {
            for (const id of ids) {
              if (element.type === id.table && element.cartodb_id === id.cartodb_id) {
                return true;
              }
            }
            return false;
          });
          return res.send(answer);
         } catch(error) {
            return res.send([]);
          }
     } else {
        let filters = '';
        let send = [];
        
        filters = getFilters(req.body);
        const PROJECT_FIELDS = 'cartodb_id, objectid, projectid, projecttype, projectsubtype, coverimage, sponsor, finalCost, ' +
           'estimatedCost, status, attachments, projectname, jurisdiction, streamname, county ';

        if (req.body.problemtype) {
           const result = await queriesByProblemTypeInProject(PROJECT_FIELDS, filters, req.body.problemtype);
           return res.status(200).send(result);
        } else {
          console.log('miau miau miau');
           for (const table of PROJECT_TABLES) {
              let query = ''
              if (table === 'projects_line_1') {
                 query = { q: `SELECT '${table}' as type, ${PROJECT_FIELDS}, ${getCounters('projects_line_1', 'projectid')}, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM ${table} ${filters} ` };
              } else {
                 query = { q: `SELECT '${table}' as type, ${PROJECT_FIELDS}, ${getCounters('projects_polygon_', 'projectid')}, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM ${table} ${filters} ` };
              }
              console.log(query);
              const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
              let answer = [];
              try {
                console.log(URL, query);
                 const data = await needle('post', URL, query, { json: true });
                 //console.log('STATUS', data.statusCode);
                 if (data.statusCode === 200) {
                    const result = data.body.rows;
                    for (const element of result) {
                       let valor = '';
                       if (element.attachments) {
                          valor = await attachmentService.findCoverImage(element.attachments);
                          //console.log('mi valor ', valor);
                          if (valor) {
                             valor = valor.split('https://storage.googleapis.com/mhfd-cloud.appspot.com/');
                             valor = 'https://storage.googleapis.com/mhfd-cloud.appspot.com/compressed/' + valor[1];
                          }
                       }
                       let coordinates = [];
                       if (element.the_geom && JSON.parse(element.the_geom).coordinates) {
                          coordinates = JSON.parse(element.the_geom).coordinates;
                       }
                       answer.push({
                          type: element.type,
                          cartodb_id: element.cartodb_id,
                          objectid: element.objectid,
                          projectid: element.projectid,
                          projecttype: element.projecttype,
                          projectsubtype: element.projectsubtype,
                          coverimage: element.coverimage,
                          sponsor: element.sponsor,
                          finalcost: element.finalcost,
                          estimatedcost: element.estimatedcost,
                          status: element.status,
                          attachments: element.attachments,
                          projectname: element.projectname,
                          jurisdiction: element.jurisdiction,
                          streamname: element.streamname,
                          county: element.county,
                          attachments: valor,
                          totalComponents: element.count_gcs + element.count_pa + element.count_sip + element.count_sil +
                             element.count_cia + element.count_sia + element.count_rl + element.count_ra +
                             element.count_sd + element.count_df + element.count_mt + element.count_la +
                             element.count_la + element.count_la1 + element.count_cila,
                          coordinates: coordinates
                       });
                    }
                    send = send.concat(answer);
                 } else {
                    console.log('bad status ', response.statusCode, response.body);
                 }
              } catch (error) {
                 console.log(error);
              };
           }
        }
        const email = req.body.email;
        console.log('my email ', email);
        const user = await User.findByEmail(email);
        try {  
          const favorite = await favoritesService.getFavorites(user._id);
          console.log('my favorite ', favorite);
          const ids = favorite.map(fav => {
            return {cartodb_id: fav.cartodb_id, table: fav.table};
          });
          console.log('my ids ', ids);
          send = send.filter(element => {
            for (const id of ids) {
              if (element.type === id.table && element.cartodb_id === id.cartodb_id) {
                return true;
              }
            }
            return false;
          });
          return res.send(send);
        } catch(error) {
          return res.send([]);
        }
     }
  } catch (error) {
     logger.error(error);
     res.status(500).send({ error: error }).send({ error: 'Error with C connection' });
  }

});

module.exports = router;