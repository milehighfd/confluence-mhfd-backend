const mongoose = require('mongoose');
const { ProjectStatus, ProjectType, ProjectSubtype, Goal, MaintenanceEligibility, ServiceArea, Frequency, Recurrence, Task, Priority } = require('../lib/enumConstants');
const user = require('../models/user.model');

const Schema = mongoose.Schema;

const County = Object.freeze({
   Arapahoe: 'arapahoe',
   Adams: 'adams',
   Boulder: 'boulder',
   Broomfield: 'broomfield',
   Denver: 'denver',
   Douglas: 'douglas',
   Jefferson: 'jefferson'
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
      enum: Object.values(Frequency)
   },
   sponsor: String,
   coSponsor: String,
   additionalCost: Number,
   additionalCostDescription: String,
   overheadCost: Number,
   estimatedCost: Number,
   mhfdFundingRequest: String,
   requestFundingYear: String,
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
   },
   priority: {
      type: String,
      enum: Object.values(Priority)
   },
});

ProjectSchema.virtual("nameCreator")
   .get(function() {
      const user = User.findOne({_id});
      console.log(user);
      return "usuario de pruebas"
   });

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;