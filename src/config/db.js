import Sequelize from 'sequelize';
import config from 'bc/config/config.js';
import user from 'bc/models/user.model.js';
import attachment from 'bc/models/attachment.model.js';
import logActivity from 'bc/models/logActivity.model.js';
import favorites from 'bc/models/favorites.model.js';
import ProjectFavorite from 'bc/models/project_favorites.model.js';

import board from 'bc/models/board.model.js';
// import locality from 'bc/models/locality.model.js';
import boardProject from 'bc/models/boardProject.model.js';
import independentComponent from 'bc/models/independentComponent.model.js';
import boardLocality from 'bc/models/boardLocality.model.js';
import newnotes from 'bc/models/newnotes.model.js';
import color from 'bc/models/color.model.js';
import groupNotes from 'bc/models/groupNotes.model.js';
import projectstream from 'bc/models/projectstream.model.js';
import projectComponent from 'bc/models/projectComponent.model.js';
import consultants from 'bc/models/consultants.model.js';
import componentDependency from 'bc/models/componentDependency.model.js';
import configuration from 'bc/models/configuration.model.js';
import codeCostType from 'bc/models/code_cost_type.model.js';
import projectCost from 'bc/models/project_cost.model.js';
import projectStatusActionItemTracking from 'bc/models/project_status_action_item_tracking.model.js';
import codeProjectType from 'bc/models/code_project_type.model.js';
import project_component from 'bc/models/projectComponent.model.js';
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
import codeStudySubreason from 'bc/models/code_study_sub_reason.model.js';
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
// import serviceAreaLocalGovernment from 'bc/models/service_area_local_government.model.js';

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
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = user(sequelize, Sequelize);
db.attachment = attachment(sequelize, Sequelize);
db.logActivity = logActivity(sequelize, Sequelize);
db.ProjectFavorite = ProjectFavorite(sequelize, Sequelize);
db.board = board(sequelize, Sequelize);
// db.locality = locality(sequelize, Sequelize);
db.boardProject = boardProject(sequelize, Sequelize);
//db.independentComponent = independentComponent(sequelize, Sequelize);
db.boardLocality = boardLocality(sequelize, Sequelize);
db.newnotes = newnotes(sequelize, Sequelize);
db.color = color(sequelize, Sequelize);
db.groupnotes = groupNotes(sequelize, Sequelize);
db.projectStream = projectstream(sequelize, Sequelize);
db.projectComponent = projectComponent(sequelize, Sequelize);
db.consultants = consultants(sequelize, Sequelize);
db.componentdependency = componentDependency(sequelize, Sequelize);
db.configuration = configuration(sequelize, Sequelize);
db.codeCostType = codeCostType(sequelize, Sequelize);
db.projectCost = projectCost(sequelize, Sequelize);
db.projectStatusActionItemTracking = projectStatusActionItemTracking(sequelize, Sequelize);
db.codeProjectType = codeProjectType(sequelize, Sequelize);
//db.project_component = project_component(sequelize, Sequelize);
db.projectStatus = projectStatus(sequelize, Sequelize);
db.codePhaseType = codePhaseType(sequelize, Sequelize);
db.stateCounty = stateCounty(sequelize, Sequelize);
db.project = project(sequelize, Sequelize);
db.projectDetail = projectDetail(sequelize, Sequelize);
db.codeStatusType = codeStatusType(sequelize, Sequelize);
db.codeAcquisitionProgressStatus = codeAcquisitionProgressStatus(sequelize, Sequelize);
db.codeMaintenanceElegibilityType = codeMaintenanceElegibilityType(sequelize, Sequelize);
db.projectCounty = projectCounty(sequelize, Sequelize);
db.codeStateCounty = codeStateCounty(sequelize, Sequelize);
// db.project.hasOne(
//   db.projectCounty,
//   { foreignKey: 'project_id' }
// );

db.projectPartner = projectPartner(sequelize, Sequelize);
db.codeProjectPartnerType = codeProjectPartnerType(sequelize, Sequelize);
db.codeStudyReason = codeStudyReason(sequelize, Sequelize);
db.codeStudySubreason = codeStudySubreason(sequelize, Sequelize);

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
// db.serviceAreaLocalGovernment = serviceAreaLocalGovernment(sequelize, Sequelize);
db.projectServiceArea.belongsTo(
  db.project,
  { foreignKey: 'project_id'}
);
db.projectServiceArea.belongsTo(
  db.codeServiceArea,
  { foreignKey: 'code_service_area_id'}
);


db.user.hasMany(db.ProjectFavorite, {foreignKey: 'user_id'});
db.user.hasMany(db.logActivity, {foreignKey: 'user_id'});
db.user.hasMany(db.color, {foreignKey: 'user_id'});
db.color.belongsTo(db.user, {foreignKey: 'user_id'});
db.newnotes.belongsTo(db.color, {foreignKey: {name: 'color_id', allowNull: true}});
db.color.hasMany(db.newnotes, {foreignKey: {name: 'color_id', allowNull: true}});
db.logActivity.belongsTo(db.user, {foreignKey: 'user_id'});
db.ProjectFavorite.belongsTo(db.user, {foreignKey: 'user_id'});
// db.user.hasMany(db.attachment, {foreignKey: 'user_id'});
// db.attachment.belongsTo(db.user, {foreignKey: 'user_id'});
// db.user.hasMany(db.newnotes, {foreignKey: 'user_id'});
db.newnotes.belongsTo(db.user, {foreignKey: 'user_id'});
db.newnotes.belongsTo(db.groupnotes, {foreignKey: {name: 'groupnotes_id', allowNull: true}});
db.groupnotes.hasMany(db.newnotes, { foreignKey: {name: 'groupnotes_id', allowNull: true }});
db.groupnotes.belongsTo(db.user, {foreignKey: 'user_id'});
db.user.hasMany(db.groupnotes, {foreignKey: 'user_id'});

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
db.project.hasMany(db.projectPartner, {foreignKey: 'project_id'});
db.projectPartner.belongsTo( 
  db.businessAssociates,
  {
    foreignKey: 'business_associates_id',
    targetKey: 'business_associates_id'
  }
);
 
db.project.hasOne(
  db.projectStatus,
  { foreignKey: 'project_id' }
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

db.sequelize.authenticate().then(()=>{
  console.log("Connected to Database");
}).catch((error)=>{
  console.log("Error" + error);
});

export default db;
