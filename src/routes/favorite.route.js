import express from 'express';
import needle from 'needle';
import logger from 'bc/config/logger.js';
import favoritesService from 'bc/services/favorites.service.js';
import attachmentService from 'bc/services/attachment.service.js';
import { CARTO_URL, PROPSPROBLEMTABLES, MAIN_PROJECT_TABLE } from 'bc/config/config.js';
import auth from 'bc/auth/auth.js';

const router = express.Router();
const PROJECT_TABLES = [MAIN_PROJECT_TABLE];
const PROBLEMS_TABLE = 'problem_boundary';

function getFilters(params, ids) {
   let filters = '';
   let tipoid = '';
   let hasProjectType = false;

   if (params.isproblem) {
      tipoid = 'problem_id';
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
      // console.log('PROJECTS');
      tipoid = 'projectid';
      if (params.name) {
         if (filters.length > 0) {
            filters = ` and projectname ilike '%${params.name}%' `;
         } else {
            filters = ` projectname ilike '%${params.name}%' `;
         }
         // console.log("ID", filters);
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
      filters += ` and`
   }
   filters += ` ${tipoid} in ('${ids.join("','")}')`

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
     console.log('my list ', list);
     return res.send(list);
  } catch (error) {
     res.status(500).send({error: error});
  }
});

router.get('/', auth, async (req, res) => {
  const user = req.user;
  try {  
    console.log(user);
    const favorite = await favoritesService.getFavorites(user._id);
    return res.send(favorite);
  } catch(error) {
    res.send(500);
  }
});

router.get('/create', auth, async (req, res) => {
  const {table, id} = req.query;
  const user = req.user;
  try {
    const favorite = {
      user_id: user._id,
      table: table,
      id: id
    };
    logger.info('create favorite ', favorite);
    const savedFavorite = await favoritesService.saveFavorite(favorite);
    res.send(savedFavorite);

  } catch(error) {
    res.status(500).send('error found ', error);
  }
});
router.delete('/', auth, async (req, res) => {
  const {table, id} = req.body;
  const user = req.user;
  try {
    const favorite = {
      user_id: user._id,
      table: table,
      id: id
    };
    const selectedFavorite = await favoritesService.getOne(favorite);
    selectedFavorite.destroy();
    logger.info('DELETED  ', user.email, table, id);
    res.send('deleted');

  } catch(error) {
     logger.error('error found on delete ', error);
    res.status(500).send('error found ' + error);
  }
});
router.post('/favorite-list', auth, async (req, res) => {
   const user = req.user;
   const favorite = await favoritesService.getFavorites(user._id);
   console.log(favorite);
   const ids = favorite
      .filter(fav => {
         if (req.body.isproblem) {
            return fav.table === PROBLEMS_TABLE;
         } else {
            return fav.table === PROJECT_TABLES[0];
         }
      })
      .map(fav => `${fav.id}`);
   if (ids.length === 0) {
      return res.send([]);
   }
  try {
     if (req.body.isproblem) {
      let filters = '';
      filters = getFilters(req.body, ids);
        const PROBLEM_SQL = `SELECT cartodb_id, ${PROPSPROBLEMTABLES.problem_boundary[5]} as ${PROPSPROBLEMTABLES.problems[5]}, ${PROPSPROBLEMTABLES.problem_boundary[6]} as ${PROPSPROBLEMTABLES.problems[6]}, ${PROPSPROBLEMTABLES.problem_boundary[0]} as ${PROPSPROBLEMTABLES.problems[0]}, ${PROPSPROBLEMTABLES.problem_boundary[2]} as ${PROPSPROBLEMTABLES.problems[2]}, ${PROPSPROBLEMTABLES.problem_boundary[7]} as ${PROPSPROBLEMTABLES.problems[7]}, ${PROPSPROBLEMTABLES.problem_boundary[1]} as ${PROPSPROBLEMTABLES.problems[1]}, ${PROPSPROBLEMTABLES.problem_boundary[8]} as ${PROPSPROBLEMTABLES.problems[8]}, county, ${getCounters(PROBLEMS_TABLE, PROPSPROBLEMTABLES.problem_boundary[5])}, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM ${PROBLEMS_TABLE} `;
        const query = { q: `${PROBLEM_SQL}  ${filters} ` };
        let answer = [];
        try {
           const data = await needle('post', CARTO_URL, query, { json: true });
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
                    problemid: element.problem_id,
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
              console.log('answer', answer);
           } else {
              console.log('bad status', data.statusCode, data.body);
              logger.error('bad status', data.statusCode, data.body);
           }
        } catch (error) {
           console.log('Error', error);
        }
         return res.send(answer);
     } else {
        let filters = '';
        let send = [];
        
        filters = getFilters(req.body, ids);
        const PROJECT_FIELDS = 'cartodb_id, objectid, projectid, projecttype, projectsubtype, coverimage, sponsor, finalCost, ' +
           'estimatedCost, status, attachments, projectname, jurisdiction, streamname, county ';

        if (req.body.problemtype) {
           const result = await queriesByProblemTypeInProject(PROJECT_FIELDS, filters, req.body.problemtype);
           return res.status(200).send(result);
        } else {
           for (const table of PROJECT_TABLES) {
              let query = ''
              if (table === MAIN_PROJECT_TABLE) {
                 query = { q: `SELECT '${table}' as type, ${PROJECT_FIELDS}, ${getCounters(MAIN_PROJECT_TABLE, 'projectid')}, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM ${table} ${filters} ` };
              }
              let answer = [];
              try {
                console.log(CARTO_URL, query);
                 const data = await needle('post', CARTO_URL, query, { json: true });
                 //console.log('STATUS', data.statusCode);
                 if (data.statusCode === 200) {
                    const result = data.body.rows;
                    for (const element of result) {
                       let valor = '';
                       if (element.attachments) {
                          valor = await attachmentService.findCoverImage(element.attachments);
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
                     console.log('bad status ', data.statusCode, data.body);
                    logger.error('bad status ', data.statusCode, data.body);
                 }
              } catch (error) {
                 logger.error(error);
              };
           }
        }
        return res.send(send);
     }
  } catch (error) {
     logger.error(error);
     res.status(500).send({ error: error }).send({ error: 'Error with C connection' });
  }

});

export default router;