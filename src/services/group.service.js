import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import Sequelize from 'sequelize';

const ProjectPartner = db.projectPartner;
const CodeStateCounty = db.codeStateCounty;
const CodeServiceArea = db.codeServiceArea;
const CodeLocalGoverment = db.codeLocalGoverment;
const ProjectStaff = db.projectStaff;
const CodeStatusType = db.codeStatusType;
const BusinessAssociante = db.businessAssociates;
const BusinessAssociateContact = db.businessAssociateContact;
const User = db.user;
const Streams = db.stream;
const ProjectType = db.codeProjectType;
const CodeProjectStaffRole = db.codeProjectStaffRole;
const Op = Sequelize.Op;

const getStatus = async () => {
  const codeStatusType = await CodeStatusType.findAll({
    order: [
      ['status_name', 'ASC']
    ]
  });
  const groups = codeStatusType.map((data) => {
    return { value: data.status_name, id: data.code_status_type_id };
  });
  groups.push( { value:'Unknown', id:-1 } );
  return groups;
}

const getJurisdiction = async () => {
  const codeLocalGoverment = await CodeLocalGoverment.findAll({
    order: [
      ['local_government_name', 'ASC']
    ]
  });
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
  });
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
  });
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
  });
  const ids = projectPartner.map((data) => data.business_associates_id);
  const businessAssociates = await BusinessAssociante.findAll({
    where: {
      business_associates_id: ids
    },
    order: [['business_name', 'ASC']]
  });
  const groups = businessAssociates.map((data) => {
    return { value: data.business_name === '' ? 'Unknown' : data.business_name, id: data.business_associates_id };
  });
  groups.sort((a, b) => {
    if (a.value === 'Unknown') {
      return 1;
    }
    if (b.value === 'Unknown') {
      return -1;
    }
    return a.value.localeCompare(b.value);
  });  
  return groups;
}

const getContractor = async () => {
  const CIVIL_CONTRACTOR_ID = 8, LANDSCAPE_CONTRACTOR_ID = 9;
  const projectPartner = await ProjectPartner.findAll({
    where: {
      code_partner_type_id: [CIVIL_CONTRACTOR_ID, LANDSCAPE_CONTRACTOR_ID]
    }
  });
  const ids = projectPartner.map((data) => data.business_associates_id);
  const businessAssociates = await BusinessAssociante.findAll({
    where: {
      business_associates_id: ids
    },
    order: [['business_name', 'ASC']]
  });
  const groups = businessAssociates.map((data) => {
    return { value: data.business_name === '' ? 'Unknown' : data.business_name, id: data.business_associates_id };
  });
  groups.sort((a, b) => {
    if (a.value === 'Unknown') {
      return 1;
    }
    if (b.value === 'Unknown') {
      return -1;
    }
    return a.value.localeCompare(b.value);
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

  // const newGroup = groups.reduce((acc, curr) => {
  //   const group = acc.find(item => item.value === curr.value);
  //   if (group) {
  //     group.id.push(curr.id);
  //   } else {
  //     acc.push({value: curr.value, id: [curr.id]});
  //   }
  //   return acc;
  // }, []);
  const newGroup = groups.reduce((acc, curr) => {
    const group = acc.find(item => item.value === curr.value);
    if (group) {
      group.id += `,${curr.id}`;
    } else {
      acc.push({value: curr.value, id: curr.id.toString()});
    }
    return acc;
  }, []);
  return newGroup;
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

const getMhfdStaff = async () => {
  const MHFD_LEAD = 1;
  const types = await ProjectStaff.findAll({
    include: [{
      model: CodeProjectStaffRole,
      required: true,
      where: {        
        code_project_staff_role_type_id: MHFD_LEAD,        
      }
    },{
      model: BusinessAssociateContact,
      required: true,
      include: [{
        model: User,
        required: false,
      }]
    }],
  });
  const groups = types.map((data) => {
    return { value: data?.business_associate_contact?.contact_name, id: data?.business_associate_contact?.business_associate_contact_id };
  });
  let uniqueGroups = [...new Map(groups.map(item => [item['id'], item])).values()];
  uniqueGroups= uniqueGroups.filter(obj => Object.keys(obj).length !== 0);
  uniqueGroups.sort((a, b) => {
    return a.value.localeCompare(b.value);
  });  
  return uniqueGroups;
}

const getLGManager = async () => {
  const LG_LEAD = 10;
  const types = await ProjectStaff.findAll({
    include: [{
      model: CodeProjectStaffRole,
      required: true,
      where: {        
        code_project_staff_role_type_id: LG_LEAD,        
      }
    },{
      model: BusinessAssociateContact,
      required: true,
      include: [{
        model: User,
        required: false,
      }]
    }],
  });
  const groups = types.map((data) => {
    return { value: data?.business_associate_contact?.contact_name, id: data?.business_associate_contact?.business_associate_contact_id };
  });
  let uniqueGroups = [...new Map(groups.map(item => [item['id'], item])).values()];
  uniqueGroups= uniqueGroups.filter(obj => Object.keys(obj).length !== 0);
  return uniqueGroups;
}

export default {
  getStatus,
  getJurisdiction,
  getCounty,
  getServiceArea,
  getConsultant,
  getContractor,
  getStreams,
  getProjectType,
  getMhfdStaff,
  getLGManager
};