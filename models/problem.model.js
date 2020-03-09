const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProblemType = Object.freeze({
   Hydrology: 'hydrology',
   Hydraulics: 'hydraulics',
   Vegetation: 'vegetation',
   Geomorphology: 'geomorphology',
   HumanConnection: 'humanConnection'
});

const ProblemPriority = Object.freeze({
   High: 'high',
   Medium: 'medium',
   Low: 'low'
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
      enum: Object.values(ProblemPriority)
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
   LegacyCode: String
});

const Problem = mongoose.model('Problem', ProblemSchema);

model.exports = Problem;
