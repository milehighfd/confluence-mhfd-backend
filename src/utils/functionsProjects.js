import db from 'bc/config/db.js';
import needle from 'needle';
import {
  CARTO_URL,
  MAIN_PROJECT_TABLE
} from 'bc/config/config.js';
import projectService from 'bc/services/project.service.js';
const Project = db.project;
const ProjectPartner = db.projectPartner;
const ProjectCounty = db.projectCounty;
const CodeStateCounty = db.codeStateCounty;
const ProjectServiceArea = db.projectServiceArea;
const CodeServiceArea = db.codeServiceArea;
const ProjectLocalGovernment = db.projectLocalGovernment;
const CodeLocalGoverment = db.codeLocalGoverment;
const ProjectCost = db.projectCost;
const ProjectStaff = db.projectStaff;
const BusinessAssociante = db.businessAssociates;
const ProjectStreams = db.project_stream;
const Streams = db.stream;
const ProjectStatus = db.projectStatus;
const CodePhaseType = db.codePhaseType;
const CodeStatusType = db.codeStatusType;
const CodeProjectType = db.codeProjectType;
const BusinessAssociateContact = db.businessAssociateContact;
const User = db.user;
const CodeProjectStaffRole = db.codeProjectStaffRole;
const CodeProjectPartnerType = db.codeProjectPartnerType;
const BusinessAssociate = db.businessAssociates;


export const getServiceAreaByProjectIds = async (ids) => {
  try {
    let projectServiceArea = await ProjectServiceArea.findAll({
      include: {
        model: CodeServiceArea,
        attributes: ['service_area_name']
      },
      where: {
        project_id: ids
      }
    });
    projectServiceArea = projectServiceArea.map((data) => ({
      ...data,
      CODE_SERVICE_AREA: data.CODE_SERVICE_AREA.dataValues.service_area_name
    }));
    return projectServiceArea;
  } catch (error) {
    throw error;
  }
}

export const getCountiesByProjectIds = async (ids) => {
  try {
    let projectCounty = await ProjectCounty.findAll({
      where: {
        project_id: ids
      }
    });
    const codeCounties = projectCounty.map((psa) => psa.state_county_id);
    let codeStateCounties = await CodeStateCounty.findAll({
      where: {
        state_county_id: codeCounties
      },
      attributes: {exclude: ['Shape']}
    });
    projectCounty = projectCounty.map((data) => {
      const codeStateCounty = codeStateCounties.filter((d) => d.state_county_id === data.state_county_id)[0];
      return {
        ...data,
        codeStateCounty: codeStateCounty
      }
    });
    return projectCounty;
  } catch (error) {
    throw error;
  }
}

export const getConsultantsByProjectids = async (ids) => {
  try {
    const CONSULTANT_ID = 3;
    let consultants = await ProjectPartner.findAll({
      where: {
        project_id: ids,
        code_partner_type_id: CONSULTANT_ID
      }
    }).map(result => result.dataValues);
    const consultantIds = consultants.map((data) => data.business_associates_id).filter((data) => data !== null);
    let consultantList = await BusinessAssociante.findAll({
      where: {
        business_associates_id: consultantIds
      }
    });
    consultants = consultants.map((staff) => {
      const consultant = consultantList.filter((cons) => {
        return cons.business_associates_id === staff.business_associates_id
      });
      return {
        ...staff,
        consultant
      }
    });
    return consultants;
  } catch (error) {
    throw error;
  }
}

export const getCivilContractorsByProjectids = async (ids) => {
  try {
    const CIVIL_CONTRACTOR_ID = 8;
    let civilContractors = await ProjectPartner.findAll({
      where: {
        project_id: ids,
        code_partner_type_id: CIVIL_CONTRACTOR_ID
      }
    }).map(result => result.dataValues);
    const civilContractorsIds = civilContractors.map((data) => data.business_associates_id).filter((data) => data !== null);
    let contractorLIst = await BusinessAssociante.findAll({
      where: {
        business_associates_id: civilContractorsIds
      }
    });
    civilContractors = civilContractors.map((staff) => {
      const business = contractorLIst.filter((cons) => {
        return cons.business_associates_id === staff.business_associates_id
      });
      return {
        ...staff,
        business
      }
    });
    return civilContractors;
  } catch (error) {
    throw error;
  }
}

