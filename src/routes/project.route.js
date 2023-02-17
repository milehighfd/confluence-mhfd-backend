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
  const { offset = 1, limit = 10000 } = req.query;
  const { body } = req;
  let projects = await projectService.getProjects(null, null, offset, limit);
  projects = await projectsByFiltersForIds(projects, body);
  logger.info('projects being called');
  res.send(projects);
};

const listProjects = async (req, res) => {
  const { offset = 1, limit = 10000 } = req.query;
  const { body } = req;
  const bounds = body?.bounds;
  let projects = await projectService.getProjects(null, bounds, offset, limit);
  logger.info(projects.length);
  
  projects = await projectsByFilters(projects, body);
  if (bounds) {
    const ids = await getIdsInBbox(bounds);
    projects = projects.filter((p) => ids.includes(p.project_id));
  }
  if (body?.sortby?.trim()?.length || 0) {
    projects = await sortProjects(projects, body);
  }
  
  // if (body?.name?.trim()?.length || 0) {
  //   projects = projects.filter((proj) => proj?.project_name?.toUpperCase().includes(body?.name?.toUpperCase()))
  // }
  
  logger.info('projects being called', projects.length);
  res.send(projects);
};

const getProjectDetail = async (req, res) => {

  const project_id = req.params['project_id'];
  console.log('project id is ', project_id);
  try {
    let project = await projectService.getDetails(project_id);
    if (project.error) {
      return res.status(project.error).send({ error: project.message });
    }
    return res.send(project);
  } catch (error) {
    res.status(500).send({ error: error });
  }
}
const getBboxProject = async (req, res) => {
  const project_id = req.params['project_id'];
  try {
    const BBOX_SQL = `
      SELECT ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom from ${MAIN_PROJECT_TABLE}
      WHERE projectid = ${project_id}
    `;
    const query = { q: BBOX_SQL };
    const data = await needle('post', CARTO_URL, query, {json: true});
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
  const project_id = req.params['project_id'];
  const Mobilization = 6, Traffic = 7, Utility = 8, Stormwater = 9, Engineering = 10, Construction = 11, Legal = 12, Contingency = 13;
    // GET Project cost, estimated and component
    let projectCost = await ProjectCost.findAll({
      where: {
        project_id: project_id,
        code_cost_type_id: [Mobilization, Traffic, Utility, Stormwater, Engineering, Legal, Construction, Contingency],
      },
      include: { all: true, nested: true }
    });

  logger.info('projects being called');
  res.send(projectCost);
};

const createCosts = async (req, res) => {
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
router.post('/ids', listProjectsForId);
router.get('/:project_id', getProjectDetail);
router.get('/projectCost/:project_id', listOfCosts);
router.post('/projectCost/:project_id', [auth], createCosts);
export default router;
