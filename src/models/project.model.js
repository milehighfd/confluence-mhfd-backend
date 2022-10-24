export default (sequelize, DataType) => {
  const Project = sequelize.define('mhfd_projects', {
    OBJECTID: {
      type: DataType.INTEGER
    },
    onbaseId: {
      type: DataType.INTEGER
    },
    projectId: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    projectName: {
      type: DataType.STRING
    },
    code_project_type_id: {
      type: DataType.INTEGER,
    },
    projectType: {
      type: DataType.STRING
    },
    projectSubtype: {
      type: DataType.STRING
    },
    description: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    startYear: {
      type: DataType.INTEGER
    },
    completeYear: {
      type: DataType.INTEGER
    },
    sponsor: {
      type: DataType.STRING
    },
    coSponsor1: {
      type: DataType.STRING
    },
    coSponsor2: {
      type: DataType.STRING
    },
    coSponsor3: {
      type: DataType.STRING
    },
    frequency: {
      type: DataType.STRING
    },
    maintenanceEligibility: {
      type: DataType.STRING
    },
    ownership: {
      type: DataType.STRING
    },
    acquisitionAnticipatedDate: {
      type: DataType.INTEGER
    },
//H
    acquisitionProgress: {
      type: DataType.STRING
    },
    additionalCostDescription: {
      type: DataType.STRING
    },
    overheadCostDescription: {
      type: DataType.STRING
    },
    consultant: {
      type: DataType.STRING
    },
    contractor: {
      type: DataType.STRING
    },
    LGManager: {
      type: DataType.STRING
    },
    mhfdManager: {
      type: DataType.STRING
    },
    code_service_area_id: {
      type: DataType.INTEGER
    },

    serviceArea: {
      type: DataType.STRING
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
    taskSedimentRemoval: {
      type: DataType.STRING
    },
    taskTreeThinning: {
      type: DataType.STRING
    },
    taskBankStabilization: {
      type: DataType.STRING
    },
    taskDrainageStructure: {
      type: DataType.STRING
    },
    taskRegionalDetention: {
      type: DataType.STRING
    },
    goalFloodRisk: {
      type: DataType.STRING
    },
    goalWaterQuality: {
      type: DataType.STRING
    },
    goalStabilization: {
      type: DataType.STRING
    },
    goalCapRecreation: {
      type: DataType.STRING
    },
    goalCapVegetation: {
      type: DataType.STRING
    },
    goalStudyOvertopping: {
      type: DataType.STRING
    },
    goalStudyConveyance: {
      type: DataType.STRING
    },
    goalStudyPeakFlow: {
      type: DataType.STRING
    },
    goalStudyDevelopment: {
      type: DataType.STRING
    },

    workPlanYr1: {
      type: DataType.INTEGER
    },
    workPlanYr2: {
      type: DataType.INTEGER
    },
    workPlanYr3: {
      type: DataType.INTEGER
    },
    workPlanYr4: {
      type: DataType.INTEGER
    },
    workPlanYr5: {
      type: DataType.INTEGER
    },

    attachments: {
      type: DataType.STRING
    },
    coverImage: {
      type: DataType.STRING
    },
    GlobalID: {
      type: DataType.INTEGER
    },
    CreationDate: {
      type: DataType.DATE
    },
    Creator: {
      type: DataType.STRING
    },
    EditDate: {
      type: DataType.DATE
    },
    Editor: {
      type: DataType.STRING
    },
    MP_WR_ID: {
      type: DataType.INTEGER
    },
    dataSource: {
      type: DataType.STRING
    },
    currentWorkPlan: {
      type: DataType.STRING
    },
    mhfdDollarsRequested: {
      type: DataType.FLOAT
    },
    mhfdDollarsAllocated: {
      type: DataType.FLOAT
    },
    estimatedCost: {
      type: DataType.FLOAT
    },
    finalCost: {
      type: DataType.FLOAT
    },
    additionalCost: {
      type: DataType.FLOAT
    },
    overheadCost: {
      type: DataType.FLOAT
    },
    costDewatering: {
      type: DataType.FLOAT
    },
    costMobilization: {
      type: DataType.FLOAT
    },
    costTraffic: {
      type: DataType.FLOAT
    },
    costUtility: {
      type: DataType.FLOAT
    },
    costStormwater: {
      type: DataType.FLOAT
    },
    costEngineering: {
      type: DataType.FLOAT
    },
    costConstruction: {
      type: DataType.FLOAT
    },
    costLegal: {
      type: DataType.FLOAT
    },
    costContingency: {
      type: DataType.FLOAT
    },
    specialDistrict: {
      type: DataType.STRING
    },
    studyReason: {
      type: DataType.STRING
    },
    studySubreason: {
      type: DataType.STRING
    },
    Component_Cost: {
      type: DataType.FLOAT
    },
    Component_Count: {
      type: DataType.INTEGER
    },
    // Shape: {
    //   type: DataType.GEOMETRY()
    // }
  }, {
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  });
  return Project;
}
