"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TASK = exports.SERVICE_AREA = exports.ROLES = exports.RECURRENCE = exports.PROJECT_TYPES_AND_NAME = exports.PROJECT_TYPE = exports.PROJECT_SUBTYPE = exports.PROJECT_STATUS = exports.PRIORITY = exports.MAINTENANCE_ELIGIBILITY = exports.GOAL_STUDY = exports.GOAL_CAPITAL = exports.GOAL = exports.FRECUENCY = exports.FIELDS = exports.EMAIL_VALIDATOR = exports.ACTIVITY_TYPE = void 0;
var PROJECT_STATUS = Object.freeze({
  DRAFT: 'draft',
  REQUEST: 'requested',
  APPROVED: 'approved',
  IDLE: 'idle',
  INITIATED: 'initiated',
  PRELIM_DESIGN: 'prelimDesign',
  CONSTRUCTION: 'construction',
  FINAL_DESIGN: 'finalDesign'
});
exports.PROJECT_STATUS = PROJECT_STATUS;
var PROJECT_TYPE = Object.freeze({
  CAPITAL: 'capital',
  MAINTENANCE: 'maintenance',
  STUDY: 'study',
  PROPERTY_ACQUISITION: 'propertyAcquisition',
  SPECIAL: 'special'
});
exports.PROJECT_TYPE = PROJECT_TYPE;
var PROJECT_SUBTYPE = Object.freeze({
  DEBRIS_MANAGEMENT: 'debrisManagement',
  VEGETATION_MANAGEMENT: 'vegetationManagement',
  MINOR_REPAIRS: 'minorRepairs',
  SEDIMENT_REMOVAL: 'sedimentRemoval',
  RESTORATION: 'restoration',
  MASTER_PLAN: 'masterPlan',
  FHAD: 'fhad'
});
exports.PROJECT_SUBTYPE = PROJECT_SUBTYPE;
var SERVICE_AREA = Object.freeze({
  BOULDER_CREEK: 'boulderCreek',
  CHERRY_CREEK: 'cherryCreek',
  NORTH: 'north',
  NORTHEAST: 'northeast',
  SAND_CREEK: 'sandCreek',
  SOUTH: 'south',
  SOUTH_WEST: 'southwest',
  WEST: 'west'
});
exports.SERVICE_AREA = SERVICE_AREA;
var GOAL = Object.freeze({
  REDUCE_FLOOD_RISK_STRUCTURES: 'reduceFloodRiskStructures',
  STREAM_BANK_BED_STABILIZATION: 'streamBankBedStabilization',
  CREATE_SHAREDUSE_PATH_RECREATION: 'createSharedUsePathsRecreation',
  VEGETATION_ENHACEMENTS: 'vegetationEnhancements',
  INCLUDE_PERMANENT_WATER_QUALITY: 'includePermanentWaterQualityBMP',
  //ReduceFloodRiskStructures: 'reduceFloodRiskStructures',
  STABILIZATION: 'stabilization',
  ELIMINATE_ROADWAY_OVERTOPPONG: 'eliminateRoadwayOvertopping',
  INCREASED_CONVEYANCE: 'increasedConveyance',
  PEAK_FLOW_REDUCTION: 'peakFlowReduction',
  WATER_QUALITY: 'waterQuality',
  GUIDE_DEVELOPMENT: 'guideDevelopment'
});
exports.GOAL = GOAL;
var GOAL_CAPITAL = Object.freeze({
  REDUCE_FLOOD_RISK_STRUCTURES: 'reduceFloodRiskStructures',
  STREAM_BANK_BED_STABILIZATION: 'streamBankBedStabilization',
  CREATE_SHAREDUSE_PATH_RECREATION: 'createSharedUsePathsRecreation',
  VEGETATION_ENHACEMENTS: 'vegetationEnhancements',
  INCLUDE_PERMANENT_WATER_QUALITY: 'includePermanentWaterQualityBMP'
});
exports.GOAL_CAPITAL = GOAL_CAPITAL;
var GOAL_STUDY = Object.freeze({
  REDUCE_FLOOD_RISK_STRUCTURES: 'reduceFloodRiskStructures',
  STABILIZATION: 'stabilization',
  ELIMINATE_ROADWAY_OVERTOPPONG: 'eliminateRoadwayOvertopping',
  INCREASED_CONVEYANCE: 'increasedConveyance',
  PEAK_FLOW_REDUCTION: 'peakFlowReduction',
  WATER_QUALITY: 'waterQuality',
  GUIDE_DEVELOPMENT: 'guideDevelopment'
});
exports.GOAL_STUDY = GOAL_STUDY;
var MAINTENANCE_ELIGIBILITY = Object.freeze({
  CAPITAL_PROJECT: 'capitalProject',
  MEP: 'MEP',
  GRANDFATHERED: 'grandfathered',
  NOT_ELIGIBLE: 'notEligible',
  I_DONT_KNOW: 'iDontKnow'
});
exports.MAINTENANCE_ELIGIBILITY = MAINTENANCE_ELIGIBILITY;
var FRECUENCY = Object.freeze({
  CYCLE_PER_YEAR: 'cyclePerYear'
});
exports.FRECUENCY = FRECUENCY;
var RECURRENCE = Object.freeze({
  ONE_TIME: 'oneTime',
  ANNUALLY: 'annually',
  MULTIPLE: 'multiple'
});
exports.RECURRENCE = RECURRENCE;
var TASK = Object.freeze({
  SEDIMENT_REMOVAL: 'sedimentRemoval',
  TREE_THINNING: 'treeThinning',
  BANK_STABILIZATION: 'bankStabilization',
  DRAINAGE_STRUCTURE: 'drainageStructure',
  REGIONAL_DETENTION: 'regionalDetention'
});
exports.TASK = TASK;
var PRIORITY = Object.freeze({
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
});
exports.PRIORITY = PRIORITY;
var ROLES = Object.freeze({
  MFHD_ADMIN: 'admin',
  MFHD_STAFF: 'staff',
  GOVERNMENT_ADMIN: 'government_admin',
  GOVERNMENT_STAFF: 'government_staff',
  CONSULTANT: 'consultant',
  OTHER: 'other',
  GUEST: 'guest'
});
exports.ROLES = ROLES;
var ACTIVITY_TYPE = Object.freeze({
  USER_LOGIN: 'user_login'
});
exports.ACTIVITY_TYPE = ACTIVITY_TYPE;
var FIELDS = Object.freeze({
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  DESIGNATION: 'designation',
  EMAIL: 'email',
  ORGANIZATION: 'organization',
  PASSWORD: 'password',
  CITY: 'city',
  COUNTY: 'county',
  SERVICE_AREA: 'serviceArea',
  REQUEST_NAME: 'requestName',
  ESTIMATED_COST: 'estimatedCost',
  MHFD_DOLLAR_REQUEST: 'mhfdDollarRequest',
  MHFD_DOLLAR_ALLOCATED: 'mhfdDollarAllocated',
  CAPITAL_STATUS: 'capitalStatus',
  PHONE: 'phone',
  TITLE: 'title',
  ZOOM_AREA: 'zoomarea'
});
exports.FIELDS = FIELDS;
var EMAIL_VALIDATOR = /[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[a-zA-Z0-9]{2,}/;
exports.EMAIL_VALIDATOR = EMAIL_VALIDATOR;
var PROJECT_TYPES_AND_NAME = [{
  name: 'Capital',
  id: 'capital'
}, {
  name: 'Maintenance',
  id: 'maintenance'
}, {
  name: 'Study',
  id: 'study'
}, {
  name: 'Property Acquisition',
  id: 'propertyAcquisition'
}, {
  name: 'Special',
  id: 'special'
}];
exports.PROJECT_TYPES_AND_NAME = PROJECT_TYPES_AND_NAME;