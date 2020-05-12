module.exports = (sequelize, DataType) => {
  const Project = sequelize.define('project', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    requestName: {
      type: DataType.STRING
    },
    imageName: {
      type: DataType.STRING
    },
    projectType: {
      type: DataType.ENUM,
      values: ['capital', 'maintenance', 'study', 'propertyAdquistion', 'special']
    },
    projectSubtype: {
      type: DataType.ENUM,
      values: ['debrisManagement', 'vegetationManagement', 'minorRepairs', 'sedimentRemoval',
        'restoration', 'masterPlan', 'fhad']
    },
    description: {
      type: DataType.STRING
    },
    goal: {
      type: DataType.ENUM,
      values: ['reduceFloodRiskStructures', 'streamBankBedStabilization', 'createSharedUsePathsRecreation',
        'vegetationEnhancements', 'includePermanentWaterQualityBMP', 'stabilization',
        'eliminateRoadwayOvertopping', 'increasedConveyance', 'peakFlowReduction',
        'waterQuality', 'guideDevelopment']
    },
    publicAccess: {
      type: DataType.BOOLEAN
    },
    maintenanceEligility: {
      type: DataType.ENUM,
      values: ['capitalProject', 'MEP', 'grandfathered', 'notEligible', 'iDontKnow']
    },
    // TODO tasks
    recurrence: {
      type: DataType.ENUM,
      values: ['oneTime', 'annually', 'multiple']
    },
    frecuency: {
      type: DataType.ENUM,
      values: ['cyclePerYear']
    },
    sponsor: {
      type: DataType.STRING
    },
    coSponsor: {
      type: DataType.STRING
    },
    additionalCost: {
      type: DataType.FLOAT
    },
    additionalCostDescription: {
      type: DataType.STRING
    },
    overheadCost: {
      type: DataType.FLOAT
    },
    estimatedCost: {
      type: DataType.FLOAT
    },
    mhfdFundingRequest: {
      type: DataType.STRING
    },
    requestFundingYear: {
      type: DataType.STRING
    },
    mhfdDollarRequest: {
      type: DataType.FLOAT
    },
    localDollarsContributed: {
      type: DataType.FLOAT
    },
    requestedStartyear: {
      type: DataType.INTEGER
    },
    requestedRank: {
      type: DataType.FLOAT
    },
    onbaseId: {
      type: DataType.STRING
    },
    projectName: {
      type: DataType.STRING
    },
    status: {
      type: DataType.ENUM,
      values: ['draft', 'requested', 'approved', 'idle', 'initiated', 'prelimDesign', 'construction', 'finalDesign']
    },
    workPlanYear: {
      type: DataType.INTEGER
    },
    mhfdDollarAllocated: {
      type: DataType.FLOAT
    },
    finalCost: {
      type: DataType.FLOAT
    },
    startYear: {
      type: DataType.INTEGER
    },
    completedYear: {
      type: DataType.INTEGER
    },
    consultant: {
      type: DataType.INTEGER,
      allowNull: true
    },
    contractor: {
      type: DataType.INTEGER,
      allowNull: true
    },
    localGovernmentManager: {
      type: DataType.STRING
    },
    mhfdManager: {
      type: DataType.INTEGER,
      allowNull: true
    },
    serviceArea: {
      type: DataType.ENUM,
      values: ['boulderCreek', 'cherryCreek', 'north', 'northeast', 'sandCreek', 'south',
        'southwest', 'west']
    },
    county: {
      type: DataType.STRING
    },
    jurisdiction: {
      type: DataType.STRING
    },
    streamName: {
      type: DataType.STRING
    },
    mhfdCode: {
      type: DataType.STRING
    },
    legacyCode: {
      type: DataType.STRING
    },
    creator: {
      type: DataType.INTEGER,
      allowNull: true
    },
    dateCreated: {
      type: DataType.DATE
    },
    lastModifiedUser: {
      type: DataType.INTEGER,
      allowNull: true
    },
    priority: {
      type: DataType.ENUM,
      values: ['high', 'medium', 'low']
    },
    mainImage: {
      type: DataType.STRING
    },
  });

  return Project;
}