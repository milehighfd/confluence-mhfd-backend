import {
  PROPSPROBLEMTABLES
} from 'bc/config/config.js';
import favoritesService from "bc/services/favorites.service.js";

export const createQueryForIn = (data) => {
  let query = '';
  let separator = '';
  for (const elem of data) {
     query += separator + '\'' + elem.trim() + '\'';
     separator = ','
  }
  return query;
}
export const getFilters = async (params) => {
  //console.log('PARAMS', params);
  let filters = '';
  let tipoid = '';
  let hasProjectType = false;
  const VALUES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point',
     'special_item_linear', 'special_item_area', 'channel_improvements_linear',
     'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain',
     'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];

  if (params.isproblem) {
     // console.log('PROBLEMS');
     tipoid = 'problemid';      
     if (params.name) {
        let name = params.name;
        if (!Number.isInteger(Number(name))) {
           name += ' ';
         }
        if (filters.length > 0) {
           filters = filters = ` and (${PROPSPROBLEMTABLES.problem_boundary[6]} ilike '%${name}%' OR ${PROPSPROBLEMTABLES.problem_boundary[5]}::text ilike '%${name}%')`;
        }
        else {
           filters = ` (${PROPSPROBLEMTABLES.problem_boundary[6]} ilike '%${name}%' OR ${PROPSPROBLEMTABLES.problem_boundary[5]}::text ilike '%${name}%') `;
        }
     }

     if (params.problemtype) {
        const query = createQueryForIn(params.problemtype.split(','));
        if (filters.length > 0) {
           filters = filters + ` and ${PROPSPROBLEMTABLES.problem_boundary[8]} in (${query}) `;
        } else {
           filters = ` ${PROPSPROBLEMTABLES.problem_boundary[8]} in (${query}) `;
        }
     }
  } else {
     // console.log('PROJECTS ROU');
     tipoid = 'projectid';
     if (params.name) {
        if (filters.length > 0) {
           filters = ` and (projectname ilike '%${params.name}%' OR onbaseid::text ilike '%${params.name}%') `;
        } else {
           filters = ` (projectname ilike '%${params.name}%' OR onbaseid::text ilike '%${params.name}%') `;
        }
     }
     // console.log("ID AQUI", params );
     if (params.problemtype) {

     }
  }

  // components
  if (params.componenttype) {
     //console.log('COMPONENTS FILTER', params.componenttype);
     const values = params.componenttype.split(',');
     let query = '';
     let operator = '';
     for (const component of values) {
        query += operator + ` ${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid}) `;
        operator = ' or ';
     }

     if (filters.length > 0) {
        filters += ` AND (${query})`;
     } else {
        filters = ` (${query})`;
     }
  }

  if (params.componentstatus) {
     const values = createQueryForIn(params.componentstatus.split(','));
     let query = '';
     let operator = '';
     // for (const value of values) {
     for (const component of VALUES_COMPONENTS) {
        query += operator +
           ` ${tipoid} in (select ${tipoid} from ${component} where status in (${values})) `;
        operator = ' or ';
     }
     //}

     if (filters.length > 0) {
        filters += ` AND (${query})`;
     } else {
        filters = ` (${query})`;
     }

  }

 //  if (params.watershed) {
 //     const values = createQueryForIn(params.watershed.split(','));
 //     let query = '';
 //     let operator = '';
 //     //for (const value of values) {
 //     for (const component of VALUES_COMPONENTS) {
 //        query += operator +
 //           ` ${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid} and mhfdmanager in (${values})) `;
 //        operator = ' or ';
 //     }
 //     //}

 //     if (filters.length > 0) {
 //        filters += ` AND (${query})`;
 //     } else {
 //        filters = ` (${query})`;
 //     }
 //  }

  if (params.yearofstudy) {
     const values = params.yearofstudy.split(',');
     let query = '';
     let operator = '';
     for (const value of values) {
        //const initValue = value;
        for (const component of VALUES_COMPONENTS) {
           query += operator +
              ` ${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid} and year_of_study between ${value} and ${value + 9}) `;
           operator = ' or ';
        }
     }

     if (filters.length > 0) {
        filters += ` AND (${query})`;
     } else {
        filters = ` (${query})`;
     }
  }

  if (params.estimatedcostComp && params.estimatedcostComp.length > 0) {

     let query = '';
     let operator = '';
     for (const value of params.estimatedcostComp) {
        const values = value.split(',');

        for (const component of VALUES_COMPONENTS) {
           query += operator +
              ` (${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid} and estimated_cost > 0 and estimated_cost between ${values[0]} and ${values[1]} )) `;
           operator = ' or ';
        }
     }

     if (filters.length > 0) {
        filters = `and (${query})`;
     } else {
        filters = ` (${query})`;
     }
  }

  if (params.jurisdictionComp) {

     const values = createQueryForIn(params.jurisdictionComp.split(','));
     let query = '';
     let operator = '';
     //const initValue = value;
     for (const component of VALUES_COMPONENTS) {
        query += operator +
           ` ${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid} and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[2] : PROPSPROBLEMTABLES.problems[2]} in (${values}) ) `;
        operator = ' or ';
     }

     if (filters.length > 0) {
        filters += ` AND (${query})`;
     } else {
        filters = ` (${query})`;
     }
  }

  if (params.countyComp) {
     const values = createQueryForIn(params.countyComp.split(','));
     let query = '';
     let operator = '';
     //const initValue = value;
     for (const component of VALUES_COMPONENTS) {
        query += operator +
           ` ${tipoid} in (select ${tipoid} from ${component} where ${component}.${tipoid}=${tipoid} and county in (${values}) ) `;
        operator = ' or ';
     }

     if (filters.length > 0) {
        filters += ` AND (${query})`;
     } else {
        filters = ` (${query})`;
     }
  }

  // ALL FILTERS
  // PROBLEMS 
  if (params.priority) {
     const query = createQueryForIn(params.priority.split(','));
     if (filters.length > 0) {
        filters = filters + ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[7] : PROPSPROBLEMTABLES.problems[7]} in (${query})`;
     } else {
        filters = ` ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[7] : PROPSPROBLEMTABLES.problems[7]} in (${query})`;
     }
  }

  if (params.solutionstatus) {
     let limite = 0;
     console.log('SOLUTIONS', params.solutionstatus);
     const values = params.solutionstatus.split(',');
     let query = '';
     let operator = '';
     for (const val of values) {

        limite = Number(val) + 25;
        query += operator + ` (cast(${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[1] : PROPSPROBLEMTABLES.problems[1]} as int) between ${val} and ${limite}) `;
        operator = ' or ';
     }

     if (filters.length > 0) {
        filters = filters + ` and ${query} `;
     } else {
        filters = ` ${query} `;
     }
  }

  if (params.cost && params.cost.length > 0) {
   filters += ` ${filters.length > 0 ? 'and': ''}  (${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[0] : PROPSPROBLEMTABLES.problems[0]} between ${params.cost[0]} and ${ +params.cost[1]-1})`;
  }

  if (params.servicearea) {
     const query = createQueryForIn(params.servicearea.split(','));
     if (filters.length > 0) {
        filters += ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[9] : PROPSPROBLEMTABLES.problems[9]} in (${query})`;
     } else {
        filters = ` ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[9] : PROPSPROBLEMTABLES.problems[9]} in (${query})`;
     }
  }

  //TODO here is the filter that needs to be related to DB
  if (params.mhfdmanager) {
     const query = createQueryForIn(params.mhfdmanager);
     if (filters.length > 0) {
        filters = filters + ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[3] : PROPSPROBLEMTABLES.problems[3]} in (${query})`;
     } else {
        filters = `${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[3] : PROPSPROBLEMTABLES.problems[3]} in (${query})`;
     }
  }
  if (params.favorites) {
      const favoriteObj = await favoritesService.getFavorites(params.favorites, true);
      const favorite = favoriteObj;
      const ids = favorite
      .map((fav) => fav.problem_id);
      const stringArray = ids.map(num => num.toString());
      const query = createQueryForIn(stringArray);
      if (filters.length > 0) {
         filters = filters + ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[5] : PROPSPROBLEMTABLES.problems[5]} in (${query})`;
      } else {
         filters = `${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[5] : PROPSPROBLEMTABLES.problems[5]} in (${query})`;
      }
   }

  if (params.source) {
     const query = createQueryForIn(params.source.split(','));
     if (filters.length > 0) {
        filters = filters + ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[14] : PROPSPROBLEMTABLES.problems[14]} in (${query}) `;
     } else {
        filters = ` ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[14] : PROPSPROBLEMTABLES.problems[14]} in (${query}) `;
     }
  }

  if (params.components) {
     //console.log('COMPONENTES', params.components);
     const values = params.components.split(',');
     let query = '';
     let operator = '';
     for (const val of values) {
        query += operator + ` ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[5] : PROPSPROBLEMTABLES.problems[5]} in (select ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[5] : PROPSPROBLEMTABLES.problems[5]} from ${val})`;
        operator = ' or ';
     }

     if (filters.length > 0) {
        filters += ` and ${query} `;
     } else {
        filters = ` ${query} `;
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

  if (params.consultant) {
     const query = createQueryForIn(params.consultant.split(','));
     if (filters.length > 0) {
        filters += ` and consultant in (${query}) `;
     } else {
        filters = ` consultant in (${query})`;
     }
  }

  if (params.contractor) {
     const query = createQueryForIn(params.contractor.split(','));
     if (filters.length > 0) {
        filters += ` and contractor in (${query}) `;
     } else {
        filters = ` contractor in (${query})`;
     }
  }

  if (params.status) {
     const query = createQueryForIn(params.status.split(','))
     if (filters.length > 0) {
        filters = filters + ` and status in (${query})`;
     } else {
        filters = `status in (${query})`;
     }
  }

  if (params.startyear) {
     if (filters.length > 0) {
        filters = filters + ` and startyear = ${params.startyear} `;
     } else {
        filters = `startyear = ${params.startyear} `;
     }
  }

  if (params.completedyear) {
     if (filters.length > 0) {
        filters = filters + ` and ${COMPLETE_YEAR_COLUMN} = ${params.completedyear} `;
     } else {
        filters = ` ${COMPLETE_YEAR_COLUMN} = ${params.completedyear} `;
     }
  }

  if (params.mhfddollarsallocated && params.mhfddollarsallocated.length > 0) {
     let query = '';
     let operator = '';

     for (const mhfddolar of params.mhfddollarsallocated) {
        const values = mhfddolar.split(',');
        query += operator + ` (cast(mhfddollarsallocated as bigint) between ${values[0]} and ${values[1]})`;
        operator = ' or ';
     }

     if (filters.length > 0) {
        filters = filters + ` and (${query})`;
     } else {
        filters = ` (${query}) `;
     }
  }

  if (params.totalcost && params.totalcost.length > 0) {
     let query = '';
     let operator = '';

     for (const cost of params.totalcost) {
        const values = cost.split(',');
        query += operator + ` (coalesce(cast(finalcost as real), cast(estimatedcost as real)) between ${values[0]} and ${values[1]}) `;
        operator = ' or ';
     }

     if (filters.length > 0) {
        filters += ` and (${query}) `;
     } else {
        filters = ` (${query}) `;
     }
  }

  if (params.workplanyear) {
     const values = params.workplanyear.split(',');
     let query = '';
     let operator = '';
     for (const year of values) {
        //console.log(year);
        switch (year) {
           case "2019": {
              query += operator + ` workplanyr1 > 0`;
              break;
           }
           case "2020": {
              query += operator + ` workplanyr2 > 0`;
              break;
           }
           case "2021": {
              query += operator + ` workplanyr3 > 0`;
              break;
           }
           case "2022": {
              query += operator + ` workplanyr4 > 0`;
              break;
           }
           case "2023": {
              query += operator + ` workplanyr5 > 0`;
              break;
           }
        }
        operator = ' or ';
     }
     //console.log(query);
     if (filters.length > 0) {
        filters += ` and (${query}) `;
     } else {
        filters = ` (${query}) `;
     }
  }

  if (params.lgmanager) {
     const query = createQueryForIn(params.lgmanager.split(','));
     if (filters.length > 0) {
        filters = filters + ` and lgmanager in (${query}) `;
     } else {
        filters = ` lgmanager in (${query}) `;
     }
  }

  if (params.streamname) {
     const query = createQueryForIn(params.streamname.split(','));
     if (filters.length > 0) {
        filters = filters + ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[15] : PROPSPROBLEMTABLES.problems[15]} in (${query}) `;
     } else {
        filters = ` ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[15] : PROPSPROBLEMTABLES.problems[15]} in (${query}) `;
     }
  }

  if (params.creator) {
     const query = createQueryForIn(params.creator.split(','));
     if (filters.length > 0) {
        filters = filters + ` and creator in (${query}) `;
     } else {
        filters = ` creator in (${query}) `;
     }
  }

  // 
  if (params.bounds) {
     const coords = params.bounds.split(',');
     filters = filters.trim();
     if (filters.length > 0) {

        filters += ` and (ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
        filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`; // only for readbility 
     } else {
        filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
        filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`; // only for readbility 
     }
  }

  if (params.county) {
     const query = createQueryForIn(params.county.split(','));
     if (filters.length > 0) {
        filters = filters + ` and county in (${query})`;
     } else {
        filters = `county in (${query})`;
     }
  }

  if (params.jurisdiction) {
     //const data = params.jurisdiction.split(',');
     const query = createQueryForIn(params.jurisdiction.split(','));
     if (filters.length > 0) {
        filters = filters + ` and ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[2] : PROPSPROBLEMTABLES.problems[2]} in (${query})`;
     } else {
        filters = ` ${params.isproblem ? PROPSPROBLEMTABLES.problem_boundary[2] : PROPSPROBLEMTABLES.problems[2]} in (${query})`;
     }
  }

  if (!hasProjectType && !params.isproblem) {
     if (filters.length > 0) {
        filters += ` and projecttype in ('Capital', 'Study', 'Maintenance')`;
     } else {
        filters = `projecttype in ('Capital', 'Study', 'Maintenance')`;
     }
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
  console.log('\n\n\n FiLTERS AT FUNCTIONS', filters, '\n\n\n\n\n\n');
  return filters;
}