const mongoose = require('mongoose');
const { PROJECT_STATUS, PROJECT_TYPE, PROJECT_SUBTYPE, GOAL, MAINTENANCE_ELIGIBILITY, SERVICE_AREA, FRECUENCY, RECURRENCE, TASK, PRIORITY } = require('../lib/enumConstants');
const user = require('../models/user.model');

const Schema = mongoose.Schema;

var ProjectSchema = new Schema({
   objectId: Number,
   requestName: String,
   imageName: String,
   projectType: {
      type: String,
      enum: Object.values(PROJECT_TYPE)
   },
   projectSubtype: {
      type: String,
      enum: Object.values(PROJECT_SUBTYPE)
   },
   description: String,
   goal: {
      type: String,
      enum: Object.values(GOAL)
   },
   publicAccess: {
      type: Boolean,
      default: false
   },
   maintenanceEligility: {
      type: String,
      enum: Object.values(MAINTENANCE_ELIGIBILITY)
   },
   tasks: Array,
   recurrence: {
      type: String,
      enum: Object.values(RECURRENCE)
   },
   frecuency: {
      type: String,
      enum: Object.values(FRECUENCY)
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
      enum: Object.values(PROJECT_STATUS)
   },
   workPlanYear: Number,
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
      enum: Object.values(SERVICE_AREA)
   },
   county: String,
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
      enum: Object.values(PRIORITY)
   },
   imageProject: {
      type: Schema.Types.ObjectId,
      ref: 'Attachment'
   },
   listDocuments: {
      type: Array,
      ref: 'Attachment'
   },
   // main image of the project
   mainImage: String,
   // attachments list
   attachList: Array,
   components: Array,
   coordinates: String
   
});

ProjectSchema.virtual("nameCreator")
   .get(function() {
      const user = User.findOne({_id});
      return "usuario de pruebas"
   });

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;