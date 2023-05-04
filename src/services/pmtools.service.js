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
const BusinessAssociateContact = db.businessAssociateContact;
const ProjectStaff = db.projectStaff;
const User = db.user;
const Op = sequelize.Op;
const CodeProjectStaffRole = db.codeProjectStaffRole;

const countProjects = async (type, filter, extraFilters) => {
  let where = {};
  if (extraFilters.favorites) {
    where.project_id = extraFilters.favorites;
  }
  if (extraFilters.search) {
    where={[Op.or]: [
      { project_name: { [Op.like]: `%${extraFilters.search}%` } },
      { onbase_project_number: { [Op.like]: `%${extraFilters.search}%` } },
    ]}
  }
  if (extraFilters.search && extraFilters.favorites){
    where = {
      [Op.and]: [
        { project_id: extraFilters.favorites },
        {
          [Op.or]: [
            { project_name: { [Op.like]: `%${extraFilters.search}%` } },
            { onbase_project_number: { [Op.like]: `%${extraFilters.search}%` } },
          ]
        }
      ]
    }
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
  if (type === 'status' || extraFilters?.filterby === 'status') {
    const filters = [];
    let where = [];
    if (type === 'status' && extraFilters?.filterby === 'status') {
      const array = extraFilters.value;
      if (array.length) {
        const intArray = array.map(str => parseInt(str, 10));
        where = { [Op.and]: [{ code_status_type_id: intArray }, { code_status_type_id: +filter }] };
      } else {
        where = { [Op.and]: [{ code_status_type_id: extraFilters.value }, { code_status_type_id: +filter }] };
      }
    }
    else if (type === 'status') {
      filters.push(+filter);
      where = { code_status_type_id: +filter }
    }
    else if (extraFilters?.filterby === 'status') {
      const array = extraFilters.value;
      if (array.length) {
        const intArray = array.map(str => parseInt(str, 10));
        where = { [Op.and]: [{ code_status_type_id: intArray }] };
      } else {
        where = { [Op.and]: [{ code_status_type_id: extraFilters.value }] };
      }
    }
    includes.push({
      model: ProjectStatus,
      as: 'currentId',
      required: true,
      include: {
        model: CodePhaseType,
        where: where,
      },
    });
  }
  if (type === 'jurisdiction' || extraFilters?.filterby === 'jurisdiction') {
    const filters = [];
    let where = [];
    if (type === 'jurisdiction' && extraFilters?.filterby === 'jurisdiction') {
      const array = extraFilters.value;
      if (array.length){
        const intArray = array.map(str => parseInt(str, 10));
        where = { [Op.and]: [{ code_local_government_id: intArray }, { code_local_government_id: +filter }] };
      }else{
        where = { [Op.and]: [{ code_local_government_id: extraFilters.value }, { code_local_government_id: +filter }] };
      }        
    }
    else if (type === 'jurisdiction') {
      filters.push(+filter);
      where = { code_local_government_id: +filter }
    }
    else if (extraFilters?.filterby === 'jurisdiction') {
      const array = extraFilters.value;
      if (array.length){
        const intArray = array.map(str => parseInt(str, 10));
        where = { [Op.and]: [{ code_local_government_id: intArray }] };
      }else{
        where = { [Op.and]: [{ code_local_government_id: extraFilters.value }] };
      }    
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
        where: where
      },
      attributes: [
        'project_local_government_id'
      ]
    });
  }
  if (type === 'staff' || extraFilters?.filterby === 'staff') {
    const filters = [];
    let where = [];
    if (type === 'staff' && extraFilters?.filterby === 'staff') {
      const array = extraFilters.value;
      if (array.length) {
        const intArray = array.map(str => parseInt(str, 10));
        where = { [Op.and]: [{ user_id: intArray }, { user_id: +filter }] };
      } else {
        where = { [Op.and]: [{ user_id: extraFilters.value }, { user_id: +filter }] };
      }
    }
    else if (type === 'staff') {
      filters.push(+filter);
      where = { user_id: +filter }
    }
    else if (extraFilters?.filterby === 'staff') {
      const array = extraFilters.value;
      if (array.length) {
        const intArray = array.map(str => parseInt(str, 10));
        where = { [Op.and]: [{ user_id: intArray }] };
      } else {
        where = { [Op.and]: [{ user_id: extraFilters.value }] };
      }
    }
    includes.push({
      model: ProjectStaff,
      attributes: [],
      as: 'currentProjectStaff',
      required: true,
      include: [{
        model: BusinessAssociateContact,
        attributes: [],
        required: true,
        include: [{
          model: User,
          attributes: [],
          required: true,
          where: where,
        }]
      }, {
        model: CodeProjectStaffRole,
        required: true,
        where: {
          project_staff_role_type_name: 'MHFD Lead',
        }
      }]
    });
  }
  if (type === 'county' || extraFilters?.filterby === 'county') {
    const filters = [];
    let where = [];
    if (type === 'county' && extraFilters?.filterby === 'county') {
      const array = extraFilters.value;
      if (array.length){
        const intArray = array.map(str => parseInt(str, 10));
        where = { [Op.and]: [{ state_county_id: intArray }, { state_county_id: +filter }] };
      }else{
        where = { [Op.and]: [{ state_county_id: extraFilters.value }, { state_county_id: +filter }] };
      }        
    }
    else if (type === 'county') {
      filters.push(+filter);
      where = { state_county_id: +filter }
    }
    else if (extraFilters?.filterby === 'county') {
      const array = extraFilters.value;
      if (array.length) {
        const intArray = array.map(str => parseInt(str, 10));
        where = { [Op.and]: [{ state_county_id: intArray }] };
      } else {
        where = { [Op.and]: [{ state_county_id: extraFilters.value }] };
      }
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
      },
      where: where,
      attributes: [
        'project_county_id'
      ]
    });
  }
  if (type === 'servicearea' || extraFilters?.filterby === 'servicearea') {
    const filters = [];
      let where = [];
      if (type === 'servicearea' && extraFilters?.filterby === 'servicearea') {
        const array = extraFilters.value;
        if (array.length) {
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ code_service_area_id: intArray }, { code_service_area_id: +filter }] };
        } else {
          where = { [Op.and]: [{ code_service_area_id: extraFilters.value }, { code_service_area_id: +filter }] };
        }
      }
      else if (type === 'servicearea') {
        filters.push(+filter);
        where = { code_service_area_id: +filter }
      }
      else if (extraFilters?.filterby === 'servicearea') {
        const array = extraFilters.value;
        if (array.length) {
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ code_service_area_id: intArray }] };
        } else {
          where = { [Op.and]: [{ code_service_area_id: extraFilters.value }] };
        }
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
        where: where
      },
      attributes: [
        'project_service_area_id'
      ]
    });
  }  
  if (type === 'consultant' || extraFilters?.filterby === 'consultant') {
    const filters = [];
    let where = [];
    if (type === 'consultant' && extraFilters?.filterby === 'consultant') {
      const array = extraFilters.value;
      if (array.length){
        const intArray = array.map(str => parseInt(str, 10));
        where = { [Op.and]: [{ business_associates_id: intArray }, { business_associates_id: +filter }] };
      }else{
        where = { [Op.and]: [{ business_associates_id: extraFilters.value }, { business_associates_id: +filter }] };
      }        
    }
    else if (type === 'consultant') {
      filters.push(+filter);
      where = { business_associates_id: +filter }
    }
    else if (extraFilters?.filterby === 'consultant') {
      const array = extraFilters.value;
      if (array.length) {
        const intArray = array.map(str => parseInt(str, 10));
        where = { [Op.and]: [{ business_associates_id: intArray }] };
      } else {
        where = { [Op.and]: [{ business_associates_id: extraFilters.value }] };
      }
    }
    const CONSULTANT_ID = 3;
    includes.push({
      model: ProjectPartner,
      as: 'currentPartner',
      required: true,
      include: {
        model: BusinessAssociate,
        where: where,
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
    let where = [];
    if (type === 'contractor' && extraFilters?.filterby === 'contractor') {
      const array = extraFilters.value;
      if (array.length) {
        const intArray = array.map(str => parseInt(str, 10));
        where = { [Op.and]: [{ business_associates_id: intArray }, { business_associates_id: +filter }] };
      } else {
        where = { [Op.and]: [{ business_associates_id: extraFilters.value }, { business_associates_id: +filter }] };
      }
    }
    else if (type === 'contractor') {
      filters.push(+filter);
      where = { business_associates_id: +filter }
    }
    else if (extraFilters?.filterby === 'contractor') {
      const array = extraFilters.value;
      if (array.length) {
        const intArray = array.map(str => parseInt(str, 10));
        where = { [Op.and]: [{ business_associates_id: intArray }] };
      } else {
        where = { [Op.and]: [{ business_associates_id: extraFilters.value }] };
      }
    }
    const CIVIL_CONTRACTOR_ID = 8, LANDSCAPE_CONTRACTOR_ID = 9;
    includes.push({
      model: ProjectPartner,
      as: 'currentConsultant',
      required: true,
      include: {
        model: BusinessAssociate,
        where: where,
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
  if (extraFilters?.filterby === 'lgmanager') {
    const filter = extraFilters.value;
    includes.push({
      model: ProjectStaff,
      attributes: [],
      as: 'currentProjectStaff',
      required: true,
      include: [{
        model: BusinessAssociateContact,
        attributes: [],
        required: true,
        include: [{
          model: User,
          attributes: [],
          required: true,
          where : { user_id: filter },
        }]
      },{
        model: CodeProjectStaffRole,
        required: true,
        where: {
          project_staff_role_type_name: 'Local Government Lead',
        }
      }]
    });
  }
  if (extraFilters?.filterby === 'stream') {
    const filter = extraFilters.value;
    includes.push({
      model: ProjectStreams,
      as: 'currentStream',
      required: true,
      subQuery: true,
      include: {
        model: Streams,
        attributes: [],
        where: { stream_id: filter }
      },
      attributes: [
        'project_id',
      ],
    });
  }
  if (extraFilters?.filterby === 'cost') {
    const ESTIMATED_ID = 1;
    const cost = extraFilters.value;
    includes.push({
      model: ProjectCost,
      required: true,
      as: 'currentCost',
      where: {
        code_cost_type_id: ESTIMATED_ID,
        cost: {
          [Op.between]: cost,
        },
        is_active: 1,
      },
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
  let where = {};
  if (extraFilters.favorites) {
    where.project_id = extraFilters.favorites;
  }
  if (extraFilters.search) {
    where = {
      [Op.or]: [
        { project_name: { [Op.like]: `%${extraFilters.search}%` } },
        { onbase_project_number: { [Op.like]: `%${extraFilters.search}%` } },
      ]
    }
  }
  if (extraFilters.search && extraFilters.favorites){
    where = {
      [Op.and]: [
        { project_id: extraFilters.favorites },
        {
          [Op.or]: [
            { project_name: { [Op.like]: `%${extraFilters.search}%` } },
            { onbase_project_number: { [Op.like]: `%${extraFilters.search}%` } },
          ]
        }
      ]
    }
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
        include: [{
          model: BusinessAssociateContact,
          required: false,
          include: [{
            attributes: [
              'name',
              'user_id',
            ],
            model: User,
            required: false,
          }]
        },{
          model: CodeProjectStaffRole,
          required: false,
        }]
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
    if (type === 'status' || extraFilters.sortby === 'status' || extraFilters.sortby === 'phase' || extraFilters?.filterby === 'status') {      
      const filters = [];
      let where = [];
      if (type === 'status' && extraFilters?.filterby === 'status') {
        const array = extraFilters.value;
        if (array.length){
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ code_status_type_id: intArray }, { code_status_type_id: +filter }] };
        }else{
          where = { [Op.and]: [{ code_status_type_id: extraFilters.value }, { code_status_type_id: +filter }] };
        }        
      }
      else if (type === 'status') {
        filters.push(+filter);
        where = { code_status_type_id: +filter }
      }
      else if (extraFilters?.filterby === 'status') {
        const array = extraFilters.value;
        if (array.length){
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ code_status_type_id: intArray }] };
        }else{
          where = { [Op.and]: [{ code_status_type_id: extraFilters.value }] };
        }    
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
      let where = [];
      if (type === 'jurisdiction' && extraFilters?.filterby === 'jurisdiction') {
        const array = extraFilters.value;
        if (array.length){
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ code_local_government_id: intArray }, { code_local_government_id: +filter }] };
        }else{
          where = { [Op.and]: [{ code_local_government_id: extraFilters.value }, { code_local_government_id: +filter }] };
        }        
      }
      else if (type === 'jurisdiction') {
        filters.push(+filter);
        where = { code_local_government_id: +filter }
      }
      else if (extraFilters?.filterby === 'jurisdiction') {
        const array = extraFilters.value;
        if (array.length){
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ code_local_government_id: intArray }] };
        }else{
          where = { [Op.and]: [{ code_local_government_id: extraFilters.value }] };
        }    
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
          where: where
        },
        attributes: [
          'project_local_government_id'
        ]
      });
    }
    if (type === 'staff' || extraFilters?.filterby === 'staff') {
      const filters = [];
      let where = [];
      if (type === 'staff' && extraFilters?.filterby === 'staff') {
        const array = extraFilters.value;
        if (array.length) {
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ user_id: intArray }, { user_id: +filter }] };
        } else {
          where = { [Op.and]: [{ user_id: extraFilters.value }, { user_id: +filter }] };
        }
      }
      else if (type === 'staff') {
        filters.push(+filter);
        where = { user_id: +filter }
      }
      else if (extraFilters?.filterby === 'staff') {
        const array = extraFilters.value;
        if (array.length) {
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ user_id: intArray }] };
        } else {
          where = { [Op.and]: [{ user_id: extraFilters.value }] };
        }
      }
      optionalIncludes.push({
        model: ProjectStaff,
        attributes: [],
        as: 'currentProjectStaff',
        required: true,
        include: [{
          model: BusinessAssociateContact,
          attributes: [],
          required: true,
          include: [{
            model: User,
            attributes: [],
            required: true,
            where: where,
          }]
        }, {
          model: CodeProjectStaffRole,
          required: true,
          where: {
            project_staff_role_type_name: 'MHFD Lead',
          }
        }]
      });
    }
    if (type === 'county' || extraFilters?.filterby === 'county') {
      const filters = [];
      let where = [];
      if (type === 'county' && extraFilters?.filterby === 'county') {
        const array = extraFilters.value;
        if (array.length) {
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ state_county_id: intArray }, { state_county_id: +filter }] };
        } else {
          where = { [Op.and]: [{ state_county_id: extraFilters.value }, { state_county_id: +filter }] };
        }
      }
      else if (type === 'county') {
        filters.push(+filter);
        where = { state_county_id: +filter }
      }
      else if (extraFilters?.filterby === 'county') {
        const array = extraFilters.value;
        if (array.length) {
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ state_county_id: intArray }] };
        } else {
          where = { [Op.and]: [{ state_county_id: extraFilters.value }] };
        }
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
          where: where,
        },
        attributes: [
          'project_county_id'
        ]
      });
    }
    if (type === 'servicearea' || extraFilters?.filterby === 'servicearea') {
      const filters = [];
      let where = [];
      if (type === 'servicearea' && extraFilters?.filterby === 'servicearea') {
        const array = extraFilters.value;
        if (array.length) {
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ code_service_area_id: intArray }, { code_service_area_id: +filter }] };
        } else {
          where = { [Op.and]: [{ code_service_area_id: extraFilters.value }, { code_service_area_id: +filter }] };
        }
      }
      else if (type === 'servicearea') {
        filters.push(+filter);
        where = { code_service_area_id: +filter }
      }
      else if (extraFilters?.filterby === 'servicearea') {
        const array = extraFilters.value;
        if (array.length) {
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ code_service_area_id: intArray }] };
        } else {
          where = { [Op.and]: [{ code_service_area_id: extraFilters.value }] };
        }
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
          where: where
        },
        attributes: [
          'project_service_area_id'
        ]
      });
    }    
    if (type === 'consultant' || extraFilters?.filterby === 'consultant') {
      const filters = [];
      let where = [];
      if (type === 'consultant' && extraFilters?.filterby === 'consultant') {
        const array = extraFilters.value;
        if (array.length){
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ business_associates_id: intArray }, { business_associates_id: +filter }] };
        }else{
          where = { [Op.and]: [{ business_associates_id: extraFilters.value }, { business_associates_id: +filter }] };
        }        
      }
      else if (type === 'consultant') {
        filters.push(+filter);
        where = { business_associates_id: +filter }
      }
      else if (extraFilters?.filterby === 'consultant') {
        const array = extraFilters.value;
        if (array.length) {
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ business_associates_id: intArray }] };
        } else {
          where = { [Op.and]: [{ business_associates_id: extraFilters.value }] };
        }
      }
      const CONSULTANT_ID = 3;
      optionalIncludes.push({
        model: ProjectPartner,
        as: 'currentPartner',
        required: true,
        include: {
          model: BusinessAssociate,
          where: where,
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
      let where = [];
      if (type === 'contractor' && extraFilters?.filterby === 'contractor') {
        const array = extraFilters.value;
        if (array.length) {
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ business_associates_id: intArray }, { business_associates_id: +filter }] };
        } else {
          where = { [Op.and]: [{ business_associates_id: extraFilters.value }, { business_associates_id: +filter }] };
        }
      }
      else if (type === 'contractor') {
        filters.push(+filter);
        where = { business_associates_id: +filter }
      }
      else if (extraFilters?.filterby === 'contractor') {
        const array = extraFilters.value;
        if (array.length) {
          const intArray = array.map(str => parseInt(str, 10));
          where = { [Op.and]: [{ business_associates_id: intArray }] };
        } else {
          where = { [Op.and]: [{ business_associates_id: extraFilters.value }] };
        }
      }
      const CIVIL_CONTRACTOR_ID = 8, LANDSCAPE_CONTRACTOR_ID = 9;
      optionalIncludes.push({
        model: ProjectPartner,
        as: 'currentConsultant',
        required: true,
        include: {
          model: BusinessAssociate,
          where: where,
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
    if (extraFilters?.filterby === 'lgmanager') {
      const filter = extraFilters.value;
      includes.push({
        model: ProjectStaff,
        attributes: [],
        as: 'currentProjectStaff',
        required: true,
        include: [{
          model: BusinessAssociateContact,
          attributes: [],
          required: true,
          include: [{
            model: User,
            attributes: [],
            required: true,
            where : { user_id: filter },
          }]
        },{
          model: CodeProjectStaffRole,
          required: true,
          where: {
            project_staff_role_type_name: 'Local Government Lead',
          }
        }]
      });
    }
    if (extraFilters?.filterby === 'stream') {
      const filter = extraFilters.value;
      includes.push({
        model: ProjectStreams,
        as: 'currentStream',
        required: true,
        include: {
          model: Streams,
          attributes: [],
          where: { stream_id: filter }
        },
        attributes: [
          'project_id',
        ],
      });
    }
    if (extraFilters?.filterby === 'cost') {
      const ESTIMATED_ID = 1;
      const cost = extraFilters.value;
      logger.info(`Filtering by cost ${cost}...`);
      optionalIncludes.push({
        model: ProjectCost,
        required: true,
        as: 'currentCost',
        where: {
          code_cost_type_id: ESTIMATED_ID,
          cost: {
            [Op.between]: cost,
          },
          is_active: 1,
        },
      });
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