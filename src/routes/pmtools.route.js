import express from 'express';
import https from 'https';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import Sequelize from 'sequelize';
import favoritesService from 'bc/services/favorites.service.js';
import groupService from 'bc/services/group.service.js';
import pmtoolsService from '../services/pmtools.service.js';
const ProjectPartner = db.projectPartner;
const ProjectStaff = db.projectStaff;
const MHFDStaff = db.mhfdStaff;
const BusinessAssociante = db.businessAssociates;

const router = express.Router();
import {
  projectsByFilters
} from 'bc/utils/functionsProjects.js';
import projectService from 'bc/services/project.service.js';


const getGroup = async (req, res) => {
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
      data.table = 'CODE_STATE_COUNTY_4326';
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
      console.log('groypname', groups);
      data.table = 'projecttype';
      data.groups = groups;
    } catch (error) {
      console.log('ERRRO AT ', groupname, error);
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
  // on_base     onbase_project_number
  // project_sponsor   .sponsor
  // project_type   .project_status?.code_phase_type?.code_project_type?.project_type_name
  // status     .project_status?.code_phase_type?.code_status_type?.status_name
  // phase      .project_status?.code_phase_type?.phase_name
  // service_area     .serviceArea?.codeServiceArea?.service_area_name
  // stream           .streams?.stream?.stream_name
  // consultant       .consultants[0]?.consultant[0]?.business_name
  // civil_contractor .civilContractor[0]?.business[0]?.business_name
  // landscape_contractor .landscapeContractor[0]?.business[0]?.business_name
  // county           .county?.codeStateCounty?.county_name
  // total_funding
  // developer 
  // construction_start_date 
  // lg_lead            
  // estimated_cost   .estimatedCost?.cost
  // MHFD_lead   ??

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
  const {
    offset = 0,
    limit = 120000,
    code_project_type_id,
    group,
    sortby,
    order,
    filterby,
    filtervalue,
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
    let list = await favoritesService.getFavorites(_id);
    list = list.map(result => result.dataValues?.project_id);
    where.project_id = list;
    console.log('list of favorites', list);
  }

  let projects = await projectService.getProjects({code_project_type_id: code_project_type_id}, null);
  const ids = projects.map((p) => p.project_id);
  // xconsole.log(project_partners);
  // GET MHFD LEAD
  const MHFD_LEAD = 1;
  const projectStaff = await ProjectStaff.findAll({
    where: {
      project_id: ids,
      code_project_staff_role_type_id: MHFD_LEAD
    }
  }).map(result => result.dataValues);
  // console.log('the project staff is ', projectStaff);
  const mhfdIds = projectStaff.map((data) => data.mhfd_staff_id).filter((data) => data !== null);
  const mhfdStaff = await MHFDStaff.findAll({
    where: {
      mhfd_staff_id: mhfdIds
    }
  }).map((data) => data.dataValues);
  // TODO END THE PARSE WHEN WE HAVE EXAMPLES
  console.log(mhfdStaff);
  // Get Service Area
  const DEVELOPER_CODE = 6;
  logger.info('projects being called');
  if (+code_project_type_id === DEVELOPER_CODE) {
    //GET Developer
    logger.info('Developer');
    const DEVELOPER_ID = 1;
    let developers = await ProjectPartner.findAll({
      where: {
        project_id: ids,
        code_partner_type_id: DEVELOPER_ID
      }
    }).map(result => result.dataValues);
    const developerIds = developers.map((data) => data.business_associates_id).filter((data) => data !== null);
    let developerLIst = await BusinessAssociante.findAll({
      where: {
        business_associates_id: developerIds
      }
    }).map((data) => data.dataValues);
    developers = developers.map((staff) => {
      const developer = developerLIst.filter((cons) => {
        return cons.business_associates_id === staff.business_associates_id
      });
      return {
        ...staff,
        developer
      }
    });
    projects = projects.map((project) => {
      const staffs = developers.filter(consult => consult.project_id === project.project_id);
      const construction_start_date = project?.project_status?.code_phase_type?.code_phase_type_id === 125 ? project?.project_status?.planned_start_date : project?.project_status?.actual_start_date
      return {
        ...project,
        developers: staffs,
        construction_start_date: construction_start_date
      }
    });
  }
  if (myprojects) {
    const staffs = await ProjectStaff.findAll({
      where: {
        project_id: ids
      }
    }).map(result => result.dataValues);
    // console.log('the project staff is ', projectStaff);
    const mhfdIds = staffs.map((data) => data.mhfd_staff_id).filter((data) => data !== null);
  }
  projects = await projectsByFilters(projects, body);
  if ( sortby ) {
    projects = sortInside(projects, sortby, order);
  }
      
  if (filterby === 'servicearea') {
    projects = projects.filter(project => project?.serviceArea?.codeServiceArea?.code_service_area_id === +filtervalue);
  }
  if (filterby === 'county') {
    projects = projects.filter(project => project?.county?.codeStateCounty?.state_county_id === +filtervalue);
  }
  if (filterby === 'jurisdiction') {
    projects = projects.filter(project => project?.localGoverment?.codeLocalGoverment?.code_local_government_id === +filtervalue);
  }
  if (filterby === 'consultant') {
    projects = projects.filter(project => {
      const consultants = project.consultants || [];
      let possible = 0;
      consultants.forEach((consultant) => {
        const business = consultant?.consultant || [];
        possible |= business.some(bus => bus?.business_associates_id === +filtervalue);
      });
      return possible;
    });
  }
  if (filterby === 'contractor') {
    projects = projects.filter(project => {
      const consultants = project.civilContractor || [];
      const landscapeContractors = project.landscapeContractor || [];
      console.log(consultants.length, landscapeContractors.length);
      let possible = 0;
      consultants.forEach((consultant) => {
        const business = consultant?.business || [];
        possible |= business.some(bus => bus.business_associates_id === +filtervalue);
      });
      landscapeContractors.forEach((consultant) => {
        const business = consultant?.business || [];
        possible |= business.some(bus => bus.business_associates_id === +filtervalue);
      });
      return possible;
    });
  }
  if (group === 'status') {
    const groupProjects = {};
    projects.forEach(project => {
      
      const status = projectService.getCurrentProjectStatus(project)?.code_phase_type?.code_status_type?.code_status_type_id || -1;
      if (!groupProjects[status]) {
        groupProjects[status] = [];
      }
      groupProjects[status].push(project);
    });
    res.send(groupProjects);
    return;
  }
  if (group === 'jurisdiction') {
    const groupProjects = {};
    projects.forEach(project => {
      project.project_local_governments.forEach(pl => {
        const jurisdiction = pl?.CODE_LOCAL_GOVERNMENT?.code_local_government_id || -1;
        if (!groupProjects[jurisdiction]) {
          groupProjects[jurisdiction] = [];
        }
        groupProjects[jurisdiction].push(project);  
      });
      if (!project.project_local_governments.length) {
        if (!groupProjects[-1]) {
          groupProjects[-1] = [];
        }
        groupProjects[-1].push(project);
      }
    });
    res.send(groupProjects);
    return;
  }
  if (group === 'county') {
    const groupProjects = {};
    projects.forEach(project => {
      project.project_counties.forEach(pl => {
        const county = pl?.CODE_STATE_COUNTY?.state_county_id || -1;
        if (!groupProjects[county]) {
          groupProjects[county] = [];
        }
        groupProjects[county].push(project);  
      });
      if (!project.project_counties.length) {
        if (!groupProjects[-1]) {
          groupProjects[-1] = [];
        }
        groupProjects[-1].push(project);
      }
    });
    res.send(groupProjects);
    return;
  }
  if (group === 'servicearea') {
    const groupProjects = {};
    projects.forEach(project => {
      project.project_service_areas.forEach(pl => {
        const sa = pl?.CODE_SERVICE_AREA?.code_service_area_id || -1;
        if (!groupProjects[sa]) {
          groupProjects[sa] = [];
        }
        groupProjects[sa].push(project);  
      });
      if (!project.project_service_areas.length) {
        if (!groupProjects[-1]) {
          groupProjects[-1] = [];
        }
        groupProjects[-1].push(project);
      }

      const serviceArea = project.serviceArea?.codeServiceArea?.code_service_area_id || -1;
      if (!groupProjects[serviceArea]) {
        groupProjects[serviceArea] = [];
      }
      groupProjects[serviceArea].push(project);
    });
    res.send(groupProjects);
    return;
  }
  if (group === 'consultant') { 
    const groupProjects = {};
    projects.forEach(project => {
      let enter = false;
      const CONSULTANT_ID = 3;
      project.project_partners.forEach((pp) => {
        if (pp.code_partner_type_id === CONSULTANT_ID) {
          enter = true;
          const business_associates_id = pp.business_associate.business_associates_id || -1;
          if (!groupProjects[business_associates_id]) {
            groupProjects[business_associates_id] = [];
          }
          groupProjects[business_associates_id].push(project);
        }
      });
      if (!enter) {
        if (!groupProjects[-1]) {
          groupProjects[-1] = [];
        }
        groupProjects[-1].push(project);
      }
    });
    res.send(groupProjects);
    return;
  }
  if (group === 'contractor') {
    const groupProjects = {};
    projects.forEach(project => {
      let enter = false;
      const LANDSCAPE_CONTRACTOR_ID = 9, CIVIL_CONTRACTOR_ID = 8;
      project.project_partners.forEach((pp) => {
        if (pp.code_partner_type_id === CIVIL_CONTRACTOR_ID ||
          pp.code_partner_type_id === LANDSCAPE_CONTRACTOR_ID) {
          enter = true;
          const business_associates_id = pp.business_associate.business_associates_id || -1;
          if (!groupProjects[business_associates_id]) {
            groupProjects[business_associates_id] = [];
          }
          groupProjects[business_associates_id].push(project);
        }
      });
      if (!enter) {
        if (!groupProjects[-1]) {
          groupProjects[-1] = [];
        }
        groupProjects[-1].push(project);
      }
    });
    res.send(groupProjects);
    return;
  }
  if (group === 'streams') {
    const groupProjects = {};
    projects.forEach(project => {
      project.project_streams.forEach((ps) => {
        const stream = ps.stream_id || -1;
        if (!groupProjects[stream]) {
          groupProjects[stream] = [];
        }
        groupProjects[stream].push(project);  
      });
      if (!project.project_streams.length) {
        if (!groupProjects[-1]) {
          groupProjects[-1] = [];
        }
        groupProjects[-1].push(project);
      }
    });
    console.log(groupProjects[-1].length);
    res.send(groupProjects);
    return;
  }
  res.send(projects);
};

const getDataForGroup = async (req, res) => {
  const { groupname, filtervalue } = req.params;
  const { page = 1, limit = 20, code_project_type_id } = req.query;
  const { favorites, search, filterby, value } = req.body;
  const extraFilters = {};
  if (code_project_type_id) {
    extraFilters.code_project_type_id = +code_project_type_id;
  }
  if (favorites) {
    extraFilters.favorites = favorites;
  }
  if (search) {
    extraFilters.search = search;
  }
  if (filterby) {
    extraFilters.filterby = filterby;
    extraFilters.value = value;
  }
  logger.info(`page=${page} limit=${limit}`);
  const group = await pmtoolsService.getProjects(groupname, filtervalue, extraFilters, +page, +limit);
  res.send(group);
}

router.post('/list', listProjects);
router.get('/groups/:groupname', getGroup);
router.post('/groups/:groupname/:filtervalue', getDataForGroup);

export default router;