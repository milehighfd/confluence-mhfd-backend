module.exports.ProjectStatus = Object.freeze({
   Draft: 'Draft',
   Requested: 'Requested',
   Approved: 'Approved',
   Idle: 'Idle',
   Initiated: 'Initiated',
   PrelimDesign: 'PrelimDesign',
   Construction: 'construction',
   FinalDesign: 'finalDesign'
});

module.exports.ProjectType = Object.freeze({ 
   Capital: 'capital',
   Maintenance: 'maintenance',
   Study: 'study',
   PropertyAcquisition: 'propertyAcquisition',
   Special: 'special'
});

module.exports.ProjectSubtype = Object.freeze({
   DebrisManagement: 'debrisManagement',
   VegetationManagement: 'vegetationManagement',
   MinorRepairs: 'minorRepairs',
   SedimentRemoval: 'sedimentRemoval',
   Restoration: 'restoration',

   MasterPlan: 'masterPlan',
   FHAD: 'fhad'
});

module.exports.ServiceArea = Object.freeze({
   BoulderCreek: 'boulderCreek',
   CherryCreek: 'cherryCreek',
   North: 'north',
   Northeast: 'northeast',
   SandCreek: 'sandCreek',
   South: 'south',
   Southwest: 'southwest',
   West: 'west'
});

module.exports.Goal = Object.freeze({
   ReducefloodriskStructures: 'Reduce flood risk to Structures',
   StreamBankBedStabilization: 'Stream Bank Bed Stabilization',
   CreateSharedusePathsRecreation: 'Create shared-use paths and recreation',
   VegetationEnhancements: 'Vegetation Enhancements',
   IncludepermanentWaterQuality: 'Include permanent water Quality BMP',

   ReduceFloodRiskStructures: 'reduceFloodRiskStructures',
   Stabilization: 'stabilization',
   EliminateRoadwayOvertopping: 'eliminateRoadwayOvertopping',
   IncreasedConveyance: 'increasedConveyance',
   PeakFlowReduction: 'peakFlowReduction',
   WaterQuality: 'waterQuality',
   GuideDevelopment: 'guideDevelopment'
});

module.exports.GoalCapital = Object.freeze({
   ReducefloodriskStructures: 'Reduce flood risk to Structures',
   StreamBankBedStabilization: 'Stream Bank Bed Stabilization',
   CreateSharedusePathsRecreation: 'Create shared-use paths and recreation',
   VegetationEnhancements: 'Vegetation Enhancements',
   IncludepermanentWaterQuality: 'Include permanent water Quality BMP',
});

module.exports.GoalStudy = Object.freeze({
   ReduceFloodRiskStructures: 'Reduce flood risk to Structures',
   Stabilization: 'Stabilization',
   EliminateRoadwayOvertopping: 'Eliminate roadway overtopping',
   IncreasedConveyance: 'Increased Conveyance',
   PeakFlowReduction: 'Peak flow reduction',
   WaterQuality: 'Water Quality',
   GuideDevelopment: 'Guide Development'
});

module.exports.MaintenanceEligibility = Object.freeze({
   CapitalProject: 'Capital Project',
   MEP: 'MEP',
   Grandfathered: 'Grandfathered',
   NotEligible: 'Not Eligible',
   IdontKnow: 'I dont know'
});

module.exports.Frequency = Object.freeze({
   CyclePerYear: 'Cycle per year'
});

module.exports.Recurrence = Object.freeze({
   OneTime: 'One time',
   Annually: 'Annually',
   Multiple: 'Multiple'
});

module.exports.Task = Object.freeze({
   SedimentRemoval: 'Sediment removal',
   TreeThinning: 'Tree thinning',
   BankStabilization: 'Bank stabilization',
   DrainageStructure: 'Drainage structure',
   RegionalDetention: 'regionalDetention'
});