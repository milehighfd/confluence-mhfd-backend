import db from 'bc/config/db.js';
import needle from 'needle';
import {
  CARTO_URL,
  MAIN_PROJECT_TABLE
} from 'bc/config/config.js';
import projectService from 'bc/services/project.service.js';
import pkg from 'sequelize';
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

const GradeControlStructure = db.gradeControlStructure;
const PipeAppurtenances = db.pipeAppurtenances;
const SpecialItemPoint = db.specialItemPoint;
const SpecialItemLinear = db.specialItemLinear;
const SpecialItemArea = db.specialItemArea;
const ChannelImprovementsLinear = db.channelImprovementsLinear;
const ChannelImprovementsArea = db.channelImprovementsArea;
const RemovalLine = db.removalLine;
const RemovalArea = db.removalArea;
const StormDrain = db.stormDrain;
const DetentionFacilities = db.detentionFacilities;
const MaintenanceTrails = db.maintenanceTrails;
const LandAcquisition = db.landAcquisition;
const LandscapingArea = db.landscapingArea; 
const StreamImprovementMeasure = db.streamImprovementMeasure; 

const actionList =[
    GradeControlStructure,
    PipeAppurtenances,
    SpecialItemPoint,
    SpecialItemLinear,
    SpecialItemArea,
    ChannelImprovementsLinear,
    ChannelImprovementsArea,
    RemovalLine,
    RemovalArea,
    StormDrain,
    DetentionFacilities,
    MaintenanceTrails,
    LandAcquisition,
    LandscapingArea,
    // StreamImprovementMeasure
]
const actionListNames = [
  'Grade Control Structure',
  'Pipe Appurtenances',
  'Special Item Point',
  'Special Item Linear',
  'Special Item Area',
  'Channel Improvements Lin',
  'Channel Improvements Area',
  'Removal Line',
  'Removal Area',
  'Storm Drain',
  'Detention Facilities',
  'Maintenance Trails',
  'Land Acquisition',
  'Landscaping Area',
  'Stream Improvement'
];
const TABLES_COMPONENTS = [
  'grade_control_structure',
  'pipe_appurtenances',
  'special_item_point',
  'special_item_linear',
  'special_item_area',
  'channel_improvements_linear',
  'channel_improvements_area',
  'removal_line',
  'removal_area',
  'storm_drain',
  'detention_facilities',
  'maintenance_trails',
  'land_acquisition',
  'landscaping_area',
  // TO DO: add stream improvement measure after client modifies table in carto UPDATE using copy of table with columns names fixed
  // ,'stream_improvement_measure_copy'
  'stream_improvement_measure'
];

const { Op } = pkg;

const getIdsInsideBoundsCarto = async (bounds) => {
  const coords = bounds.split(',');
  let filters = `(ST_Contains(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom) or `;
    filters += `ST_Intersects(ST_MakeEnvelope(${coords[0]},${coords[1]},${coords[2]},${coords[3]},4326), the_geom))`;
  let result = [];
  try {
    for(let i = 0 ; i < actionListNames.length ; ++i) {
      const SQL = `SELECT component_id FROM ${TABLES_COMPONENTS[i]} where ${filters}`;
      const query = { q: ` ${SQL} ` };
      const data = await needle('post', CARTO_URL, query, { json: true });
      if (data.statusCode === 200) {
        result.push({
          component_type: actionListNames[i],
          actionids: data.body.rows.map(compid => compid.component_id)
        });
      } else if (data.statusCode === 400) {
        logger.error('data.statusCode 400', data.body);
      } else {
        logger.error('Error on getCounterComponentsWithFilter');
        logger.error(data.statusCode);
        logger.error(data.body);
      }
    }
  } catch(error) {
    logger.error('Error at inside bounds' + error);
  }
  return result;
}

