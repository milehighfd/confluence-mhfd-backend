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
})

var ComponentSchema = new Schema({
   componentName: String,
   typeComponent: {
      type: String,
      enum: Object.values(TypeComponent)
   }
})