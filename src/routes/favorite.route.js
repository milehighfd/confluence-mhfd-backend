import express from "express";
import needle from "needle";
import logger from "bc/config/logger.js";
import favoritesService from "bc/services/favorites.service.js";
import attachmentService from "bc/services/attachment.service.js";
import projectService from "bc/services/project.service.js";
import {
  CARTO_URL,
  PROPSPROBLEMTABLES,
  MAIN_PROJECT_TABLE,
} from "bc/config/config.js";
import auth from "bc/auth/auth.js";

const router = express.Router();
const PROJECT_TABLES = [MAIN_PROJECT_TABLE];
const PROBLEMS_TABLE = "problem_boundary";

function getFilters(params, ids) {
  let filters = "";
  let tipoid = "";
  let hasProjectType = false;

  tipoid = "problem_id";
  if (params.name) {
    if (filters.length > 0) {
      filters = filters = ` and problemname ilike '%${params.name}%'`;
    } else {
      filters = ` problemname ilike '%${params.name}%' `;
    }
  }

  if (params.problemtype) {
    const query = createQueryForIn(params.problemtype.split(","));
    if (filters.length > 0) {
      filters = filters + ` and problemtype in (${query}) `;
    } else {
      filters = ` problemtype in (${query}) `;
    }
  }
  

  // components

  // ALL FILTERS
  // PROBLEMS
  if (params.priority) {
    const query = createQueryForIn(params.priority.split(","));
    if (filters.length > 0) {
      filters = filters + ` and problempriority in (${query})`;
    } else {
      filters = ` problempriority in (${query})`;
    }
  }

  // PROJECTS
  if (params.projecttype) {
    const query = createQueryForIn(params.projecttype.split(","));
    if (filters.length > 0) {
      filters = filters + ` and projecttype in (${query})`;
    } else {
      filters = `projecttype in (${query})`;
    }
    hasProjectType = true;
  }

  if (filters.length > 0) {
    filters += ` and`;
  }
  filters += ` ${tipoid} in (${ids.join(",")})`;

  if (filters.length > 0) {
    filters = " where " + filters;
  }

  if (params.sortby) {
    let sorttype = "";
    let sortby = params.sortby;
    if (params.sortby === "estimatedcost") {
      sortby = ` (coalesce(${params.sortby}::real, 0)) `;
    }

    if (params.sortby === "projectname") {
      sortby = ` coalesce(projectname, '')`;
    }

    if (!params.sorttype) {
      sorttype = "desc";
    } else {
      sorttype = params.sorttype;
    }
    filters += ` order by ${sortby} ${sorttype}`;
  }
  if (params.limit && params.page) {
    filters = ` limit= ${limit} offset=${params.page * params.limit}`;
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

router.get("/", auth, async (req, res) => {
  logger.info(`Starting endpoint favorite/ with params`);
  const { isProblem } = req.query;
  const user = req.user;
  try {
    console.log(user);
    logger.info(`Starting function getFavorites for favorite/`);
    const favorite = await favoritesService.getFavorites(user.user_id, isProblem);
    logger.info(`Finished function getFavorites for favorite/`);
    return res.send(favorite);
  } catch (error) {
    res.status(500).send(error);
  }
});


router.get("/create", auth, async (req, res) => {
  logger.info(`Starting endpoint favorite/create with params`);
  const { id, isProblem } = req.query;
  const user = req.user;
  try {
    const favorite = {
      user_id: user.user_id,
      idField: id,
      creator: user.email,
    };
    logger.info("create favorite ", favorite);
    logger.info(`Starting function saveFavorite for favorite/create`);
    const savedFavorite = await favoritesService.saveFavorite(favorite, isProblem);
    logger.info(`Finished function saveFavorite for favorite/create`);
    res.send(savedFavorite);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.delete("/", auth, async (req, res) => {
  logger.info(`Starting endpoint favorite/ with params ${JSON.stringify(req.params, null, 2)}`);
  const { id } = req.body;
  const { isProblem } = req.query;
  const user = req.user;
  try {
    const favorite = {
      user_id: user.user_id,
      project_id: id,
    };
    logger.info(`Starting function getOne for favorite/`);
    const selectedFavorite = await favoritesService.getOne(favorite, isProblem);
    logger.info(`Finished function getOne for favorite/`);
    if (selectedFavorite) {
      selectedFavorite.destroy();
    } else {
      return res.status(404).send({ error: `${id} not found` });
    }
    logger.info(`DELETED id=${id} for user ${user.user_id}`);
    res.send({ status: "deleted", id: id });
  } catch (error) {
    logger.error("error found on delete ", error);
    res.status(500).send("error found " + error);
  }
});

router.get("/count", auth, async (req, res) => {
  logger.info(`Starting endpoint favorite/count with params ${JSON.stringify(req.params, null, 2)}`);
  const { isProblem } = req.query;
  const user = req.user;
  try {
    console.log(user.user_id);
    logger.info(`Starting function countFavorites for favorite/count`);
    const favorite = await favoritesService.countFavorites(user.user_id, isProblem);
    logger.info(`Finished function countFavorites for favorite/count`);
    res.send({ count: favorite });
  } catch (error) {
    res.status(500).send("error found " + error);
  }
});

router.get("/problem-cards", auth, async (req, res) => {
  logger.info(`Starting endpoint favorite/problem-cards with params ${JSON.stringify(req.params, null, 2)}`);
  const user = req.user;
  try {
    logger.info(`Starting function getFavorites for favorite/problem-cards`);
    const favoriteObj = await favoritesService.getFavorites(user.user_id, true);
    logger.info(`Finished function getFavorites for favorite/problem-cards`);
    const favorite = favoriteObj;
    const ids = favorite
    .map((fav) => fav.problem_id);
    console.log('favorites are ', ids);
    if (!ids.length) {
      return res.send([]);
    }
    let filters = "";
    filters = getFilters(req.body, ids);
    const PROBLEM_SQL = `SELECT cartodb_id,
    ${PROPSPROBLEMTABLES.problem_boundary[5]} 
    as ${PROPSPROBLEMTABLES.problems[5]}, 
    ${PROPSPROBLEMTABLES.problem_boundary[6]} 
    as ${PROPSPROBLEMTABLES.problems[6]},
    ${PROPSPROBLEMTABLES.problem_boundary[0]} 
    as ${PROPSPROBLEMTABLES.problems[0]}, 
    ${PROPSPROBLEMTABLES.problem_boundary[2]}
    as ${PROPSPROBLEMTABLES.problems[2]}, 
    ${PROPSPROBLEMTABLES.problem_boundary[7]} 
    as ${PROPSPROBLEMTABLES.problems[7]}, 
    ${PROPSPROBLEMTABLES.problem_boundary[1]}
    as ${PROPSPROBLEMTABLES.problems[1]},
    ${PROPSPROBLEMTABLES.problem_boundary[8]}
    as ${PROPSPROBLEMTABLES.problems[8]}, county, ${getCounters(
      PROBLEMS_TABLE,
      PROPSPROBLEMTABLES.problem_boundary[5]
    )}, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM ${PROBLEMS_TABLE} `;
    const query = { q: `${PROBLEM_SQL}  ${filters} ` };
    console.log(`${PROBLEM_SQL}  ${filters} `);
    let answer = [];
    logger.info(`Starting function needle for favorite/problem-cards`);
    const data = await needle("post", CARTO_URL, query, { json: true });
    logger.info(`Finished function needle for favorite/problem-cards`);
    if (data.statusCode === 200) {
      answer = data.body.rows.map((element) => {
        return {
          cartodb_id: element.cartodb_id,
          type: "problems",
          problemid: element.problemid,
          problemname: element.problemname,
          solutioncost: element.solutioncost,
          jurisdiction: element.jurisdiction,
          problempriority: element.problempriority,
          solutionstatus: element.solutionstatus,
          problemtype: element.problemtype,
          county: element.county,
          totalComponents:
            element.count_gcs +
            element.count_pa +
            element.count_sip +
            element.count_sil +
            element.count_cia +
            element.count_sia +
            element.count_rl +
            element.count_ra +
            element.count_sd +
            element.count_df +
            element.count_mt +
            element.count_la +
            element.count_la +
            element.count_la1 +
            element.count_cila,
          coordinates: JSON.parse(element.the_geom).coordinates
            ? JSON.parse(element.the_geom).coordinates
            : [],
        };
      });
      logger.info("answer " + answer);
      return res.send(answer);
    } else {
      console.log("bad status", data.statusCode, data.body);
      logger.error("bad status", data.statusCode, data.body);
      return res.status(data.statusCode).send({ error: data.body })
    }
  } catch (error) {
    logger.error(error);
    res.status(500).error(error);
  }
});

const getProjectCards = async (req, res) => {
  logger.info(`Starting endpoint favorite/project-cards with params`);
  const user = req.user;  
  try {
    let projectsFilterId = (await favoritesService.getFavorites(user.user_id))
    let projects = await projectService.getProjects(null, null, projectsFilterId, 1, 1000);   
    res.send(projects);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error });
  }
};

router.get("/project-cards", auth, getProjectCards);
export default router;