export const getLocalGovernmentByProjectids = async (ids) => {
  try {
    let projectLocalGovernment = await ProjectLocalGovernment.findAll({
      where: {
        project_id: ids
      }
    });
    const codeLovalGovermentIds = projectLocalGovernment.map((psa) => psa.code_local_government_id);
    let codeLocalGoverments = await CodeLocalGoverment.findAll({
      where: {
        code_local_government_id: codeLovalGovermentIds
      },
      attributes: {exclude: ['Shape']}
    });
    projectLocalGovernment = projectLocalGovernment.map((data) => {
      const codeLocalGoverment = codeLocalGoverments.filter((d) => d.code_local_government_id === data.code_local_government_id)[0];
      return {
        ...data,
        codeLocalGoverment: codeLocalGoverment
      }
    });
    return projectLocalGovernment;
  } catch (error) {
    throw error;
  }
}

export const getEstimatedCostsByProjectids = async (ids) => {
  try {
    const projectCost = await ProjectCost.findAll({
      where: {
        project_id: ids,
        is_active: 1
      }
    }).map(result => result.dataValues);
    const ESTIMATED_COST = 1;
    const estimatedCosts = projectCost.filter(result => result.code_cost_type_id === ESTIMATED_COST);
    return estimatedCosts;
  } catch (error) {
    throw error;
  }
}

export const getStreamsDataByProjectIds = async (ids) => {
  try {
    let projectStreams = await ProjectStreams.findAll({
      where: {
        project_id: ids
      }
    });
    const projectStreamsIds = projectStreams.map((data) => data.stream_id).filter((data) => data !== null);
    const streamsList = await Streams.findAll({
      where: {
        stream_id: projectStreamsIds
      },
      attributes: {exclude: ['Shape']}
    });
    projectStreams = projectStreams.map((data) => {
      const streamvalue = streamsList.filter((d => d.stream_id === data.stream_id));
      return {
        ...data, 
        stream: streamvalue
      };
    });
    return projectStreams;
  } catch (errror) {
    throw error;
  }
}

export const projectsByFilters = async (projects, filters) => {
  let newprojects = [...projects];
  // KEYWORD
  if ((filters.name?.length || 0) > 0) {
    let filterName =filters.name.toLowerCase()
    newprojects = newprojects.filter((proj) => proj?.project_name.toLowerCase().includes(filterName));
  }
  // STATUS
  if ((filters.status?.length || 0) > 0) {    
    newprojects = newprojects.filter((proj) => filters.status.includes(projectService.getCurrentProjectStatus(proj)?.code_phase_type?.code_status_type?.code_status_type_id));
    // newprojects = newprojects.filter((proj) =>proj?.project_statuses.some((p) => filters.status.includes(p?.code_phase_type?.code_status_type?.code_status_type_id)) );
  }
//   // PROJECT TYPE
  if ((filters.projecttype?.length || 0) > 0) {
    // newprojects = newprojects.filter((proj) => filters.projecttype.includes(proj?.project_status?.code_phase_type?.code_project_type?.code_project_type_id));
    newprojects = newprojects.filter((proj) => filters.projecttype.includes(proj?.code_project_type.code_project_type_id));
  }
//   // SERVICE AREA
  if ((filters.servicearea?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => proj?.project_service_areas.some((p) => filters.servicearea.includes(p?.CODE_SERVICE_AREA?.code_service_area_id)) );
  }
//   //COUNTY
  if((filters.county?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => proj?.project_counties.some((p) => filters.county.includes(p?.CODE_STATE_COUNTY?.state_county_id)) );
  }

//   //STREAMS 
  if ((filters.streamname?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => proj?.project_streams.some(p => filters.streamname.includes(p?.stream_id)));
  }
  
//   // jurisdiction
  if ((filters.jurisdiction?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => proj?.project_local_governments.some( p => filters.jurisdiction.includes(p?.CODE_LOCAL_GOVERNMENT?.code_local_government_id)));
  }

// //CONSULTANT
  if((filters.consultant?.length || 0) > 0) { 
    const CONSULTANT_CODE = 3;
    newprojects = newprojects.filter((proj) => proj?.project_partners.some( p => p?.code_partner_type_id == CONSULTANT_CODE && filters.consultant.includes(+p?.business_associate?.business_associates_id)))
  };
// //CONTRACTOR
  if((filters.contractor?.length || 0) > 0) { 
    const CIVIL_CONTRACTOR_ID = 8;
    newprojects = newprojects.filter((proj) => proj?.project_partners.some( p => p?.code_partner_type_id == CIVIL_CONTRACTOR_ID && filters.contractor.includes(+p?.business_associate?.business_associates_id)))
  };

//  ESTIMATED COST 
  if ((filters.totalcost?.length || 0) > 0) {
    const ESTIMATED_ID = 1;
    newprojects = newprojects.filter((proj) => proj?.project_costs?.some( p => p?.code_cost_type_id == ESTIMATED_ID && p?.cost >= filters.totalcost[0] && p?.cost <= filters.totalcost[1]));
  }
  return newprojects;
}

