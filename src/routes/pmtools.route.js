import express from 'express';
import https from 'https';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
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
const router = express.Router();
import {
  CARTO_URL,
  PROBLEM_TABLE,
  PROPSPROBLEMTABLES,
} from 'bc/config/config.js';


const listProjects = async (req, res) => {
  const { offset = 0, limit = 120000, code_project_type_id } = req.query;
  const where = {};
  if (code_project_type_id) {
    where.code_project_type_id = code_project_type_id;
  }
  let projects = await Projects.findAll({
    limit,
    offset,
    include: { all: true, nested: true },
    where: where
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
  console.log('the project staff is ', projectStaff);
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
  console.log('data is ', codeServiceAreas);
  logger.info('projects being called');
  res.send(projects);
};

router.get('/list', listProjects);

export default router;