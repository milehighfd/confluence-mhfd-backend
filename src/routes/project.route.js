import express from 'express';
import moment from 'moment';
import needle from 'needle';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import projectService from 'bc/services/project.service.js';
import { projectsByFiltersForIds, getIdsInBbox } from 'bc/utils/functionsProjects.js';
import auth from 'bc/auth/auth.js';
import { CARTO_URL, MAIN_PROJECT_TABLE } from 'bc/config/config.js';

const ProjectCost = db.projectCost;
const Project = db.project;
const User = db.user;
const CodeDataSourceType = db.codeDataSourceType;
const CodeCostType = db.codeCostType;
const ProjectIndependentAction = db.projectIndependentAction;
const ProjectProposedAction = db.projectProposedAction;
const Attachment = db.projectAttachment;
const ProjectDetail = db.projectDetail;

const router = express.Router();

const listProjectsForId = async (req, res) => {
  logger.info(`Starting endpoint project/ids with params ${JSON.stringify(req, null, 2)}`);
  const { offset = 1, limit = 20 } = req.query;
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
  const { page = 1, limit = 20 } = req.query;
  const { body } = req;
  logger.info(`Calling projects endpoint with body: ${JSON.stringify(body)}, page: ${page}, limit: ${limit}`);
  const bounds = body?.bounds;
  let ids = [];
  if (bounds) {

    logger.info(`Starting function getIdsInBox for endpoint project/`);
    ids = await getIdsInBbox(bounds);
    logger.info(`Finished function getIdsInBox for endpoint project/`);
  } else {
    let defaultBounds = `${-105.3236683149282},${39.274174328991904},${-104.48895750946532},${40.26156304805423}`;
    ids = await getIdsInBbox(defaultBounds);
  }
  logger.info(`Starting function filterProjectsBy for endpoint project/`);
  let projectsFilterId = await projectService.filterProjectsBy(body, null, null, null, 'listProjects');
  logger.info(`Finished function filterProjectsBy for endpoint project/`);
  projectsFilterId = projectsFilterId.map(pf => ({ project_id: pf.project_id})).filter(pid => {
    return (ids.some(boundsids => pid.project_id === boundsids.project_id));
  });
  logger.info(`Starting function getProjects for endpoint project/`);
  let projects = await projectService.getProjects(null, bounds, projectsFilterId, page, limit, body);
  logger.info(`Finished function getProjects for endpoint project/`);
  const set = new Set(projectsFilterId.map((p) => p?.project_id));
  const count = set.size;
  logger.info(projects.length);
  logger.info('projects being called', projects.length);
  res.send({ projects, count: count });
};

const listProjectsDBFilter = async (req, res) => {
  logger.info(`Starting endpoint project/test with params`);
  const { body } = req;
  const bounds = body?.bounds;
  logger.info(`Starting function filterProjectsBy for endpoint project/test`);
  let projects = await projectService.filterProjectsBy(body);
  logger.info(`Finished function filterProjectsBy for endpoint project/test`);
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
  logger.info(`Starting endpoint project/:project_id with params`);
  const project_id = req.params['project_id'];
  try {
    logger.info(`Starting function getDetails for endpoint project/${project_id}`);
    let project = await projectService.getDetails(project_id);
    logger.info(`Finished function getDetails for endpoint project/${project_id}`);
    if (project.error) {
      return res.status(project.error).send({ error: project.message });
    }
    return res.send(project);
  } catch (error) {
    console.log('ERror', error);
    res.status(500).send({ error: error });
  }
}