export const projectsByFiltersForIds = async (projects, filters) => {
  let newprojects = [...projects];
  newprojects = await projectsByFilters(newprojects, filters);
  // newprojects = newprojects?.map((element) => 
  //     element.project_id
  // );
  return newprojects;
}

export const sortProjects = async (projects, filters) => {
  const { sortby, sorttype } = filters;
  switch(sortby) {
    case 'estimatedcost':
      const ESTIMATED_ID = 1;
      projects.sort((a,b) => {
        let valuea = a.project_costs.filter( pc => pc.code_cost_type_id === ESTIMATED_ID)[0]?.cost;
        let valueb = b.project_costs.filter( pc => pc.code_cost_type_id === ESTIMATED_ID)[0]?.cost;
        valuea = valuea ? valuea : 0;
        valueb = valueb ? valueb : 0;
        if (sorttype === 'asc') {
          return valuea - valueb;
        } else {
          return valueb - valuea;
        }
      });
      break;
    case 'projecttype': 
      projects.sort((a,b) => {
        if (sorttype === 'asc') {
          return a?.project_status?.code_phase_type?.code_project_type?.project_type_name?.localeCompare(b?.project_status?.code_phase_type?.code_project_type?.project_type_name )
        } else {
          return b?.project_status?.code_phase_type?.code_project_type?.project_type_name?.localeCompare(a?.project_status?.code_phase_type?.code_project_type?.project_type_name )
        }
      });
      break;
    case 'projectname':
      projects.sort((a,b) => {
        if (sorttype === 'asc') {
          return a?.project_name?.localeCompare(b?.project_name);
        } else {
          return b?.project_name?.localeCompare(a?.project_name);
        }
      });
      break;
    default: 
      break;
  }
  return projects;
}

export const getIdsInBbox = async (bounds) => {
  const coords = bounds.split(',');
  let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
  filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
  try {
    const BBOX_SQL = `
      SELECT projectid from ${MAIN_PROJECT_TABLE}
      WHERE ${filters}
    `;
    const query = { q: BBOX_SQL };
    const data = await needle('post', CARTO_URL, query, {json: true});
    if (data.statusCode === 200) {
      return data.body.rows.map((d) => ({ project_id: d.projectid }));
    } else { 
      console.error('Error at bbox', data.body);
      return [];
    }
  } catch (error) {
    console.log('This error ', error);
    return [];
  }
}
export const safeGet = (obj, props, defaultValue) => {
  try {
    const dataReturn = props.split('.').reduce(function(obj, p) {
      return obj[p];
    }, obj);
    return dataReturn;
  } catch(e) {

    // console.log('error on safe get', e, obj);
    return defaultValue
  }
}

