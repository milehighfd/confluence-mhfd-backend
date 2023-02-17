import db from 'bc/config/db.js';
import needle from 'needle';
import {
  CARTO_URL,
  MAIN_PROJECT_TABLE
} from 'bc/config/config.js';

const Projects = db.project;
const ProjectPartner = db.projectPartner;
const ProjectCounty = db.projectCounty;
const CodeStateCounty = db.codeStateCounty;
const ProjectServiceArea = db.projectServiceArea;
const CodeServiceArea = db.codeServiceArea;
const ProjectLocalGovernment = db.projectLocalGovernment;
const CodeLocalGoverment = db.codeLocalGoverment;
const ProjectCost = db.projectCost;
const ProjectStaff = db.projectStaff;
const MHFDStaff = db.mhfdStaff;
const ProjectDetail = db.projectDetail;
const BusinessAssociante = db.businessAssociates;
const ProjectStreams = db.project_stream;
const Streams = db.stream;
const Attachment = db.projectAttachment;

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
    }).map((data) => data.dataValues);
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
    }).map(data => data.dataValues);
    const codeCounties = projectCounty.map((psa) => psa.state_county_id);
    let codeStateCounties = await CodeStateCounty.findAll({
      where: {
        state_county_id: codeCounties
      },
      attributes: {exclude: ['Shape']}
    }).map(data => data.dataValues);
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
    }).map((data) => data.dataValues);
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
    }).map((data) => data.dataValues);
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
    }).map(data => data.dataValues);
    const codeLovalGovermentIds = projectLocalGovernment.map((psa) => psa.code_local_government_id);
    let codeLocalGoverments = await CodeLocalGoverment.findAll({
      where: {
        code_local_government_id: codeLovalGovermentIds
      },
      attributes: {exclude: ['Shape']}
    }).map(data => data.dataValues);
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
        project_id: ids
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
    }).map((data) => data.dataValues);
    const projectStreamsIds = projectStreams.map((data) => data.stream_id).filter((data) => data !== null);
    const streamsList = await Streams.findAll({
      where: {
        stream_id: projectStreamsIds
      },
      attributes: {exclude: ['Shape']}
    }).map((data) => data.dataValues);
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
    newprojects = newprojects.filter((proj) => filters.status.includes(proj?.project_status?.code_phase_type?.code_status_type?.code_status_type_id) );
  }
//   // PROJECT TYPE
  if ((filters.projecttype?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => filters.projecttype.includes(proj?.project_status?.code_phase_type?.code_project_type?.code_project_type_id));
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
  newprojects = newprojects?.map((element) => 
      element.project_id
  );
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
      return data.body.rows.map((d) => d.projectid);
    } else { 
      console.error('Error at bbox', data.body);
      return [];
    }
  } catch (error) {
    console.log('This error ', error);
    return [];
  }
}