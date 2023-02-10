import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import needle from 'needle';

import {
  CARTO_URL,
  MAIN_PROJECT_TABLE,
  PROJECT_TABLE
} from 'bc/config/config.js';
import {
  getServiceAreaByProjectIds,
  getCountiesByProjectIds,
  getConsultantsByProjectids,
  getCivilContractorsByProjectids,
  getLocalGovernmentByProjectids,
  getEstimatedCostsByProjectids,
  getStreamsDataByProjectIds
} from 'bc/utils/functionsProjects.js';
import sequelize from 'sequelize';

const Project = db.project;
const ProjectPartner = db.projectPartner;
const ProjectServiceArea = db.projectServiceArea;
const CodeServiceArea = db.codeServiceArea;
const ProjectFavorite = db.ProjectFavorite;
const ProjectCounty = db.projectCounty;
const CodeStateCounty = db.codeStateCounty;
const ProjectStreams = db.project_stream;
const ProjectLocalGovernment = db.projectLocalGovernment;
const CodeLocalGoverment = db.codeLocalGoverment;
const Streams = db.stream;
const ProjectCost = db.projectCost;
const ProjectStatus = db.projectStatus;
const CodePhaseType = db.codePhaseType;
const CodeStatusType = db.codeStatusType;
const BusinessAssociate = db.businessAssociates;
const Op = sequelize.Op;

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
  console.log(include, bounds, offset, limit);
  const where = {};
  try {
    if (bounds) {
      const project_ids_bybounds = await getProjectsIdsByBounds(bounds);
      if(project_ids_bybounds.length) {
        where.project_id = project_ids_bybounds;
      }
    }
    if (include && include.user_id) {
      const projectsFavorite = await ProjectFavorite.findAll({
        where: {
          user_id: include.user_id,
          project_table_name: MAIN_PROJECT_TABLE
        }
      }).map(result => result.dataValues);
      const pids = projectsFavorite.map((p) => p.project_id);
      if (where.project_id) {
        where.project_id = where.project_id.filter((data) => pids.includes(data));
      } else {
        where.project_id = pids;
      }
    }
    let projects = await Project.findAll({
      where: where,
      limit,
      offset,
      // include: { all: true, nested: true },
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
    const promises = [
      getServiceAreaByProjectIds(ids),
      getCountiesByProjectIds(ids),
      getConsultantsByProjectids(ids),
      getCivilContractorsByProjectids(ids),
      getLocalGovernmentByProjectids(ids),
      getEstimatedCostsByProjectids(ids),
      getStreamsDataByProjectIds(ids)
    ];
    const resolvedPromises = await Promise.all(promises);
    const projectServiceArea = resolvedPromises[0];
    const projectCounties = resolvedPromises[1];
    const consultants = resolvedPromises[2];
    const civilContractors = resolvedPromises[3];
    const projectLocalGovernment = resolvedPromises[4];
    const estimatedCosts = resolvedPromises[5];
    const projectStreams = resolvedPromises[6];
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
        serviceArea: pservicearea[0],
        county:  pcounty,
        consultants: staffs,
        contractors: contractorsStaff,
        localGoverment: codeLocalGoverment,
        estimatedCost,
        streams
      };
    });
    return projects;
  } catch (error) {
    throw error;
  }
}
const getProjectsComplete = async (include, bounds, offset = 1, limit = 120000) => {
  console.log(include, bounds, offset, limit);
  const where = {};
  try {
    if (bounds) {
      project_ids_bybounds = await getProjectsIdsByBounds(bounds);
      if(project_ids_bybounds.length) {
        where.project_id = project_ids_bybounds;
      }
    }
    if (include && include.user_id) {
      const projectsFavorite = await ProjectFavorite.findAll({
        where: {
          user_id: include.user_id,
          project_table_name: MAIN_PROJECT_TABLE
        }
      }).map(result => result.dataValues);
      const pids = projectsFavorite.map((p) => p.project_id);
      if (where.project_id) {
        where.project_id = [...where.project_id, ...pids];
      } else {
        where.project_id = pids;
      }
    }
    console.log('my where is ', where);
    let projects = await Project.findAll({
      where: where,
      limit,
      offset,
      include: [
        {
          model: ProjectServiceArea,
          include: {
            model: CodeServiceArea,
            attributes: [
              'service_area_name',
              'code_service_area_id'
            ]
          },
          attributes: [
            'project_service_area_id'
          ] 
        },
        {
          model: ProjectCounty,
          include: {
            model: CodeStateCounty,
            attributes: [
              'county_name',
              'state_county_id'
            ]
          },
          attributes: [
            'project_county_id'
          ]
        },
        {
          model: ProjectStreams,
          include: {
            model: Streams,
            attributes: [
              'stream_id',
              'stream_name'
            ]
          },
          attributes: [
            'stream_id',
            'length_in_mile'
          ]
        },
        {
          model: ProjectLocalGovernment,
          include: {
            model: CodeLocalGoverment,
            attributes: [
              'local_government_name',
              'code_local_government_id'
            ]
          },
          attributes: [
            'project_local_government_id'
          ]
        },
        {
          model: ProjectCost,
          attributes: [
            'code_cost_type_id',
            'cost'
          ],
          where: {
            code_cost_type_id: 1
          }
        },
        {
          model: ProjectStatus,
          attributes: [
            'code_phase_type_id'
          ],
          include: {
            model: CodePhaseType,
            attributes: [
              'phase_name',
            ],
            include: {
              model: CodeStatusType,
              attributes: [
                'code_status_type_id',
                'status_name'
              ]
            }
          }
        }, 
        {
          model: ProjectPartner,
          attributes: [
            'project_partner_id',
            'code_partner_type_id'
          ],
          include: {
            model: BusinessAssociate,
            attributes: [
              'business_name'
            ]
          },
          where: {
            code_partner_type_id: [3, 8, 11]
          }
        }
      ],
      order: [['created_date', 'DESC']]
    }).map(result => result.dataValues);
    // const SPONSOR_TYPE = 11; // maybe this can change in the future
    // const ids = projects.map((p) => p.project_id);
  
    // const project_partners = await ProjectPartner.findAll({
    //   where: {
    //     project_id: ids,
    //     code_partner_type_id: SPONSOR_TYPE,
    //   },
    //   include: { all: true, nested: true }
    // }).map(result => result.dataValues).map(res => { 
    //   return {...res, business_associate: res.business_associate.dataValues }
    // });
  
    // projects = projects.map((project) => {
    //   const partners = project_partners.filter((partner) => partner.project_id === project.project_id);
    //   let sponsor = null;
    //   if (partners.length) {
    //     sponsor = partners[0].business_associate.business_associate_name;
    //   } 
    //   return  {...project, sponsor: sponsor };
    // });
    // xconsole.log(project_partners);
    // const promises = [
    //   getServiceAreaByProjectIds(ids),
    //   getCountiesByProjectIds(ids),
      // getConsultantsByProjectids(ids),
    //   getCivilContractorsByProjectids(ids),
    //   getLocalGovernmentByProjectids(ids),
    //   getEstimatedCostsByProjectids(ids),
    //   getStreamsDataByProjectIds(ids)
    // ];
    // const resolvedPromises = await Promise.all(promises);
    // const projectServiceArea = resolvedPromises[0];
    // const projectCounties = resolvedPromises[1];
    // const consultants = resolvedPromises[2];
    // const civilContractors = resolvedPromises[3];
    // const projectLocalGovernment = resolvedPromises[4];
    // const estimatedCosts = resolvedPromises[5];
    // const projectStreams = resolvedPromises[6];
  
    // projects = projects.map((project) => {
    //   const pservicearea = projectServiceArea.filter((psa) => psa.project_id === project.project_id);
    //   const pcounty = projectCounties.filter((d) => d.project_id === project.project_id)[0];
    //   const staffs = consultants.filter(consult => consult.project_id === project.project_id);
    //   const contractorsStaff = civilContractors.filter(consult => consult.project_id === project.project_id);
    //   const codeLocalGoverment = projectLocalGovernment.filter((d) => d.project_id === project.project_id)[0];
    //   const estimatedCost = estimatedCosts.filter(ec => ec.project_id === project.project_id)[0];
    //   const streams = projectStreams.filter((d) => d.project_id === project.project_id)[0];
    //   return {
    //     ...project,
    //     service_area_name: pservicearea[0]?.CODE_SERVICE_AREA,
    //     serviceArea: pservicearea[0],
    //     county:  pcounty,
    //     consultants: staffs,
    //     contractors: contractorsStaff,
    //     localGoverment: codeLocalGoverment,
    //     estimatedCost,
    //     streams
    //   };
    // });
    return projects;
  } catch (error) {
    throw error;
  }
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
  getProjects,
  getProjectsComplete
};
