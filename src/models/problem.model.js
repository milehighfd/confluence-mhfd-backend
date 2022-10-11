const mongoose = require('mongoose');
const { Priority } = require('../lib/enumConstants');

const Schema = mongoose.Schema;

const ProblemType = Object.freeze({
   Hydrology: 'hydrology',
   Hydraulics: 'hydraulics',
   Vegetation: 'vegetation',
   Geomorphology: 'geomorphology',
   HumanConnection: 'humanConnection'
});

const Source = Object.freeze({
   MHFDMasterPlan: 'mhfdMasterPlan',
   MHFDStreamAssessment: 'mhfdStreamAssessment',
   LGPlanStudy: 'lgPlanStudy',
   LGInspection: 'lgInspection',
   MHFDInspection: 'mhfdInspection',
   Other: 'other'
});

const ServiceArea = Object.freeze({
   BoulderCreek: 'boulderCreek',
   CherryCreek: 'cherryCreek',
   North: 'north',
   Northeast: 'northeast',
   SandCreek: 'sandCreek',
   South: 'south',
   Southwest: 'southwest',
   West: 'west'
})

var ProblemSchema = new Schema({
   problemName: String,
   description: String,
   problemType: {
      type: String,
      enum: Object.values(ProblemType)
   },
   problemPriority: {
      type: String,
      enum: Object.values(Priority)
   },
   source: {
      type: String,
      enum: Object.values(Source)
   },
   sourceName: String,
   sourceDate: Date,
   solutionCost: Number,
   solutionStatus: Number,
   serviceArea: {
      type: String,
      enum: Object.values(ServiceArea)
   },
   county: String,
   jurisdiction: String,
   streamName: String,
   MHFDCode: mhdfCode,
   LegacyCode: String,
   projects: [{
      type: Schema.Types.ObjectId,
      ref: 'Project'
   }]
});

const Problem = mongoose.model('Problem', ProblemSchema);

model.exports = Problem;
