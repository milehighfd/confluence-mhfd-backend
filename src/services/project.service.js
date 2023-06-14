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
  getStreamsDataByProjectIds,
  getSortedProjectsByAttrib,
  sortProjectsByAttrib
} from 'bc/utils/functionsProjects.js';
import sequelize from 'sequelize';
import { CREATE_PROJECT_TABLE } from 'bc/config/config.js';

const Project = db.project;
const ProjectAttachment = db.projectAttachment;
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
const ProjectDetail = db.projectDetail;
const ProjectStudy = db.projectstudy;
const Study = db.study;
const CodeStudyType = db.codestudytype;
const RelatedStudy = db.relatedstudy;
const StreamStudy = db.streamstudy;
const CodeStudyReason = db.codeStudyReason;
const CodeProjectStaffRole = db.codeProjectStaffRole;
const User = db.user;
const CodeProjectPartnerType = db.codeProjectPartnerType;
const Op = sequelize.Op;
const BusinessAssociateContact = db.businessAssociateContact;
const BusinessAddress = db.businessAdress;
const CodeRuleActionItem = db.codeRuleActionItem;
const BoardProject = db.boardProject;
const ProjectSpatial = db.projectSpatial;
const BoardProjectCost = db.boardProjectCost;

async function getCentroidsOfAllProjects () {
  const SQL = `SELECT st_asGeojson(ST_PointOnSurface(the_geom)) as centroid, projectid FROM "denver-mile-high-admin".${CREATE_PROJECT_TABLE}`;
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
    return data;
  } catch (e) {
    console.error('Error with QUERY ', e);
    return [];
  }
}

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
      });
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
    });
  
    const SPONSOR_TYPE = 11; // maybe this can change in the future
    const ids = projects.map((p) => p.project_id);
  
    const project_partners = await ProjectPartner.findAll({
      where: {
        project_id: ids,
        code_partner_type_id: SPONSOR_TYPE,
      },
      include: { all: true, nested: true }
    }).map(res => { 
      return {...res, business_associate: res.business_associate }
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
          ],
        ], 
        include: [
          {
            model: ProjectServiceArea,
            separate: true,
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
            separate: true,
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
            separate: true,
            include: [{
              model: Streams,
              required: false,
              attributes: [
                'stream_id',
                'stream_name'
              ],
            },
            {
              model: CodeLocalGoverment,
              required: false,
              attributes: [
                'local_government_name',
                'code_local_government_id'
              ],
            }],
          },
          {
            model: ProjectLocalGovernment,
            required: false,
            separate: true,
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
            separate: true,
            attributes: [
              'code_cost_type_id',
              'cost',
              'cost_description'
            ],
            where: {
              is_active: 1
            }
          },
          {
            model: ProjectStatus,
            required: false,
            separate: true,
            attributes: [
              'code_phase_type_id',
              'planned_start_date',
              'actual_start_date',
              'actual_end_date',
              'planned_end_date',
              'modified_date',
              'project_status_id',
              'is_locked',
              'is_done'
            ],
            include: {
              model: CodePhaseType,
              required: false,
              attributes: [
                'phase_name',
                'phase_ordinal_position'
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
            attributes: [
              'project_partner_id',
              'code_partner_type_id'
            ],
            required: false,
            separate: true,
            include: [{
              model: CodeProjectPartnerType,
              required: false,
              attributes: [
                'code_partner_type_id',
                'partner_type_name',
                'partner_type'
              ]
            }, {
              model: BusinessAssociate,
              required: false,
              attributes: [
                'business_name',
                'business_associates_id'
              ]
            },],
          },
          {
            model: ProjectProposedAction,
            required: false,
            separate: true,
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
            separate: true,
            attributes: [
              'action_name',
              'project_id',
              'cost',
              'action_status'
            ]
          },
          {
            model: ProjectStaff,
            required: false,
            separate: true,
            attributes: [
              'code_project_staff_role_type_id',
              'is_active',
              'project_staff_id',
              'business_associate_contact_id'
            ],
            include: [{
              model: BusinessAssociateContact,
              attributes: [
                'contact_name',
                'business_associate_contact_id'
              ],
              required: true,
              include: [
                {
                model: BusinessAddress,
                required: true,
                attributes: [
                  'business_associate_id',
                  'business_address_id'
                ],
                include: [{
                  model: BusinessAssociate,
                  required: true,
                  attributes: [
                    'business_name'
                  ]
                }]
              }]
            }]
          },
          {
            model: ProjectDetail,
            separate: true,
            required: false,
          },
          {
            model: ProjectStudy,
            separate: true,
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
        ]
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

const getLocalityDetails = async (project_id) => {
  const project = await Project.findByPk(project_id, {
    attributes: [
      "project_id"
    ],
    include: [
      {
        model: ProjectLocalGovernment,
        required: false,
        attributes: [
          'code_local_government_id'
        ],
        include: {
          model: CodeLocalGoverment,
          required: false,
          attributes: [
            'local_government_name'
          ]
        }
      },
      {
        model: ProjectCounty,
        required: false,
        separate: true,
        attributes: [
          'state_county_id'
        ],
        include: {
          model: CodeStateCounty,
          required: false,
          attributes: [
            'county_name',
          ]
        }
      },
      {
        model: ProjectServiceArea,
        required: false,
        attributes: [
          'code_service_area_id'
        ],
        include: {
          model: CodeServiceArea,
          required: false,
          attributes: [
            'service_area_name'
          ],
        }
      },
    ]
  });
  if (!project) {
    return {
      error: 404,
      message: 'Project Not Found'
    };
  }
  return project;
};

const getLightDetails = async (project_id, project_counties, project_local_governments, project_service_areas) => {
  const countyWhere = {};
  if (project_counties && project_counties.length > 0) {
    countyWhere.state_county_id = { [Op.in]: project_counties };
  }
  const localGovernmentWhere = {};
  if (project_local_governments && project_local_governments.length > 0) {
    localGovernmentWhere.code_local_government_id = { [Op.in]: project_local_governments };
  }
  const serviceAreaWhere = {};
  if (project_service_areas && project_service_areas.length > 0) {
    serviceAreaWhere.code_service_area_id = { [Op.in]: project_service_areas };
  }
  const project = await Project.findByPk(project_id, {
    attributes: [
      "project_id",
      "project_name",
      'current_project_status_id',
    ],
    include: [
      {
        model: ProjectLocalGovernment,
        required: false,
        attributes: [
          'code_local_government_id'
        ],
        include: {
          model: CodeLocalGoverment,
          required: true,
          where: localGovernmentWhere,
          attributes: [
            'local_government_name'
          ]
        }
      },
      {
        model: ProjectCounty,
        required: false,
        separate: true,
        attributes: [
          'state_county_id'
        ],
        include: {
          model: CodeStateCounty,
          required: true,
          where: countyWhere,
          attributes: [
            'county_name',
          ]
        }
      },
      {
        model: ProjectServiceArea,
        required: false,
        attributes: [
          'code_service_area_id'
        ],
        include: {
          model: CodeServiceArea,
          required: true,
          where: serviceAreaWhere,
          attributes: [
            'service_area_name'
          ],
        },
      },
      {
        model: CodeProjectType,
        required: false,
        attributes: [
          'code_project_type_id',
          'project_type_name'
        ]
      },
      {
        model: ProjectStatus,
        required: false,
        separate: true,
        as: 'currentId',
        attributes: [
          'code_phase_type_id',
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
              'code_project_type_id'
            ]
          }]
        }
      }
    ]
  });
  if (!project) {
    return {
      error: 404,
      message: 'Project Not Found'
    };
  }
  return project;
}

