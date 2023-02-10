import express from 'express';
import needle from 'needle';
import groupService from 'bc/services/group.service.js';
import projectService from 'bc/services/project.service.js';
import db from 'bc/config/db.js';
import {
  CARTO_URL,
  MAIN_PROJECT_TABLE
} from 'bc/config/config.js';


const router = express.Router();

const getIdsInBbox = async (bounds) => {
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


const getFilters = async (req, res) => {
  const { body, query } = req;
  const { bounds } = query;
  const data = {};
  let dataPromises = [
    groupService.getStatus(),
    groupService.getJurisdiction(),
    groupService.getCounty(),
    groupService.getServiceArea(),
    groupService.getConsultant(),
    groupService.getContractor(),
    groupService.getStreams(),
    groupService.getProjectType()
  ];
  let resolvedPromises = await Promise.all(dataPromises);
  
  data.status = resolvedPromises[0];
  data.jurisdiction = resolvedPromises[1];
  data.county = resolvedPromises[2];
  data.servicearea = resolvedPromises[3];
  data.consultant = resolvedPromises[4];
  data.contractor = resolvedPromises[5];
  data.streamname = resolvedPromises[6];
  data.projecttype = resolvedPromises[7];
  data.creator = [];
  data.mhfdmanager = [];
  data.startyear = [];
  data.completedyear = [];
  data.mhfddollarallocated = [];
  data.workplanyear = [];
  data.problemtype = [];
  data.lgmanager = [];
  data.estimatedCost = [];
  
  let projects = await projectService.getProjects(null, null, 1);
  if (bounds) {
    const ids = await getIdsInBbox(bounds);
    projects = projects.filter((p) => ids.includes(p.project_id));
  }
  const toMatch = [];
  if (body.completedyear && body.completedyear.length) { // don't touch

  }
  if (body.contractor && body.contractor.length) { //
    const ids = projects.filter((project) => {
      let has = false;
      project?.contractors?.forEach(con => {
        con?.business?.forEach((cc) => {
          body.contractor.forEach((c) => {
            has |= (cc.business_associates_id === c);
          });  
        });
      });
      return has;
    }).map((project) => project.project_id);
    data.contractor = data.contractor.filter((con) => body.contractor.includes(con.id));
    toMatch.push(ids);
    
  }
  if (body.consultant && body.consultant.length) { //
    const ids = projects.filter((project) => {
      let has = false;
      project?.consultants?.forEach(con => {
        con?.consultant?.forEach((cc) => {
          body.consultant.forEach((c) => {
            has |= (cc.business_associates_id === c);
          });  
        });
      });
      return has;
    }).map((project) => project.project_id);
    data.consultant = data.consultant.filter((con) => body.consultant.includes(con.id));
    toMatch.push(ids);
  }
  if (body.county && body.county.length) { //x
    const ids = projects.filter((project) => {
      return body.county.includes(project?.county?.codeStateCounty?.state_county_id);
    }).map((project) => project.project_id);
    data.county = data.county.filter((con) => body.county.includes(con.id));
    toMatch.push(ids);
  }
  if (body.creator && body.creator.length) { // pause for now, guess is the user?

  }
  if (body.totalcost && body.totalcost.length) {
    const ids = projects.filter((project) => {
      return project?.estimatedCost?.cost >= body.totalcost[0] && project?.estimatedCost?.cost <= body.totalcost[1];
    }).map((project) => {
      return project.project_id
    });
    data.estimatedCost = data.estimatedCost?.filter((con) => body.estimatedcost.includes(con.id));
    toMatch.push(ids);
  }
  if (body.jurisdiction && body.jurisdiction.length) { //
    const ids = projects.filter((project) => {
      return body.jurisdiction.includes(project?.localGoverment?.codeLocalGoverment?.code_local_government_id)
    }).map((project) => {
      return project.project_id
    });
    data.jurisdiction = data.jurisdiction.filter((con) => body.jurisdiction.includes(con.id));
    toMatch.push(ids);
  }
  if (body.keyword && body.keyword.length) { // idk

  }
  if (body.lgmanager && body.lgmanager.length) { // pause for now

  }
  if (body.mhfdmanager && body.mhfdmanager.length) { // pause for now

  }
  if (body.order) { // idk don't look important
  }
  if (body.projecttype && body.projecttype.length) { // maybe we will have problems with the names
    const ids = projects.filter((project) => {
      return body.projecttype.includes(
        project?.project_status?.code_phase_type?.code_project_type?.code_project_type_id
      );
    }).map((project) => project.project_id);
    data.projecttype = data.projecttype.filter((con) => body.projecttype.includes(con.id));
    toMatch.push(ids);
  }
  if (body.startyear && body.startyear.length) { // don't touch

  }
  // UNCOMMENT ONCE WE ARE SENDING IDS
  // if (body.status && body.status.length) { // 
  //   const ids = projects.filter((project) => {
  //     return body.status.includes(project?.project_status?.code_phase_type?.code_status_type?.code_status_type_id);
  //   }).map((project) => {
  //     return project.project_id
  //   });
  //   data.status = data.status.filter((con) => body.status.includes(con.id));
  //   toMatch.push(ids);
  // }
  if (body.streamname && body.streamname.length) { //
    const ids = projects.filter((project) => {
      const has = false;
      project.streams?.stream?.forEach((stream) => {
        has |= body.streamname.includes(stream.stream_id);
      });
      return has;
    }).map((project) => {
      return project.project_id
    });
    data.streamname = data.streamname.filter((con) => body.streamname.includes(con.id));
    toMatch.push(ids);
  }
  if (body.servicearea && body.servicearea.length) {
    const ids = projects.filter((project) => {
      return project?.project_service_areas.some( elem => body.servicearea.includes(elem?.CODE_SERVICE_AREA?.code_service_area_id) )
    }).map((project) => {
      return project.project_id
    });
    data.servicearea = data.servicearea.filter((con) => body.servicearea.includes(con.id));
    toMatch.push(ids);
  }
  const toCount = {};
  projects.forEach((project) => {
    toCount[project.project_id] = 0;
  });
  const finalProjects = [];
  toMatch.forEach((array) => {
    array.forEach((el) => {
      toCount.el++;
    })
  });
  for (const key in toCount) {
    if (toCount[key] === toMatch.length) {
      finalProjects.push(key);
    }
  }
  data.status.forEach((d) => {
    d.counter = projects.reduce((pre, current) => {
      if (current?.project_status?.code_phase_type?.code_status_type?.code_status_type_id === d.id) {
        return pre + 1;
      }
      return pre;
    }, 0);
  });
  data.jurisdiction.forEach((d) => {
    d.counter = projects.reduce((pre, current) => {
      if (current?.localGoverment?.codeLocalGoverment?.code_local_government_id === d.id) {
        return pre + 1;
      }
      return pre;
    }, 0);
  });
  data.county.forEach((d) => {
    d.counter = projects.reduce((pre, current) => {
      if (current?.project_counties?.some( pc => pc?.CODE_STATE_COUNTY?.state_county_id === +d.id)) {
        return pre + 1;
      }
      return pre;
    }, 0);
  });
  data.servicearea.forEach((d) => {
    d.counter = projects.reduce((pre, current) => {
      if (current?.project_service_areas?.some(psa => psa?.CODE_SERVICE_AREA?.code_service_area_id === +d.id)) {
        return pre + 1;
      } 
      return pre;
    }, 0);
  });
  data.projecttype.forEach((d) => {
    d.counter = projects.reduce((pre, current) => {
      if (current?.project_status?.code_phase_type?.code_project_type?.code_project_type_id === d.id) {
        return pre + 1;
      } 
      return pre;
    }, 0);
  });
  
  res.send({'all': 'too well', data});
}
const getProjectsComplete = async (req, res) => {
  const projects = await projectService.getProjects();
  res.send({projects: projects});
}
const getProjectsPromise = async (req, res) => {
  const projects = await projectService.getProjectsDeprecated();
  res.send({projects: projects});
}
router.get('/projectspromise', getProjectsPromise);
router.get('/projects', getProjectsComplete);
router.post('/', getFilters);

export default router;