import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

import {
  CARTO_URL,
  MAIN_PROJECT_TABLE
} from 'bc/config/config.js';
import {
  getCountiesByProjectIds,
  getConsultantsByProjectids,
  getCivilContractorsByProjectids,
  getLocalGovernmentByProjectids,
  getEstimatedCostsByProjectids,
  getStreamsDataByProjectIds
} from 'bc/utils/functionsProjects.js';

const Project = db.project;
const ProjectPartner = db.projectPartner;
const ProjectServiceArea = db.projectServiceArea;
const CodeServiceArea = db.codeServiceArea;

const getAll = (Projectsid) => {
  try {
    const list = Project.findAll({
      where: {
        project_id: Projectsid
      }
    });
    return list;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const getProjectsIdsByBounds = async (bounds) => {
  const coords = bounds.split(',');
  const where_intersect = `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom)`;
  const query = `SELECT projectid FROM ${MAIN_PROJECT_TABLE} WHERE ${where_intersect}`;
  const queryCarto = { q: query };
  try {
    const data = await needle('post', CARTO_URL, queryCarto, { json:true });

    if ( data.statusCode === 200) {
      return data.body.rows.map((elem) => elem.projectid);
    } else {
      logger.error('bad status', data.statusCode, data.body);
    }
  } catch (error) {
    console.log('ERROR AT CARTO', error);
    return [];
  }
};

const getProjects = async (include, bounds, offset = 1, limit = 12000) => {
  const where = {};
  if (bounds) {
    project_ids_bybounds = await getProjectsIdsByBounds(bounds);
    if(project_ids_bybounds.length) {
      where.project_id = project_ids_bybounds;
    }
  }
  let projects = await Project.findAll({
    where: where,
    limit,
    offset,
    include: { all: true, nested: true },
    order: [['created_date', 'DESC']]
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
  let projectServiceArea = await ProjectServiceArea.findAll({
    include: {
      model: CodeServiceArea,
      attributes: ['service_area_name']
    },
    where: {
      project_id: ids
    }
  }).map((data) => data.dataValues).map((data) => ({...data, CODE_SERVICE_AREA: data.CODE_SERVICE_AREA.dataValues.service_area_name}));
  const projectCounties = await getCountiesByProjectIds(ids);
  const consultants = await getConsultantsByProjectids(ids);
  const civilContractors = await getCivilContractorsByProjectids(ids);
  const projectLocalGovernment = await getLocalGovernmentByProjectids(ids);
  const estimatedCosts = await getEstimatedCostsByProjectids(ids);
  const projectStreams = await getStreamsDataByProjectIds(ids);

  projects = projects.map((project) => {
    const pservicearea = projectServiceArea.filter((psa) => psa.project_id === project.project_id);
    const pcounty = projectCounties.filter((d) => d.project_id === project.project_id)[0];
    const staffs = consultants.filter(consult => consult.project_id === project.project_id);
    const contractorsStaff = civilContractors.filter(consult => consult.project_id === project.project_id);
    const codeLocalGoverment = projectLocalGovernment.filter((d) => d.project_id === project.project_id)[0];
    const estimatedCost = estimatedCosts.filter(ec => ec.project_id === project.project_id)[0];
    const streams = projectStreams.filter((d) => d.project_id === project.project_id)[0];
    return {
      ...project,
      service_area_name: pservicearea[0]?.CODE_SERVICE_AREA,
      serviceArea: pservicearea,
      county:  pcounty,
      consultants: staffs,
      contractors: contractorsStaff,
      localGoverment: codeLocalGoverment,
      estimatedCost,
      streams
    };
  });
  return projects;
}

const deleteByProjectId= async (Projectsid) => {
  const project = Project.destroy({
    where: {
      project_id: Projectsid 
    }});
  if (project) {
    logger.info('project destroyed ');
    return true;
  } else {
    logger.info('project not found');
    return false;
  }
}

const saveProject = async (
  CREATE_PROJECT_TABLE,
  location, 
  project_name, 
  description,
  code_project_type_id, 
  created_date,
  modified_date,
  start_date,
  last_modified_by,
  notRequiredFields,
  notRequiredValues,
  created_by
) => {
  logger.info('create project ' + JSON.stringify(
    CREATE_PROJECT_TABLE,
    location, 
    project_name, 
    description,
    code_project_type_id, 
    created_date,
    modified_date,
    start_date,
    last_modified_by,
    notRequiredFields,
    notRequiredValues,
    created_by ));
  try {
    const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (location, project_name, description, code_project_type_id, created_date, modified_date, start_date, last_modified_by ${notRequiredFields} , created_by)
    OUTPUT inserted . *
    VALUES('${location}', '${project_name}', '${description}', '${code_project_type_id}', '${created_date}', '${modified_date}', '${start_date}', '${last_modified_by}' ${notRequiredValues},'${created_by}')`;
    const data = await db.sequelize.query(
      insertQuery,
      {
        type: db.sequelize.QueryTypes.INSERT,
      });
    return data[0][0];
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

export default {
  getAll,
  deleteByProjectId,
  saveProject,
  getProjects
};