const getBboxProject = async (req, res) => {  
  logger.info(`Starting endpoint project/bbox/:project_id with params`);
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
const completeListOfCosts = async (req, res) => {
  logger.info(`Starting endpoint project/projectCost/:project_id with params `);
  const project_id = req.params['project_id'];
  // code_source_type_id 
  // first name last name 
  // cost 
  // last_modified_by
  let projectCost = await ProjectCost.findAll({
    attributes: ['cost', 'modified_by', 'last_modified', 'code_cost_type_id'],
    where: {
      project_id: project_id,
    },
    include: [{
      model: CodeDataSourceType,
      as: 'codeSourceData',
      attributes: ['update_source', 'code_data_source_type_id']
    },{
      model: CodeCostType,
      attributes: ['cost_type_name', 'code_cost_type_id']
    }],
    order: [['last_modified', 'DESC']]
  });
  for(let element of projectCost) {
    if(element.codeSourceData?.code_data_source_type_id === 1) {
      const modifiedUser = element.modified_by;
      let userModified = await User.findOne({
          attributes: ['firstName', 'lastName'],
          where: { email: modifiedUser }
      });
      element.dataValues.userModified = userModified;
    } 
  }
  res.send(projectCost);
};
const independentActionHistory = async (req, res) => {
  const project_id = req.params['project_id'];
  let independentActions = await ProjectIndependentAction.findAll({
    where: {
      project_id: project_id,
    },
    attributes: ['action_name', 'cost', 'modified_date', 'last_modified_by'],
    order: [['modified_date', 'DESC']]
  });
  for(let element of independentActions) {
      const modifiedUser = element.last_modified_by;
      let userModified = await User.findOne({
          attributes: ['firstName', 'lastName'],
          where: { email: modifiedUser }
      });
      element.dataValues.userModified = userModified;
  }
  
  res.send(independentActions);
}

const proposedActionHistory = async(req, res) => {
  const project_id = req.params['project_id'];
  let proposedActionHist = await ProjectProposedAction.findAll({
    where: {
      project_id: project_id,
    },
    attributes: ['modified_date', 'last_modified_by']
  });
  for(let element of proposedActionHist) {
    const modifiedUser = element.last_modified_by;
    let userModified = await User.findOne({
        attributes: ['firstName', 'lastName'],
        where: { email: modifiedUser }
    });
    element.dataValues.userModified = userModified;
  }
  res.send(proposedActionHist);
}

const projectHistory = async(req, res) => {
  const project_id = req.params['project_id'];
  let projectHistory = await Project.findAll({
    where: {
      project_id: project_id,
    },
    attributes: ['modified_date', 'last_modified_by']
  });
  for(let element of projectHistory) {
    const modifiedUser = element.last_modified_by;
    let userModified = await User.findOne({
        attributes: ['firstName', 'lastName'],
        where: { email: modifiedUser }
    });
    element.dataValues.userModified = userModified;
  }
  res.send(projectHistory);
}

const detailHistory = async (req, res) => {
  const project_id = req.params['project_id'];
  let projectDetail = await ProjectDetail.findAll({
    where: {
      project_id: project_id,
    },
    attributes: ['last_modified_by', 'modified_date'],
    order: [['modified_date', 'DESC']]
  });
  for(let element of projectDetail) {
    const modifiedUser = element.last_modified_by;
    let userModified = await User.findOne({
        attributes: ['firstName', 'lastName'],
        where: { email: modifiedUser }
    });
    element.dataValues.userModified = userModified;
  }
  res.send(projectDetail);
}

const attachmentHistory = async (req, res) => {
  const project_id = req.params['project_id'];
  let attachments = await Attachment.findAll({
    where: {
      project_id: project_id,
    },
    attributes: ['attachment_reference_key', 'created_by','created_date','last_modified_by', 'last_modified_date'],
    order: [['created_date', 'DESC']]
  });
  for(let element of attachments) {
      const modifiedUser = element.created_by;
      let userModified = await User.findOne({
          attributes: ['firstName', 'lastName'],
          where: { email: modifiedUser }
      });
      element.dataValues.userModified = userModified;
  }
  res.send(attachments);
}

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
        logger.info(`Starting function transaction`);
        await db.sequelize.transaction(async (t)=>{
          db.sequelize.query(insertQuery, { transaction: t })
        });
        logger.info(`Finished function transaction`);
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

const archiveProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params['project_id'], 10);
    const archiveProject = await projectService.archiveByProjectId(projectId);
    if (archiveProject) {
      logger.info('project archived ');
      res.status(200).send({ message: 'archived' });
    } else {
      logger.info('project not found');
      res.status(200).send({ message: 'not found' });
    }
  } catch (error) {
    logger.error(`Error archiving project: ${error}`);
    res.status(500).send({ message:'Error archiving project'});
  }
};

const checkProjectName = async (req, res) => {
  try {
    const { project_name } = req.body;
    const checkProjectName = await projectService.checkProjectName(project_name);
    if (checkProjectName) {
      logger.info('project name already exists');
      res.status(200).send({exists: true});
    } else {
      logger.info('project name not found');
      res.status(200).send({exists: false});
    }
  } catch (error) {
    logger.error(`Error checking project name: ${error}`);
    res.status(500).send('Error checking project name');
  }
};

const countGlobalSearch = async (req, res) => {
  try {
    const { keyword } = req.body;
    const projects = await projectService.globalSearch(keyword);
    let filteredProjects = [];
    const isNumeric = /^\d+$/.test(keyword);
    if (isNumeric) {
      filteredProjects = projects;
    } else {
      const words = keyword.split(' ').filter(word => word.trim() !== '');
      filteredProjects = projects.filter(project => {
        return words.every(word => {
          let regexPattern = word === '@' ? `@` : `\\b${word}\\b`;
          const regex = new RegExp(regexPattern, 'i');
          return regex.test(project.project_name);
        });
      });
    }
    const projectsIds = filteredProjects.map(p => p.project_id);
    logger.info('project name already exists');
    const WRcount = await projectService.getBoardProjectDataCount(projectsIds, 'WORK_REQUEST');
    const WPcount = await projectService.getBoardProjectDataCount(projectsIds, 'WORK_PLAN');
    const PMcount = await projectService.getPmtoolsProjectDataCount(projectsIds);
    res.status(200).send({WRcount: WRcount, WPcount: WPcount, PMcount: PMcount});
  } catch (error) {
    logger.error(`Error checking project name: ${error}`);
    res.status(500).send('Error checking project name');
  }
};

