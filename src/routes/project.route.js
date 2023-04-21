import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import projectService from 'bc/services/project.service.js';
import {
  getStreamsDataByProjectIds,
  sortProjects,
  projectsByFilters,
  projectsByFiltersForIds,
  getIdsInBbox
} from 'bc/utils/functionsProjects.js';
import auth from 'bc/auth/auth.js';


const ProjectCost = db.projectCost;


const router = express.Router();
import {
  CARTO_URL,
  MAIN_PROJECT_TABLE
} from 'bc/config/config.js';
import needle from 'needle';
import moment from 'moment';



const listProjectsForId = async (req, res) => {
  logger.info(`Starting endpoint project/ids with params ${JSON.stringify(req, null, 2)}`);
  const { offset = 1, limit = 10000 } = req.query;
  const { body } = req;
  logger.info(`Starting function getProjects for endpoint project/ids`);
  let projects = await projectService.getProjects(null, null, offset, limit);
  logger.info(`Finished function getProjects for endpoint project/ids`);

  logger.info(`Starting function projectsByfiltersForIds for endpoint project/ids`);
  projects = await projectsByFiltersForIds(projects, body);
  logger.info(`Finished function projectsByfiltersForIds for endpoint project/ids`);
  logger.info('projects being called');
  res.send(projects);
};

const listProjects = async (req, res) => {
  logger.info(`Starting endpoint project/ with params`);
  const { page = 1, limit = 10000 } = req.query;
  const { body } = req;
  logger.info(`Calling projects endpoint with body: ${JSON.stringify(body)}, page: ${page}, limit: ${limit}`);
  const bounds = body?.bounds;
  let ids = [];
  if (bounds) {

    logger.info(`Starting function getIdsInBox for endpoint project/`);
    ids = await getIdsInBbox(bounds);
    logger.info(`Finished function getIdsInBox for endpoint project/`);
  }
  logger.info(`Starting function getProjects2 for endpoint project/`);
  let projectsFilterId = await projectService.getProjects2(null, null, 1, null, body);
  logger.info(`Finished function getProjects2 for endpoint project/`);
  projectsFilterId = projectsFilterId.concat(ids);
  logger.info(`Starting function getProjects for endpoint project/`);
  let projects = await projectService.getProjects(null, bounds, projectsFilterId, page, limit);
  logger.info(`Finished function getProjects for endpoint project/`);
  const set = new Set(projectsFilterId.map((p) => p?.dataValues?.project_id));
  const count = set.size;
  logger.info(projects.length);
  if (body?.sortby?.trim()?.length || 0) {
    logger.info(`Starting function sortProjects for endpoint project/`);
    projects = await sortProjects(projects, body);
    logger.info(`Finished function sortProjects for endpoint project/`);
  }

  logger.info('projects being called', projects.length);
  res.send({ projects, count: count });
};

const listProjectsDBFilter = async (req, res) => {
  logger.info(`Starting endpoint project/test with params`);
  const { offset = 1, limit = 10000 } = req.query;
  const { body } = req;
  const bounds = body?.bounds;
  logger.info(`Starting function getProjects2 for endpoint project/test`);
  let projects = await projectService.getProjects2(null, bounds, offset, limit, body);
  logger.info(`Finished function getProjects2 for endpoint project/test`);
  logger.info('projects being called', projects.length);
  if (bounds) {
    logger.info(`Starting function getIdsInBbox for endpoint project/test`);
    const ids = await getIdsInBbox(bounds);
    logger.info(`Finished function getIdsInBbox for endpoint project/test`);
    projects = projects.filter((p) => ids.includes(p.project_id));
  }
  res.send(projects);
}

const getProjectDetail = async (req, res) => {
  const project_id = req.params['project_id'];
  try {
    logger.info(`Starting function getDetails for endpoint project/:project_id`);
    let project = await projectService.getDetails(project_id);
    logger.info(`Finished function getDetails for endpoint project/:project_id`);
    if (project.error) {
      return res.status(project.error).send({ error: project.message });
    }
    return res.send(project);
  } catch (error) {
    res.status(500).send({ error: error });
  }
}

const getBboxProject = async (req, res) => {
  
  logger.info(`Starting endpoint project/bbox/:project_id with params ${JSON.stringify(req.params, null, 2)}`);
  const project_id = req.params['project_id'];
  try {
    const BBOX_SQL = `
      SELECT ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom from ${MAIN_PROJECT_TABLE}
      WHERE projectid = ${project_id}
    `;
    const query = { q: BBOX_SQL };
    logger.info(`Starting function needle for endpoint project/bbox/:project_id`);
    const data = await needle('post', CARTO_URL, query, {json: true});
    logger.info(`Finished function needle for endpoint project/bbox/:project_id`);
    if (data.statusCode === 200) {
      const geojson = data.body.rows[0]?.the_geom;
      const bbox = JSON.parse(geojson);
      res.status(200).send(bbox?.coordinates[0]);
    } else { 
      console.error('Error at bbox', data.body);
      res.status(500).send(data.body);
    }
  } catch (error) {
    console.log('This error ', error);
    res.status(500).send(error);
  }
}

const listOfCosts = async (req, res) => {
  logger.info(`Starting endpoint project/projectCost/:project_id with params ${JSON.stringify(req, null, 2)}`);
  const project_id = req.params['project_id'];
  const Mobilization = 6, Traffic = 7, Utility = 8, Stormwater = 9, Engineering = 10, Construction = 11, Legal = 12, Contingency = 13;
    // GET Project cost, estimated and component
    logger.info(`Starting function findAll for endpoint project/projectCost/:project_id`);
    let projectCost = await ProjectCost.findAll({
      where: {
        project_id: project_id,
        code_cost_type_id: [Mobilization, Traffic, Utility, Stormwater, Engineering, Legal, Construction, Contingency],
      },
      include: { all: true, nested: true }
    });
    logger.info(`Finished function findAll for endpoint project/projectCost/:project_id`);
  logger.info('projects being called');
  res.send(projectCost);
};

const createCosts = async (req, res) => {
  logger.info(`Starting endpoint project/projectCost/:project_id with params ${JSON.stringify(req, null, 2)}`);
  const user = req.user;
  try {
    const project_id = req.params['project_id'];
    const { body } = req;
    const costTypes = Object.keys(body).map((element)=> element >= 6 && element <= 13 ? Number(element) : null).filter(e => !!e)
    for (const costType of costTypes) {
      try {
        const insertQuery = `INSERT INTO project_cost (project_id, cost, code_cost_type_id, created_by, modified_by, created, last_modified)
        OUTPUT inserted . *
        VALUES('${project_id}', '${body[costType]}', '${costType}', '${user.name}', '${user.name}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${moment().format('YYYY-MM-DD HH:mm:ss')}')`;
        await db.sequelize.transaction(async (t)=>{
          db.sequelize.query(insertQuery, { transaction: t })
        });
      } catch (error) {
        logger.info('error on createCosts', error);
      }
    }
    res.status(200).send('OK');
  } catch (error) {
    logger.info('error on createCosts', error);
    res.status(500).send(error);
  }
  
};


router.get('/bbox/:project_id', getBboxProject);
router.post('/', listProjects);
router.post('/test', listProjectsDBFilter);
router.post('/ids', listProjectsForId);
router.get('/:project_id', getProjectDetail);
router.get('/projectCost/:project_id', listOfCosts);
router.post('/projectCost/:project_id', [auth], createCosts);
export default router;
