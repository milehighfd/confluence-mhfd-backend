import express from 'express';
import https from 'https';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import Sequelize from 'sequelize';
import favoritesService from 'bc/services/favorites.service.js';
import groupService from 'bc/services/group.service.js';
const ProjectPartner = db.projectPartner;
const ProjectStaff = db.projectStaff;
const BusinessAssociante = db.businessAssociates;

const router = express.Router();
import {
  projectsByFilters,
  sortProjects,
} from 'bc/utils/functionsProjects.js';
import projectService from 'bc/services/project.service.js';


const getGroup = async (req, res) => {
  logger.info(`Starting endpoint /groups/:groupname with params `);
  const groupname = req.params['groupname'];
  const data = {};
  if (groupname === 'status') {
    try{
      const groups = await groupService.getStatus();
      data.table = 'code_status_type';
      data.groups = groups;
    } catch(error) {
      res.status(500).send({table: '', groups: []});
      return;
    }
  }
  if (groupname === 'jurisdiction') {
    try{
      const groups = await groupService.getJurisdiction();
      data.table = 'CODE_LOCAL_GOVERNMENT_4326';
      data.groups = groups;
    } catch(error) {
      res.status(500).send({table: '', groups: []});
      return;
    }
  }
  if (groupname === 'county') {
    try{
      const groups = await groupService.getCounty();
      data.table = 'CODE_STATE_COUNTY_CLIP_4326';
      data.groups = groups;
    } catch(error) {
      logger.error(error);
      res.status(500).send({table: '', groups: []});
      return;
    }
  }
  if (groupname === 'servicearea') {
    try{
      const groups = await groupService.getServiceArea();
      data.table = 'CODE_SERVICE_AREA_4326';
      data.groups = groups;
    } catch(error) {
      logger.error(error);
      res.status(500).send({table: '', groups: []});
      return;
    }
  }
  if (groupname === 'consultant') {
    try{
      const groups = await groupService.getConsultant();
      data.table = 'business_associates';
      data.groups = groups;
    } catch(error) {
      logger.error(error);
      res.status(500).send({table: '', groups: []});
      return;
    }
  }
  if (groupname === 'contractor') {
    try{
      const groups = await groupService.getContractor();
      data.table = 'business_associates';
      data.groups = groups;
    } catch(error) {
      logger.error(error);
      res.status(500).send({table: '', groups: []});
      return;
    }
  }
  if (groupname === 'streams') {
    try {
      const groups = await groupService.getStreams();
      data.table = 'streams';
      data.groups = groups;
    } catch (error) {
      console.log('ERRRO AT ', groupname, error);
    }
  }
  if (groupname === 'projecttype') {
    try {
      const groups = await groupService.getProjectType();
      data.table = 'projecttype';
      data.groups = groups;
    } catch (error) {
      console.log('ERRRO AT ', groupname, error);
    }
  }
  if (groupname === 'staff') {
    try {
      const groups = await groupService.getMhfdStaff();
      data.table = 'staff';
      data.groups = groups;
    } catch (error) {
      console.log('Error at ', groupname, error);
    }
  }
  if (groupname === 'lg_lead') {
    try {
      const groups = await groupService.getLGManager();
      data.table = 'lg_lead';
      data.groups = groups;
    } catch (error) {
      console.log('Arrot at', groupname, error);
    }
  }
  res.send(data);
}
const safeGet = (obj, prop, defaultValue) => {
  try {
    return obj[prop]
  } catch(e) {
    return defaultValue
  }
}

