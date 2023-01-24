import express from 'express';
import https from 'https';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import Sequelize from 'sequelize';
import favoritesService from 'bc/services/favorites.service.js';
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
const CodeStatusType = db.codeStatusType;
const BusinessAssociante = db.businessAssociates;
const Streams = db.stream;
const ProjectStreams = db.project_stream;
const Op = Sequelize.Op;

const router = express.Router();
import {
  CARTO_URL,
  PROBLEM_TABLE,
  PROPSPROBLEMTABLES,
} from 'bc/config/config.js';


const getGroup = async (req, res) => {
  const groupname = req.params['groupname'];
  const data = {};
  if (groupname === 'status') {
    try{
      const codeStatusType = await CodeStatusType.findAll({
        order: [
          ['status_name', 'ASC']
        ]
      }).map((data) => data.dataValues);
      const groups = codeStatusType.map((data) => {
        return { name: data.status_name, id: data.code_status_type_id };
      });
      data.table = 'code_status_type';
      data.groups = groups;
    } catch(error) {
      res.status(500).send({table: '', groups: []});
      return;
    }
  }
  if (groupname === 'jurisdiction') {
    try{
      const codeLocalGoverment = await CodeLocalGoverment.findAll({
        order: [
          ['local_government_name', 'ASC']
        ]
      }).map((data) => data.dataValues);
      const groups = codeLocalGoverment.map((data) => {
        return { name: data.local_government_name, id: data.code_local_government_id };
      });
      data.table = 'CODE_LOCAL_GOVERNMENT_4326';
      data.groups = groups;
    } catch(error) {
      res.status(500).send({table: '', groups: []});
      return;
    }
  }
  if (groupname === 'county') {
    try{
      const codeStateCounty = await CodeStateCounty.findAll({
        order: [
          ['county_name', 'ASC']
        ]
      }).map((data) => data.dataValues);
      const groups = codeStateCounty.map((data) => {
        return { name: data.county_name, id: data.state_county_id };
      });
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
      const codeServiceArea = await CodeServiceArea.findAll({
        order: [
          ['service_area_name', 'ASC']
        ]
      }).map((data) => data.dataValues);
      const groups = codeServiceArea.map((data) => {
        return { name: data.service_area_name, id: data.code_service_area_id };
      });
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
      const CONSULTANT_ID = 3;
      const projectPartner = await ProjectPartner.findAll({
        where: {
          code_partner_type_id: CONSULTANT_ID
        }
      }).map((data) => data.dataValues);
      const ids = projectPartner.map((data) => data.business_associates_id);
      const businessAssociates = await BusinessAssociante.findAll({
        where: {
          business_associates_id: ids
        },
        order: [['business_name', 'ASC']]
      });
      const groups = businessAssociates.map((data) => {
        return { name: data.business_name, id: data.business_associates_id };
      });
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
      const CIVIL_CONTRACTOR_ID = 8, LANDSCAPE_CONTRACTOR_ID = 9;
      const projectPartner = await ProjectPartner.findAll({
        where: {
          code_partner_type_id: [CIVIL_CONTRACTOR_ID, LANDSCAPE_CONTRACTOR_ID]
        }
      }).map((data) => data.dataValues);
      const ids = projectPartner.map((data) => data.business_associates_id);
      const businessAssociates = await BusinessAssociante.findAll({
        where: {
          business_associates_id: ids
        },
        order: [['business_name', 'ASC']]
      });
      const groups = businessAssociates.map((data) => {
        return { name: data.business_name, id: data.business_associates_id };
      });
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
      const streams = await Streams.findAll({
        order: [
          ['stream_name', 'ASC']
        ],
        where: {
          stream_name: {[Op.ne]: null}
        }
      });
      const groups = streams.map((data) => {
        return { name: data.stream_name, id: data.stream_id}
      });
      data.table = 'streams';
      data.groups = groups;
    } catch (error) {
      console.log('ERRRO AT streams', error);
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
        console.log('\n\n\nabout to sort sponsor \n\n***********\n\n\n'); 
        projects.sort((a,b) => {
          if (order === 'ascend') {
            return a?.sponsor?.localeCompare(b?.sponsor )
          } else {
            return b?.sponsor?.localeCompare(a?.sponsor )
          }
        });
        break;
      case 'project_type': 
      console.log('\n\n\nabout to sort project_type \n\n***********\n\n\n');
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
    _id 
  } = req.query;
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

  let projects = await Projects.findAll({
    limit,
    offset,
    include: { all: true, nested: true },
    where: where,
  }).map(result => result.dataValues);
  const SPONSOR_TYPE = 11; // maybe this can change in the future
  const ids = projects.map((p) => p.project_id);
  const project_partners = await ProjectPartner.findAll({
    where: {
      project_id: ids,
      code_partner_type_id: SPONSOR_TYPE,
    },
    include: { all: true, nested: true }
  }).map(result => result.dataValues).map(res => { 
    return {...res, business_associate: res.business_associate.dataValues }
  });
  projects = projects.map((project) => {
    const partners = project_partners.filter((partner) => partner.project_id === project.project_id);
    let sponsor = null;
    if (partners.length) {
      sponsor = partners[0].business_associate.business_associate_name;
    } 
    return  {...project, sponsor: sponsor };
  });
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
  let projectServiceArea = await ProjectServiceArea.findAll({
    // include: [{
    //   model: CodeServiceArea,
    //   attributes: { exclude: ['Shape']}
    // }] ,
    where: {
      project_id: ids
    }
  }).map((data) => data.dataValues);
  const codeServiceAreaIds = projectServiceArea.map((psa) => psa.code_service_area_id);
  let codeServiceAreas = await CodeServiceArea.findAll({
    where: {
      code_service_area_id: codeServiceAreaIds
    },
    attributes: {exclude: ['Shape']}
  }).map(data => data.dataValues);
  projectServiceArea = projectServiceArea.map((data) => {
    const codeServiceArea = codeServiceAreas.filter((d) => d.code_service_area_id === data.code_service_area_id)[0];
    return {
      ...data,
      codeServiceArea: codeServiceArea
    }
  });
  projects = projects.map((data) => {
    const codeServiceArea = projectServiceArea.filter((d) => d.project_id === data.project_id)[0];
    return {
      ...data,
      serviceArea: codeServiceArea
    }
  });
  // GET project local goverment (jurisdiction?)
  let projectLocalGovernment = await ProjectLocalGovernment.findAll({
    where: {
      project_id: ids
    }
  }).map(data => data.dataValues);
  const codeLovalGovermentIds = projectLocalGovernment.map((psa) => psa.code_local_government_id);
  let codeLocalGoverments = await CodeLocalGoverment.findAll({
    where: {
      code_local_government_id: codeLovalGovermentIds
    },
    attributes: {exclude: ['Shape']}
  }).map(data => data.dataValues);
  projectLocalGovernment = projectLocalGovernment.map((data) => {
    const codeLocalGoverment = codeLocalGoverments.filter((d) => d.code_local_government_id === data.code_local_government_id)[0];
    return {
      ...data,
      codeLocalGoverment: codeLocalGoverment
    }
  });
  projects = projects.map((data) => {
    const codeLocalGoverment = projectLocalGovernment.filter((d) => d.project_id === data.project_id)[0];
    return {
      ...data,
      localGoverment: codeLocalGoverment
    }
  });
  // GET COUNTY 
  let projectCounty = await ProjectCounty.findAll({
    where: {
      project_id: ids
    }
  }).map(data => data.dataValues);
  const codeCounties = projectCounty.map((psa) => psa.state_county_id);
  let codeStateCounties = await CodeStateCounty.findAll({
    where: {
      state_county_id: codeCounties
    },
    attributes: {exclude: ['Shape']}
  }).map(data => data.dataValues);
  projectCounty = projectCounty.map((data) => {
    const codeStateCounty = codeStateCounties.filter((d) => d.state_county_id === data.state_county_id)[0];
    return {
      ...data,
      codeStateCounty: codeStateCounty
    }
  });
  projects = projects.map((data) => {
    const codeStateCounty = projectCounty.filter((d) => d.project_id === data.project_id)[0];
    return {
      ...data,
      county: codeStateCounty
    }
  });
  //GET Consultant
  logger.info('CONSULTANT');
  const CONSULTANT_ID = 3;
  let consultants = await ProjectPartner.findAll({
    where: {
      project_id: ids,
      code_partner_type_id: CONSULTANT_ID
    }
  }).map(result => result.dataValues);
  const consultantIds = consultants.map((data) => data.business_associates_id).filter((data) => data !== null);
  let consultantList = await BusinessAssociante.findAll({
    where: {
      business_associates_id: consultantIds
    }
  }).map((data) => data.dataValues);
  consultants = consultants.map((staff) => {
    const consultant = consultantList.filter((cons) => {
      return cons.business_associates_id === staff.business_associates_id
    });
    return {
      ...staff,
      consultant
    }
  });
  projects = projects.map((project) => {
    const staffs = consultants.filter(consult => consult.project_id === project.project_id);
    return {
      ...project,
      consultants: staffs
    }
  });
  // GET civil contractor
  logger.info('CIVIL contractor');
  const CIVIL_CONTRACTOR_ID = 8;
  let civilContractors = await ProjectPartner.findAll({
    where: {
      project_id: ids,
      code_partner_type_id: CIVIL_CONTRACTOR_ID
    }
  }).map(result => result.dataValues);
  const civilContractorsIds = civilContractors.map((data) => data.business_associates_id).filter((data) => data !== null);
  let contractorLIst = await BusinessAssociante.findAll({
    where: {
      business_associates_id: civilContractorsIds
    }
  }).map((data) => data.dataValues);
  civilContractors = civilContractors.map((staff) => {
    const business = contractorLIst.filter((cons) => {
      return cons.business_associates_id === staff.business_associates_id
    });
    return {
      ...staff,
      business
    }
  });
  projects = projects.map((project) => {
    const staffs = civilContractors.filter(consult => consult.project_id === project.project_id);
    return {
      ...project,
      civilContractor: staffs
    }
  });
  //GET landscape contractor
  logger.info('LANDSCAPE contractor');
  const LANDSCAPE_CONTRACTOR_ID = 9;
  let landscapeContractor = await ProjectPartner.findAll({
    where: {
      project_id: ids,
      code_partner_type_id: LANDSCAPE_CONTRACTOR_ID
    }
  }).map(result => result.dataValues);
  const landscapeContractorIds = landscapeContractor.map((data) => data.business_associates_id).filter((data) => data !== null);
  let landscapeContractorList = await BusinessAssociante.findAll({
    where: {
      business_associates_id: landscapeContractorIds
    }
  }).map((data) => data.dataValues);
  landscapeContractor = landscapeContractor.map((staff) => {
    const business = landscapeContractorList.filter((cons) => {
      return cons.business_associates_id === staff.business_associates_id
    });
    return {
      ...staff,
      business
    }
  });
  projects = projects.map((project) => {
    const staffs = landscapeContractor.filter(consult => consult.project_id === project.project_id);
    return {
      ...project,
      landscapeContractor: staffs
    }
  });
  // STREAMS
  let projectStreams = await ProjectStreams.findAll({
    where: {
      project_id: ids
    }
  }).map((data) => data.dataValues);
  const projectStreamsIds = projectStreams.map((data) => data.stream_id).filter((data) => data !== null);
  const streamsList = await Streams.findAll({
    where: {
      stream_id: projectStreamsIds
    },
    attributes: {exclude: ['Shape']}
  }).map((data) => data.dataValues);
  projectStreams = projectStreams.map((data) => {
    const streamvalue = streamsList.filter((d => d.stream_id === data.stream_id));
    return {
      ...data, 
      stream: streamvalue
    };
  });
  projects = projects.map((project) => { 
    const streams = projectStreams.filter((d) => d.project_id === project.project_id)[0];
    return {
      ...project,
      streams: streams
    };
  });
  

  logger.info('projects being called');
  const CIP_CODE = 5, RESTORATION_CODE = 7, DEVELOPER_CODE = 6;
  if (+code_project_type_id === CIP_CODE 
   || +code_project_type_id === RESTORATION_CODE) {
    const projectCost = await ProjectCost.findAll({
      where: {
        project_id: ids
      }
    }).map(result => result.dataValues);
    const ESTIMATED_COST = 1;
    const estimatedCosts = projectCost.filter(result => result.code_cost_type_id === ESTIMATED_COST);
    projects = projects.map(project => {
      const estimatedCost = estimatedCosts.filter(ec => ec.project_id === project.project_id)[0];
      return {
        ...project,
        estimatedCost
      };
    });
  }
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
  if ( sortby ) {
    projects = sortInside(projects, sortby, order);
  }
      
  if (filterby === 'servicearea') {
    projects = projects.filter(project => project.serviceArea.codeServiceArea.code_service_area_id === +filtervalue);
  }
  if (filterby === 'county') {
    projects = projects.filter(project => project.county.codeStateCounty.state_county_id === +filtervalue);
  }
  if (filterby === 'jurisdiction') {
    projects = projects.filter(project => project.localGoverment.codeLocalGoverment.code_local_government_id === +filtervalue);
  }
  if (filterby === 'consultant') {
    projects = projects.filter(project => {
      const consultants = project.consultants || [];
      let possible = 0;
      consultants.forEach((consultant) => {
        const business = consultant?.consultant || [];
        possible |= business.some(bus => bus.business_associates_id === +filtervalue);
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
      const status = project.project_status?.code_phase_type?.code_status_type?.code_status_type_id || -1;
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
      const jurisdiction = project.localGoverment?.codeLocalGoverment?.code_local_government_id || -1;
      if (!groupProjects[jurisdiction]) {
        groupProjects[jurisdiction] = [];
      }
      groupProjects[jurisdiction].push(project);
    });
    res.send(groupProjects);
    return;
  }
  if (group === 'county') {
    const groupProjects = {};
    projects.forEach(project => {
      const county = project.county?.codeStateCounty?.state_county_id || -1;
      if (!groupProjects[county]) {
        groupProjects[county] = [];
      }
      groupProjects[county].push(project);
    });
    res.send(groupProjects);
    return;
  }
  if (group === 'servicearea') {
    const groupProjects = {};
    projects.forEach(project => {
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
      const consultants = project.consultants || [];
      consultants.forEach((consultant) => {
        console.log(consultant.consultant, consultant.consultant.business_associates_id);
        const array = consultant.consultant || [];
        array.forEach((business) => {
          const business_associates_id = business.business_associates_id || -1;
          if (!groupProjects[business_associates_id]) {
            groupProjects[business_associates_id] = [];
          }
          groupProjects[business_associates_id].push(project);

        })
      });
    });
    res.send(groupProjects);
    return;
  }
  if (group === 'contractor') {
    const groupProjects = {};
    projects.forEach(project => {
      const civilContractors = project.civilContractor || [];
      civilContractors.forEach((civilContractor) => {
        const array = civilContractor.business || [];
        array.forEach((business) => {
          const business_associates_id = business.business_associates_id || -1;
          if (!groupProjects[business_associates_id]) {
            groupProjects[business_associates_id] = [];
          }
          groupProjects[business_associates_id].push(project);
        })
      });
      const landscapeContractor = project.landscapeContractor || [];
      landscapeContractor.forEach((landscape) => {
        const array = landscape.business || [];
        array.forEach((business) => {
          const business_associates_id = business.business_associates_id || -1;
          if (!groupProjects[business_associates_id]) {
            groupProjects[business_associates_id] = [];
          }
          groupProjects[business_associates_id].push(project);
        })
      });
    });
    res.send(groupProjects);
    return;
  }
  if (group === 'streams') {
    const groupProjects = {};
    projects = sortInside(projects, 'project_type');
    projects.forEach(project => {
      const stream = project?.streams?.stream[0]?.stream_id || -1;
      if (!groupProjects[stream]) {
        groupProjects[stream] = [];
      }
      groupProjects[stream].push(project);
    });
    res.send(groupProjects);
    return;
  }
  res.send(projects);
};

router.get('/list', listProjects);
router.get('/groups/:groupname', getGroup);

export default router;