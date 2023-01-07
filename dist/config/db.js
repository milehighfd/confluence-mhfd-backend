"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _config = _interopRequireDefault(require("bc/config/config.js"));

var _userModel = _interopRequireDefault(require("bc/models/user.model.js"));

var _attachmentModel = _interopRequireDefault(require("bc/models/attachment.model.js"));

var _logActivityModel = _interopRequireDefault(require("bc/models/logActivity.model.js"));

var _favoritesModel = _interopRequireDefault(require("bc/models/favorites.model.js"));

var _boardModel = _interopRequireDefault(require("bc/models/board.model.js"));

var _boardProjectModel = _interopRequireDefault(require("bc/models/boardProject.model.js"));

var _independentComponentModel = _interopRequireDefault(require("bc/models/independentComponent.model.js"));

var _boardLocalityModel = _interopRequireDefault(require("bc/models/boardLocality.model.js"));

var _newnotesModel = _interopRequireDefault(require("bc/models/newnotes.model.js"));

var _colorModel = _interopRequireDefault(require("bc/models/color.model.js"));

var _groupNotesModel = _interopRequireDefault(require("bc/models/groupNotes.model.js"));

var _projectstreamModel = _interopRequireDefault(require("bc/models/projectstream.model.js"));

var _projectComponentModel = _interopRequireDefault(require("bc/models/projectComponent.model.js"));

var _consultantsModel = _interopRequireDefault(require("bc/models/consultants.model.js"));

var _componentDependencyModel = _interopRequireDefault(require("bc/models/componentDependency.model.js"));

var _configurationModel = _interopRequireDefault(require("bc/models/configuration.model.js"));

var _code_cost_typeModel = _interopRequireDefault(require("bc/models/code_cost_type.model.js"));

var _project_costModel = _interopRequireDefault(require("bc/models/project_cost.model.js"));

var _project_status_action_item_trackingModel = _interopRequireDefault(require("bc/models/project_status_action_item_tracking.model.js"));

var _code_project_typeModel = _interopRequireDefault(require("bc/models/code_project_type.model.js"));

var _project_statusModel = _interopRequireDefault(require("bc/models/project_status.model.js"));

var _code_phase_typeModel = _interopRequireDefault(require("bc/models/code_phase_type.model.js"));

var _state_countyModel = _interopRequireDefault(require("bc/models/state_county.model.js"));

var _projectModel = _interopRequireDefault(require("bc/models/project.model.js"));

var _project_detailModel = _interopRequireDefault(require("bc/models/project_detail.model.js"));

var _code_status_typeModel = _interopRequireDefault(require("bc/models/code_status_type.model.js"));

var _code_acquisition_progress_statusModel = _interopRequireDefault(require("bc/models/code_acquisition_progress_status.model.js"));

var _code_maintenance_eligibility_typeMode = _interopRequireDefault(require("bc/models/code_maintenance_eligibility_type.mode.js"));

var _project_countyModel = _interopRequireDefault(require("bc/models/project_county.model.js"));

var _project_partnerModel = _interopRequireDefault(require("bc/models/project_partner.model.js"));

var _code_project_partner_typeModel = _interopRequireDefault(require("bc/models/code_project_partner_type.model.js"));

var _code_study_reasonModel = _interopRequireDefault(require("bc/models/code_study_reason.model.js"));

var _code_study_sub_reasonModel = _interopRequireDefault(require("bc/models/code_study_sub_reason.model.js"));

var _code_service_areaModel = _interopRequireDefault(require("bc/models/code_service_area.model.js"));

var _local_governmentModel = _interopRequireDefault(require("bc/models/local_government.model.js"));

var _project_streamModel = _interopRequireDefault(require("bc/models/project_stream.model.js"));

var _project_attachmentModel = _interopRequireDefault(require("bc/models/project_attachment.model.js"));

var _project_local_governmentModel = _interopRequireDefault(require("bc/models/project_local_government.model.js"));

var _project_staffModel = _interopRequireDefault(require("bc/models/project_staff.model.js"));

var _mhfd_staffModel = _interopRequireDefault(require("bc/models/mhfd_staff.model.js"));

var _streamModel = _interopRequireDefault(require("bc/models/stream.model.js"));

var _business_associate_contactModel = _interopRequireDefault(require("bc/models/business_associate_contact.model.js"));

var _business_addressModel = _interopRequireDefault(require("bc/models/business_address.model.js"));