const sortInside = (projects, sortvalue, order) => {

  switch (sortvalue) {
      case 'on_base': 
        console.log('\n\n\nabout to sort ON BASE \n\n***********\n\n\n');
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return a.onbase_project_number - b.onbase_project_number
          } else {
            return b.onbase_project_number - a.onbase_project_number
          }
        });
        break;
      case 'project_sponsor':
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return a?.sponsor?.localeCompare(b?.sponsor )
          } else {
            return b?.sponsor?.localeCompare(a?.sponsor )
          }
        });
        break;
      case 'project_type': 
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return a?.project_status?.code_phase_type?.code_project_type?.project_type_name?.localeCompare(b?.project_status?.code_phase_type?.code_project_type?.project_type_name )
          } else {
            return b?.project_status?.code_phase_type?.code_project_type?.project_type_name?.localeCompare(a?.project_status?.code_phase_type?.code_project_type?.project_type_name )
          }
        });
        break;
      case 'status': 
      console.log('\n\n\nabout to sort status \n\n***********\n\n\n');
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return a?.project_status?.code_phase_type?.code_status_type?.status_name?.localeCompare(b?.project_status?.code_phase_type?.code_status_type?.status_name);
          } else {
            return b?.project_status?.code_phase_type?.code_status_type?.status_name?.localeCompare(a?.project_status?.code_phase_type?.code_status_type?.status_name);
          }
        });
        break;
      case 'phase': 
      console.log('\n\n\nabout to sort phase \n\n***********\n\n\n');
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return a?.project_status?.code_phase_type?.phase_name?.localeCompare(b?.project_status?.code_phase_type?.phase_name);
          } else {
            return b?.project_status?.code_phase_type?.phase_name?.localeCompare(a?.project_status?.code_phase_type?.phase_name);
          }
        });
        break;
      case 'service_area': 
      console.log('\n\n\nabout to sort service area \n\n***********\n\n\n');
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return a?.serviceArea?.codeServiceArea?.service_area_name?.localeCompare(b?.serviceArea?.codeServiceArea?.service_area_name); 
          } else {
            return b?.serviceArea?.codeServiceArea?.service_area_name?.localeCompare(a?.serviceArea?.codeServiceArea?.service_area_name); 
          }
        });
        break;
      case 'stream': 
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return a?.streams?.stream?.stream_name?.localeCompare(b.streams?.stream?.stream_name);
          } else {
            return b?.streams?.stream?.stream_name?.localeCompare(a.streams?.stream?.stream_name);
          }
        });
        break;
      case 'consultant': 
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return a?.consultants[0]?.consultant[0]?.business_name?.localeCompare(b?.consultants[0]?.consultant[0]?.business_name);
          } else {
            return b?.consultants[0]?.consultant[0]?.business_name?.localeCompare(a?.consultants[0]?.consultant[0]?.business_name);
          }
        });
        break;
      case 'civil_contractor': 
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return a?.civilContractor[0]?.business[0]?.business_name.localeCompare(b?.civilContractor[0]?.business[0]?.business_name);
          } else {
            return b?.civilContractor[0]?.business[0]?.business_name.localeCompare(a?.civilContractor[0]?.business[0]?.business_name); 
          }
        });
        break;
      case 'landscape_contractor': 
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return a.landscapeContractor[0]?.business[0]?.business_name.localeCompare(b?.landscapeContractor[0]?.business[0]?.business_name);
          } else {
            return b.landscapeContractor[0]?.business[0]?.business_name.localeCompare(a?.landscapeContractor[0]?.business[0]?.business_name);
          }
        });
        break;
      case 'county': 
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return a.county?.codeStateCounty?.county_name.localeCompare(b?.county?.codeStateCounty?.county_name);
          } else {
            return b.county?.codeStateCounty?.county_name.localeCompare(a?.county?.codeStateCounty?.county_name);
          }
        });
        break;

      case 'total_funding': 
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return 
          } else {
            return 
          }
        });
        break;
      case 'developer': 
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return 
          } else {
            return 
          }
        });
        break;
      case 'construction_start_date': 
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return 
          } else {
            return 
          }
        });
        break;
      case 'lg_lead': 
        break;
      case 'estimated_cost': 
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return a?.estimatedCost?.cost - b?.estimatedCost?.cost
          } else {
            return b?.estimatedCost?.cost - a?.estimatedCost?.cost
          }
        });
        break;
      case 'MHFD_lead': 
        break;
  
      default:
        break;
  }
    
  
  return projects;
}
const listProjects = async (req, res) => {
  logger.info(`Starting endpoint pmtools/list with params ${JSON.stringify(req.params, null, 2)}`);
  const { code_project_type_id } = req.query;
  const {
    offset = 0,
    limit = 120000,
    group,
    sortby,
    order,
    filterby,
    favorites,
    myprojects,
    _id 
  } = req.query;
  const { body } = req;
  const where = {};
  if (code_project_type_id) {
    where.code_project_type_id = +code_project_type_id;
  }
  
  if(favorites == 'true'){
    logger.info('Favorites requests', _id);
    logger.info(`Starting function getFavorites for endpoint pmtools/list`);
    let list = await favoritesService.getFavorites(_id);
    logger.info(`Finished function getFavorites for endpoint pmtools/list`);
    list = list.map(result => result.project_id);
    where.project_id = list;
  }
  const project_ids = await projectService.filterProjectsBy(body, null, null, code_project_type_id);
  logger.info(`Starting function getProjects for endpoint pmtools/list`);
  let projects = await projectService.getUpcomingProjects(null, null, project_ids);
  res.send(projects);
};

