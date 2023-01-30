import db from 'bc/config/db.js';

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
const BusinessAssociante = db.businessAssociates;

const Attachment = db.projectAttachment;

export const getCountiesByProjectIds = async (ids) => {
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
  return projectCounty;
}

export const getConsultantsByProjectids = async (ids) => {
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
  return consultants;
}

export const getCivilContractorsByProjectids = async (ids) => {
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
  return civilContractors;
}

export const getLocalGovernmentByProjectids = async (ids) => {
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
  return projectLocalGovernment;
}

export const getEstimatedCostsByProjectids = async (ids) => {
  const projectCost = await ProjectCost.findAll({
    where: {
      project_id: ids
    }
  }).map(result => result.dataValues);
  const ESTIMATED_COST = 1;
  const estimatedCosts = projectCost.filter(result => result.code_cost_type_id === ESTIMATED_COST);
  return estimatedCosts;
}