module.exports.ProjectStatus = Object.freeze({
   Draft: 'draft',
   Requested: 'requested',
   Approved: 'approved',
   Idle: 'idle',
   Initiated: 'initiated',
   PrelimDesign: 'prelimDesign',
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