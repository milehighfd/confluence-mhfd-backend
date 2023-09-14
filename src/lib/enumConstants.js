export const PROJECT_STATUS = Object.freeze({
   DRAFT: 'draft',
   REQUEST: 'requested',
   APPROVED: 'approved',
   IDLE: 'idle',
   INITIATED: 'initiated',
   PRELIM_DESIGN: 'prelimDesign',
   CONSTRUCTION: 'construction',
   FINAL_DESIGN: 'finalDesign'
});

export const PROJECT_SUBTYPE = Object.freeze({
   DEBRIS_MANAGEMENT: 'debrisManagement',
   VEGETATION_MANAGEMENT: 'vegetationManagement',
   MINOR_REPAIRS: 'minorRepairs',
   SEDIMENT_REMOVAL: 'sedimentRemoval',
   RESTORATION: 'restoration',

   MASTER_PLAN: 'masterPlan',
   FHAD: 'fhad'
});

export const SERVICE_AREA = Object.freeze({
   BOULDER_CREEK: 'boulderCreek',
   CHERRY_CREEK: 'cherryCreek',
   NORTH: 'north',
   NORTHEAST: 'northeast',
   SAND_CREEK: 'sandCreek',
   SOUTH: 'south',
   SOUTH_WEST: 'southwest',
   WEST: 'west'
});

export const GOAL = Object.freeze({
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

export const GOAL_CAPITAL = Object.freeze({
   REDUCE_FLOOD_RISK_STRUCTURES: 'reduceFloodRiskStructures',
   STREAM_BANK_BED_STABILIZATION: 'streamBankBedStabilization',
   CREATE_SHAREDUSE_PATH_RECREATION: 'createSharedUsePathsRecreation',
   VEGETATION_ENHACEMENTS: 'vegetationEnhancements',
   INCLUDE_PERMANENT_WATER_QUALITY: 'includePermanentWaterQualityBMP',
});

export const GOAL_STUDY = Object.freeze({
   REDUCE_FLOOD_RISK_STRUCTURES: 'reduceFloodRiskStructures',
   STABILIZATION: 'stabilization',
   ELIMINATE_ROADWAY_OVERTOPPONG: 'eliminateRoadwayOvertopping',
   INCREASED_CONVEYANCE: 'increasedConveyance',
   PEAK_FLOW_REDUCTION: 'peakFlowReduction',
   WATER_QUALITY: 'waterQuality',
   GUIDE_DEVELOPMENT: 'guideDevelopment'
});

export const MAINTENANCE_ELIGIBILITY = Object.freeze({
   CAPITAL_PROJECT: 'capitalProject',
   MEP: 'MEP',
   GRANDFATHERED: 'grandfathered',
   NOT_ELIGIBLE: 'notEligible',
   I_DONT_KNOW: 'iDontKnow'
});

export const FRECUENCY = Object.freeze({
   CYCLE_PER_YEAR: 'cyclePerYear'
});

export const RECURRENCE = Object.freeze({
   ONE_TIME: 'oneTime',
   ANNUALLY: 'annually',
   MULTIPLE: 'multiple'
});

export const TASK = Object.freeze({
   SEDIMENT_REMOVAL: 'sedimentRemoval',
   TREE_THINNING: 'treeThinning',
   BANK_STABILIZATION: 'bankStabilization',
   DRAINAGE_STRUCTURE: 'drainageStructure',
   REGIONAL_DETENTION: 'regionalDetention'
});

export const PRIORITY = Object.freeze({
   HIGH: 'high',
   MEDIUM: 'medium',
   LOW: 'low'
});

export const ROLES = Object.freeze({
    MFHD_ADMIN: 'admin',
    MFHD_STAFF: 'staff',
    GOVERNMENT_ADMIN: 'government_admin',
    GOVERNMENT_STAFF: 'government_staff',
    CONSULTANT: 'consultant',
    OTHER: 'other',
    GUEST: 'guest'
 });

export const ACTIVITY_TYPE = Object.freeze({
    USER_LOGIN: 'user_login'
 });

export const FIELDS = Object.freeze({
   FIRST_NAME: 'firstName',
   LAST_NAME: 'lastName',
   DESIGNATION: 'designation',
   EMAIL: 'email',
   ORGANIZATION: 'organization',
   PASSWORD: 'password',
   CITY: 'city', 
   COUNTY: 'county',
   SERVICE_AREA: 'serviceArea',
   REQUEST_NAME: 'requestName',
   ESTIMATED_COST: 'estimatedCost',
   MHFD_DOLLAR_REQUEST: 'mhfdDollarRequest',
   MHFD_DOLLAR_ALLOCATED: 'mhfdDollarAllocated',
   CAPITAL_STATUS:'capitalStatus',
   PHONE: 'phone',
   TITLE: 'title',
   ZOOM_AREA: 'zoomarea',
   BUSSINESS_ASSOCIATE_CONTACT_ID: 'business_associate_contact_id'
 });
   
export const EMAIL_VALIDATOR = /[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[a-zA-Z0-9]{2,}/;

export const PROJECT_TYPES_AND_NAME = [
   {
     name: 'Capital', id: 'capital'
   },
   {
     name: 'Maintenance', id: 'maintenance'
   },
   {
     name: 'Study', id: 'study'
   },
   {
     name: 'Property Acquisition', id: 'propertyAcquisition'
   },
   {
     name: 'Special', id: 'special'
   }
 ];