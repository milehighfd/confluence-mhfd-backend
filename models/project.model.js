const mongoose = require('mongoose');
const { ProjectStatus, ProjectType, ProjectSubtype, ServiceArea } = require('../lib/enumConstants');
const user = require('../models/user.model');

const Schema = mongoose.Schema;

// const ProjectType = Object.freeze({ 
//    Capital: 'capital',
//    Maintenance: 'maintenance',
//    Study: 'study',
//    PropertyAcquisition: 'propertyAcquisition',
//    Special: 'special'
// });

// const ProjectSubtype = Object.freeze({
//    DebrisManagement: 'debrisManagement',
//    VegetationManagement: 'vegetationManagement',
//    MinorRepairs: 'minorRepairs',
//    SedimentRemoval: 'sedimentRemoval',
//    Restoration: 'restoration',

//    MasterPlan: 'masterPlan',
//    FHAD: 'fhad'
// });

const Goal = Object.freeze({
   ReducefloodriskStructures: 'ReducefloodriskStructures',
   StreamBankBedStabilization: 'streamBankBedStabilization',
   CreateSharedusePathsRecreation: 'createSharedusePathsRecreation',
   VegetationEnhancements: 'vegetationEnhancements',
   IncludepermanentWaterQuality: 'includepermanentWaterQuality',

   ReduceFloodRiskStructures: 'reduceFloodRiskStructures',
   Stabilization: 'stabilization',
   EliminateRoadwayOvertopping: 'eliminateRoadwayOvertopping',
   IncreasedConveyance: 'increasedConveyance',
   PeakFlowReduction: 'peakFlowReduction',
   WaterQuality: 'waterQuality',
   GuideDevelopment: 'guideDevelopment'
});

const MaintenanceEligibility = Object.freeze({
   CapitalProject: 'capitalProject',
   MEP: 'mep',
   Grandfathered: 'grandfathered',
   NotEligible: 'notEligible',
   IdontKnow: 'idontKnow'
});

const Task = Object.freeze({
   SedimentRemoval: 'sedimentRemoval',
   TreeThinning: 'treeThinning',
   BankStabilization: 'bankStabilization',
   DrainageStructure: 'drainageStructure',
   RegionalDetention: 'regionalDetention'
});

const Recurrence = Object.freeze({
   OneTime: 'oneTime',
   Annually: 'annually',
   Multiple: 'multiple'
});

// const ProjectStatus = Object.freeze({
//    Draft: 'draft',
//    Requested: 'requested',
//    Approved: 'approved',
//    Idle: 'idle',
//    Initiated: 'initiated',
//    PrelimDesign: 'prelimDesign',
//    Construction: 'construction',
//    FinalDesign: 'finalDesign'
// });

// const ServiceArea = Object.freeze({
//    BoulderCreek: 'boulderCreek',
//    CherryCreek: 'cherryCreek',
//    North: 'north',
//    Northeast: 'northeast',
//    SandCreek: 'sandCreek',
//    South: 'south',
//    Southwest: 'southwest',
//    West: 'west'
// });

const County = Object.freeze({
   Arapahoe: 'arapahoe',
   Adams: 'adams',
   Boulder: 'boulder',
   Broomfield: 'broomfield',
   Denver: 'denver',
   Douglas: 'douglas',
   Jefferson: 'jefferson'
});

const Frecuency = Object.freeze({
   CyclePerYear: 'cyclePerYear'
});

var ProjectSchema = new Schema({
   objectId: Number,
   requestName: String,
   projectType: {
      type: String,
      enum: Object.values(ProjectType)
   },
   projectSubType: {
      type: String,
      enum: Object.values(ProjectSubtype)
   },
   description: String,
   goal: {
      type: String,
      enum: Object.values(Goal)
   },
   publicAccess: {
      type: Boolean,
      default: false
   },
   maintenanceEligility: {
      type: String,
      enum: Object.values(MaintenanceEligibility)
   },
   task: {
      type: String,
      enum: Object.values(Task)
   },
   recurrence: {
      type: String,
      enum: Object.values(Recurrence)
   },
   frecuency: {
      type: String,
      enum: Object.values(Frecuency)
   },
   sponsor: String,
   coSponsor: String,
   additionalCost: Number,
   additionalCostDescription: String,
   overheadCost: Number,
   estimatedCost: Number,
   mhfdDollarRequest: Number,
   localDollarsContributed: Number,
   requestedStartyear: Number,
   requestedRank: Number,
   onbaseId: String,
   projectName: String,
   status: {
      type: String,
      enum: Object.values(ProjectStatus)
   },
   workPlainYear: Number,
   mhfdDollarAllocated: Number,
   finalCost: Number,
   startYear: Number,
   completedYear: Number,
   consultant: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
   }],
   contractor: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
   }],
   localGovernmentManager: String,
   mhfdManager: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
   }],
   serviceArea: {
      type: String,
      enum: Object.values(ServiceArea)
   },
   county: {
      type: String,
      enum: Object.values(County)
   },
   jurisdiction: String,
   streamName: String,
   mhfdCode: String,
   legacyCode: String,
   creator: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
   }],
   dateCreated: Date,
   lastModifiedUser: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
   }],
   lastModifiedDate: Date,
   image: {
      data: Buffer, contentType: String
   }
});

ProjectSchema.virtual("nameCreator")
   .get(function() {
      const user = User.findOne({_id});
      console.log(user);
      return "usuario de pruebas"
   });

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;