import https from 'https';
import needle from 'needle';

import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

import sequelize from 'sequelize';

const Project = db.project;
const ProjectPartner = db.projectPartner;
const ProjectServiceArea = db.projectServiceArea;
const CodeServiceArea = db.codeServiceArea;
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
const CodeProjectType = db.codeProjectType;
const BusinessAssociate = db.businessAssociates;
const ProjectStaff = db.projectStaff;
const MHFDStaff = db.mhfdStaff;
const User = db.user;
const Op = sequelize.Op;

const countProjects = async (type, filter, extraFilters) => {
  const where = {};
  if (extraFilters.favorites) {
    where.project_id = extraFilters.favorites;
  }
  if (extraFilters.search) {
    where.project_name = {
      [Op.like]: `%${extraFilters.search}%`
    };
  }
  const includes = [{
    model: CodeProjectType,
    required: true,
    attributes: [
      'code_project_type_id',
      'project_type_name'
    ],
    where: extraFilters.code_project_type_id ? 
    {
      code_project_type_id: extraFilters.code_project_type_id
    }: {}
  }];
  if (type === 'status') {
    includes.push({
      model: ProjectStatus,
      as: 'currentId',
      required: true,
      include: {
        model: CodePhaseType,
        where: { code_status_type_id: +filter },
      },
    });
  }
  if (type === 'jurisdiction' || extraFilters?.filterby === 'jurisdiction') {
    const filters = [];
    if (type === 'jurisdiction') {
      filters.push(+filter);
    }
    if (extraFilters?.filterby === 'jurisdiction') {
      filters.push(extraFilters.value);
    }
    includes.push({
      model: ProjectLocalGovernment,
      as: 'currentLocalGovernment',
      required: true,
      include: {
        model: CodeLocalGoverment,
        attributes: [
          'local_government_name',
          'code_local_government_id'
        ],
        where: { code_local_government_id: filters }
      },
      attributes: [
        'project_local_government_id'
      ]
    });
  }
  if (type === 'staff' || extraFilters?.filterby === 'staff') {
    const filters = [];
    if (type === 'staff') {
      filters.push(+filter);
    }
    if (extraFilters?.filterby === 'staff') {
      filters.push(extraFilters.value);
    }
    includes.push({
      model: ProjectStaff,
      as: 'currentProjectStaff',
      required: true,
      include: {
        model: MHFDStaff,
        required: true,
        attributes: [
          'mhfd_staff_id',
          'full_name'
        ],
        
      },
      where: { mhfd_staff_id: filters },        
    });
  }
  if (type === 'county' || extraFilters?.filterby === 'county') {
    const filters = [];
    if (type === 'county') {
      filters.push(+filter);
    }
    if (extraFilters?.filterby === 'county') {
      filters.push(extraFilters.value);
    }
    includes.push({
      model: ProjectCounty,
      as: 'currentCounty',
      required: true,
      include: {
        model: CodeStateCounty,
        attributes: [
          'county_name',
          'state_county_id'
        ],
        where: { state_county_id: filters }
      },
      attributes: [
        'project_county_id'
      ]
    });
  }
  if (type === 'servicearea' || extraFilters?.filterby === 'servicearea') {
    const filters = [];
    if (type === 'servicearea') {
      filters.push(+filter);
    }
    if (extraFilters?.filterby === 'servicearea') {
      filters.push(extraFilters.value);
    }
    includes.push({
      model: ProjectServiceArea,
      as: 'currentServiceArea',
      required: true,
      include: {
        model: CodeServiceArea,
        attributes: [
          'service_area_name',
          'code_service_area_id'
        ],
        where: { code_service_area_id: filters }
      },
      attributes: [
        'project_service_area_id'
      ]
    });
  }
  if (type === 'consultant' || extraFilters?.filterby === 'consultant') {
    const filters = [];
    if (type === 'consultant') {
      filters.push(+filter);
    }
    if (extraFilters?.filterby === 'consultant') {
      filters.push(extraFilters.value);
    }
    const CONSULTANT_ID = 3;
    includes.push({
      model: ProjectPartner,
      as: 'currentPartner',
      required: true,
      include: {
        model: BusinessAssociate,
        where: { business_associates_id: filters },
        attributes: [
          'business_name',
          'business_associates_id'
        ],
      },
      attributes: [
        'project_partner_id'
      ],
      where: {
        code_partner_type_id: CONSULTANT_ID
      }
    });
  }
  if (type === 'contractor' || extraFilters?.filterby === 'contractor') {
    const filters = [];
    if (type === 'contractor') {
      filters.push(+filter);
    }
    if (extraFilters?.filterby === 'contractor') {
      filters.push(extraFilters.value);
    }
    const CIVIL_CONTRACTOR_ID = 8, LANDSCAPE_CONTRACTOR_ID = 9;
    includes.push({
      model: ProjectPartner,
      as: 'currentConsultant',
      required: true,
      include: {
        model: BusinessAssociate,
        where: { business_associates_id: filters },
        attributes: [
          'business_name',
          'business_associates_id'
        ],
      },
      attributes: [
        'project_partner_id'
      ],
      where: {
        code_partner_type_id: [CIVIL_CONTRACTOR_ID, LANDSCAPE_CONTRACTOR_ID]
      }
    });
  }
  if (type === 'streams') {
    includes.push({
      model: ProjectStreams,
      as: 'currentStream',
      required: true,
      include: {
        model: Streams,
        attributes: [
          'stream_name',
        ],
        where: { stream_name: filter }
      },
      attributes: [
        'project_stream_id',
      ],
    });
  }
  logger.info(`where: ${JSON.stringify(where)}`);
  logger.info(`includes: ${JSON.stringify(includes)}`);
  const count = await Project.count({  
    where,
    include: includes,
  });
  return count;
};

