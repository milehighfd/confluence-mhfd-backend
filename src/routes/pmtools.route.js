import express from 'express';
import https from 'https';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import Sequelize from 'sequelize';
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

const sortInside = (projects, sortvalue) => {
  projects.sort((a,b) => a?.project_status?.code_phase_type?.code_project_type?.project_type_name?.localeCompare(b?.project_status?.code_phase_type?.code_project_type?.project_type_name ));
  return projects;
}
const listProjects = async (req, res) => {
  const { offset = 0, limit = 120000, code_project_type_id, group, filterby, filtervalue } = req.query;
  const where = {};
  if (code_project_type_id) {
    where.code_project_type_id = +code_project_type_id;
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
      return {
        ...project,
        developers: staffs
      }
    });
  }
  if (filterby === 'servicearea') {
    projects = projects.filter(project => project.serviceArea.codeServiceArea.code_service_area_id === +filtervalue);
  }
  if (group === 'status') {
    const groupProjects = {};
    projects = sortInside(projects, 'project_type');
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