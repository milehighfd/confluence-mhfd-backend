import needle from 'needle';
import https from 'https';
import attachmentService from 'bc/services/attachment.service.js';
import projectStreamService from 'bc/services/projectStream.service.js';
import {
  CARTO_URL,
  CREATE_PROJECT_TABLE,
  PROBLEM_TABLE,
  PROPSPROBLEMTABLES,
  MAIN_PROJECT_TABLE,
  COSPONSOR1,
  COSPONSOR
} from 'bc/config/config.js';

export const getCoordsByProjectId = async (projectid, isDev) => {
  let table = MAIN_PROJECT_TABLE;
  if (isDev) {
    table = CREATE_PROJECT_TABLE;
  }
  let fields = ['ST_AsGeoJSON(the_geom) as the_geom3'];
  let SQL = `SELECT ${fields.join(', ')} FROM ${table} where projectid=${projectid}`;
  let URL = encodeURI(`${CARTO_URL}&q=${SQL}`);
  const data = await needle('get', URL, { json: true });
  if (data.statusCode === 200 && data.body.rows.length > 0) {
    let obj = data.body.rows[0];
    let o = {};
    o.createdCoordinates = obj.the_geom3;
    return o;
  } else {
    console.log('getCoordsByProjectId error', data.statusCode, data.body);
    throw new Error('Project not found');
  }
}

export const getMidByProjectId = async (projectid, projecttype) => {
  let table = CREATE_PROJECT_TABLE;
  let fields = ["projectid", "cartodb_id", "county", "jurisdiction", "servicearea", "projectname", "status", "description", "acquisitionprogress", "acquisitionanticipateddate", "projecttype", "projectsubtype", "additionalcost", "additionalcostdescription", `${COSPONSOR1} as ${COSPONSOR}`, "frequency", "maintenanceeligibility", "overheadcost", "overheadcostdescription", "ownership", "sponsor", 'estimatedcost', 'studyreason', 'studysubreason'];
  if (['Acquisition', 'Special', 'Maintenance', 'Capital'].includes(projecttype)) {
    fields.push('ST_AsGeoJSON(the_geom) as the_geom')
  }
  let SQL = `SELECT ${fields.join(', ')} FROM ${table} where projectid=${projectid}`;
  console.log('SQL in get mid by project id ', SQL);
  let URL = encodeURI(`${CARTO_URL}&q=${SQL}`);
  const data = await needle('get', URL, { json: true });
  if (data.statusCode === 200 && data.body.rows.length > 0) {
    let obj = data.body.rows[0];
    if (projecttype === 'Study') {
      const streams = await projectStreamService.getAll(projectid);
      obj.streams = streams.map(r => r.mhfd_code);
    }
    return obj;
  } else {
    console.log('getMidByProjectId error', data.statusCode, data.body);
    return null;
  }
}

export const getMinimumDateByProjectId = async (projectid) => {
  let table = CREATE_PROJECT_TABLE;
  let SQL = `SELECT county, servicearea FROM ${table} where projectid=${projectid}`;
  let URL = encodeURI(`${CARTO_URL}&q=${SQL}`);
  const data = await needle('get', URL, { json: true });
  if (data.statusCode === 200 && data.body.rows.length > 0) {
    return data.body.rows[0];
  } else {
    console.log('getMinimumDateByProjectId error', data.statusCode, data.body);
    throw new Error('Project not found');
  }
}

