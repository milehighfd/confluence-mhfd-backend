import https from 'https';
import needle from 'needle';

import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

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

const getProjects = async (type, filter, page = 1, limit = 20) => {
  logger.info(`page: ${page}, limit: ${limit} filter: ${filter}`);
  const offset = (page - 1) * limit;
  const where = {};
  try {
    let includes = [
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
    ];
    let optionalIncludes = [ 
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
    ];
    if (type === 'status') {
      optionalIncludes.push({
        model: ProjectStatus,
        as: 'currentId',
        required:true ,
        include: {
          model: CodePhaseType,
          required:true ,
          where: { code_status_type_id: 5 }
        },
      });
      // where.current_project_status_id = +filter;
      
      /*
      const newStatus = {
        model: ProjectStatus,
        required: true,
        type: 'status',
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
        where: {
          project_status_id: +filter
        },
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
      };
      optionalIncludes = optionalIncludes.map(data => {
        if (data.type === 'status') {
          return newStatus;
        }
        return data;
      });
      */
    }
    includes = includes.concat(optionalIncludes);
    console.log(includes);
    const projects = await Project.findAll({
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
      ],
      include: includes,
      order: [['created_date', 'DESC']]
    }).map(project => project.dataValues);
    return projects;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}


export default {
  getProjects
};