const sortArrayOfProjects = (valuetype, sortattrib, sorttype, projectsToSort) => {
  return projectsToSort.sort((x,y) => {
    const valueX = safeGet(x, sortattrib, valuetype === 'string' ? 'π': Infinity);
    const valueY = safeGet(y, sortattrib, valuetype === 'string' ? 'π': Infinity);
    const nameX = valuetype === 'string' && valueX !== Infinity ? valueX.toUpperCase(): valueX;
    const nameY = valuetype === 'string' && valueY !== Infinity ? valueY.toUpperCase(): valueY;
    // console.log('SORTED VALUES are', nameX, nameY);
    if (nameX > nameY) {
      // console.log('ValueX bigger', valueX, valueY);
      return -1 * (sorttype === 'asc' ? -1 : 1);
    }
    if (nameX < nameY) {
      // console.log('ValueY bigger', valueX, valueY);
      return 1 * (sorttype === 'asc' ? -1 : 1);
    }
    // console.log('EQUALAS??', valueX, valueY);
    return 0;
  });
}
export const getSortedProjectsByAttrib = async (sortby, sorttype) => {
  let includesValues = [];
  let attributes = ["project_id"];
  let sortattrib = '';
  let valuetype = 'string';
  let projectsSorted = [];
  if (sortby === 'projecttype') {
    includesValues.push({
      model: CodeProjectType,
      required: false,
      attributes: [
        'code_project_type_id',
        'project_type_name'
      ]
    });
    sortattrib = 'code_project_type.project_type_name';
  }
  if (sortby === 'projectname') {
    sortattrib = 'project_name';
    attributes.push('project_name');
  }
  if (sortby === 'on_base') {
    sortattrib = 'onbase_project_number';
    attributes.push('onbase_project_number');
    valuetype = 'number';
  }
  if (sortby?.includes('cost')) {
    const ESTIMATED_ID = 1;
    includesValues.push({
      model: ProjectCost,
      required: false,
      as: 'currentCost',
      attributes: [
        'cost'
      ],
      where: {
        code_cost_type_id: ESTIMATED_ID,
        is_active: 1,
      },
    });
    sortattrib = 'currentCost.0.cost';
    valuetype = 'number';
  }
  if (sortby === 'status') {
    includesValues.push({
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
    });
    sortattrib = 'currentId.0.code_phase_type.code_status_type.status_name';
  }
  if (sortby === 'phase') {
    includesValues.push({
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
          'phase_name'
        ],
      }
    });
    sortattrib = 'currentId.0.code_phase_type.phase_name';
  }
  if (sortby === 'county') {
    includesValues.push({
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
    });
    sortattrib = 'project_counties.0.CODE_STATE_COUNTY.county_name';
  }
  if (sortby === 'lg_lead') {
    const LG_LEAD = 10;
    includesValues.push({
      model: ProjectStaff,
      attributes: [
        'project_staff_id'
      ],
      required: false,
      include: [{
          model: BusinessAssociateContact,
          attributes: [
            'business_associate_contact_id'
          ],
          required: false,
          include: [{
            model: User,
            attributes: [
              'name'
            ],
          }]          
      }, {
        model: CodeProjectStaffRole,
        required: false,
        where: {
          code_project_staff_role_type_id: LG_LEAD,
        }
      }],
    });
    //testing purposes
    sortattrib = 'project_staffs.0.business_associate_contact.user.name';
  }
  if (sortby === 'mhfd') {
    const MHFD_LEAD = 1;
    includesValues.push({
      model: ProjectStaff,
      attributes: [
        'project_staff_id'
      ],
      required: false,
      include: [{
          model: BusinessAssociateContact,
          attributes: [
            'business_associate_contact_id'
          ],
          required: false,
          include: [{
            model: User,
            attributes: [
              'name'
            ],
          }]          
      }, {
        model: CodeProjectStaffRole,
        required: false,
        where: {
          code_project_staff_role_type_id: MHFD_LEAD,
        }
      }],
    });
    //testing purposes
    sortattrib = 'project_staffs.0.business_associate_contact.user.name';
  }
  if (sortby === 'service_area') {
    includesValues.push({
      model: ProjectServiceArea,
			attributes: ['project_service_area_id'],			
			include: {
			  attributes: ['service_area_name'],
			  model: CodeServiceArea,
			},		  
	  });
    sortattrib = 'project_service_areas.0.CODE_SERVICE_AREA.service_area_name';
  }
  if (sortby === 'stream') {
    includesValues.push({
      model: ProjectStreams,
      required: false,
      separate: true,
      include: {
        model: Streams,
        required: false,
        attributes: [
          'stream_id',
          'stream_name'
        ]
      }
    });
    sortattrib = 'project_streams.0.stream.stream_name';
  }
  if (sortby === 'consultant') {
    const CONSULTANT = 3;
    includesValues.push({
      model: ProjectPartner,
      attributes: [
        'project_partner_id',
        'code_partner_type_id'
      ],
      required: false,
      separate: true,
      as: 'currentConsultant',
      include: [{
        model: CodeProjectPartnerType,
        required: true,
        attributes: [
          'code_partner_type_id',          
        ],
        where: {code_partner_type_id: CONSULTANT}
      }, {
        model: BusinessAssociate,
        required: false,
        attributes: [
          'business_name',
        ]
      },],
    });
    sortattrib = 'currentConsultant.0.business_associate.business_name';
  }
  if (sortby === 'landscape_contractor') {
    const LANDSCAPE_CONTRACTOR_ID = 9;
    includesValues.push({
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
    });
    sortattrib = 'landscapeContractor.0.business_associate.business_name';
  }
  if (sortby === 'civil_contractor') {
    const CIVIL_CONTRACTOR_ID = 8;
    includesValues.push({
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
    });
    sortattrib = 'civilContractor.0.business_associate.business_name';
  }
  projectsSorted = await Project.findAll({
    attributes: attributes,
    include: includesValues
  });
  // console.log('projects not sorted', projectsSorted.map(p => ({id: p.project_id, cost: JSON.stringify(p.currentId)})));
  projectsSorted = sortArrayOfProjects(valuetype, sortattrib, sorttype, projectsSorted);
  // console.log('projects very sorted', JSON.stringify(projectsSorted.map(p => ({id: p.project_id, cost: (p.project_staffs)}))));
  // console.log('Projects Sorted', JSON.stringify(projectsSorted));
  return projectsSorted;
}

export const sortProjectsByAttrib = async (projects, sortOrder, filters) => {

  if (sortOrder.length) {
    const itemPositions = {};
    for (const [index, id] of sortOrder.entries()) {
      itemPositions[id] = index;
    }
    projects = projects.sort((a, b) => itemPositions[a.project_id] - itemPositions[b.project_id]);
  }

  return projects;
}