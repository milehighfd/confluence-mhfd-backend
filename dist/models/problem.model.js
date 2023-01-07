"use strict";

var mongoose = require('mongoose');

var _require = require('../lib/enumConstants'),
    Priority = _require.Priority;

var Schema = mongoose.Schema;
var ProblemType = Object.freeze({
  Hydrology: 'hydrology',
  Hydraulics: 'hydraulics',
  Vegetation: 'vegetation',
  Geomorphology: 'geomorphology',
  HumanConnection: 'humanConnection'
});
var Source = Object.freeze({
  MHFDMasterPlan: 'mhfdMasterPlan',
  MHFDStreamAssessment: 'mhfdStreamAssessment',
  LGPlanStudy: 'lgPlanStudy',
  LGInspection: 'lgInspection',
  MHFDInspection: 'mhfdInspection',
  Other: 'other'
});
var ServiceArea = Object.freeze({
  BoulderCreek: 'boulderCreek',
  CherryCreek: 'cherryCreek',
  North: 'north',
  Northeast: 'northeast',
  SandCreek: 'sandCreek',
  South: 'south',
  Southwest: 'southwest',
  West: 'west'
});
var ProblemSchema = new Schema({
  problemName: String,
  description: String,
  problemType: {
    type: String,
    "enum": Object.values(ProblemType)
  },
  problemPriority: {
    type: String,
    "enum": Object.values(Priority)
  },
  source: {
    type: String,
    "enum": Object.values(Source)
  },
  sourceName: String,
  sourceDate: Date,
  solutionCost: Number,
  solutionStatus: Number,
  serviceArea: {
    type: String,
    "enum": Object.values(ServiceArea)
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
var Problem = mongoose.model('Problem', ProblemSchema);
model.exports = Problem;