export const getActions = async (filter, bounds) => {
    try {
        let promises = [];
        let where = {};
        let whereStreamImprovementException = {};

        const ids = await getIdsInsideBoundsCarto(bounds);
        console.log('ids \n ******** \n', ids);
        const service_area = filter.servicearea ? filter.servicearea : [];
        const county = filter.county ? filter.county : [];
        const component_type = filter.component_type ? filter.component_type : [];
        const status = filter.status ? filter.status : [];
        const jurisdiction = filter.jurisdiction ? filter.jurisdiction : [];
        const mhfdmanager = filter.mhfdmanager ? filter.mhfdmanager : [];
        const cost = filter.estimatedcost && filter.estimatedcost.length > 0 ? { [Op.between]: [+filter.estimatedcost[0], +filter.estimatedcost[1]] } : null;
        const yearofstudy = (filter.yearofstudy && filter.yearofstudy.split(',').length > 0 ? { [Op.between]: [+filter.yearofstudy.split(',')[0], +filter.yearofstudy.split(',')[1]] } : null) 

        if (service_area.length) {
          where = {
            ...where,
            servicearea: {[Op.in]: service_area}
          };
          whereStreamImprovementException = {
            ...whereStreamImprovementException,
            service_area: {[Op.in]: service_area}
          };
        }
        if (county.length) {
          where = {
            ...where,
            county: {[Op.in]: county}
          };
          whereStreamImprovementException = {
            ...whereStreamImprovementException,
            county: {[Op.in]: county}
          };
        }
        if (component_type.length) {
          where = {
            ...where,
            type: {[Op.in]: component_type}
          };
          whereStreamImprovementException = {
            ...whereStreamImprovementException,
            component_part_category: {[Op.in]: component_type}
          };
        }
        if (status.length) {
          where = {
            ...where,
            status: {[Op.in]: status}
          };
          whereStreamImprovementException = {
            ...whereStreamImprovementException,
            status: {[Op.in]: status}
          };
        }
        if (jurisdiction.length) {
          where = {
            ...where,
            jurisdiction: {[Op.in]: jurisdiction}
          };
          whereStreamImprovementException = {
            ...whereStreamImprovementException,
            local_government: {[Op.in]: jurisdiction}
          };
        }
        if (mhfdmanager.length) {
          where = {
            ...where,
            mhfdmanager: {[Op.in]: mhfdmanager}
          };
          whereStreamImprovementException = {
            ...whereStreamImprovementException,
            mhfd_manager: {[Op.in]: mhfdmanager}
          };
        }
        if(cost) {
          where = {
            ...where,
            estimated_cost: cost
          };
          whereStreamImprovementException = {
            ...whereStreamImprovementException,
            estimated_cost_base: cost
          };
        }
        if(yearofstudy) {
          where = {
            ...where,
            year_of_study: yearofstudy
          };
          // THERE IS NO YEAR OF STUDY
          whereStreamImprovementException = {
            ...whereStreamImprovementException,
            source_complete_year: yearofstudy
          };
        }

        actionList.forEach(async actionType => {
          promises.push(actionType.findAll({
            attributes: [
              'servicearea',
              'county',
              'status',
              'estimated_cost',
              'year_of_study',
              'jurisdiction',
              'mhfdmanager',
              ['type', 'component_type'],
              'component_id'
            ],
            where: where
          }));
        });
        promises.push(
          StreamImprovementMeasure.findAll({
            attributes: [
              ['service_area', 'servicearea'],
              'county',
              'status',
              ['estimated_cost_base', 'estimated_cost'],
              ['local_government', 'jurisdiction'],
              'mhfd_manager',
              ['source_complete_year', 'year_of_study'],
              ['component_part_category', 'component_type'],
              'component_id'
            ],
            where: whereStreamImprovementException
          })
        );

        let allActions = await Promise.all(promises);
        allActions = allActions.map((action, index) =>  ({
          component_type: actionListNames[index],
          actions: action.map(act => act.toJSON())
        }))
        // console.log('All Actions \n ******* \n', allActions);
        return allActions;
    } catch (error) {
      console.log('error at components' + error);
      throw error;
    }
  }
