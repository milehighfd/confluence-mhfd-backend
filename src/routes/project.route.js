import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
const Projects = db.project;
const ProjectPartner = db.projectPartner;
const BusinessAssociates = db.businessAssociates;
const ProjectCounty = db.projectCounty;
const CodeStateCounty = db.codeStateCounty;
const ProjectServiceArea = db.projectServiceArea;
const CodeServiceArea = db.codeServiceArea;
const router = express.Router();

const listProjects = async (req, res) => {
  const { offset = 0, limit = 120000 } = req.query;
  let projects = await Projects.findAll({
    limit,
    offset,
    include: { all: true, nested: true }
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
    console.log({...project, sponsor });
    return  {...project, sponsor: sponsor };
  });
  // xconsole.log(project_partners);
  logger.info('projects being called');
  res.send(projects);
};

const getProjectDetail = async (req, res) => {
  console.log(req.params);
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
  res.send(project);
}

router.post('/', listProjects);
router.get('/:project_id', getProjectDetail);
export default router;