// in the future change isDev for is board project , don't delete the variable please @pachon
export const getDataByProjectIds = async (projectid, type, isDev) => {
  let table = MAIN_PROJECT_TABLE;
  if (isDev) {
    table = CREATE_PROJECT_TABLE;
  }
  let SQL = `SELECT *, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom2, ST_AsGeoJSON(the_geom) as the_geom3 FROM ${table} where  projectid=${projectid} `;
  let URL = encodeURI(`${CARTO_URL}&q=${SQL}`);
  const data = await needle('get', URL, { json: true });
  console.log("\n\n\n\nSQL\n\n\n\n", SQL);
  if (data.statusCode === 200 && data.body.rows.length > 0) {
    const result = data.body.rows[0];
    let problems = [];
    let attachmentFinal = [];
    let components = [];
    let coordinates = [];
    let convexhull = [];
    if (result.projectid !== null && result.projectid !== undefined && result.projectid) {
      problems = await getProblemByProjectId(result.projectid, PROPSPROBLEMTABLES.problems[6], 'asc');
      components = await getCoordinatesOfComponents(result.projectid, 'projectid');
      convexhull = await getEnvelopeProblemsComponentsAndProject(result.projectid, table, 'projectid');
      if(convexhull[0]){
        convexhull = JSON.parse(convexhull[0].envelope).coordinates;
      }
    }
    
    if (result.attachments) {
      attachmentFinal = await attachmentService.findByName(result.attachments);
    }
    let createdCoordinates = {};
    if (isDev) {
      createdCoordinates = result.the_geom3;
    }
    result.the_geom = result.the_geom2;
    if(convexhull[0].length > 0){
      coordinates = convexhull;
      // console.log("CONVEX HULL", coordinates);
    } else if (JSON.parse(result.the_geom).coordinates) {
      coordinates = JSON.parse(result.the_geom).coordinates;
    }
    return {
      cartodb_id: result.cartodb_id,
      objectid: result.objectid,
      createdCoordinates: createdCoordinates,
      projectid: result.projectid,
      onbaseid: result.onbaseid,
      projectname: result.projectname,
      status: result.status,
      requestedname: result.requestedname,
      projecttype: result.projecttype,
      projectsubtype: result.projectsubtype,
      description: result.description,
      sponsor: result.sponsor,
      cosponsor: result.cosponsor,
      recurrence: result.recurrence,
      frequency: result.frequency,
      mhfddollarsrequested: result.mhfddollarsrequested,
      estimatedcost: result.estimatedcost,
      componentcost: result.component_cost,
      mhfddollarsallocated: result.mhfddollarsallocated,
      finalcost: result.finalcost,
      startyear: result.startyear,
      completedyear: result.completedyear,
      consultant: result.consultant,
      contractor: result.contractor,
      lgmanager: result.lgmanager,
      mhfdmanager: result.mhfdmanager,
      servicearea: result.servicearea,
      county: result.county,
      jurisdiction: result.jurisdiction,
      streamname: result.streamname,
      tasksedimentremoval: result.tasksedimentremoval,
      tasktreethinning: result.tasktreethinning,
      taskbankstabilization: result.taskbankstabilization,
      taskdrainagestructure: result.taskdrainagestructure,
      taskregionaldetention: result.taskregionaldetention,
      goalfloodrisk: result.goalfloodrisk,
      goalwaterquality: result.goalwaterquality,
      goalstabilization: result.goalstabilization,
      goalcaprecreation: result.goalcaprecreation,
      goalcapvegetation: result.goalcapvegetation,
      goalstudyovertopping: result.goalstudyovertopping,
      goalstudyconveyance: result.goalstudyconveyance,
      goalstudypeakflow: result.goalstudypeakflow,
      goalstudydevelopment: result.goalstudydevelopment,
      creator: result.creator,
      datecreated: result.datecreated,
      lastmodifieduser: result.lastmodifieduser,
      lastmodifieddate: result.lastmodifieddate,
      workplanyr1: result.workplanyr1,
      workplanyr2: result.workplanyr2,
      workplanyr3: result.workplanyr3,
      workplanyr4: result.workplanyr4,
      workplanyr5: result.workplanyr5,
      coverimage: result.coverimage,
      globalid: result.globalid,
      shape_length: result.shape_length,
      attachments: attachmentFinal,
      problems: problems,
      components: components,
      coordinates: coordinates,
      acquisitionprogress: result.acquisitionprogress,
      acquisitionanticipateddate: result.acquisitionanticipateddate,
      acquisitionprogress: result.acquisitionprogress,
      acquisitionanticipateddate: result.acquisitionanticipateddate,
      sponsor: result.sponsor,
      cosponsor: result.cosponsor,
      frequency: result.frequency,
      maintenanceeligibility: result.maintenanceeligibility,
      ownership: result.ownership,
      overheadcost: result.overheadcost,
      overheadcostdescription: result.overheadcostdescription,
      additionalcost: result.additionalcost,
      additionalcostdescription: result.additionalcostdescription,
    };
  } else {
    console.log('getDataByProjectIds error', data.statusCode, data.body);
    throw new Error('Project not found');
  }
}

export async function getProblemByProjectId(projectid, sortby, sorttype) {
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
    return data;
  } catch (e) {
    console.error('Error with QUERY ', LINE_SQL);
  }
}

