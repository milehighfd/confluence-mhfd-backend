module.exports.PROJECT_STATUS = Object.freeze({
   DRAFT: 'draft',
   REQUEST: 'requested',
   APPROVED: 'approved',
   IDLE: 'idle',
   INITIATED: 'initiated',
   PRELIM_DESIGN: 'prelimDesign',
   CONSTRUCTION: 'construction',
   FINAL_DESIGN: 'finalDesign'
});

module.exports.PROJECT_TYPE = Object.freeze({ 
   CAPITAL: 'capital',
   MAINTENANCE: 'maintenance',
   STUDY: 'study',
   PROPERTY_ACQUISITION: 'propertyAcquisition',
   SPECIAL: 'special'
});

module.exports.PROJECT_SUBTYPE = Object.freeze({
   DEBRIS_MANAGEMENT: 'debrisManagement',
   VEGETATION_MANAGEMENT: 'vegetationManagement',
   MINOR_REPAIRS: 'minorRepairs',
   SEDIMENT_REMOVAL: 'sedimentRemoval',
   RESTORATION: 'restoration',

   MASTER_PLAN: 'masterPlan',
   FHAD: 'fhad'
});

module.exports.SERVICE_AREA = Object.freeze({
   BOULDER_CREEK: 'boulderCreek',
   CHERRY_CREEK: 'cherryCreek',
   NORTH: 'north',
   NORTHEAST: 'northeast',
   SAND_CREEK: 'sandCreek',
   SOUTH: 'south',
   SOUTH_WEST: 'southwest',
   WEST: 'west'
});

module.exports.GOAL = Object.freeze({
   REDUCE_FLOOD_RISK_STRUCTURES: 'reduceFloodRiskStructures',
   STREAM_BANK_BED_STABILIZATION: 'streamBankBedStabilization',
   CREATE_SHAREDUSE_PATH_RECREATION: 'createSharedUsePathsRecreation',
   VEGETATION_ENHACEMENTS: 'vegetationEnhancements',
   INCLUDE_PERMANENT_WATER_QUALITY: 'includePermanentWaterQualityBMP',

   //ReduceFloodRiskStructures: 'reduceFloodRiskStructures',
   STABILIZATION: 'stabilization',
   ELIMINATE_ROADWAY_OVERTOPPONG: 'eliminateRoadwayOvertopping',
   INCREASED_CONVEYANCE: 'increasedConveyance',
   PEAK_FLOW_REDUCTION: 'peakFlowReduction',
   WATER_QUALITY: 'waterQuality',
   GUIDE_DEVELOPMENT: 'guideDevelopment'
});

module.exports.GOAL_CAPITAL = Object.freeze({
   REDUCE_FLOOD_RISK_STRUCTURES: 'reduceFloodRiskStructures',
   STREAM_BANK_BED_STABILIZATION: 'streamBankBedStabilization',
   CREATE_SHAREDUSE_PATH_RECREATION: 'createSharedUsePathsRecreation',
   VEGETATION_ENHACEMENTS: 'vegetationEnhancements',
   INCLUDE_PERMANENT_WATER_QUALITY: 'includePermanentWaterQualityBMP',
});

module.exports.GOAL_STUDY = Object.freeze({
   REDUCE_FLOOD_RISK_STRUCTURES: 'reduceFloodRiskStructures',
   STABILIZATION: 'stabilization',
   ELIMINATE_ROADWAY_OVERTOPPONG: 'eliminateRoadwayOvertopping',
   INCREASED_CONVEYANCE: 'increasedConveyance',
   PEAK_FLOW_REDUCTION: 'peakFlowReduction',
   WATER_QUALITY: 'waterQuality',
   GUIDE_DEVELOPMENT: 'guideDevelopment'
});

module.exports.MAINTENANCE_ELIGIBILITY = Object.freeze({
   CAPITAL_PROJECT: 'capitalProject',
   MEP: 'MEP',
   GRANDFATHERED: 'grandfathered',
   NOT_ELIGIBLE: 'notEligible',
   I_DONT_KNOW: 'iDontKnow'
});

module.exports.FRECUENCY = Object.freeze({
   CYCLE_PER_YEAR: 'cyclePerYear'
});

module.exports.RECURRENCE = Object.freeze({
   ONE_TIME: 'oneTime',
   ANNUALLY: 'annually',
   MULTIPLE: 'multiple'
});

module.exports.TASK = Object.freeze({
   SEDIMENT_REMOVAL: 'sedimentRemoval',
   TREE_THINNING: 'treeThinning',
   BANK_STABILIZATION: 'bankStabilization',
   DRAINAGE_STRUCTURE: 'drainageStructure',
   REGIONAL_DETENTION: 'regionalDetention'
});

module.exports.PRIORITY = Object.freeze({
   HIGH: 'high',
   MEDIUM: 'medium',
   LOW: 'low'
});

 module.exports.ROLES = Object.freeze({
    MFHD_ADMIN: 'admin',
    MFHD_STAFF: 'staff',
    GOVERNMENT_ADMIN: 'government_admin',
    GOVERNMENT_STAFF: 'government_staff',
    CONSULTANT: 'consultant',
    OTHER: 'other',
    GUEST: 'guest'
 });

 module.exports.FIELDS = Object.freeze({
   FIRST_NAME: 'firstName',
   LAST_NAME: 'lastName',
   DESIGNATION: 'designation',
   EMAIL: 'email',
   ORGANIZATION: 'organization',
   PASSWORD: 'password',
   CITY: 'city', 
   COUNTY: 'county',
   SERVICE_AREA: 'serviceArea'
 });
