import db from 'bc/config/db.js';

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

export const getCountiesByProjectIds = async (ids) => {
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
}

export const getConsultantsByProjectids = async (ids) => {
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
}

export const getCivilContractorsByProjectids = async (ids) => {
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
}

export const getLocalGovernmentByProjectids = async (ids) => {
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
}

export const getEstimatedCostsByProjectids = async (ids) => {
  const projectCost = await ProjectCost.findAll({
    where: {
      project_id: ids
    }
  }).map(result => result.dataValues);
  const ESTIMATED_COST = 1;
  const estimatedCosts = projectCost.filter(result => result.code_cost_type_id === ESTIMATED_COST);
  return estimatedCosts;
}

export const getStreamsDataByProjectIds = async (ids) => {
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
}

export const projectsByFilters = async (projects, filters) => {
  let newprojects = [...projects];
  // STATUS
  if ((filters.status?.trim()?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => filters.status.includes(proj?.project_status?.code_phase_type?.code_status_type?.status_name) );
  }
  // PROJECT TYPE
  if ((filters.projecttype?.trim()?.length || 0) > 0) {
    //TO DO: the filter works with project type name, it has a  
    // let projecttypeFiltered = [];
    let filterProjectType =  filters.projecttype.split(',')
    // filterProjectType.forEach(type => {
    //    projecttypeFiltered = [...projecttypeFiltered, newprojects.filter((proj) => proj?.project_status?.code_phase_type?.code_project_type?.project_type_name.includes(type))];
    // });
    // newprojects = projecttypeFiltered
    newprojects = newprojects.filter((proj) => {
      let flag = false;
      for (let index = 0; index < filterProjectType.length; index++) {
        const type = filterProjectType[index];
        if(proj?.project_status?.code_phase_type?.code_project_type?.project_type_name.includes(type)){
          flag =true;
        }
      }
      return flag
    });
  }
  // SERVICE AREA
  if ((filters.servicearea?.trim()?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => filters.servicearea.includes(proj?.service_area_name) );
  }
  //COUNTY
  if((filters.county?.trim()?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => filters.county.includes(proj?.county?.codeStateCounty?.county_name));
  }

  //STREAMS 
  if ((filters.streamname?.trim()?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => filters.streamname.includes(proj?.streams?.stream[0]?.stream_name));
  }
  
  // jurisdiction is weird 
  if ((filters.jurisdiction?.trim()?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => proj?.localGoverment?.codeLocalGoverment?.local_government_name.includes(filters.jurisdiction));
  }

//CONSULTANT
  if((filters.consultant?.trim()?.length || 0) > 0) {
    let consultantFilter = filters.consultant.toUpperCase();
    console.log('consultanttttt',consultantFilter) 
    newprojects = newprojects.filter((proj) => consultantFilter.includes(proj?.consultants[0]?.consultant[0]?.business_name));
  }
    //CONTRACTOR
  if((filters.contractor?.trim()?.length || 0) > 0) {
    let contractorFilter = filters.contractor.toUpperCase();
    // console.log('contractortttt',contractorFilter)
    // newprojects = newprojects.filter((proj) => contractorFilter.includes(proj?.contractors[0]?.business[0]?.business_name));
    let filterContractor =  contractorFilter.split(',')
    newprojects = newprojects.filter((proj) => {
      let flag = false;
      for (let index = 0; index < filterContractor.length; index++) {
        const contractor = filterContractor[index];
        if(proj?.contractors[0]?.business[0]?.business_name.includes(contractor)){
          flag =true;
        }
      }
      return flag
    });
  }
  return newprojects;
}

export const projectsByFiltersForIds = async (projects, filters) => {
  let newprojects = [...projects];
  // STATUS
  if ((filters.status?.trim()?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => filters.status.includes(proj?.project_status?.code_phase_type?.code_status_type?.status_name))
  }
  // PROJECT TYPE
  if ((filters.projecttype?.trim()?.length || 0) > 0) {
    //TO DO: the filter works with project type name, it has a  
    let filterProjectType =  filters.projecttype.split(',')
    newprojects = newprojects.filter((proj) => {
      let flag = false;
      for (let index = 0; index < filterProjectType.length; index++) {
        const type = filterProjectType[index];
        if(proj?.project_status?.code_phase_type?.code_project_type?.project_type_name.includes(type)){
          flag =true;
        }
      }
      return flag
    })
  }
  // SERVICE AREA
  if ((filters.servicearea?.trim()?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => filters.servicearea.includes(proj?.service_area_name) )
  }
  //COUNTY
  if((filters.county?.trim()?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => filters.county.includes(proj?.county?.codeStateCounty?.county_name))
  }

  //STREAMS 
  if ((filters.streamname?.trim()?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => filters.streamname.includes(proj?.streams?.stream[0]?.stream_name))
  }
  
  // jurisdiction is weird 
  if ((filters.jurisdiction?.trim()?.length || 0) > 0) {
    newprojects = newprojects.filter((proj) => proj?.localGoverment?.codeLocalGoverment?.local_government_name.includes(filters.jurisdiction))
  }

//CONSULTANT
  if((filters.consultant?.trim()?.length || 0) > 0) {
    let consultantFilter = filters.consultant.toUpperCase();
    newprojects = newprojects.filter((proj) => consultantFilter.includes(proj?.consultants[0]?.consultant[0]?.business_name))
  }
    //CONTRACTOR
    if((filters.contractor?.trim()?.length || 0) > 0) {
      let contractorFilter = filters.contractor.toUpperCase();
      let filterContractor =  contractorFilter.split(',')
      newprojects = newprojects.filter((proj) => {
        let flag = false;
        for (let index = 0; index < filterContractor.length; index++) {
          const contractor = filterContractor[index];
          if(proj?.contractors[0]?.business[0]?.business_name.includes(contractor)){
            flag =true;
          }
        }
        return flag
      })
    }
    newprojects = newprojects.map((element) => 
       element.project_id
    );
  return newprojects;
}

export const sortProjects = async (projects, filters) => {
  const { sortby, sorttype } = filters;
  switch(sortby) {
    case 'estimatedcost':
      projects.sort((a,b) => {
        if (sorttype === 'asc') {
          return a?.estimatedCost?.cost - b?.estimatedCost?.cost
        } else {
          return b?.estimatedCost?.cost - a?.estimatedCost?.cost
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