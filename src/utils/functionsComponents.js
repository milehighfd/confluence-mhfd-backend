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

export const getActions = async (filter) => {
    try {
        let promises = [];
        let where = {};
        let whereStreamImprovementException = {};
        const service_area = filter.servicearea ? filter.servicearea : [];

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
        // if (county) {

        // }

        actionList.forEach(async actionType => {
          promises.push(actionType.findAll({
            attribute: [
              'servicearea',
              'county',
              'status',
              'estimatedcost',
              'yearofstudy',
              'jurisdiction',
              'mhfdmanager',
              'component_type'
            ],
            where: where
          }));
        });
        promises.push(
          StreamImprovementMeasure.findAll({
            attribute: [
              'service_area',
              'county',
              'status',
              'estimated_cost_base',
              'local_government',
              'mhfd_manager',
              'component_type'
            ],
            where: whereStreamImprovementException
          })
        );

        let allActions = await Promise.all(promises);
        allActions = allActions.map(action =>  action.map(act => act.toJSON()))
        // console.log('All Actions \n ******* \n', allActions);
        return allActions;
    } catch (error) {
      throw error;
    }
  }
