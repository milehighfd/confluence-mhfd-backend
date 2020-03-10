const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TypeComponent = Object.freeze({
   GradeControlStructure: 'gradeControlStructure',
   PipeAppurtenances: 'PipeAppurtenances',
   SpecialItemPoint: 'specialItemPoint',
   SpecialItemLinear: 'specialItemLinear',
   SpecialItemArea: 'specialItemArea',
   ChannelImprovementsLinear: 'channelImprovementsLinear',
   ChannelImprovementsArea: 'channelImprovementsArea',
   RemovalLine: 'removalLine',
   RemovalArea: 'removalArea',
   StormDrain: 'stormDrain',
   DetentionFacilities: 'detentionFacilities',
   LandAcquisition: 'landAcquisition'
});

const HowCost = Object.freeze({
   SWIFT: 'swift',
   PreviousStudy: 'previousStudy',
   Other: 'other'
});

const Status = Object.freeze({
   Approved: 'approved',
   Active: 'active',
   None: 'none',
   Complete: 'complete'
});

const MitigationType = Object.freeze({
   IncreasedConveyanceCrossing: 'increasedConveyanceCrossing',
   IncreasedConveyanceStream: 'increasedConveyanceStream',
   IncreasedConveyancePipe: 'increasedConveyancePipe',
   FlowReduction: 'flowReduction',
   StabilizationVertical: 'stabilizationVertical',
   StabilizationLateral: 'stabilizationLateral',
   Acquisition: 'acquisition',
   StreamRestoration: 'streamRestoration',
   StreamManagementCorridor: 'streamManagementCorridor'
});

var ComponentSchema = new Schema({
   componentName: String,
   typeComponent: {
      type: String,
      enum: Object.values(TypeComponent)
   },
   studyName: String,
   yearStudy: Number,
   estimatedCost: Number,
   howCost: {
      type: String,
      enum: Object.values(HowCost)
   },
   status: {
      type: String,
      enum: Object.values(Status)
   },
   mitigationType: {
      type: String,
      enum: Object.values(MitigationType)
   },
   jurisdiction: String,
   county: String,
   mhfdManager: String,
   serviceArea: String,
   streamName: String,
   mhfdCode: String,
   legacyCode: String,
   problemId: [{
      type: Schema.Types.ObjectId,
      ref: 'Problem'
   }],
   projectId: [{
      type: Schema.Types.ObjectId,
      ref: 'Project'
   }],
});

const Component = mongoose.model('Component', ComponentSchema);

model.exports = Component;