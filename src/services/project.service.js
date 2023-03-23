import https from 'https';
import needle from 'needle';

import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import { cleanStringValue } from 'bc/routes/new-project/helper.js';

import {
  CARTO_URL,
  MAIN_PROJECT_TABLE,
  PROPSPROBLEMTABLES,
  PROBLEM_TABLE,
  ARCGIS_SERVICE
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
const ProjectProposedAction = db.projectProposedAction;
const CodeLocalGoverment = db.codeLocalGoverment;
const Streams = db.stream;
const ProjectCost = db.projectCost;
const ProjectStatus = db.projectStatus;
const CodePhaseType = db.codePhaseType;
const CodeStatusType = db.codeStatusType;
const CodeProjectType = db.codeProjectType;
const BusinessAssociate = db.businessAssociates;
const ProjectStaff = db.projectStaff;
const MHFDStaff = db.mhfdStaff;
const ProjectDetail = db.projectDetail;
const ProjectStudy = db.projectstudy;
const Study = db.study;
const CodeStudyType = db.codestudytype;
const RelatedStudy = db.relatedstudy;
const StreamStudy = db.streamstudy;
const CodeStudyReason = db.codeStudyReason;

const User = db.user;
const Op = sequelize.Op;

async function getProblemByProjectId(projectid, sortby, sorttype) {
  let data = [];
  const LINE_SQL = `select ${PROPSPROBLEMTABLES.problem_boundary[5]} as ${PROPSPROBLEMTABLES.problems[5]}, ${PROPSPROBLEMTABLES.problem_boundary[6]} as ${PROPSPROBLEMTABLES.problems[6]}, ${PROPSPROBLEMTABLES.problem_boundary[7]}  as ${PROPSPROBLEMTABLES.problems[7]} from ${PROBLEM_TABLE}  
 where ${PROPSPROBLEMTABLES.problem_boundary[5]} in (SELECT problemid FROM grade_control_structure 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM pipe_appurtenances 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM special_item_point 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM special_item_linear 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM special_item_area 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM channel_improvements_linear 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM channel_improvements_area 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM removal_line 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM removal_area 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM storm_drain 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM detention_facilities 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM maintenance_trails 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM land_acquisition 
   where projectid=${projectid} and projectid>0  union ` +
     `SELECT problemid FROM landscaping_area 
   where projectid=${projectid} and projectid>0) 
   order by ${sortby} ${sorttype}`;
  logger.info(`CARTO REQUEST: ${LINE_SQL}'`);
  const LINE_URL = encodeURI(`${CARTO_URL}&q=${LINE_SQL}`);
  //console.log(LINE_URL);
  try {
    const newProm1 = new Promise((resolve, reject) => {
      https.get(LINE_URL, response => {
         if (response.statusCode === 200) {
            let str = '';
            response.on('data', function (chunk) {
               str += chunk;
            });
            response.on('end', async function () {
               resolve(JSON.parse(str).rows);
            })
         }
      });
   });
    data = await newProm1;
    console.log('the data is ', data);
    return data;
  } catch (e) {
    console.error('Error with QUERY ', e);
    return [];
  }
}

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
  const coords = bounds?.split(',');
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

const  getProjectsDeprecated  = async (include, bounds, offset = 1, limit = 12000) => {
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

const getDetails = async (project_id) => {
  try {
    const [projectPromise, problems] = await Promise.all([
      Project.findByPk(project_id, {
        attributes: [
          "project_id",
          "project_name",
          "description",
          "onbase_project_number",
          "created_date",
          'code_project_type_id',
          'code_maintenance_eligibility_type_id',
          'current_project_status_id',
          [
            sequelize.literal(`(
              SELECT COUNT([project_proposed_action].[project_id])
              FROM [project_proposed_action]
              WHERE [project_proposed_action].[project_id] = [project].[project_id]
            )`),
            'totalComponents',
          ],
        ], 
        include: [
          {
            model: ProjectServiceArea,
            required: false,
            include: {
              model: CodeServiceArea,
              required: false,
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
            required: false,
            include: {
              model: CodeStateCounty,
              required: false,
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
            required: false,
            include: {
              model: Streams,
              required: false,
              attributes: [
                'stream_id',
                'stream_name'
              ]
            },
          },
          {
            model: ProjectLocalGovernment,
            required: false,
            include: {
              model: CodeLocalGoverment,
              required: false,
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
            required: false,
            attributes: [
              'code_cost_type_id',
              'cost',
              'cost_description'
            ],
            // where: {
            //   code_cost_type_id: 1
            // }
          },
          {
            model: ProjectStatus,
            required: false,
            attributes: [
              'code_phase_type_id',
              'planned_start_date',
              'actual_start_date',
              'project_status_id'
            ],
            include: {
              model: CodePhaseType,
              required: false,
              attributes: [
                'phase_name',
              ],
              include: [{
                model: CodeStatusType,
                required: false,
                attributes: [
                  'code_status_type_id',
                  'status_name'
                ]
              }, {
                model: CodeProjectType,
                required: false,
                attributes: [
                  'code_project_type_id',
                  'project_type_name'
                ]
              }]
            }
          },
          {
            model: ProjectPartner,
            required: false,
            attributes: [
              'project_partner_id',
              'code_partner_type_id'
            ],
            include: {
              model: BusinessAssociate,
              required: false,
              attributes: [
                'business_name',
                'business_associates_id'
              ]
            },
            // where: {
            //   code_partner_type_id: [3, 8, 11]
            // }
          },
          {
            model: ProjectProposedAction,
            required: false,
            attributes: [
              'object_id',
              'source_table_name',
              'project_proposed_action_id'
            ],
            // where: {
            //   code_cost_type_id: 1
            // }
          },
          {
            model: ProjectStaff,
            required: false,
            attributes: [
              'code_project_staff_role_type_id',
              'is_active',
              'project_staff_id'
            ],
            include: {
              model: MHFDStaff,
              required: false,
              attributes: [
                'user_id',
                'mhfd_staff_id',
                'full_name'
              ],
              include: {
                model: User,
                required: false,
                attributes: [
                  'organization'
                ]
              }
            }
            // where: {
            //   code_cost_type_id: 1
            // }
          },
          {
            model: ProjectDetail,
            required: false,
            // where: {
            //   code_cost_type_id: 1
            // }
          },
          {
            model: ProjectStudy,
            required: false,
            include: {
              model: Study,
              required: false,
              include: [{
                model: CodeStudyType,
                required: false,
              },
              {
                model: RelatedStudy,
                required: false,
              },
              {
                model: CodeStudyReason,
                required: false,
              },
              {
                model: StreamStudy,
                required: false,
                include: {
                  attributes: [
                    'stream_id',
                    'stream_name'
                  ],
                  model: Streams,
                  required: false,
                }
              }]
            }
          }, 
          {
            model: CodeProjectType,
            required: false,
            attributes: [
              'code_project_type_id',
              'project_type_name'
            ]
          }
        ],
        order: [['created_date', 'DESC']]
      }),
      getProblemByProjectId(project_id, PROPSPROBLEMTABLES.problems[6], 'asc')
    ]);
    if (!projectPromise) {
      return {
        error: 404,
        message: 'Project Not Found'
      };
    }
    let project = projectPromise.dataValues;
    logger.info(`Adding problems ${JSON.stringify(problems)}`)
    project = { ...project, problems: problems };
    return project;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}


let cache = null;
const getProjects = async (include, bounds, offset = 0, limit = 120000) => {
  console.log(include, bounds, offset, limit);
  const where = {};
  try {
    if (cache) {
      return cache;
    }
    console.log('my where is ', where);
    let projects = await Project.findAll({
      where: where,
      limit,
      offset,
      separate: true,
      attributes: [
        "project_id",
        "project_name",
        "description",
        "onbase_project_number",
        "created_date",
        'code_project_type_id',
        'current_project_status_id',
        [
          sequelize.literal(`(
            SELECT COUNT([project_proposed_action].[project_id])
            FROM [project_proposed_action]
            WHERE [project_proposed_action].[project_id] = [project].[project_id]
          )`),
          'totalComponents',
        ],
      ], 
      
      include: [
        {
          model: ProjectStaff,
          required: false,
          attributes: [
            'code_project_staff_role_type_id',
            'is_active',
            'project_staff_id'
          ],
          include: {
            model: MHFDStaff,
            required: false,
            attributes: [
              'user_id',
              'mhfd_staff_id',
              'full_name'
            ],
            include: {
              model: User,
              required: false,
              attributes: [
                'organization'
              ]
            }
          }
          // where: {
          //   code_cost_type_id: 1
          // }
        },
        {
          model: ProjectServiceArea,
          required: false,
          include: {
            model: CodeServiceArea,
            required: false,
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
            required: false,
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
          required: false,
          include: {
            model: Streams,
            required: false,
            attributes: [
              'stream_id',
              'stream_name'
            ]
          }
        },
        {
          model: ProjectLocalGovernment,
          required: false,
          include: {
            model: CodeLocalGoverment,
            required: false,
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
          required: false,
          attributes: [
            'code_cost_type_id',
            'cost'
          ],
          // where: {
          //   code_cost_type_id: 1
          // }
        },
        {
          model: ProjectStatus,
          required: false,
          attributes: [
            'code_phase_type_id',
            'planned_start_date',
            'actual_start_date',
            'project_status_id'
          ],
          include: {
            model: CodePhaseType,
            required: false,
            attributes: [
              'phase_name',
            ],
            include: [{
              model: CodeStatusType,
              required: false,
              attributes: [
                'code_status_type_id',
                'status_name'
              ]
            }, {
              model: CodeProjectType,
              required: false,
              attributes: [
                'code_project_type_id',
                'project_type_name'
              ]
            }]
          }
        },         
        {
          model: ProjectPartner,
          required: false,
          attributes: [
            'project_partner_id',
            'code_partner_type_id'
          ],
          include: {
            model: BusinessAssociate,
            required: false,
            attributes: [
              'business_name',
              'business_associates_id'
            ]
          },
          // where: {
          //   code_partner_type_id: [3, 8, 11]
          // }
        },{
          model: CodeProjectType,
          required: false,
          attributes: [
            'code_project_type_id',
            'project_type_name'
          ]
        }
      ],
      order: [['created_date', 'DESC']]
    }).map(result => result.dataValues);
    cache = projects;
    return projects;
  } catch (error) {
    logger.error(error);
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
  project_name, 
  description,
  code_project_type_id, 
  created_date,
  modified_date,
  start_date,
  last_modified_by,
  created_by,
  code_maintenance_eligibility_type_id = null
) => {
  
  try {
    let insert;
    if (code_maintenance_eligibility_type_id) {
      insert = Project.create({
        project_name: project_name,
        project_alias: project_name,
        description: description,
        code_project_type_id: code_project_type_id,
        created_date: created_date,
        modified_date: modified_date,
        start_date: start_date,
        last_modified_by: last_modified_by,
        is_spatial_data_required: 0,
        created_by: created_by,
        code_maintenance_eligibility_type_id: code_maintenance_eligibility_type_id,
      });
    } else {
      insert = Project.create({
        project_name: project_name,
        project_alias: project_name,
        description: description,
        code_project_type_id: code_project_type_id,
        created_date: created_date,
        modified_date: modified_date,
        start_date: start_date,
        last_modified_by: last_modified_by,
        is_spatial_data_required: 0,
        created_by: created_by
      });
    }
    logger.info('create project ');
    return insert;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

const updateProject = async (
  project_id,
  project_name, 
  description,
  modified_date,
  last_modified_by,
  code_maintenance_eligibility_type_id = null
) => {
  
  try {
    let insert;
    if (code_maintenance_eligibility_type_id) {
      insert = Project.update({
        project_name: project_name,
        description: description,
        modified_date: modified_date,
        last_modified_by: last_modified_by,
        code_maintenance_eligibility_type_id: code_maintenance_eligibility_type_id,
      }, { where: { project_id: project_id } }
      );
    } else {
      insert = Project.update({
        project_name: project_name,
        description: description,
        modified_date: modified_date,
        last_modified_by: last_modified_by,
      }, { where: { project_id: project_id } });
    }
    logger.info('create project ');
    return insert;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}


const createRandomGeomOnARCGIS = (coordinates, projectname, token, projectid) => {  
  const newGEOM = [{"geometry":{"paths":[ ] ,"spatialReference" : {"wkid" : 4326}},"attributes":{"update_flag":0,"projectName":projectname, "projectId": projectid}}];
  newGEOM[0].geometry.paths = coordinates;
  const formData = {
    'f': 'pjson',
    'token': token,
    'adds': JSON.stringify(newGEOM)
  };
  return formData;
};

const getAuthenticationFormData = () => {
  const formData = {
    'username': 'ricardo_confluence',
    'password': 'M!l3H!gh$m$',
    'client': 'referer',
    'ip': '181.188.178.182',
    'expiration': '60',
    'f': 'pjson',
    'referer': 'localhost'
  };
  return formData;
}

const insertIntoArcGis = async (geom, projectid, projectname) => {
  try {
    const URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
    const fd = getAuthenticationFormData();
    const token_data = await needle('post', URL_TOKEN, fd, { multipart: true });
    const TOKEN = JSON.parse(token_data.body).token;
    const bodyFD = createRandomGeomOnARCGIS(JSON.parse(geom).coordinates, cleanStringValue(projectname), TOKEN, projectid);
    const createOnArcGis = await needle('post',`${ARCGIS_SERVICE}/applyEdits`, bodyFD, { multipart: true });
    console.log('create on arc gis at ', ARCGIS_SERVICE, createOnArcGis.statusCode, createOnArcGis.body);
    if (createOnArcGis.statusCode == 200) {
      if (createOnArcGis.body.error) {
        return { successArcGis: false, error: createOnArcGis.body.error };  
      }
      return { successArcGis: createOnArcGis.body.addResults[0].success };
    } else {
      return { successArcGis: false, error:createOnArcGis.body};
    }
  } catch(e) {
    console.log('error at insert into arcgis', e);
    return {
      successArcGis: false,
      error: e
    }
  }  
}

const getCurrentProjectStatus = (project) => {
  const current = project?.project_statuses?.find(ps => ps.project_status_id === project.current_project_status_id);
  return current;
}

export default {
  getAll,
  deleteByProjectId,
  saveProject,
  getProjects,
  getProjectsDeprecated,
  getProjectsIdsByBounds,
  getDetails,
  insertIntoArcGis,
  getAuthenticationFormData,
  createRandomGeomOnARCGIS,
  updateProject,
  getCurrentProjectStatus
};
