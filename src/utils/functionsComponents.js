import db from 'bc/config/db.js';
import needle from 'needle';
import {
  CARTO_URL,
  MAIN_PROJECT_TABLE
} from 'bc/config/config.js';
import projectService from 'bc/services/project.service.js';
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
    StreamImprovementMeasure
]

export const getActions = async () => {
    try {
    //     const actions = actionList.forEach(async actionType => {
    //         let projectServiceArea = await actionType.findAll({
    //             include: {
    //               model: CodeServiceArea,
    //               attributes: ['service_area_name']
    //             },
    //             where: {
    //               project_id: ids
    //             }
    //           });
    //     });
    //   return projectServiceArea;
    } catch (error) {
      throw error;
    }
  }
