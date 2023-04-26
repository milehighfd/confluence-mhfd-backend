import Sequelize from 'sequelize';
import config from 'bc/config/config.js';
import user from 'bc/models/user.model.js';
import attachment from 'bc/models/attachment.model.js';
import logActivity from 'bc/models/logActivity.model.js';
import favorites from 'bc/models/favorites.model.js';
import ProjectFavorite from 'bc/models/project_favorites.model.js';
import ProblemFavorite from 'bc/models/problem_favorites.model.js';

import board from 'bc/models/board.model.js';
import boardProject from 'bc/models/boardProject.model.js';
import boardLocality from 'bc/models/boardLocality.model.js';
import newnotes from 'bc/models/newnotes.model.js';
import color from 'bc/models/color.model.js';
import groupNotes from 'bc/models/groupNotes.model.js';
import codeRuleActionItem from 'bc/models/code_rule_action_item.model.js';
import projectActionItem from 'bc/models/project_action_item.model.js'
import projectstream from 'bc/models/projectstream.model.js';
import ProjectIndependentAction from 'bc/models/independent_action.model.js';
import consultants from 'bc/models/consultants.model.js';
import componentDependency from 'bc/models/componentDependency.model.js';
import configuration from 'bc/models/configuration.model.js';
import codeCostType from 'bc/models/code_cost_type.model.js';
import projectCost from 'bc/models/project_cost.model.js';
import projectStatusActionItemTracking from 'bc/models/project_status_action_item_tracking.model.js';
import codeProjectType from 'bc/models/code_project_type.model.js';
import projectStatus from 'bc/models/project_status.model.js';
import codePhaseType from 'bc/models/code_phase_type.model.js';
import stateCounty from 'bc/models/state_county.model.js';
import project from 'bc/models/project.model.js';
import projectDetail from 'bc/models/project_detail.model.js';
import codeStatusType from 'bc/models/code_status_type.model.js';
import codeAcquisitionProgressStatus from 'bc/models/code_acquisition_progress_status.model.js';
import codeMaintenanceElegibilityType from 'bc/models/code_maintenance_eligibility_type.mode.js';
import projectCounty from 'bc/models/project_county.model.js';
import projectPartner from 'bc/models/project_partner.model.js';
import codeProjectPartnerType from 'bc/models/code_project_partner_type.model.js';
import codeStudyReason from 'bc/models/code_study_reason.model.js';
import codeServiceArea from 'bc/models/code_service_area.model.js';
import localGovernment from 'bc/models/local_government.model.js';
import project_stream from 'bc/models/project_stream.model.js';
import projectAttachment from 'bc/models/project_attachment.model.js';
import projectLocalGovernment from 'bc/models/project_local_government.model.js';
import projectStaff from 'bc/models/project_staff.model.js';
import mhfdStaff from 'bc/models/mhfd_staff.model.js';
import stream from 'bc/models/stream.model.js';
import businessAssociateContact from 'bc/models/business_associate_contact.model.js';
import businessAdress from 'bc/models/business_address.model.js';
import businessAssociates from 'bc/models/business_associates.model.js';
import codeLocalGoverment from 'bc/models/code_local_government.model.js';
import codeStateCounty from 'bc/models/code_state_county.model.js';
import projectServiceArea from 'bc/models/project_service_area.model.js';
import projectStudy from 'bc/models/projectstudy.model.js';
import study from 'bc/models/study.model.js';
import codeStudyType from 'bc/models/code_study_type.model.js';
import relatedStudy from 'bc/models/related_study.model.js';
import streamStudy from 'bc/models/stream_study.model.js';
import projectProposedAction from 'bc/models/project_proposed_action.model.js';

import gradeControlStructure from 'bc/models/grade_control_structure.model.js';
import pipeAppurtenances from 'bc/models/pipe_appurtenances.model.js';
import specialItemPoint from 'bc/models/special_item_point.model.js';
import specialItemLinear from 'bc/models/special_item_linear.model.js';
import specialItemArea from 'bc/models/special_item_area.model.js';
import channelImprovementsLinear from 'bc/models/channel_improvements_linear.model.js';
import channelImprovementsArea from 'bc/models/channel_improvements_area.model.js';
import removalLine from 'bc/models/removal_line.model.js';
import removalArea from 'bc/models/removal_area.model.js';
import stormDrain from 'bc/models/storm_drain.model.js';
import detentionFacilities from 'bc/models/detention_facilities.model.js';
import maintenanceTrails from 'bc/models/maintenance_trails.model.js';
import landAcquisition from 'bc/models/land_acquisition.model.js';
import landscapingArea from 'bc/models/landscaping_area.model.js'; 


Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  date = this._applyTimezone(date, options);
  return date.format('YYYY-MM-DD HH:mm:ss.SSS');
};