const getDataForGroupFilters = async (req, res) => {
  try {
    logger.info(`Starting endpoint pmtools/groups/:groupname/:filtervalue with params`);
    const { groupname, filtervalue, origin = '' } = req.params;
    const { page = 1, limit = 20, sortby, sortorder, code_project_type_id } = req.query;
    const { body } = req;
    const extraFilters = {};
    if (sortby) {
      extraFilters.sortby = sortby;
      extraFilters.sortorder = sortorder;
    }
    console.log('Extra filters ', extraFilters);
    logger.info(`page=${page} limit=${limit}`);
    logger.info(`Starting function getProjects for endpoint pmtools/groups/:groupname/:filtervalue`);
    logger.info(`Filtering by lgmanager ${groupname, filtervalue, code_project_type_id}...`);
    const group = await projectService.filterProjectsBy(body, groupname, filtervalue, code_project_type_id, origin);
    logger.info(`Finished function getProjects for endpoint pmtools/groups/:groupname/:filtervalue`);
    logger.info(`Starting function getProjects for endpoint project/`);
    let projects = await projectService.getProjects(null, null, group, page, limit, body);
    logger.info(`Finished function getProjects for endpoint project/`);
    if (body?.sortby?.trim()?.length || 0) {
      logger.info(`Starting function sortProjects for endpoint project/`);
      projects = await sortProjects(projects, body);
      logger.info(`Finished function sortProjects for endpoint project/`);
    }
    // console.log('PROJECTS', projects);
    res.send(projects);
  } catch (error) {
    logger.error(`Error in endpoint pmtools/groups/:groupname/:filtervalue: ${error.message}`);
    res.status(500).send({ error: error });
  }
};

const countDataForGroupFilters = async (req, res) => {
  try {
    logger.info(`Starting endpoint pmtools/groups/:groupname/:filtervalue with params`);
    const { groupname, filtervalue, origin = '' } = req.params;
    const filtervalue2 = filtervalue.split('&').filter((f) => !f.includes('sortby') && !f.includes('sortorder')).join('&');
    const { page = 1, limit = 20, code_project_type_id } = req.query;
    const { body } = req;
    logger.info(`page=${page} limit=${limit}`);
    logger.info(`Starting function getProjects for endpoint pmtools/groups/:groupname/:filtervalue`);
    console.log(body, 'FILTER VALUE 2')
    const group = await projectService.filterProjectsBy(body, groupname, filtervalue2, code_project_type_id, origin);
    logger.info(`Finished function getProjects for endpoint pmtools/groups/:groupname/:filtervalue`);
    logger.info(`Starting function getProjects for endpoint project/`);    
    const set = new Set(group.map((p) => p?.project_id));
    const count = set.size;
    res.send({count: count});
  } catch (error) {
    logger.error(`Error in endpoint pmtools/groups/:groupname/:filtervalue: ${error.message}`);
    res.status(500).send({ error: error });
  }
};


router.post('/list', listProjects);
router.get('/groups/:groupname', getGroup);
router.post('/groupsFilter/:groupname/:filtervalue/:origin', getDataForGroupFilters);
router.post('/groupsFilter/count/:groupname/:filtervalue/:origin', countDataForGroupFilters);

export default router;