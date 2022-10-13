const config = require('./config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(config.POSTGRESQL_DB, config.POSTGRESQL_USER, config.POSTGRESQL_PASSWORD, {
  dialect: config.DB_DIALECT,
  host: config.POSTGRESQL_HOST,
  port: config.DB_PORT,
  databaseVersion: '10.50.6000',
  dialectOptions: {
    instancName: 'XXX',
    options:{
      encrypt: false
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

db.user = require('../models/user.model.js')(sequelize, Sequelize);
db.attachment = require('../models/attachment.model.js')(sequelize, Sequelize);
db.logActivity = require('../models/logActivity.model.js')(sequelize, Sequelize);
db.favorites = require('../models/favorites.model.js')(sequelize, Sequelize);
db.board = require('../models/board.model.js')(sequelize, Sequelize);
db.locality = require('../models/locality.model.js')(sequelize, Sequelize);
db.boardProject = require('../models/boardProject.model.js')(sequelize, Sequelize);
db.independentComponent = require('../models/independentComponent.model.js')(sequelize, Sequelize);
db.boardLocality = require('../models/boardLocality.model.js')(sequelize, Sequelize);
db.newnotes = require('../models/newnotes.model.js')(sequelize, Sequelize);
db.color = require('../models/color.model.js')(sequelize, Sequelize);
db.groupnotes = require('../models/groupNotes.model.js')(sequelize, Sequelize);
db.projectStream = require('../models/projectstream.model.js')(sequelize, Sequelize);
db.projectComponent = require('../models/projectComponent.model.js')(sequelize, Sequelize);
db.consultants = require('../models/consultants.model')(sequelize, Sequelize);
db.componentdependency = require('../models/componentDependency.model')(sequelize, Sequelize);
db.configuration = require('../models/configuration.model')(sequelize, Sequelize);
db.codeCostType = require('../models/code_cost_type.model')(sequelize, Sequelize);
db.projectCost = require('../models/project_cost.model')(sequelize, Sequelize);
db.projectStatusActionItemTracking = require('../models/project_status_action_item_tracking.model')(sequelize, Sequelize);
db.codeProjectType = require('../models/code_project_type.model')(sequelize, Sequelize);
db.projectComponent = require('../models/project_component.model')(sequelize, Sequelize);
db.projectStatus = require('../models/project_status.model')(sequelize, Sequelize);
db.codePhaseType = require('../models/code_phase_type.model')(sequelize, Sequelize);
db.stateCounty = require('../models/state_county.model')(sequelize, Sequelize);
db.project = require('../models/project.model')(sequelize, Sequelize);
db.projectDetail = require('../models/project_detail.model')(sequelize, Sequelize);
db.codeStatusType = require('../models/code_status_type.model')(sequelize, Sequelize);
db.codeAcquisitionProgressStatus = require('../models/code_acquisition_progress_status.model')(sequelize, Sequelize);
db.codeMaintenanceElegibilityType = require('../models/code_maintenance_eligibility_type.mode')(sequelize, Sequelize);
db.projectCounty = require('../models/project_county.model')(sequelize, Sequelize);
db.projectPartner = require('../models/project_partner.model')(sequelize, Sequelize);
db.codeProjectPartnerType = require('../models/code_project_partner_type.model')(sequelize, Sequelize);
db.codeStudyReason = require('../models/code_study_reason.model')(sequelize, Sequelize);
db.codeStudySubreason = require('../models/code_study_sub_reason.model')(sequelize, Sequelize);
db.codeServiceArea = require('../models/code_service_area.model')(sequelize, Sequelize);
db.localGovernment = require('../models/local_government.model')(sequelize, Sequelize);
db.project_stream = require('../models/project_stream.model')(sequelize, Sequelize);
db.projectAttachment = require('../models/project_attachment.model')(sequelize, Sequelize);
db.projectLocalGovernment = require('../models/project_local_government.model')(sequelize, Sequelize);
db.stream = require('../models/stream.model')(sequelize, Sequelize);
db.businessAssociateContact = require('../models/business_associate_contact.model')(sequelize, Sequelize);
db.businessAdress = require('../models/business_address.model')(sequelize, Sequelize);
db.businessAssociates = require('../models/business_associates.model')(sequelize, Sequelize); 

db.user.hasMany(db.favorites, {foreignKey: 'user_id'});
db.user.hasMany(db.logActivity, {foreignKey: 'user_id'});
db.user.hasMany(db.color, {foreignKey: 'user_id'});
db.color.belongsTo(db.user, {foreignKey: 'user_id'});
db.newnotes.belongsTo(db.color, {foreignKey: {name: 'color_id', allowNull: true}});
db.color.hasMany(db.newnotes, {foreignKey: {name: 'color_id', allowNull: true}});
db.logActivity.belongsTo(db.user, {foreignKey: 'user_id'});
db.favorites.belongsTo(db.user, {foreignKey: 'user_id'});
db.user.hasMany(db.attachment, {foreignKey: 'user_id'});
db.attachment.belongsTo(db.user, {foreignKey: 'user_id'});
db.user.hasMany(db.newnotes, {foreignKey: 'user_id'});
db.newnotes.belongsTo(db.user, {foreignKey: 'user_id'});
db.newnotes.belongsTo(db.groupnotes, {foreignKey: {name: 'group_id', allowNull: true}});
db.groupnotes.hasMany(db.newnotes, { foreignKey: {name: 'group_id', allowNull: true }});
db.groupnotes.belongsTo(db.user, {foreignKey: 'user_id'});
db.user.hasMany(db.groupnotes, {foreignKey: 'user_id'});

db.sequelize.authenticate().then(()=>{
  console.log("Connected to Database");
}).catch((error)=>{
  console.log("Error" + error);
});

module.exports = db;