const sequelize = new Sequelize(config.POSTGRESQL_DB, config.POSTGRESQL_USER, config.POSTGRESQL_PASSWORD, {
  dialect: config.DB_DIALECT,
  host: config.POSTGRESQL_HOST,
  port: config.DB_PORT,
  databaseVersion: '10.50.6000',
  dialectOptions: {
    instancName: 'XXX',
    options:{
      encrypt: false,
      validateBulkLoadParameters: false
    }
  },
  pool: {
    max: 150,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  retry: {
    max: 5
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = user(sequelize, Sequelize);
db.attachment = attachment(sequelize, Sequelize);
db.logActivity = logActivity(sequelize, Sequelize);
db.ProjectFavorite = ProjectFavorite(sequelize, Sequelize);
db.problemFavorite = ProblemFavorite(sequelize, Sequelize);
db.board = board(sequelize, Sequelize);
db.boardProject = boardProject(sequelize, Sequelize);
db.boardLocality = boardLocality(sequelize, Sequelize);
db.newnotes = newnotes(sequelize, Sequelize);
db.color = color(sequelize, Sequelize);
db.groupnotes = groupNotes(sequelize, Sequelize);
db.codeRuleActionItem = codeRuleActionItem(sequelize,Sequelize);
db.projectStream = projectstream(sequelize, Sequelize);
db.projectstudy = projectStudy(sequelize, Sequelize);
db.study = study(sequelize, Sequelize);
db.codestudytype = codeStudyType(sequelize, Sequelize);
db.relatedstudy = relatedStudy(sequelize, Sequelize);
db.streamstudy = streamStudy(sequelize, Sequelize);
db.projectProposedAction = projectProposedAction(sequelize, Sequelize);
db.projectIndependentAction = ProjectIndependentAction(sequelize, Sequelize);
db.consultants = consultants(sequelize, Sequelize);
db.componentdependency = componentDependency(sequelize, Sequelize);
db.configuration = configuration(sequelize, Sequelize);
db.codeCostType = codeCostType(sequelize, Sequelize);
db.projectCost = projectCost(sequelize, Sequelize);
db.projectStatusActionItemTracking = projectStatusActionItemTracking(sequelize, Sequelize);
db.codeProjectType = codeProjectType(sequelize, Sequelize);
db.projectStatus = projectStatus(sequelize, Sequelize);
db.codePhaseType = codePhaseType(sequelize, Sequelize);
db.projectActionItem = projectActionItem(sequelize, Sequelize);
db.stateCounty = stateCounty(sequelize, Sequelize);
db.project = project(sequelize, Sequelize);
db.projectDetail = projectDetail(sequelize, Sequelize);
db.codeStatusType = codeStatusType(sequelize, Sequelize);
db.codeAcquisitionProgressStatus = codeAcquisitionProgressStatus(sequelize, Sequelize);
db.codeMaintenanceElegibilityType = codeMaintenanceElegibilityType(sequelize, Sequelize);
db.projectCounty = projectCounty(sequelize, Sequelize);
db.codeStateCounty = codeStateCounty(sequelize, Sequelize);
db.projectPartner = projectPartner(sequelize, Sequelize);
db.codeProjectPartnerType = codeProjectPartnerType(sequelize, Sequelize);
db.codeStudyReason = codeStudyReason(sequelize, Sequelize);
db.codeServiceArea = codeServiceArea(sequelize, Sequelize);
db.codeLocalGoverment = codeLocalGoverment(sequelize, Sequelize);
db.localGovernment = localGovernment(sequelize, Sequelize);
db.project_stream = project_stream(sequelize, Sequelize);
db.projectAttachment = projectAttachment(sequelize, Sequelize);
db.projectLocalGovernment = projectLocalGovernment(sequelize, Sequelize);
db.projectStaff = projectStaff(sequelize, Sequelize);
db.mhfdStaff = mhfdStaff(sequelize, Sequelize);
db.stream = stream(sequelize, Sequelize);
db.businessAssociateContact = businessAssociateContact(sequelize, Sequelize);
db.businessAdress = businessAdress(sequelize, Sequelize);
db.businessAssociates = businessAssociates(sequelize, Sequelize);
db.projectServiceArea = projectServiceArea(sequelize, Sequelize);
// 14 layers called
db.gradeControlStructure = gradeControlStructure(sequelize, Sequelize);
db.pipeAppurtenances = pipeAppurtenances(sequelize, Sequelize);
db.specialItemPoint = specialItemPoint(sequelize, Sequelize);
db.specialItemLinear = specialItemLinear(sequelize, Sequelize);
db.specialItemArea = specialItemArea(sequelize, Sequelize);
db.channelImprovementsLinear = channelImprovementsLinear(sequelize, Sequelize);
db.channelImprovementsArea = channelImprovementsArea(sequelize, Sequelize);
db.removalLine = removalLine(sequelize, Sequelize);
db.removalArea = removalArea(sequelize, Sequelize);
db.stormDrain = stormDrain(sequelize, Sequelize);
db.detentionFacilities = detentionFacilities(sequelize, Sequelize);
db.maintenanceTrails = maintenanceTrails(sequelize, Sequelize);
db.landAcquisition = landAcquisition(sequelize, Sequelize);
db.landscapingArea = landscapingArea(sequelize, Sequelize); 


db.user.hasMany(db.ProjectFavorite, {foreignKey: 'user_id'});
db.user.hasMany(db.problemFavorite, { foreignKey: 'user_id' });
db.user.hasMany(db.logActivity, {foreignKey: 'user_id'});
db.user.hasMany(db.color, {foreignKey: 'user_id'});
db.color.belongsTo(db.user, {foreignKey: 'user_id'});

db.color.hasMany(db.newnotes, {foreignKey: {name: 'color_id', allowNull: true}});
db.newnotes.belongsTo(db.color, {foreignKey: {name: 'color_id', allowNull: true}});

db.logActivity.belongsTo(db.user, {foreignKey: 'user_id'});
db.ProjectFavorite.belongsTo(db.user, {foreignKey: 'user_id'});
db.problemFavorite.belongsTo(db.user, { foreignKey: 'user_id' });
// db.user.hasMany(db.newnotes, {foreignKey: 'user_id'});
db.newnotes.belongsTo(db.user, {foreignKey: 'user_id'});
db.newnotes.belongsTo(db.groupnotes, {foreignKey: {name: 'groupnotes_id', allowNull: true}});
db.groupnotes.hasMany(db.newnotes, { foreignKey: {name: 'groupnotes_id', allowNull: true }});
db.groupnotes.belongsTo(db.user, {foreignKey: 'user_id'});
db.user.hasMany(db.groupnotes, {foreignKey: 'user_id'});
db.user.hasMany(db.mhfdStaff, {foreignKey: {name: 'user_id', allowNull: true}, targetKey: 'user_id'});
db.mhfdStaff.belongsTo(db.user, {foreignKey: {name: 'user_id', allowNull: true}, targetKey: 'user_id'});

db.user.belongsTo(db.businessAssociateContact,{foreignKey: 'business_associate_contact_id'});
db.businessAssociateContact.belongsTo(db.businessAdress,{foreignKey: 'business_address_id'});
db.businessAdress.belongsTo(db.businessAssociates,{foreignKey: 'business_associate_id'});
db.businessAssociates.hasMany(db.businessAdress,{foreignKey: 'business_associate_id'});
db.businessAdress.hasMany(db.businessAssociateContact,{foreignKey: 'business_address_id'});

/*
db.businessAssociates.hasMany(
  db.projectPartner,
  {
    foreignKey: 'business_associates_id'
  }
);
*/

db.codeMaintenanceElegibilityType.belongsTo(
  db.project,
  {
    foreignKey: 'code_maintenance_eligibility_type_id'
  }
);
// db.projectPartner.belongsTo(
//   db.project,
//   {
//     foreignKey: 'project_id'
//   }
// );
// project partner 
db.project.hasMany(db.projectPartner, {foreignKey: 'project_id'});
db.project.hasMany(db.projectPartner, {foreignKey: 'project_id', as: 'currentPartner'});
db.project.hasMany(db.projectPartner, {foreignKey: 'project_id', as: 'currentConsultant'});
db.projectPartner.belongsTo( 
  db.businessAssociates,
  {
    foreignKey: 'business_associates_id',
    targetKey: 'business_associates_id'
  }
);
// project service area
db.project.hasMany(db.projectServiceArea, {foreignKey: 'project_id'});
db.project.hasMany(db.projectServiceArea, {foreignKey: 'project_id', as: 'currentServiceArea'});
db.projectServiceArea.belongsTo(
  db.codeServiceArea,
  { foreignKey: 'code_service_area_id'}
);
 //project county 
 db.project.hasMany(db.projectCounty, {foreignKey: 'project_id'});
 db.project.hasMany(db.projectCounty, {foreignKey: 'project_id', as: 'currentCounty'});
 db.projectCounty.belongsTo(
  db.codeStateCounty,
  { foreignKey: 'state_county_id'}
 );
// project stream

db.project.hasMany(db.project_stream, {foreignKey: 'project_id'});
db.project.hasOne(db.project_stream, {foreignKey: 'project_id', as: 'currentStream'});
db.project_stream.belongsTo(
  db.stream,
  { foreignKey: 'stream_id'}
)
// project localgovernment

db.project.hasMany(db.projectLocalGovernment, {foreignKey: 'project_id'});
db.project.hasMany(db.projectLocalGovernment, {foreignKey: 'project_id', as: 'currentLocalGovernment'});

db.projectLocalGovernment.belongsTo(
  db.codeLocalGoverment,
  { foreignKey: 'code_local_government_id' }
)
// project estimated cost 
db.project.hasMany(db.projectCost, {foreignKey: 'project_id'});
db.projectCost.belongsTo(
  db.codeCostType,
   { foreignKey: 'code_cost_type_id' }
);

// project project-component
db.project.hasMany(db.projectProposedAction, {foreignKey: 'project_id'});
db.projectProposedAction.belongsTo(db.project, {foreignKey: 'project_id'});

// project independent project-component
db.project.hasMany(db.projectIndependentAction, {foreignKey: 'project_id'});
db.projectIndependentAction.belongsTo(db.project, {foreignKey: 'project_id'});


//project project-detail
db.project.hasMany(db.projectDetail, { foreignKey: 'project_id' });

// project project-staff
db.project.hasMany(db.projectStaff, { foreignKey: 'project_id' });
db.project.hasMany(db.projectStaff, { foreignKey: 'project_id' , as: 'currentProjectStaff'});
db.projectStaff.belongsTo(db.mhfdStaff, { foreignKey: 'mhfd_staff_id' });

db.project.hasMany(
  db.projectStatus,
  { foreignKey: 'project_id' }
);
db.project.hasMany(
  db.projectStatus,
  { foreignKey: 'project_status_id',sourceKey: "current_project_status_id",
  as: 'currentId' } 
);


db.projectStatus.belongsTo(
  db.codePhaseType,
  { foreignKey: 'code_phase_type_id' }
);
db.codePhaseType.belongsTo(
  db.codeStatusType,
  { foreignKey: 'code_status_type_id' }
);
db.codePhaseType.belongsTo(
  db.codeProjectType,
  { foreignKey: 'code_project_type_id' }
);
db.project.belongsTo(
  db.codeProjectType,
  { foreignKey: 'code_project_type_id' }
);
db.codePhaseType.hasMany(db.codeRuleActionItem, {foreignKey: 'code_phase_type_id'});
db.codeRuleActionItem.hasMany(db.projectActionItem,{foreignKey: 'code_rule_action_item_id'})

// relation project projectstudy
db.project.hasMany(db.projectstudy, {foreignKey: 'project_id'});
db.projectstudy.belongsTo(db.project, { foreignKey: 'project_id' });

// relation study projectstudy
db.study.hasMany(db.projectstudy, {foreignKey: 'study_id'});
db.projectstudy.belongsTo(db.study, { foreignKey: 'study_id' });

// relation study relatedstudy
db.study.hasMany(db.relatedstudy, {foreignKey: 'study_id'});
db.relatedstudy.belongsTo(db.study, { foreignKey: 'study_id' });

// relation study codestudytype
db.codestudytype.hasMany(db.study, {foreignKey: 'study_type_id'});
db.study.belongsTo(db.codestudytype, {foreignKey: 'study_type_id'});

// relation study codeStudyReason
db.codeStudyReason.hasMany(db.study, {foreignKey: 'code_study_reason_id'});
db.study.belongsTo(db.codeStudyReason, {foreignKey: 'code_study_reason_id'});

// relation streamstudy stream
db.stream.hasMany(db.streamstudy, {foreignKey: 'stream_id'});
db.streamstudy.belongsTo(db.stream, { foreignKey: 'stream_id' })

// relation study streamstudy
db.study.hasMany(db.streamstudy, {foreignKey: 'study_id'});
db.streamstudy.belongsTo(db.study, { foreignKey: 'study_id' });

db.sequelize.authenticate().then(()=>{
  console.log("Connected to Database");
}).catch((error)=>{
  console.log("Error" + error);
});

export default db;
