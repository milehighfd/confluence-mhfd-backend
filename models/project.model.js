module.exports = (sequelize, Sequelize) => {
   const Project = sequelize.define('project', {
     /* projectId: {
       type: Sequelize.UUID,
       allowNull: false,
       primaryKey: true,
       references: {
         model: 'project',
         key: 'projectId'
       }
     }, */
     requestName: {
       type: Sequelize.STRING
     },
     imageName: {
       type: Sequelize.STRING
     },
     projectType: {
       type: Sequelize.ENUM,
       values: ['capital', 'maintenance', 'study', 'propertyAdquistion', 'special']
     },
     projectSubtype: {
       type: Sequelize.ENUM,
       values: ['debrisManagement', 'vegetationManagement', 'minorRepairs', 'sedimentRemoval',
               'restoration', 'masterPlan', 'fhad']
     },
     description: {
       type: Sequelize.STRING
     },
     goal: {
       type: Sequelize.ENUM,
       values: ['reduceFloodRiskStructures','streamBankBedStabilization','createSharedUsePathsRecreation',
               'vegetationEnhancements','includePermanentWaterQualityBMP','stabilization',
               'eliminateRoadwayOvertopping','increasedConveyance','peakFlowReduction',
               'waterQuality','guideDevelopment']
     },
     publicAccess: {
       type: Sequelize.BOOLEAN
     },
     maintenanceEligility: {
       type: Sequelize.ENUM,
       values: ['capitalProject','MEP','grandfathered','notEligible','iDontKnow']
     },
     // TODO tasks
     recurrence: {
       type: Sequelize.ENUM,
       values: ['oneTime','annually','multiple']
     },
     frecuency: {
       type: Sequelize.ENUM,
       values: ['cyclePerYear']
     },
     sponsor: {
       type: Sequelize.STRING
     },
     coSponsor: {
       type: Sequelize.STRING
     },
     additionalCost: {
       type: Sequelize.FLOAT
     },
     additionalCostDescription: {
       type: Sequelize.STRING
     },
     overheadCost: {
       type: Sequelize.FLOAT
     },
     estimatedCost: {
       type: Sequelize.FLOAT
     }, 
     mhfdFundingRequest: {
       type: Sequelize.STRING
     },
     requestFundingYear: {
       type: Sequelize.STRING
     },
     mhfdDollarRequest: {
       type: Sequelize.FLOAT
     },
     localDollarsContributed: {
       type: Sequelize.FLOAT
     },
     requestedStartyear: {
       type: Sequelize.INTEGER
     },
     requestedRank: {
       type: Sequelize.FLOAT
     },
     onbaseId: {
       type: Sequelize.STRING
     },
     projectName: {
       type: Sequelize.STRING
     },
     status: {
       type: Sequelize.ENUM,
       values: ['draft','requested','approved','idle','initiated','prelimDesign','construction','finalDesign']
     },
     workPlanYear: {
       type: Sequelize.INTEGER
     },
     mhfdDollarAllocated: {
       type: Sequelize.FLOAT
     },
     finalCost: {
       type: Sequelize.FLOAT
     },
     startYear: {
       type: Sequelize.INTEGER
     },
     completedYear: {
       type: Sequelize.INTEGER
     },
     consultant: {
       type: Sequelize.UUID,
       allowNull: false
     },
     contractor: {
       type: Sequelize.UUID,
       allowNull: false
     },
     localGovernmentManager: {
       type: Sequelize.STRING
     },
     mhfdManager: {
       type: Sequelize.UUID,
       allowNull: false
     },
     serviceArea: {
       type: Sequelize.ENUM,
       values: ['boulderCreek','cherryCreek','north','northeast','sandCreek','south',
             'southwest','west']
     },
     county: {
       type: Sequelize.STRING
     },
     jurisdiction: {
       type: Sequelize.STRING
     },
     streamName: {
       type: Sequelize.STRING
     },
     mhfdCode: {
       type: Sequelize.STRING
     },
     legacyCode: {
       type: Sequelize.STRING
     },
     creator: {
       type: Sequelize.UUID,
       allowNull: false
     },
     dateCreated: {
       type: Sequelize.DATE
     },
     lastModifiedUser: {
       type: Sequelize.UUID,
       allowNull: false
     },
     priority: {
       type: Sequelize.ENUM,
       values: ['high','medium','low']
     },
     mainImage: {
       type: Sequelize.STRING
     },
   });
 
   /* Project.associate = models => {
     Project.hasMany(models.Component, {
       onDelete: "cascade"
     });
   }; */
 
   return Project;
 }