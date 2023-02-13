import express from 'express';
import https from 'https';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import projectService from 'bc/services/project.service.js';
import {
  getStreamsDataByProjectIds,
  sortProjects,
  projectsByFilters,
  projectsByFiltersForIds
} from 'bc/utils/functionsProjects.js';

const Projects = db.project;
const ProjectPartner = db.projectPartner;
const ProjectCounty = db.projectCounty;
const CodeStateCounty = db.codeStateCounty;
const ProjectServiceArea = db.projectServiceArea;
const CodeServiceArea = db.codeServiceArea;
const ProjectLocalGovernment = db.projectLocalGovernment;
const CodeLocalGoverment = db.codeLocalGoverment;
const ProjectCost = db.projectCost;
const ProjectStaff = db.projectStaff;
const MHFDStaff = db.mhfdStaff;
const ProjectDetail = db.projectDetail;
const CodeCostType = db.codeCostType;
const Attachment = db.projectAttachment;


const router = express.Router();
import {
  CARTO_URL,
  PROBLEM_TABLE,
  PROPSPROBLEMTABLES,
  MAIN_PROJECT_TABLE
} from 'bc/config/config.js';
import needle from 'needle';

async function getProblemByProjectId(projectid, sortby, sorttype) {
  let data = [];
  const LINE_SQL = `select ${PROPSPROBLEMTABLES.problem_boundary[5]} as ${PROPSPROBLEMTABLES.problems[5]}, ${PROPSPROBLEMTABLES.problem_boundary[6]} as ${PROPSPROBLEMTABLES.problems[6]}, ${PROPSPROBLEMTABLES.problem_boundary[7]}  as ${PROPSPROBLEMTABLES.problems[7]} from ${PROBLEM_TABLE}  
 where ${PROPSPROBLEMTABLES.problem_boundary[5]} in (SELECT problemid FROM grade_control_structure 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM pipe_appurtenances 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM special_item_point 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM special_item_linear 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM special_item_area 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM channel_improvements_linear 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM channel_improvements_area 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM removal_line 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM removal_area 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM storm_drain 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM detention_facilities 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM maintenance_trails 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM land_acquisition 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM landscaping_area 
   where projectid=${projectid} and projectid>0) 
   order by ${sortby} ${sorttype}`;
  logger.info(`CARTO REQUEST: ${LINE_SQL}'`);
  const LINE_URL = encodeURI(`${CARTO_URL}&q=${LINE_SQL}`);
  //console.log(LINE_URL);
  try {
    const newProm1 = new Promise((resolve, reject) => {
      https.get(LINE_URL, response => {
         if (response.statusCode === 200) {
            let str = '';
            response.on('data', function (chunk) {
               str += chunk;
            });
            response.on('end', async function () {
               resolve(JSON.parse(str).rows);
            })
         }
      });
   });
    data = await newProm1;
    console.log('the data is ', data);
    return data;
  } catch (e) {
    console.error('Error with QUERY ', e);
    return [];
  }
}


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
  if (body?.sortby?.trim()?.length || 0) {
    projects = await sortProjects(projects, body);
  }
  if (body?.name?.trim()?.length || 0) {
    projects = projects.filter((proj) => proj?.project_name?.toUpperCase().includes(body?.name?.toUpperCase()))
  }
  
  logger.info('projects being called', projects.length);
  res.send(projects);
};

