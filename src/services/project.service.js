import https from 'https';
import needle from 'needle';

import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

import {
  CARTO_URL,
  MAIN_PROJECT_TABLE,
  PROPSPROBLEMTABLES,
  PROBLEM_TABLE
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
const ProjectComponent = db.projectComponent;
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
const CodeStudySubreason = db.codeStudySubreason;
const CodeStudyReason = db.codeStudyReason;
const StreamStudy = db.streamstudy;

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
          [
            sequelize.literal(`(
              SELECT COUNT([project_component].[project_id])
              FROM [project_component]
              WHERE [project_component].[project_id] = [project].[project_id]
            )`),
            'totalComponents',
          ],
        ], 
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
            // where: {
            //   code_cost_type_id: 1
            // }
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
              include: [{
                model: CodeStatusType,
                attributes: [
                  'code_status_type_id',
                  'status_name'
                ]
              }, {
                model: CodeProjectType,
                attributes: [
                  'code_project_type_id',
                  'project_type_name'
                ]
              }]
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
                'business_name',
                'business_associates_id'
              ]
            },
            // where: {
            //   code_partner_type_id: [3, 8, 11]
            // }
          },
          {
            model: ProjectComponent,
            attributes: [
              'component_id',
              'source_table_name',
              'project_component_id'
            ],
            // where: {
            //   code_cost_type_id: 1
            // }
          },
          {
            model: ProjectComponent,
            attributes: [
              'component_id',
              'source_table_name',
              'project_component_id'
            ],
            // where: {
            //   code_cost_type_id: 1
            // }
          },
          {
            model: ProjectStaff,
            attributes: [
              'code_project_staff_role_type_id',
              'is_active',
              'project_staff_id'
            ],
            include: {
              model: MHFDStaff,
              attributes: [
                'user_id',
                'mhfd_staff_id',
                'full_name'
              ],
              include: {
                model: User,
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
            model: ProjectDetail
            // where: {
            //   code_cost_type_id: 1
            // }
          },
          {
            model: ProjectStudy,
            include: {
              model: Study,
              include: [{
                model: CodeStudyType
              },
              {
                model: RelatedStudy
              },
              {
                model: CodeStudySubreason,
                include: {
                  model: CodeStudyReason
                }
              },
              {
                model: StreamStudy,
                include: {
                  attributes: [
                    'stream_id',
                    'stream_name'
                  ],
                  model: Streams
                }
              }]
            }
          }, 
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
    /*
      if (bounds) {
        const project_ids_bybounds = await getProjectsIdsByBounds(bounds);
        if(project_ids_bybounds.length) {
          where.project_id = project_ids_bybounds;
        }
      }
      if (include?.code_project_type_id) {
        where.code_project_type_id = +include.code_project_type_id;
      }
      
      if (include && include.user_id) {
        const projectsFavorite = await ProjectFavorite.findAll({
          where: {
            user_id: include.user_id,
          }
        }).map(result => result.dataValues);
        const pids = projectsFavorite.map((p) => p.project_id);
        if (where.project_id) {
          where.project_id = [...where.project_id, ...pids];
        } else {
          where.project_id = pids;
        }
      }
    */
    //if (!bounds && !include?.code_project_type_id && !include?.user_id && cache) {
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
        [
          sequelize.literal(`(
            SELECT COUNT([project_component].[project_id])
            FROM [project_component]
            WHERE [project_component].[project_id] = [project].[project_id]
          )`),
          'totalComponents',
        ],
      ], 
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
          // where: {
          //   code_cost_type_id: 1
          // }
        },
        {
          model: ProjectStatus,
          attributes: [
            'code_phase_type_id',
            'planned_start_date',
            'actual_start_date'
          ],
          include: {
            model: CodePhaseType,
            attributes: [
              'phase_name',
            ],
            include: [{
              model: CodeStatusType,
              attributes: [
                'code_status_type_id',
                'status_name'
              ]
            }, {
              model: CodeProjectType,
              attributes: [
                'code_project_type_id',
                'project_type_name'
              ]
            }]
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
              'business_name',
              'business_associates_id'
            ]
          },
          // where: {
          //   code_partner_type_id: [3, 8, 11]
          // }
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
  created_by
) => {
  logger.info('create project ' + JSON.stringify(
    CREATE_PROJECT_TABLE,
    project_name, 
    description,
    code_project_type_id, 
    created_date,
    modified_date,
    start_date,
    last_modified_by,
    created_by ));
  try {
    const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (project_name, description, code_project_type_id, created_date, modified_date, start_date, last_modified_by, created_by)
    OUTPUT inserted . *
    VALUES('${project_name}', '${description}', '${code_project_type_id}', '${created_date}', '${modified_date}', '${start_date}', '${last_modified_by}', '${created_by}')`;
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
  getProjectsDeprecated,
  getProjectsIdsByBounds,
  getDetails
};
