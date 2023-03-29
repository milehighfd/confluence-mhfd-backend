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
import { CREATE_PROJECT_TABLE } from 'bc/config/config.js';

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
const ProjectIndependentAction = db.projectIndependentAction;
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


async function getCentroidOfProjectId (projectid) {
  const SQL = `SELECT st_asGeojson(ST_PointOnSurface(the_geom)) as centroid FROM "denver-mile-high-admin".${CREATE_PROJECT_TABLE} where projectid = ${projectid}`;
  const LINE_URL = encodeURI(`${CARTO_URL}&q=${SQL}`);
  let data;
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
    console.log('the data is ', projectid, data, '\n', SQL);
    return data;
  } catch (e) {
    console.error('Error with QUERY ', e);
    return [];
  }
}
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
    const [projectPromise, problems, centroidProj] = await Promise.all([
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
              'actual_end_date',
              'planned_end_date',
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
            model: ProjectIndependentAction,
            required: false,
            attributes: [
              'action_name',
              'project_id',
              'cost',
              'action_status'
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
      getProblemByProjectId(project_id, PROPSPROBLEMTABLES.problems[6], 'asc'),
      getCentroidOfProjectId(project_id)
    ]);
    if (!projectPromise) {
      return {
        error: 404,
        message: 'Project Not Found'
      };
    }
    let project = projectPromise.dataValues;
    logger.info(`Adding problems ${JSON.stringify(problems)} to ${project_id} with name ${project.project_name}`)
    project = { ...project, problems: problems, centroid: centroidProj };
    return project;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}