const getProjectDetail = async (req, res) => {

  const project_id = req.params['project_id'];
  let project = await Projects.findByPk(project_id, {
    include: { all: true, nested: true}
  });
  if (!project) {
    res.status(404).send('Not found');
    return;
  }
  project = project.dataValues;
 //  project = project.map(result => result.dataValues)
  // console.log(project);
  // Get County
  let projectCounty = await ProjectCounty.findOne({
    where: {
      project_id: project.project_id
    }
  });
  if (projectCounty) {
    projectCounty = projectCounty.dataValues;
    let codeStateCounty = await CodeStateCounty.findOne({
      where: {
        state_county_id: projectCounty.state_county_id
      }
    });

    codeStateCounty = codeStateCounty.dataValues;
    logger.info(`Adding Code State County: ${JSON.stringify(codeStateCounty)} to project object`);
    project = {...project, codeStateCounty: codeStateCounty};
  }
  // Get Service Area
  let projectServiceArea = await ProjectServiceArea.findOne({
    where: {
      project_id: project.project_id
    }
  });
  if (projectServiceArea) {
    projectServiceArea = projectServiceArea.dataValues;
    let codeServiceArea = await CodeServiceArea.findOne({
      where: {
        code_service_area_id: projectServiceArea.code_service_area_id
      }
    });
    codeServiceArea = codeServiceArea.dataValues;
    logger.info(`Adding code service area: ${JSON.stringify(codeServiceArea)} to project object`);
    project = { ...project, codeServiceArea: codeServiceArea };
  }
  // GET project local goverment (jurisdiction?)
  let projectLocalGovernment = await ProjectLocalGovernment.findOne({
    where: {
      project_id: project.project_id
    }
  });
  if (projectLocalGovernment) {
    projectLocalGovernment = projectLocalGovernment.dataValues;
    let codeLocalGoverment = await CodeLocalGoverment.findOne({
      where: {
        code_local_government_id: projectLocalGovernment.code_local_government_id
      }
    });
    codeLocalGoverment = codeLocalGoverment.dataValues;
    logger.info(`Adding code local government: ${JSON.stringify(codeLocalGoverment)} to project object`);
    project = { ... project, codeLocalGoverment: codeLocalGoverment };
  }
  // GET Project cost, estimated and component
  let projectCost = await ProjectCost.findAll({
    where: {
      project_id: project.project_id
    }
  });
  projectCost = projectCost.map(result => result.dataValues);
  const ESTIMATED_COST = 1,
    COMPONENT_COST = 14;
  const estimatedCost = projectCost.filter(result => result.code_cost_type_id === ESTIMATED_COST);
  const componentCost = projectCost.filter(result => result.code_cost_type_id === COMPONENT_COST);
  logger.info(`projects costs: ${JSON.stringify(projectCost, null, 2)}`);
  const sumCost = projectCost.reduce((pc, current) => pc + current.cost, 0);
  project = { ... project, sumCost: sumCost, estimatedCost: estimatedCost, componentCost: componentCost };
  // GET mananger
  // Maybe need to get the data from code_project_staff_role_type table in the future 
  const STAFF_LEAD = 1,
  WATERSHED_MANAGER = 2,
  CONSTRUCTION_MANAGER = 3,
  LG_LEAD = 10;
  const projectStaff = await ProjectStaff.findAll({
    where: {
      project_id: project.project_id,
      code_project_staff_role_type_id: [STAFF_LEAD, WATERSHED_MANAGER, CONSTRUCTION_MANAGER,LG_LEAD],
      is_active: 1
    }
  }).map(result => result.dataValues);
  const managers = projectStaff.map(result => result.mhfd_staff_id);
  logger.info(`manager list ${managers}`)
  const staffs = await MHFDStaff.findAll({
    where: {
      mhfd_staff_id: managers
    }
  }).map(result => result.dataValues);
  if (staffs) {
    logger.info(`Adding managers to project: ${JSON.stringify(staffs, null, 2)}`);
    project = {...project, managers: staffs };
  }
  // vendor calculation
  const CONSULTANT = 3,
    CIVIL_CONTRACTOR = 8,
    LANDSCAPE_CONTRACTOR = 9;
  const consultants = await ProjectPartner.findAll({
    where: {
      project_id: project.project_id,
      code_partner_type_id: CONSULTANT,
    },
    include: { all: true, nested: true }
  }).map(result => result.dataValues).map(res => { 
    return {...res, business_associate: res.business_associate.dataValues }
  });
  logger.info(`Adding consultants to project: ${consultants}`);
  project = { ...project, consultants };
  const contractors = await ProjectPartner.findAll({
    where: {
      project_id: project.project_id,
      code_partner_type_id: [CIVIL_CONTRACTOR, LANDSCAPE_CONTRACTOR],
    },
    include: { all: true, nested: true }
  }).map(result => result.dataValues).map(res => { 
    return {...res, business_associate: res.business_associate.dataValues }
  });
  logger.info(`Adding contractors to project: ${contractors}`);
  project = { ...project, contractors };
  // ADDING SPONSOR:
  const SPONSOR_TYPE = 11; // maybe this can change in the future
  const project_partners = await ProjectPartner.findAll({
    where: {
      project_id: project.project_id,
      code_partner_type_id: SPONSOR_TYPE,
    },
    include: { all: true, nested: true }
  }).map(result => result.dataValues).map(res => { 
    return {...res, business_associate: res.business_associate.dataValues }
  });
  project = { ... project, sponsor: project_partners};
  // frequency, for maintenance projects
  const project_detail = await ProjectDetail.findAll({
    where: {
      project_id: project.project_id,
    }
  });
  project = { ...project, projectDetail: project_detail };

  // attachments, for projects
/*   const attachments = await Attachment.findAll({
    where: {
      project_id: project.project_id,
    }
  });
  let attachmentFinal 
  if (attachments.length > 0) {
    attachmentFinal = await attachmentService.FilterUrl(attachments);
    console.log(attachmentFinal)
  }
  project = { ...project, attachments: attachmentFinal ? attachmentFinal : [] }; */
  project = { ...project, attachments: [] };
  // get streams
  const streams = await getStreamsDataByProjectIds(project.project_id);
  project = { ...project, streams: streams || [] };
  // get problems 
  const problems = await getProblemByProjectId(project.project_id, PROPSPROBLEMTABLES.problems[6], 'asc');
  logger.info(`Adding problems ${JSON.stringify(problems)}`)
  project = { ...project, problems: problems };
  res.send(project);
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
  const Mobilization = 6, Traffic = 7, Utility = 8, Stormwater = 9, Engineering = 10, Legal = 12, Construction = 11, Contingency = 13;
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


router.get('/bbox/:project_id', getBboxProject);
router.post('/', listProjects);
router.post('/ids', listProjectsForId);
router.get('/:project_id', getProjectDetail);
router.get('/projectCost/:project_id', listOfCosts);

export default router;
