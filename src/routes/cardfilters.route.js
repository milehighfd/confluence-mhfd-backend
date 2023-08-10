import express from 'express';
import groupService from 'bc/services/group.service.js';
import projectService from 'bc/services/project.service.js';
import { getIdsInBbox, projectsByFilters } from 'bc/utils/functionsProjects.js';
import logger from 'bc/config/logger.js';

const router = express.Router();


const getFilters = async (req, res) => {
  logger.info(`Starting endpoint cardfilters.route/ with params ${JSON.stringify(req.params, null, 2)}`);
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
    groupService.getProjectType(),
    groupService.getMhfdStaff(),
    groupService.getLGManager(),
  ];
  logger.info(`Starting function all for cardfilters.route/`);
  let resolvedPromises = await Promise.all(dataPromises);
  logger.info(`Finished function all for cardfilters.route/`);
  
  data.status = resolvedPromises[0];
  data.jurisdiction = resolvedPromises[1];
  data.county = resolvedPromises[2];
  data.servicearea = resolvedPromises[3];
  data.consultant = resolvedPromises[4];
  data.contractor = resolvedPromises[5];
  data.streamname = resolvedPromises[6];
  data.projecttype = resolvedPromises[7];
  data.creator = [];
  data.mhfdmanager = resolvedPromises[8];
  data.startyear = [];
  data.completedyear = [];
  data.mhfddollarallocated = [];
  data.workplanyear = [];
  data.problemtype = [];
  data.lgmanager = resolvedPromises[9];
  data.estimatedCost = [];
  logger.info(`Starting function filterProjectsBy for cardfilters.route/`);
  let projectsFilterId = await projectService.filterProjectsBy(body);
  let projects = await projectService.getProjects(null, null, projectsFilterId, 1, 10000000);

  // projects = await projectsByFilters(projects, body);

  if (bounds) {
    logger.info(`Starting function getIdsInBbox for cardfilters.route/`);
    const ids = await getIdsInBbox(bounds);
    const dataIds = ids.map((item) => item.project_id);
    projects = projects.filter((p) => { return dataIds.includes(p.dataValues.project_id)});
  }


  const toMatch = [];
  const toCount = {};
  projects.forEach((project) => {
    toCount[project.dataValues.project_id] = 0;
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
      if (current?.project_local_governments?.some( pc => pc?.CODE_LOCAL_GOVERNMENT?.code_local_government_id === +d.id)) {
        return pre + 1;
      }

      // if (current?.localGoverment?.codeLocalGoverment?.code_local_government_id === d.id) {
      //   return pre + 1;
      // }
      return pre;
    }, 0);
  });
  data.county.forEach((d) => {
    d.counter = projects.reduce((pre, current) => {
      if (current?.project_counties?.some( pc => pc?.CODE_STATE_COUNTY?.dataValues.state_county_id === +d.id)) {
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
      // if (current?.project_statuses[0]?.code_phase_type?.code_project_type?.code_project_type_id === d.id) {
      if (current?.code_project_type?.code_project_type_id === d.id) {
        return pre + 1;
      } 
      return pre;
    }, 0);
  });
  
  
  res.send({'all': 'too well', data});
}
const getProjectsComplete = async (req, res) => {
  logger.info(`Starting endpoint business.route/projects with params ${JSON.stringify(req.params, null, 2)}`);
  logger.info(`Starting function getProjects for cardfilters.route/projects`);
  const projects = await projectService.getProjects(null, null);
  logger.info(`Finished function getProjects for cardfilters.route/projects`);
  console.log('projects count', projects.length);
  res.send({projects: projects});
}
const getProjectsPromise = async (req, res) => {
  logger.info(`Starting endpoint business.route/projectspromise with params ${JSON.stringify(req.params, null, 2)}`);
  logger.info(`Starting function getProjectsDeprecated for cardfilters.route/projectspromise`);
  const projects = await projectService.getProjectsDeprecated();
  logger.info(`Finished function getProjectsDeprecated for cardfilters.route/projectspromise`);
  res.send({projects: projects});
}
const getProjectsIdsByBounds = async (req, res) => {
  logger.info(`Starting endpoint business.route/getidsbounds with params ${JSON.stringify(req.params, null, 2)}`);
  const { body } = req;
  const bounds = body?.bounds;
  let projects = [];
  if (bounds) {
    logger.info(`Starting function getProjectsIdsByBounds for cardfilters.route/getidsbounds`);
    projects = await projectService.getProjectsIdsByBounds(bounds);
    logger.info(`Finished function getProjectsIdsByBounds for cardfilters.route/getidsbounds`);
  }  
  res.send({project_ids: projects});

}
router.get('/projectspromise', getProjectsPromise);
router.get('/projects', getProjectsComplete);
router.post('/', getFilters);
router.post('/getidsbounds', getProjectsIdsByBounds);

export default router;