let cache = null;
const getProjects = async (include, bounds, offset = 0, limit = 120000) => {
  const where = {};
  try {
    if (cache) {
      return cache;
    }
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
        /* [
          sequelize.literal(`(
            SELECT COUNT([GRADE_CONTROL_STRUCTURE].[projectid])
            FROM [GRADE_CONTROL_STRUCTURE]
            WHERE [GRADE_CONTROL_STRUCTURE].[projectid] = [project].[project_id]
          )`),
          'GRADE_CONTROL_STRUCTURE',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT([PIPE_APPURTENANCES].[projectid])
            FROM [PIPE_APPURTENANCES]
            WHERE [PIPE_APPURTENANCES].[projectid] = [project].[project_id]
          )`),
          'PIPE_APPURTENANCES',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT([SPECIAL_ITEM_POINT].[projectid])
            FROM [SPECIAL_ITEM_POINT]
            WHERE [SPECIAL_ITEM_POINT].[projectid] = [project].[project_id]
          )`),
          'SPECIAL_ITEM_POINT',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT([SPECIAL_ITEM_LINEAR].[projectid])
            FROM [SPECIAL_ITEM_LINEAR]
            WHERE [SPECIAL_ITEM_LINEAR].[projectid] = [project].[project_id]
          )`),
          'SPECIAL_ITEM_LINEAR',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT([SPECIAL_ITEM_AREA].[projectid])
            FROM [SPECIAL_ITEM_AREA]
            WHERE [SPECIAL_ITEM_AREA].[projectid] = [project].[project_id]
          )`),
          'SPECIAL_ITEM_AREA',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT([CHANNEL_IMPROVEMENTS_LINEAR].[projectid])
            FROM [CHANNEL_IMPROVEMENTS_LINEAR]
            WHERE [CHANNEL_IMPROVEMENTS_LINEAR].[projectid] = [project].[project_id]
          )`),
          'CHANNEL_IMPROVEMENTS_LINEAR',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT([CHANNEL_IMPROVEMENTS_AREA].[projectid])
            FROM [CHANNEL_IMPROVEMENTS_AREA]
            WHERE [CHANNEL_IMPROVEMENTS_AREA].[projectid] = [project].[project_id]
          )`),
          'CHANNEL_IMPROVEMENTS_AREA',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT([REMOVAL_LINE].[projectid])
            FROM [REMOVAL_LINE]
            WHERE [REMOVAL_LINE].[projectid] = [project].[project_id]
          )`),
          'REMOVAL_LINE',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT([REMOVAL_AREA].[projectid])
            FROM [REMOVAL_AREA]
            WHERE [REMOVAL_AREA].[projectid] = [project].[project_id]
          )`),
          'REMOVAL_AREA',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT([STORM_DRAIN].[projectid])
            FROM [STORM_DRAIN]
            WHERE [STORM_DRAIN].[projectid] = [project].[project_id]
          )`),
          'STORM_DRAIN',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT([DETENTION_FACILITIES].[projectid])
            FROM [DETENTION_FACILITIES]
            WHERE [DETENTION_FACILITIES].[projectid] = [project].[project_id]
          )`),
          'DETENTION_FACILITIES',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT([MAINTENANCE_TRAILS].[projectid])
            FROM [MAINTENANCE_TRAILS]
            WHERE [MAINTENANCE_TRAILS].[projectid] = [project].[project_id]
          )`),
          'MAINTENANCE_TRAILS',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT([LAND_ACQUISITION].[projectid])
            FROM [LAND_ACQUISITION]
            WHERE [LAND_ACQUISITION].[projectid] = [project].[project_id]
          )`),
          'LAND_ACQUISITION',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT([LANDSCAPING_AREA].[projectid])
            FROM [LANDSCAPING_AREA]
            WHERE [LANDSCAPING_AREA].[projectid] = [project].[project_id]
          )`),
          'LANDSCAPING_AREA',
        ], */
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
            'actual_end_date',
            'planned_end_date',
            'project_status_id',
            'is_locked',
            'is_done'
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

    // TODO: Think logic for this
    /*
      projects.forEach(async project => {
        if (project.current_project_status_id) {
          let foundCurrent = false;
          for (const ps of project.project_statuses) {
            if (ps.project_status_id === project.current_project_status_id) {
              foundCurrent = true;
            }
            if (foundCurrent) break;
            if (!ps.is_done) {
              ps.is_done = 1;
              await ProjectStatus.update({
                is_done: 1
              }, {
                where: {
                  project_status_id: ps.project_status_id
                }
              });
            }
          }
        }
      });
    */
    const BUCKET_SIZE = 50;
    let index = 0;
    let bucket = BUCKET_SIZE;
    while (index < projects.length) {
      const promises = [];
      const starIndex = index;
      while (index < bucket && index < projects.length) {
        promises.push(getProblemByProjectId(projects[index].project_id, PROPSPROBLEMTABLES.problems[6], 'asc'));
        promises.push(getCentroidOfProjectId(projects[index].project_id));
        index++;
      }
      const doneData = await Promise.all(promises);
      for (let i = starIndex; i < index; i++) {
        projects.problems = doneData[2 * i];
        projects.centroid = doneData[2 * i + 1];
      } 
      logger.info(`BUCKET FROM ${starIndex} to ${bucket} proccesed`);
      bucket += BUCKET_SIZE;
    }
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

const updateProjectCurrentProjectStatusId = (project_id, current_project_status_id) => {
  if (cache) {
    const index = cache.findIndex(project => project.project_id === project_id);
    if (index !== -1) {
      cache[index].current_project_status_id = current_project_status_id;
    }
  }
}

const updateProjectStatus = async (project_id) => {
  const projectStatuses = await ProjectStatus.findAll({
    where: {
      project_id: project_id
    },
    required: false,
    attributes: [
      'code_phase_type_id',
      'planned_start_date',
      'actual_start_date',
      'actual_end_date',
      'planned_end_date',
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
    },
  }).map(d => d.dataValues);
  logger.info(JSON.stringify(projectStatuses));
  if (cache) {
    const index = cache.findIndex(project => project.project_id === project_id);
    logger.info(`Index is ${index}`)
    if (index !== -1) {
      cache[index].project_statuses = projectStatuses;
    }
  }
}

const findProject = (project_id) => {
  if (cache) {
    const project = cache.find((p) => p.project_id === project_id);
    return project;
  } else {
    return null;
  }
}

const addProjectToCache = async (project_id) => {
  if (cache) {
    try {
      const project = await getDetails(project_id);
      cache.push(project);
      logger.info(`Project ${project_id} successful added to cache `);
    } catch(error) {
      logger.error(`Cannot add to cache reason: ${error}`)
    }
  } else {
    logger.error('cache is not available');
  }
}

const updateProjectOnCache = async (project_id) => {
  if (cache) {
    const index = cache.findIndex(project => project.project_id === project_id);
    const project = await getDetails(project_id);
    if (index !== -1) {
      cache[index] = project;
      logger.info(`Project ${project_id} updated on cache`);
    } else {
      logger.info(`Project ${project_id} not found on cache`);
      cache.push(project);
      logger.info(`Project ${project_id} successful added to cache `);
    }
  } else {
    logger.error('cache is not available');
  }
}

const deleteProjectFromCache = async (project_id) => {
  if (cache) {
    cache = cache.filter(project => project.project_id !== project_id);
    logger.info(`Project ${project_id} deleted from cache`);
  } else {
    logger.error('cache is not available');
  }
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
  updateProjectStatus,
  updateProjectCurrentProjectStatusId,
  getCurrentProjectStatus,
  findProject,
  addProjectToCache,
  updateProjectOnCache
};
