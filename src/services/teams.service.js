import db from 'bc/config/db.js';
import sequelize from 'sequelize';

const Op = sequelize.Op;
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
const LandAcquisition = db.landAcquisition;
const LandscapingArea = db.landscapingArea;
const StreamImprovementMeasure = db.streamImprovementMeasure;
const MaintenanceTrails = db.maintenanceTrails;
const ProjectStaff = db.projectStaff;
const Project = db.project;
const BusinessAssociateContact = db.businessAssociateContact;
const BusinessAddress = db.businessAdress;
const BusinessAssociate = db.businessAssociates;


const getProjectIdByProblemId = async (problemId) => {
  const [
    gradeControlStructureData, 
    pipeAppurtenancesData, 
    specialItemPointData, 
    specialItemLinearData, 
    specialItemAreaData, 
    channelImprovementsLinearData, 
    channelImprovementsAreaData, 
    removalLineData, 
    removalAreaData, 
    stormDrainData, 
    detentionFacilitiesData, 
    maintenanceTrailsData, 
    landAcquisitionData, 
    landscapingAreaData, 
    streamImprovementMeasureData
  ] = await Promise.all([
    GradeControlStructure.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    PipeAppurtenances.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    SpecialItemPoint.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    SpecialItemLinear.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    SpecialItemArea.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    ChannelImprovementsLinear.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    ChannelImprovementsArea.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    RemovalLine.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    RemovalArea.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    StormDrain.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    DetentionFacilities.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    MaintenanceTrails.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    LandAcquisition.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    LandscapingArea.findAll({ where: { problemid: problemId, projectid: { [Op.not]: null } }, attributes: ['projectid'] }),
    StreamImprovementMeasure.findAll({ where: { problem_id: problemId, project_id: { [Op.not]: null } }, attributes: ['project_id',] })
  ]);
  const modelData = [
    gradeControlStructureData.map(instance => instance.dataValues),
    pipeAppurtenancesData.map(instance => instance.dataValues),
    specialItemPointData.map(instance => instance.dataValues),
    specialItemLinearData.map(instance => instance.dataValues),
    specialItemAreaData.map(instance => instance.dataValues),
    channelImprovementsLinearData.map(instance => instance.dataValues),
    channelImprovementsAreaData.map(instance => instance.dataValues),
    removalLineData.map(instance => instance.dataValues),
    removalAreaData.map(instance => instance.dataValues),
    stormDrainData.map(instance => instance.dataValues),
    detentionFacilitiesData.map(instance => instance.dataValues),
    maintenanceTrailsData.map(instance => instance.dataValues),
    landAcquisitionData.map(instance => instance.dataValues),
    landscapingAreaData.map(instance => instance.dataValues),
    streamImprovementMeasureData.map(instance => {
      const { project_id, problem_id, ...rest } = instance.dataValues;
      return { ...rest, projectid: project_id, problemid: problem_id };
    })
  ].filter(arr => arr.length > 0);
  const cleanArray = modelData.flat().flatMap(element => element.projectid);
  const uniqueArray = [...new Set(cleanArray)];
  return uniqueArray;
}
const getTeams = async (projectList) => {
  try {
    const teamsProject = await Project.findAll({
      where: { project_id: { [Op.in]: projectList } }, 
      attributes: ['project_id'] ,
      include: [{
        model: ProjectStaff,
        required: false,
        separate: true,
        attributes: [
          'code_project_staff_role_type_id',
          'is_active',
          'project_staff_id',
          'business_associate_contact_id'
        ],
        include: [{
          model: BusinessAssociateContact,
          attributes: [
            'contact_name',
            'business_associate_contact_id'
          ],
          required: true,
          include: [
            {
            model: BusinessAddress,
            required: true,
            attributes: [
              'business_associate_id',
              'business_address_id'
            ],
            include: [{
              model: BusinessAssociate,
              required: true,
              attributes: [
                'business_name'
              ]
            }]
          }]
        }]
      }]
    });
    return teamsProject.map(instance => instance.dataValues);
  } catch (error){
    throw error;
  }
}
const getTeamsByEntityId = async (problemId) => {
  try {
    const projectIdsArray = await getProjectIdByProblemId(problemId);
    const teams = await getTeams(projectIdsArray);
    return teams;
  } catch (error) {
    throw error;
  }
}

export default {
  getTeamsByEntityId
}