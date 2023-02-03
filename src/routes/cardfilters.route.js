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
  data.status = await groupService.getStatus();
  data.jurisdiction = await groupService.getJurisdiction();
  data.county = await groupService.getCounty();
  data.serviceArea = await groupService.getServiceArea();
  data.consultant = await groupService.getConsultant();
  data.contractor = await groupService.getContractor();
  data.streams = await groupService.getStreams();
  data.projecttype = await groupService.getProjectType();
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
  if (body.estimatedcost && body.estimatedcost.length) {
    const ids = projects.filter((project) => {
      return body.estimatedcost.any((ec) => {
        return project.estimatedCost.cost >= ec[0] && project.estimatedCost.cost <= ec[1];
      });
    }).map((project) => {
      return project.project_id
    });
    data.estimatedcost = data.estimatedcost.filter((con) => body.estimatedcost.includes(con.id));
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
      return body.projecttype(
        project?.project_status?.code_phase_type?.code_project_type?.code_project_type_id
      );
    }).map((project) => project.project_id);
    data.projecttype = data.projecttype.filter((con) => body.projecttype.includes(con.id));
    toMatch.push(ids);
  }
  if (body.startyear && body.startyear.length) { // don't touch

  }
  if (body.status && body.status.length) { // 
    const ids = projects.filter((project) => {
      return body.status.includes(project?.project_status?.code_phase_type?.code_status_type?.code_status_type_id);
    }).map((project) => {
      return project.project_id
    });
    data.status = data.status.filter((con) => body.status.includes(con.id));
    toMatch.push(ids);
  }
  if (body.stream && body.stream.length) { //
    const ids = projects.filter((project) => {
      const has = false;
      project.streams?.stream?.forEach((stream) => {
        has |= body.stream.includes(stream.stream_id);
      });
      return has;
    }).map((project) => {
      return project.project_id
    });
    data.stream = data.stream.filter((con) => body.stream.includes(con.id));
    toMatch.push(ids);
  }
  if (body.serviceArea && body.serviceArea.length) { //
    const ids = projects.filter((project) => {
      return body.serviceArea.includes(project?.serviceArea?.code_service_area_id);
    }).map((project) => {
      return project.project_id
    });
    data.serviceArea = data.serviceArea.filter((con) => body.serviceArea.includes(con.id));
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
    d.count = projects.reduce((pre, current) => {
      if (current?.project_status?.code_phase_type?.code_status_type?.code_status_type_id === d.id) {
        return pre + 1;
      }
      return pre;
    }, 0);
  });
  data.jurisdiction.forEach((d) => {
    d.count = projects.reduce((pre, current) => {
      if (current?.localGoverment?.codeLocalGoverment?.code_local_government_id === d.id) {
        return pre + 1;
      }
      return pre;
    }, 0);
  });
  data.county.forEach((d) => {
    d.count = projects.reduce((pre, current) => {
      if (current?.county?.codeStateCounty?.state_county_id === d.id) {
        return pre + 1;
      }
      return pre;
    }, 0);
  });
  data.serviceArea.forEach((d) => {
    d.count = projects.reduce((pre, current) => {
      // console.log('sa sa ', current?.serviceArea, d.id);
      if (current?.serviceArea?.code_service_area_id === +d.id) {
        return pre + 1;
      } 
      return pre;
    }, 0);
  });
  data.projecttype.forEach((d) => {
    d.count = projects.reduce((pre, current) => {
      if (current?.project_status?.code_phase_type?.code_project_type?.code_project_type_id === d.id) {
        return pre + 1;
      } 
      return pre;
    }, 0);
  });
  
  res.send({'all': 'too well', data});
}

router.get('/', getFilters);

export default router;