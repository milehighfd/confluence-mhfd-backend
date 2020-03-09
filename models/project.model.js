const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var ProjectSchema = new Schema({
   objectId: Number,
   requestName: String,
   description: String,
   goal: String,
   publicAccess: {
      type: Boolean,
      default: false
   },
   maintenanceEligility: String,
   task: String,
   registerDate: Date,
   cost: Number,
   jurisdiction: String,
   county: String,
   priority: String,
   activated: {
      type: Boolean,
      default: false
   },
   solutionStatus: Number,
   status: String,
   studyStatus: String,
   users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
   }],
   problemType: String,
   mhfdDollarRequest: String,
   mhfdDollarAllocated: Number,
   workPlainYear: Number,
   serviceArea: String,
   additionalCost: Number,
   overheadCost: Number
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;