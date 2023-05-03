import db from 'bc/config/db.js';
import needle from 'needle';
import {
  CARTO_URL,
  MAIN_PROJECT_TABLE
} from 'bc/config/config.js';
import projectService from 'bc/services/project.service.js';
import { Op } from 'sequelize';
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

export const getActions = async (filter) => {
    try {
        let promises = [];
        let where = {};
        let whereStreamImprovementException = {};
        const service_area = filter.servicearea ? filter.servicearea : [];
        const county = filter.county ? filter.county : [];
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
              'service_area',
              'county',
              'status',
              'estimated_cost_base',
              'local_government',
              'mhfd_manager',
              'component_type',
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