const getProjects2 = async (include, bounds, offset = 0, limit = 120000, filter, groupname, filtervalue,type_id) => {  
  const CONSULTANT_ID = 3;  
  const CIVIL_CONTRACTOR_ID = 8;
  const ESTIMATED_ID = 1;
  const filterName = filter.name ? isNaN(filter.name) ?  filter.name : filter.name : '';
  const filterBase = filter.name ? filter.name: -1;
  const contractor = filter.contractor ?  filter.contractor  : [];
  const consultant = filter.consultant ?  filter.consultant  : [];
  const code_project_type_id = filter.projecttype ? filter.projecttype : [];
  const service_area = filter.servicearea ? filter.servicearea : [];
  const state_county_id = filter.county ? filter.county : [];
  const lgmanager = filter.lgmanager ? filter.lgmanager : '';
  const favorites = filter.favorites ? filter.favorites : '';
  const teams = filter.teams ? filter.teams : '';
  let stream_id = filter.streamname ? filter.streamname : [];
  if (stream_id.length){
    stream_id = stream_id[0].split(',');    
  }
  const code_local_government_id = filter.jurisdiction ? filter.jurisdiction : [];
  const cost = filter.totalcost && filter.totalcost.length>0 ? { [Op.between]: [+filter.totalcost[0], +filter.totalcost[1]] } : null;
  const status = filter.status ? filter.status : [];
  const conditions = [];
  const mhfd_lead = filter.mhfdmanager && filter.mhfdmanager!=='' ? filter.mhfdmanager : [];  
  const sortby = filter.sortby && filter.sortby !== '' ? filter.sortby : '';
  const sorttype = filter.sorttype && filter.sorttype !== '' ? filter.sorttype : 'asc';
  const groupN = groupname ? groupname : '';
	const filterN = filtervalue ? filtervalue : '';
  const type_idF = type_id ? type_id : [];
  let projectsSorted = [];
  if (sortby) { 
    projectsSorted = await getSortedProjectsByAttrib(sortby, sorttype);
  }
  if (favorites !== '') {
    conditions.push(ProjectFavorite.findAll({
      attributes: ["project_id"],
      include: [{
        model: User,
        require: true,
        where : { user_id: favorites },
      }]
    }));
  }
  if (teams !== '') {
    logger.info(`Filtering by teams ${teams}...`);
    //Teams
    conditions.push(Project.findAll({
      attributes: ["project_id", "code_project_type_id"],
      include: [{
        model: ProjectStaff,
        attributes: [],
        required: true,
        include: [{
            model: BusinessAssociateContact,
            attributes: [],
            required: true,
            where : { business_associate_contact_id: teams },            
        }, {
          model: CodeProjectStaffRole,
          required: true,
        }],
      }]
    }));
  }
  if (lgmanager !== '') {
    logger.info(`Filtering by lgmanager ${lgmanager}...`);
    //LG Manager
    const LG_LEAD = 10;
    conditions.push(Project.findAll({
      attributes: ["project_id", "code_project_type_id"],
      include: [{
        model: ProjectStaff,
        attributes: [],
        required: true,
        include: [{
            model: BusinessAssociateContact,
            attributes: [],
            required: true,
            where : { business_associate_contact_id: lgmanager },            
        }, {
          model: CodeProjectStaffRole,
          required: true,
          where: {
            code_project_staff_role_type_id: LG_LEAD,
          }
        }],
      }]
    }));
   }  
  if (mhfd_lead.length || groupN === 'staff') {
    //MHFD LEAD
    const MHFD_LEAD = 1;
    let where = {};
    if (groupN === 'staff' && mhfd_lead.length) {
      where = { [Op.and]: [{ business_associate_contact_id: filterN }, { business_associate_contact_id: mhfd_lead }] };
    } else if (groupN === 'staff') {
      where = { business_associate_contact_id: filterN };
    } else {
      where = { business_associate_contact_id: mhfd_lead };
    }
    conditions.push(Project.findAll({
      attributes: ["project_id", "code_project_type_id"],
      include: [{
        model: ProjectStaff,
        attributes: [],
        required: true,
        include: [{
            model: BusinessAssociateContact,
            attributes: [],
            required: true,
            where : where,             
        }, {
          model: CodeProjectStaffRole,
          required: true,
          where: {
            code_project_staff_role_type_id: MHFD_LEAD,
          }
        }],
      }]
    }));
  }  
  if (filterName || filterBase) {
    // KEYWORD 
    logger.info(`Filtering by name ${filterName}...`);
    let whereOr = [];
    if (filterName) {
      whereOr.push({
        project_name: { [Op.like]: `${filterName}` }
      });
      whereOr.push({
        project_name: { [Op.like]: `% ${filterName}%` }
      });
      whereOr.push({
        project_name: { [Op.like]: `%${filterName} %` }
      });
    }
    if (filterBase != -1) {
      whereOr.push({
        onbase_project_number: { [Op.like]: filterName}
      });
    }
    if (filterBase != -1) {
      whereOr.push({
        project_id: { [Op.like]: filterName}
      });
    }
    if (whereOr.length) {
      conditions.push(Project.findAll({
        attributes: ["project_id","code_project_type_id"],
        where: {
          [Op.or]: whereOr
        }
      }));
    }
  }
  if (contractor.length || groupN === 'contractor') {
    logger.info(`Filtering by contractor ${contractor}...`);
    let where = {};
    if (groupN === 'contractor' && contractor.length) {
      where = { [Op.and]: [{ code_partner_type_id: CIVIL_CONTRACTOR_ID }, { business_associates_id: filterN }, { business_associates_id: contractor }] };
    } else if (groupN === 'contractor') {
      where = { [Op.and]: [{ code_partner_type_id: CIVIL_CONTRACTOR_ID }, { business_associates_id: filterN }] };
    } else {
      where = { [Op.and]: [{ code_partner_type_id: CIVIL_CONTRACTOR_ID }, { business_associates_id: contractor }] };
    }
    conditions.push(//CONTRACTOR
      Project.findAll({
        attributes: ["project_id", "code_project_type_id"],
        include: [{
          model: ProjectPartner,
          attributes: [],
          include: {
            model: BusinessAssociate,
            attributes: [],
          },
          where: where
        }],
      }));
  }
  if (consultant.length || groupN === 'consultant') {
    logger.info(`Filtering by consultant ${consultant}...`);
    let where = {};
    if (groupN === 'consultant' && consultant.length) {
      where = { [Op.and]: [{ code_partner_type_id: CONSULTANT_ID }, { business_associates_id: filterN }, { business_associates_id: consultant }] };
    } else if (groupN === 'consultant') {
      where = { [Op.and]: [{ code_partner_type_id: CONSULTANT_ID }, { business_associates_id: filterN }] };
    } else {
      where = { [Op.and]: [{ code_partner_type_id: CONSULTANT_ID }, { business_associates_id: consultant }] };
    }
    conditions.push(//CONSULTANT
      Project.findAll({
        attributes: ["project_id", "code_project_type_id"],
        include: [{
          model: ProjectPartner,
          attributes: [],
          include: {
            model: BusinessAssociate,
            attributes: [],
          },
          where: where
        }],
      }));
  }
  if (code_project_type_id.length || type_idF > 0) {
	  logger.info(`Filtering by project_type ${code_project_type_id}...`);
	  let where = {};
	  if (type_idF > 0 && code_project_type_id.length) {
		where = { [Op.and]: [{  code_project_type_id: type_idF }, { code_project_type_id: code_project_type_id }] };
	  } else if (type_idF > 0) {
		where = { code_project_type_id: type_idF };
	  } else {
		where = { code_project_type_id: code_project_type_id };
	  }
	  conditions.push(//PROJECT TYPE
		Project.findAll({
		  attributes: ["project_id","code_project_type_id"],
		  where: where
	  }));
	}
  if (service_area.length || groupN === 'servicearea') {    
	  logger.info(`Filtering by service area ${service_area}...`);
	  let where = {};
	  if (groupN === 'servicearea' && service_area.length) {
		where = { [Op.and]: [{ code_service_area_id: filterN }, { code_service_area_id: service_area }] };
	  } else if (groupN === 'servicearea') {
		where = { code_service_area_id: filterN };
	  } else {
		where = { code_service_area_id: service_area };
	  }
	  conditions.push(//SERVICE AREA
		Project.findAll({
		  attributes: ["project_id","code_project_type_id"],
		  include: [{
			attributes: [],
			model: ProjectServiceArea,
			include: {
			  attributes: [],
			  model: CodeServiceArea,
			},
			where: where
		  }]
	  }));
	}
  if (state_county_id.length || groupN === 'county') {
	  logger.info(`Filtering by county ${groupN}...`);
	  let where = {};
	  if (groupN === 'county' && state_county_id.length) {
		where = { [Op.and]: [{ state_county_id: filterN }, { state_county_id: state_county_id }] };
	  } else if (groupN === 'county') {
		where = { state_county_id: filterN };
	  } else {
		where = { state_county_id: state_county_id };
	  }
	  conditions.push(//COUNTY
		Project.findAll({
		  attributes: ["project_id","code_project_type_id"],
		  include: [{
			attributes: [],
			model: ProjectCounty,
			include: {
			  attributes: [],
			  model: CodeStateCounty,            
			},          
			where: where
		  }]
	  }));
	}
  if (stream_id.length) {
    logger.info(`Filtering by stream ${stream_id}...`);
    conditions.push(//STREAM
      Project.findAll({
        attributes: ["project_id","code_project_type_id"],
        include: [{
          attributes: [],
          model: ProjectStreams,
          include: {
            attributes: [],
            model: Streams,
          },
          where: { stream_id: stream_id }
        }]
    }));
  }
  if (code_local_government_id.length || groupN === 'jurisdiction') {
	  logger.info(`Filtering by name ${groupN}...`);
	  let where = {};
	  if (groupN === 'jurisdiction' && code_local_government_id.length) {
		where = { [Op.and]: [{ code_local_government_id: filterN }, { code_local_government_id: code_local_government_id }] };
	  } else if (groupN === 'jurisdiction') {
		where = { code_local_government_id: filterN };
	  } else {
		where = { code_local_government_id: code_local_government_id };
	  }
	  conditions.push(//JURISDICTION
		Project.findAll({
		  attributes: ["project_id","code_project_type_id"],
		  include: [{
			attributes: [],
			model: ProjectLocalGovernment,
			include: {
			  attributes: [],
			  model: CodeLocalGoverment,
			},
			where: where
		  }]
	  }));
	}
  if (cost) {
    logger.info(`Filtering by cost ${cost}...`);
    conditions.push(//COST
      Project.findAll({
        attributes: ["project_id","code_project_type_id"],
        include: [{
          model: ProjectCost,
          attributes: [],
          where: { code_cost_type_id: ESTIMATED_ID, cost: cost , is_active: 1 }
        }]
    }));
  }
  if (status.length || groupN === 'status') {
	  logger.info(`Filtering by name ${status}...`);
	  let where = {};
	  if (groupN === 'status' && status.length) {
		where = { [Op.and]: [{ code_status_type_id: filterN }, { code_status_type_id: status }] };
	  } else if (groupN === 'status') {
		where = { code_status_type_id: filterN };
	  } else {
		where = { code_status_type_id: status };
	  }
	  conditions.push(//STATUS
		Project.findAll({
		  attributes: ["project_id","code_project_type_id"],
		  include: [{
			model: ProjectStatus,
			attributes: [],
			as: 'currentId',
			required:true ,
			include: {
			  model: CodePhaseType,
			  required:true ,
			  where: where
			},
		  }]
	  }));
	}
  if (conditions.length === 0) {
    conditions.push(Project.findAll({
      attributes: ["project_id","code_project_type_id"],
    }));
  }
  let projects = await Promise.all(conditions);
  projects = projects.map(project => project.map(p => p.toJSON()));
  // console.log(projects);
  // projects = projects?.filter(project => project.length > 0);
  const counterObject = {};
  projects?.forEach(project => {
    project.forEach(p => {
      counterObject[p.project_id] = counterObject[p.project_id] ? counterObject[p.project_id] + 1 : 1;
    });
  });
  const intersection = Object.keys(counterObject).filter(key => counterObject[key] === projects.length)
    .map(key => +key);
  const intersectedProjects = [];
  intersection.forEach(project_id => {
    let found = false;
    projects.forEach(project => {
      if (!found) {
        const foundProject = project.find(p => p.project_id === project_id);
        if (foundProject) {
          intersectedProjects.push(foundProject);
          found = true;
        }
      }
    });
  });

  let intersectedProjectsSorted = [];
  if (sortby) {
    projectsSorted.forEach((project) => {
      let found = false;
      if (!found) {
        
        const foundProject = intersectedProjects.find(p => {
          return p.project_id === project.project_id
        });
        if (foundProject) {
          intersectedProjectsSorted.push(foundProject);
          found = true;
        }
      }
    });
  } else {
    intersectedProjectsSorted = intersectedProjects;
  }
  // console.log('intersectedProjects', intersectedProjectsSorted.map(p => ({id: p.project_id, cost: JSON.stringify(p)})));
  console.log('length', intersectedProjects.length,'sorted', intersectedProjectsSorted.length, 'bf inter', projectsSorted.length);
  return intersectedProjectsSorted;
}

