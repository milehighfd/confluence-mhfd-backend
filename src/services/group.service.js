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
const ProjectType = db.codeProjectType;
const Op = Sequelize.Op;

const getStatus = async () => {
  const codeStatusType = await CodeStatusType.findAll({
    order: [
      ['status_name', 'ASC']
    ]
  }).map((data) => data.dataValues);
  const groups = codeStatusType.map((data) => {
    return { value: data.status_name, id: data.code_status_type_id };
  });
  groups.push( { value:'No Group Available', id:-1 } );
  return groups;
}

const getJurisdiction = async () => {
  const codeLocalGoverment = await CodeLocalGoverment.findAll({
    order: [
      ['local_government_name', 'ASC']
    ]
  }).map((data) => data.dataValues);
  const groups = codeLocalGoverment.map((data) => {
    return { value: data.local_government_name, id: data.code_local_government_id };
  });
  return groups;
}

const getCounty = async () => {
  const codeStateCounty = await CodeStateCounty.findAll({
    order: [
      ['county_name', 'ASC']
    ]
  }).map((data) => data.dataValues);
  const groups = codeStateCounty.map((data) => {
    return { value: data.county_name, id: data.state_county_id };
  });
  return groups;
}

const getServiceArea = async () => {
  const codeServiceArea = await CodeServiceArea.findAll({
    order: [
      ['service_area_name', 'ASC']
    ]
  }).map((data) => data.dataValues);
  const groups = codeServiceArea.map((data) => {
    return { value: data.service_area_name, id: data.code_service_area_id };
  });
  return groups;
}

const getConsultant = async () => {
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
    return { value: data.business_name, id: data.business_associates_id };
  });
  return groups;
}

const getContractor = async () => {
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
    return { value: data.business_name, id: data.business_associates_id };
  });
  return groups;
}

const getStreams = async () => {
  const streams = await Streams.findAll({
    order: [
      ['stream_name', 'ASC']
    ],
    attributes: [
      'stream_name',
      'stream_id'
    ],
    where: {
      stream_name: {[Op.ne]: null}
    }
  });
  const groups = streams.map((data) => {
    return { value: data.stream_name, id: data.stream_id}
  });
  return groups;
}

const getProjectType = async () => {
  const types = await ProjectType.findAll({
    order: [
      ['project_type_name']
    ]
  });
  const groups = types.map((data) => {
    return { value: data.project_type_name, id: data.code_project_type_id };
  });
  return groups;
}

export default {
  getStatus,
  getJurisdiction,
  getCounty,
  getServiceArea,
  getConsultant,
  getContractor,
  getStreams,
  getProjectType
};