async function getEnvelopeProblemsComponentsAndProject(id, table, field) {
  const SQL = `
  select ST_ASGEOJSON(ST_EXTENT(the_geom)) as envelope
    from (
    SELECT the_geom FROM ${table} where  projectid=${id}
  union 
    select the_geom from ${PROBLEM_TABLE}  
      where ${PROPSPROBLEMTABLES.problem_boundary[5]} in (SELECT problemid FROM grade_control_structure 
        where projectid=${id} and projectid>0  union SELECT problemid FROM pipe_appurtenances 
        where projectid=${id} and projectid>0  union SELECT problemid FROM special_item_point 
        where projectid=${id} and projectid>0  union SELECT problemid FROM special_item_linear 
        where projectid=${id} and projectid>0  union SELECT problemid FROM special_item_area 
        where projectid=${id} and projectid>0  union SELECT problemid FROM channel_improvements_linear 
        where projectid=${id} and projectid>0  union SELECT problemid FROM channel_improvements_area 
        where projectid=${id} and projectid>0  union SELECT problemid FROM removal_line 
        where projectid=${id} and projectid>0  union SELECT problemid FROM removal_area 
        where projectid=${id} and projectid>0  union SELECT problemid FROM storm_drain 
        where projectid=${id} and projectid>0  union SELECT problemid FROM detention_facilities 
        where projectid=${id} and projectid>0  union SELECT problemid FROM maintenance_trails 
        where projectid=${id} and projectid>0  union SELECT problemid FROM land_acquisition 
        where projectid=${id} and projectid>0  union SELECT problemid FROM landscaping_area 
        where projectid=${id} and projectid>0) 
  union  
    SELECT the_geom FROM grade_control_structure where ${field}=${id}  
      union SELECT the_geom FROM pipe_appurtenances where ${field}=${id}  
      union SELECT the_geom FROM special_item_point where ${field}=${id}  
      union SELECT the_geom FROM special_item_linear where ${field}=${id}  
      union SELECT the_geom FROM special_item_area where ${field}=${id}  
      union SELECT the_geom FROM channel_improvements_linear where ${field}=${id}  
      union SELECT the_geom FROM channel_improvements_area where ${field}=${id}  
      union SELECT the_geom FROM removal_line where ${field}=${id}  
      union SELECT the_geom FROM removal_area where ${field}=${id}  
      union SELECT the_geom FROM storm_drain where ${field}=${id}  
      union SELECT the_geom FROM detention_facilities where ${field}=${id}  
      union SELECT the_geom FROM maintenance_trails where ${field}=${id}  
      union SELECT the_geom FROM land_acquisition where ${field}=${id}  
      union SELECT the_geom FROM landscaping_area where ${field}=${id}  
  ) joinall
` ;   
  const SQL_URL = encodeURI(`${CARTO_URL}&q=${SQL}`);
  const newProm1 = new Promise((resolve, reject) => {
    https.get(SQL_URL, response => {
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
}
export async function getCoordinatesOfComponents(id, field) {
  const fixedField = 'problemid' ? 'problem_id' : 'project_id';
  const COMPONENTS_SQL = `SELECT type, 'grade_control_structure' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM grade_control_structure 
     where ${field}=${id}  union ` +
     `SELECT type, 'pipe_appurtenances' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM pipe_appurtenances 
     where ${field}=${id}  union ` +
     `SELECT type, 'special_item_point' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM special_item_point 
     where ${field}=${id}  union ` +
     `SELECT type, 'special_item_linear' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM special_item_linear 
     where ${field}=${id}  union ` +
     `SELECT type, 'special_item_area' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM special_item_area 
     where ${field}=${id}  union ` +
     `SELECT type, 'channel_improvements_linear' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM channel_improvements_linear 
     where ${field}=${id}  union ` +
     `SELECT type, 'channel_improvements_area' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM channel_improvements_area 
     where ${field}=${id}  union ` +
     `SELECT type, 'removal_line' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM removal_line 
     where ${field}=${id}  union ` +
     `SELECT type, 'removal_area' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM removal_area 
     where ${field}=${id}  union ` +
     `SELECT type, 'storm_drain' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM storm_drain 
     where ${field}=${id}  union ` +
     `SELECT type, 'detention_facilities' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM detention_facilities 
     where ${field}=${id}  union ` +
     `SELECT type, 'maintenance_trails' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM maintenance_trails 
     where ${field}=${id}  union ` +
     `SELECT type, 'land_acquisition' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM land_acquisition 
     where ${field}=${id}  union ` +
    `SELECT component_part_category as type, 'stream_improvement_measure' as table, project_id as projectid, problem_id as problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM stream_improvement_measure 
      where ${fixedField}=${id}  union ` +
     `SELECT type, 'landscaping_area' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM landscaping_area 
     where ${field}=${id}  `;
  const newProm1 = new Promise((resolve, reject) => {
     const COMPONENT_URL = encodeURI(`${CARTO_URL}&q=${COMPONENTS_SQL}`);
     https.get(COMPONENT_URL, response => {
        if (response.statusCode === 200) {
           let str = '';
           response.on('data', function (chunk) {
              str += chunk;
           });
           response.on('end', async function () {
              const result = JSON.parse(str).rows;
              let resultFinal = [];
              for (const res of result) {

                 resultFinal.push({
                    type: res.type,
                    table: res.table,
                    problemid: res.problemid,
                    projectid: res.projectid,
                    coordinates: JSON.parse(res.st_asgeojson).coordinates
                 });
              }

              resolve(resultFinal);
           })
        }
     });
  });
  const finalResult = await newProm1;
  return finalResult;
}