let cache = null;
const getProjects = async (include, bounds, project_ids, page = 1, limit = 20, filters) => {  
  const CONSULTANT = 3;
  const LANDSCAPE_CONTRACTOR_ID = 9;
  const CIVIL_CONTRACTOR_ID = 8;
  const LG_LEAD = 10;
  let where = {};
  const offset = (+page - 1) * +limit;
  const toRange = +offset + +limit;
  let project_ids_array = project_ids.map(project => project.project_id);
  // if (filters?.sortby) {
    project_ids_array = project_ids_array.slice(offset, toRange);
  // }
  where = {project_id: project_ids_array};
  let limitRange = filters?.sortby ? undefined : limit;
  let offsetRange = filters?.sortby ? undefined : offset;
  console.log('Limit', limit, limitRange, offsetRange);
  try {
    if (cache) {
      return JSON.parse(JSON.stringify(cache));
    }
    let projects = await Project.findAll({
      where: where,
      // limit: limitRange,
      // offset: offsetRange,
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
        ],
      ],  
      
      include: [
        {
          model: ProjectAttachment,
          required: false,
          separate: true,
          where: {
            is_cover: 1
          },
          attributes: [
            'attachment_url'
          ]
        },
        {
          model: CodePhaseType,
          required: false,
          include: {
            model: CodeRuleActionItem,
            required: false,
          },
          where : {
            phase_ordinal_position: {
              [Op.not]: -1
            },
            code_phase_type_id: {
              [Op.gt]: 4
            }
          },
        },
        {
          model: ProjectStaff,
          required: false,
          separate: true,
          where: {
            is_active: 1
          },
          attributes: [
            'code_project_staff_role_type_id',
            'is_active',
            'project_staff_id'
          ],
          include: [{
            model: BusinessAssociateContact,
            required: false,           
          },{
            model: CodeProjectStaffRole,
            required: false,
          }]
        },
        {
          model: ProjectServiceArea,
          separate: true,
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
          separate: true,
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
          separate: true,
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
          separate: true,
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
          separate: true,
          required: false,
          attributes: [
            'code_cost_type_id',
            'cost'
          ],
          where: {
            is_active: 1
          }
        },
        {
          model: ProjectStatus,
          separate: true,
          required: false,
          attributes: [
            'code_phase_type_id',
            'planned_start_date',
            'actual_start_date',
            'actual_end_date',
            'planned_end_date',
            'project_status_id',
            'modified_date',
            'is_locked',
            'is_done'
          ],
          include: {
            model: CodePhaseType,
            required: false,
            attributes: [
              'phase_name',
              'phase_ordinal_position'
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
          separate: true,
          required: false,
          attributes: [
            'project_partner_id',
            'code_partner_type_id'
          ],
          include: [{
            model: BusinessAssociate,
            required: false,
            attributes: [
              'business_name',
              'business_associates_id'
            ]
          }, {
            model: CodeProjectPartnerType,
            required: true,
            attributes: [
              'code_partner_type_id',
              'partner_type'
            ],
          }],
          // where: {
          //   code_partner_type_id: [3, 8, 11]
          // }
        }, {
          model: CodeProjectType,
          required: false,
          attributes: [
            'code_project_type_id',
            'project_type_name'
          ]
        },
        {
          model: ProjectStatus,
          separate: true,
          required: false,
          attributes: [
            'code_phase_type_id'
          ],
          as: 'currentId',
          include: {
            model: CodePhaseType,
            required: false,
            attributes: [
              'code_phase_type_id'
            ],
            include: [{
              model: CodeStatusType,
              required: false,
              attributes: [
                'status_name'
              ]
            }]
          }
        },
        {
          model: ProjectPartner,
          as: 'currentConsultant',
          attributes: [
            'project_partner_id',
            'code_partner_type_id'
          ],
          required: false,
          separate: true,
          include: [{
            model: CodeProjectPartnerType,
            required: true,
            attributes: [
              'code_partner_type_id',
            ],
            where: { code_partner_type_id: CONSULTANT }
          }, {
            model: BusinessAssociate,
            required: false,
            attributes: [
              'business_name',
            ]
          },],
        },
        {
          model: ProjectPartner,
          as: 'landscapeContractor',
          attributes: [
            'project_partner_id',
            'code_partner_type_id'
          ],
          required: false,
          separate: true,
          include: [{
            model: CodeProjectPartnerType,
            required: true,
            attributes: [
              'code_partner_type_id',
            ],
            where: { code_partner_type_id: LANDSCAPE_CONTRACTOR_ID }
          }, {
            model: BusinessAssociate,
            required: false,
            attributes: [
              'business_name',
            ]
          },],
        },
        {
          model: ProjectPartner,
          as: 'civilContractor',
          attributes: [
            'project_partner_id',
            'code_partner_type_id'
          ],
          required: false,
          separate: true,
          include: [{
            model: CodeProjectPartnerType,
            required: true,
            attributes: [
              'code_partner_type_id',
            ],
            where: { code_partner_type_id: CIVIL_CONTRACTOR_ID }
          }, {
            model: BusinessAssociate,
            required: false,
            attributes: [
              'business_name',
            ]
          },],
        },
        {
          model: ProjectStatus,
          separate: true,
          required: false,
          attributes: [
            'code_phase_type_id',
            'planned_start_date',
            'actual_start_date',
          ],
          as: 'construction_phase',
          include: {
            model: CodePhaseType,
            required: true,
            attributes: [
              'code_phase_type_id',
              'phase_name',
            ],
            where: {
              phase_name: 'Construction',
            }
          }
        },
        {
          model: ProjectPartner,
          as: 'project_sponsor',
          attributes: [
            'project_partner_id',
            'code_partner_type_id'
          ],
          required: false,
          separate: true,
          include: [{
            model: CodeProjectPartnerType,
            required: true,
            attributes: [
              'code_partner_type_id',
              'partner_type',
            ],
            where: { partner_type: 'SPONSOR' }
          }, {
            model: BusinessAssociate,
            required: false,
            attributes: [
                'business_name',
              ]
            },],
        },
        {
          model: ProjectStaff,
          required: false,
          separate: true,
          as: 'currentProjectStaff',
          where: {
            is_active: 1
          },
          attributes: [
            'code_project_staff_role_type_id',
            'is_active',
            'project_staff_id'
          ],
          include: [{
            model: BusinessAssociateContact,
            required: false,
          },{
            model: CodeProjectStaffRole,
            required: true,
            where: {
              code_project_staff_role_type_id: LG_LEAD,
            },
          }]
        }
      ],
    });
    logger.info(`projects found: ${projects.length}`);
    /*
      projects = projects.map(project => {
        project.centroid = centroids.find(centroid => centroid.projectid === project.project_id);
        return project;
      });
    */
    //cache = projects;
    if (filters?.sortby) {
      projects = await sortProjectsByAttrib(projects, project_ids_array, filters);
    }
    return projects;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

const deleteByProjectId = async (Projectsid) => {
  const t = await db.sequelize.transaction();
  try {
    try {
      const project = await Project.findByPk(Projectsid);
      console.log(project)
      if (project) {
        await project.update({
          current_project_status_id: null
        }, {
          where: {
            project_id: Projectsid
          }, transaction: t 
        });
      }
    } catch (error) {
      logger.info('Error removing project association with ProjectStatus:', error);
      throw error;
    }
    try {
      const board_project_id = await BoardProject.findOne({
        attributes: ['board_project_id'],
        where: { project_id: Projectsid },
        transaction: t
      });
      if(board_project_id){
        await BoardProjectCost.destroy({
          where: { board_project_id: board_project_id.board_project_id },
          transaction: t
        });
      }      
    } catch (error) {
      logger.info('Error removing board project cost:', error);
      throw error;
    }
    const models = [
      ProjectStatus,
      ProjectPartner,
      ProjectStaff,
      ProjectCounty,
      ProjectLocalGovernment,
      ProjectServiceArea,
      ProjectDetail,
      ProjectAttachment,
      ProjectProposedAction,
      ProjectCost,
      BoardProject,
      ProjectSpatial,
    ];
    await Promise.all(models.map(model => {
      return model.destroy({
        where: { project_id: Projectsid },
        transaction: t
      });
    }));
    const deletedProject = await Project.destroy({
      where: { project_id: Projectsid },
      transaction: t
    });
    await t.commit();
    console.log(deletedProject)
    console.log(Projectsid)
    if (deletedProject) {
      logger.info('project destroyed ');
      return true;
    } else {
      logger.info('project not found');
      return false;
    }
  }
  catch (error) {
    await t.rollback();
    throw error;
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


const createGeomDataForARCGIS = (coordinates, token, projectid) => {  
  const newGEOM = [{"geometry":{"paths":[ ] ,"spatialReference" : {"wkid" : 4326}},"attributes":{"update_flag":0, "project_id": projectid}}];
  newGEOM[0].geometry.paths = coordinates;
  const formData = {
    'f': 'pjson',
    'token': token,
    'adds': JSON.stringify(newGEOM)
  };
  console.log('DATA TO SEND', JSON.stringify(newGEOM));
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
    const bodyFD = createGeomDataForARCGIS(JSON.parse(geom).coordinates, TOKEN, projectid);
    const createOnArcGis = await needle('post',`${ARCGIS_SERVICE}/applyEdits`, bodyFD, { multipart: true });
    console.log('create on arc gis at ', ARCGIS_SERVICE, createOnArcGis.statusCode, JSON.stringify(createOnArcGis.body));
    if (createOnArcGis.statusCode == 200) {
      if (createOnArcGis.body.error) {
        console.log('Error at ARGIS creation', createOnArcGis.body.error);
        return { successArcGis: false, error: createOnArcGis.body.error };  
      }
      return { successArcGis: createOnArcGis.body.addResults[0].success };
    } else {
      console.log('Error at ARGIS creation', createOnArcGis.body);
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
      logger.info(`UPDATING CURRENT PROJECT ID ${project_id} WITH CURRENT PROJECT STATUS ${current_project_status_id}`)
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
    },
  });
  logger.info(JSON.stringify(projectStatuses));
  if (cache) {
    const index = cache.findIndex(project => project.project_id === project_id);
    logger.info(`Index is ${index}`)
    if (index !== -1) {
      logger.info(`UPDATE PROJECT ID ${project_id} WITH ${JSON.stringify(projectStatuses)}`);
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
    const index = cache.findIndex(project => project.project_id == project_id);
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
  deleteProjectFromCache,
  deleteByProjectId,
  saveProject,
  getProjects,
  getProjects2,
  getProjectsDeprecated,
  getProjectsIdsByBounds,
  getDetails,
  getLightDetails,
  insertIntoArcGis,
  getAuthenticationFormData,
  createRandomGeomOnARCGIS: createGeomDataForARCGIS,
  updateProject,
  updateProjectStatus,
  updateProjectCurrentProjectStatusId,
  getCurrentProjectStatus,
  findProject,
  addProjectToCache,
  updateProjectOnCache,
  getLocalityDetails
};
//ALTER TABLE apr29.dbo.project_staff ADD CONSTRAINT project_staff_FK FOREIGN KEY (business_associate_contact_id) REFERENCES apr29.dbo.business_associate_contact(business_associate_contact_id) ON DELETE CASCADE ON UPDATE CASCADE;