var _business_associatesModel = _interopRequireDefault(require("bc/models/business_associates.model.js"));

var _code_local_governmentModel = _interopRequireDefault(require("bc/models/code_local_government.model.js"));

var _code_state_countyModel = _interopRequireDefault(require("bc/models/code_state_county.model.js"));

var _project_service_areaModel = _interopRequireDefault(require("bc/models/project_service_area.model.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// import locality from 'bc/models/locality.model.js';
// import serviceAreaLocalGovernment from 'bc/models/service_area_local_government.model.js';
var sequelize = new _sequelize["default"](_config["default"].POSTGRESQL_DB, _config["default"].POSTGRESQL_USER, _config["default"].POSTGRESQL_PASSWORD, {
  dialect: _config["default"].DB_DIALECT,
  host: _config["default"].POSTGRESQL_HOST,
  port: _config["default"].DB_PORT,
  databaseVersion: '10.50.6000',
  dialectOptions: {
    instancName: 'XXX',
    options: {
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
var db = {};
db.Sequelize = _sequelize["default"];
db.sequelize = sequelize;
db.user = (0, _userModel["default"])(sequelize, _sequelize["default"]);
db.attachment = (0, _attachmentModel["default"])(sequelize, _sequelize["default"]);
db.logActivity = (0, _logActivityModel["default"])(sequelize, _sequelize["default"]);
db.favorites = (0, _favoritesModel["default"])(sequelize, _sequelize["default"]);
db.board = (0, _boardModel["default"])(sequelize, _sequelize["default"]); // db.locality = locality(sequelize, Sequelize);

db.boardProject = (0, _boardProjectModel["default"])(sequelize, _sequelize["default"]); //db.independentComponent = independentComponent(sequelize, Sequelize);

db.boardLocality = (0, _boardLocalityModel["default"])(sequelize, _sequelize["default"]);
db.newnotes = (0, _newnotesModel["default"])(sequelize, _sequelize["default"]);
db.color = (0, _colorModel["default"])(sequelize, _sequelize["default"]);
db.groupnotes = (0, _groupNotesModel["default"])(sequelize, _sequelize["default"]);
db.projectStream = (0, _projectstreamModel["default"])(sequelize, _sequelize["default"]);
db.projectComponent = (0, _projectComponentModel["default"])(sequelize, _sequelize["default"]);
db.consultants = (0, _consultantsModel["default"])(sequelize, _sequelize["default"]);
db.componentdependency = (0, _componentDependencyModel["default"])(sequelize, _sequelize["default"]);
db.configuration = (0, _configurationModel["default"])(sequelize, _sequelize["default"]);
db.codeCostType = (0, _code_cost_typeModel["default"])(sequelize, _sequelize["default"]);
db.projectCost = (0, _project_costModel["default"])(sequelize, _sequelize["default"]);
db.projectStatusActionItemTracking = (0, _project_status_action_item_trackingModel["default"])(sequelize, _sequelize["default"]);
db.codeProjectType = (0, _code_project_typeModel["default"])(sequelize, _sequelize["default"]); //db.project_component = project_component(sequelize, Sequelize);

db.projectStatus = (0, _project_statusModel["default"])(sequelize, _sequelize["default"]);
db.codePhaseType = (0, _code_phase_typeModel["default"])(sequelize, _sequelize["default"]);
db.stateCounty = (0, _state_countyModel["default"])(sequelize, _sequelize["default"]);
db.project = (0, _projectModel["default"])(sequelize, _sequelize["default"]);
db.projectDetail = (0, _project_detailModel["default"])(sequelize, _sequelize["default"]);
db.codeStatusType = (0, _code_status_typeModel["default"])(sequelize, _sequelize["default"]);
db.codeAcquisitionProgressStatus = (0, _code_acquisition_progress_statusModel["default"])(sequelize, _sequelize["default"]);
db.codeMaintenanceElegibilityType = (0, _code_maintenance_eligibility_typeMode["default"])(sequelize, _sequelize["default"]);
db.projectCounty = (0, _project_countyModel["default"])(sequelize, _sequelize["default"]);
db.projectPartner = (0, _project_partnerModel["default"])(sequelize, _sequelize["default"]);
db.codeProjectPartnerType = (0, _code_project_partner_typeModel["default"])(sequelize, _sequelize["default"]);
db.codeStudyReason = (0, _code_study_reasonModel["default"])(sequelize, _sequelize["default"]);
db.codeStudySubreason = (0, _code_study_sub_reasonModel["default"])(sequelize, _sequelize["default"]);
db.codeServiceArea = (0, _code_service_areaModel["default"])(sequelize, _sequelize["default"]);
db.codeLocalGoverment = (0, _code_local_governmentModel["default"])(sequelize, _sequelize["default"]);
db.codeStateCounty = (0, _code_state_countyModel["default"])(sequelize, _sequelize["default"]);
db.localGovernment = (0, _local_governmentModel["default"])(sequelize, _sequelize["default"]);
db.project_stream = (0, _project_streamModel["default"])(sequelize, _sequelize["default"]);
db.projectAttachment = (0, _project_attachmentModel["default"])(sequelize, _sequelize["default"]);
db.projectLocalGovernment = (0, _project_local_governmentModel["default"])(sequelize, _sequelize["default"]);
db.projectStaff = (0, _project_staffModel["default"])(sequelize, _sequelize["default"]);
db.mhfdStaff = (0, _mhfd_staffModel["default"])(sequelize, _sequelize["default"]);
db.stream = (0, _streamModel["default"])(sequelize, _sequelize["default"]);
db.businessAssociateContact = (0, _business_associate_contactModel["default"])(sequelize, _sequelize["default"]);
db.businessAdress = (0, _business_addressModel["default"])(sequelize, _sequelize["default"]);
db.businessAssociates = (0, _business_associatesModel["default"])(sequelize, _sequelize["default"]);
db.projectServiceArea = (0, _project_service_areaModel["default"])(sequelize, _sequelize["default"]); // db.serviceAreaLocalGovernment = serviceAreaLocalGovernment(sequelize, Sequelize);

db.projectServiceArea.belongsTo(db.project, {
  foreignKey: 'project_id'
}); // db.projectServiceArea.belongsTo(
// )
// db.user.hasMany(db.favorites, {foreignKey: 'user_id'});
// db.user.hasMany(db.logActivity, {foreignKey: 'user_id'});
// db.user.hasMany(db.color, {foreignKey: 'user_id'});
// db.color.belongsTo(db.user, {foreignKey: 'user_id'});

db.newnotes.belongsTo(db.color, {
  foreignKey: {
    name: 'color_id',
    allowNull: true
  }
});
db.color.hasMany(db.newnotes, {
  foreignKey: {
    name: 'color_id',
    allowNull: true
  }
}); // db.logActivity.belongsTo(db.user, {foreignKey: 'user_id'});
// db.favorites.belongsTo(db.user, {foreignKey: 'user_id'});
// db.user.hasMany(db.attachment, {foreignKey: 'user_id'});
// db.attachment.belongsTo(db.user, {foreignKey: 'user_id'});
// db.user.hasMany(db.newnotes, {foreignKey: 'user_id'});
// db.newnotes.belongsTo(db.user, {foreignKey: 'user_id'});

db.newnotes.belongsTo(db.groupnotes, {
  foreignKey: {
    name: 'group_id',
    allowNull: true
  }
});
db.groupnotes.hasMany(db.newnotes, {
  foreignKey: {
    name: 'group_id',
    allowNull: true
  }
}); // db.groupnotes.belongsTo(db.user, {foreignKey: 'user_id'});
// db.user.hasMany(db.groupnotes, {foreignKey: 'user_id'});

/*
db.businessAssociates.hasMany(
  db.projectPartner,
  {
    foreignKey: 'business_associates_id'
  }
);
*/

db.codeMaintenanceElegibilityType.belongsTo(db.project, {
  foreignKey: 'code_maintenance_eligibility_type_id'
});
/*
db.projectPartner.belongsTo(
  db.project,
  {
    foreignKey: 'project_id'
  }
);
*/

db.projectPartner.belongsTo(db.businessAssociates, {
  foreignKey: 'business_associates_id',
  targetKey: 'business_associates_id'
});
db.project.hasOne(db.projectStatus, {
  foreignKey: 'project_id'
});
db.projectStatus.belongsTo(db.codePhaseType, {
  foreignKey: 'code_phase_type_id'
});
db.codePhaseType.belongsTo(db.codeStatusType, {
  foreignKey: 'code_status_type_id'
});
db.codePhaseType.belongsTo(db.codeProjectType, {
  foreignKey: 'code_project_type_id'
});
db.sequelize.authenticate().then(function () {
  console.log("Connected to Database");
})["catch"](function (error) {
  console.log("Error" + error);
});
var _default = db;
exports["default"] = _default;