const globalSearch = async (req, res) => {
  try {
    const { keyword, type } = req.body;
    const projects = await projectService.globalSearch(keyword);
    let filteredProjects = [];
    const isNumeric = /^\d+$/.test(keyword);
    if (isNumeric) {
      filteredProjects = projects;
    } else {
      const words = keyword.split(' ').filter(word => word.trim() !== '');
      filteredProjects = projects.filter(project => {
        return words.every(word => {
          let regexPattern = word === '@' ? `@` : `\\b${word}\\b`;
          const regex = new RegExp(regexPattern, 'i');
          return regex.test(project.project_name);
        });
      });
    }
    const projectsIds = filteredProjects.map(p => p.project_id);
    if (projectsIds && (type === 'WORK_REQUEST' || type === 'WORK_PLAN')) {
      const boardProjects = await projectService.getBoardProjectData(projectsIds, type);
      const projectPartner = await projectService.getProjectPartner(projectsIds);
      const nameProjects = boardProjects.map(p => {
        const project = projects.find(pr => pr.project_id === p.project_id);
        const partner = projectPartner.find(pp => pp.project_id === p.project_id);
        return {
          board_project_id: p.board_project_id,
          project_id: p.project_id,          
          board : p.board,
          project_name: project?.project_name,
          code_status_type: p.code_status_type,
          project_data: p.projectData,
          partner: partner,
        }
      });
      logger.info('project name already exists');
      res.status(200).send({projects : nameProjects});
    } else {
      const pmtoolsProjects = await projectService.getPmtoolsProjectData(projectsIds);
      const nameProjects = pmtoolsProjects.map(p => {
        const project = projects.find(pr => pr.project_id === p.project_id);
        return {
          project_id: p.project_id,
          project_name: project?.project_name,
          currentId: p.currentId,
          code_project_type: p.code_project_type,
        }
      });
      logger.info('project name not found');
      res.status(200).send({projects : nameProjects});
    }
  } catch (error) {
    logger.error(`Error checking project name: ${error}`);
    res.status(500).send('Error checking project name');
  }
};

const getPagePMTools = async (req, res) => {
  try {
    const { status, pageSize, project_id } = req.body;
    const filter = { status: [status] }
    //const projects = await projectService.getProjectsByStatus(status);
    const projectsBy = await projectService.filterProjectsBy(filter);
    const index = projectsBy.findIndex(p => p.project_id === project_id);
    const pageNumber = Math.floor(index / pageSize) + 1;    
    res.status(200).send({pageNumber : pageNumber});
  } catch (error) {
    console.error(error);
    res.status(500).send('Error getting page PM tools');
  }
};

const updateProjectNote = async (req, res) => {
  const { project_id } = req.params;
  const { short_project_note } = req.body;
  const user = req.user;
  try {
    const project = await Project.update({
      short_project_note: short_project_note,
      last_modified_by: user.email,
      modified_date: moment().format('YYYY-MM-DD HH:mm:ss')
    }, {
      where: {
        project_id: project_id
      }
    });
    res.status(200).send({
      message: 'OK',
      short_project_note: project.short_project_note
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({message: 'Error updating project note'});
  }
};

router.get('/bbox/:project_id', getBboxProject);
router.put('/archive/:project_id', [auth], archiveProject);
router.post('/check-project-name', checkProjectName)
router.post('/', listProjects);
router.post('/test', listProjectsDBFilter);
router.post('/ids', listProjectsForId);
router.get('/:project_id', getProjectDetail);
router.get('/projectCost/:project_id', listOfCosts);
router.post('/projectCost/:project_id', [auth], createCosts);
router.post('/search', globalSearch);
router.post('/count-search', countGlobalSearch);
router.post('/page', getPagePMTools);
router.put('/:project_id/short_note', [auth], updateProjectNote);
router.get('/complete/projectCost/:project_id', completeListOfCosts);
router.get('/complete/independentActionHistory/:project_id', independentActionHistory);
router.get('/complete/attachmentHistory/:project_id', attachmentHistory);
router.get('/complete/detailHistory/:project_id', detailHistory);
router.get('/complete/projectHistory/:project_id', projectHistory);
router.get('/complete/proposedActionHistory/:project_id', proposedActionHistory);

export default router;