const getProjects = async (type, filter, extraFilters, page = 1, limit = 20) => {
  logger.info(`page: ${page}, limit: ${limit} filter: ${filter}`);
  let hasOrder = false;
  const offset = (page - 1) * limit;
  const where = {};
  if (extraFilters.favorites) {
    where.project_id = extraFilters.favorites;
  }
  if (extraFilters.search) {
    where.project_name = {
      [Op.like]: `%${extraFilters.search}%`
    };
  }
  const order = [];
  console.log(db.project);  
  if (extraFilters.sortby) {
    hasOrder = true;
    if (extraFilters.sortby === 'onbase_project_number') {
      order.push(['onbase_project_number', extraFilters.sortorder]);
    }
    if (extraFilters.sortby === 'project_type') {   
      order.push([
        'code_project_type',
        'project_type_name',
        extraFilters.sortorder
      ]);
    }
  }
  
  logger.info(`order: ${JSON.stringify(order)}`);
  try {
    let includes = [
      {
        model: ProjectCost,
        required: false,
        separate: true,
        attributes: [
          'code_cost_type_id',
          'cost'
        ],
        where: {
          is_active: 1
        }
      },
    ];
    let optionalIncludes = [ 
      {
        model: ProjectStaff,
        required: false,
        separate: true,
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
        separate: true,
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
          ],
        },        
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
          'is_locked',
          'modified_date',
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
        model: CodeProjectType,
        required: true,
        attributes: [
          'code_project_type_id',
          'project_type_name'
        ],
        where: extraFilters.code_project_type_id ? 
        {
          code_project_type_id: extraFilters.code_project_type_id
        }: {},
      }
    ];    
    if (type === 'status' || extraFilters.sortby === 'status' || extraFilters.sortby === 'phase') {
      let where = {code_status_type_id: +filter}
      if ((extraFilters.sortby === 'status' || extraFilters.sortby === 'phase') && type !== 'status' ) {
        where = {}
      }
      // optionalIncludes.push({
      //   model: ProjectStatus,
      //   as: 'currentId',
      //   required: true,
      //   duplicating: false,
      //   include: {
      //     duplicating: false,
      //     model: CodePhaseType,
      //     required:true ,
      //     where: { code_status_type_id: +filter }
      //   },
      // });
      optionalIncludes.push({
        model: ProjectStatus,
        as: 'currentId',
        required: true,
        include: {
          model: CodePhaseType,
          include: {
            model: CodeStatusType,
          },
          where: where,
        },
      });
      if (extraFilters.sortby === 'status') {
        order.push([
          'currentId', CodePhaseType, CodeStatusType, 'status_name', extraFilters.sortorder
        ]);
      }
      if (extraFilters.sortby === 'phase') {
        order.push([
          'currentId', CodePhaseType, 'phase_name', extraFilters.sortorder
        ]);
      }
    }
    if (type === 'jurisdiction' || extraFilters?.filterby === 'jurisdiction') {
      const filters = [];
      if (type === 'jurisdiction') {
        filters.push(+filter);
      }
      if (extraFilters?.filterby === 'jurisdiction') {
        filters.push(extraFilters.value);
      }
      optionalIncludes.push({
        model: ProjectLocalGovernment,
        as: 'currentLocalGovernment',
        required: true,
        include: {
          model: CodeLocalGoverment,
          attributes: [
            'local_government_name',
            'code_local_government_id'
          ],
          where: { code_local_government_id: filters }
        },
        attributes: [
          'project_local_government_id'
        ]
      });
    }
    if (type === 'staff' || extraFilters?.filterby === 'staff') {
      const filters = [];
      if (type === 'staff') {
        filters.push(+filter);
      }
      if (extraFilters?.filterby === 'staff') {
        filters.push(extraFilters.value);
      }
      optionalIncludes.push({
        model: ProjectStaff,
        as: 'currentProjectStaff',
        required: true,
        include: {
          model: MHFDStaff,
          required: true,
          attributes: [
            'mhfd_staff_id',
            'full_name'
          ],
          
        },
        where: { mhfd_staff_id: filters },        
      });
    }
    if (type === 'county' || extraFilters?.filterby === 'county') {
      const filters = [];
      if (type === 'county') {
        filters.push(+filter);
      }
      if (extraFilters?.filterby === 'county') {
        filters.push(extraFilters.value);
      }
      optionalIncludes.push({
        model: ProjectCounty,
        as: 'currentCounty',
        required: true,
        include: {
          model: CodeStateCounty,
          attributes: [
            'county_name',
            'state_county_id'
          ],
          where: { state_county_id: filters }
        },
        attributes: [
          'project_county_id'
        ]
      });
    }
    if (type === 'servicearea' || extraFilters?.filterby === 'servicearea') {
      const filters = [];
      if (type === 'servicearea') {
        filters.push(+filter);
      }
      if (extraFilters?.filterby === 'servicearea') {
        filters.push(extraFilters.value);
      }
      optionalIncludes.push({
        model: ProjectServiceArea,
        as: 'currentServiceArea',
        required: true,
        include: {
          model: CodeServiceArea,
          attributes: [
            'service_area_name',
            'code_service_area_id'
          ],
          where: { code_service_area_id: filters }
        },
        attributes: [
          'project_service_area_id'
        ]
      });
    }
    if (type === 'consultant' || extraFilters?.filterby === 'consultant') {
      const filters = [];
      if (type === 'consultant') {
        filters.push(+filter);
      }
      if (extraFilters?.filterby === 'consultant') {
        filters.push(extraFilters.value);
      }
      const CONSULTANT_ID = 3;
      optionalIncludes.push({
        model: ProjectPartner,
        as: 'currentPartner',
        required: true,
        include: {
          model: BusinessAssociate,
          where: { business_associates_id: filters },
          attributes: [
            'business_name',
            'business_associates_id'
          ],
        },
        attributes: [
          'project_partner_id'
        ],
        where: {
          code_partner_type_id: CONSULTANT_ID
        }
      });
    }
    if (type === 'contractor' || extraFilters?.filterby === 'contractor') {
      const filters = [];
      if (type === 'contractor') {
        filters.push(+filter);
      }
      if (extraFilters?.filterby === 'contractor') {
        filters.push(extraFilters.value);
      }
      const CIVIL_CONTRACTOR_ID = 8, LANDSCAPE_CONTRACTOR_ID = 9;
      optionalIncludes.push({
        model: ProjectPartner,
        as: 'currentConsultant',
        required: true,
        include: {
          model: BusinessAssociate,
          where: { business_associates_id: filters },
          attributes: [
            'business_name',
            'business_associates_id'
          ],
        },
        attributes: [
          'project_partner_id'
        ],
        where: {
          code_partner_type_id: [CIVIL_CONTRACTOR_ID, LANDSCAPE_CONTRACTOR_ID]
        }
      });
    }
    if (extraFilters?.sortby === 'stream') {
      optionalIncludes.push({
        model: ProjectStreams,
        as: 'currentStream',
        required: false,
        include: {
          model: Streams,
          required: false,
          attributes: [
            'stream_name',
          ]
        },
        attributes: [
          'project_stream_id',
        ],
      });
      if (extraFilters.sortby === 'stream') {
        order.push([
          'currentStream', Streams, 'stream_name', extraFilters.sortorder
        ]);
      }
    }
    if (extraFilters?.sortby === 'county') {
      optionalIncludes.push({
        model: ProjectCounty,
        as: 'sortCounty',
        required: true,
        include: {
          model: CodeStateCounty,
          attributes: [
            'county_name',
          ]
        },
      });
      order.push([
        'sortCounty', CodeStateCounty, 'county_name', extraFilters.sortorder
      ]);
    }
    if (extraFilters?.sortby === 'servicearea') {
      optionalIncludes.push({
        model: ProjectServiceArea,
        as: 'sortServiceArea',
        required: true,
        include: {
          model: CodeServiceArea,
          attributes: [
            'service_area_name',
          ]
        },
      });
      order.push([
        'sortServiceArea', CodeServiceArea, 'service_area_name', extraFilters.sortorder
      ]);
    }
    if (extraFilters?.sortby === 'staff') {
      optionalIncludes.push({
        model: ProjectStaff,
        as: 'sortProjectStaff',
        required: true,
        include: {
          model: MHFDStaff,
          attributes: [
            'full_name',
          ]
        },
      });
      order.push([
        'sortProjectStaff', MHFDStaff, 'full_name', extraFilters.sortorder
      ]);
    }
    if (extraFilters?.sortby === 'sponsor') {
      const SPONSOR = 11;
      optionalIncludes.push({
        model: ProjectPartner,
        as: 'sortPartner',
        required: true,
        include: {
          model: BusinessAssociate,
          attributes: [
            'business_name',
          ]
        },
        where: {
          code_partner_type_id: SPONSOR
        }
      });
      order.push([
        'sortPartner', BusinessAssociate, 'business_name', extraFilters.sortorder
      ]);
    }
    includes = includes.concat(optionalIncludes);
    console.log('VALUES TO SEARCH LIMIT', limit, 'OFFSET', offset);
    const projects = await Project.findAll({
      where,
      limit,
      offset,
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
      subQuery: false,
      order: !hasOrder ? [['created_date', 'DESC']] : order
    });
    return projects;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}


export default {
  getProjects,
  countProjects
};