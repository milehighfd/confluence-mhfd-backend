const express = require('express');
const router = express.Router();
const Project = require('../models/project.model');
const auth = require('../auth/auth');
const { PROJECT_STATUS, PROJECT_TYPE, PROJECT_SUBTYPE, GOAL_CAPITAL, GOAL_STUDY, MAINTENANCE_ELIGIBILITY, FRECUENCY, RECURRENCE, TASK, PRIORITY } = require('../lib/enumConstants');

router.post('/', async (req, res) => {
   try {
      const project = new Project(req.body);
      await project.save();
      res.status(201).send(project);
   } catch(error) {
      res.status(500).send(error);
   }
});

router.post('/create', auth, validate, async(req, res) => {
   try {
      var project = new Project(req.body);
      console.log('project');
      console.log(project);
      project.status = PROJECT_STATUS.DRAFT;
      project.dateCreated = new Date();
      project.creator = req.user;
      project.priority = PRIORITY.HIGH;
      project.estimatedCost = 1200000;
      await project.save();
      res.status(201).send(project);
   } catch(error) {
      res.status(500).send(error);
   }
});

function validate(req, res, next) {
   var fields = [];
   var requiredFields = [];
   var missingFields = '';
   for(const key in req.body) {
      fields.push(key);
   }
   if(req.body.projectType == PROJECT_TYPE.CAPITAL) {
      requiredFields = ['requestName', 'description', 'mhfdFundingRequest',
               'localDollarsContributed', 'requestFundingYear', 'goal'];
   } else {
      if(req.body.projectType == PROJECT_TYPE.MAINTENANCE) {
         switch(req.body.projectSubtype) {
            case PROJECT_SUBTYPE.DEBRIS_MANAGEMENT:
               requiredFields = ['requestName', 'description', 'mhfdDollarRequest', 
                        'maintenanceEligility', 'frecuency'];
               break;
            case PROJECT_SUBTYPE.VEGETATION_MANAGEMENT:
               requiredFields = ['requestName', 'description','mhfdDollarRequest',
                        'recurrence', 'frecuency', 'maintenanceEligility'];
               break;
            case PROJECT_SUBTYPE.SEDIMENT_REMOVAL:
               requiredFields = ['requestName', 'description','mhfdDollarRequest',
                        'recurrence', 'frecuency', 'maintenanceEligility'];
               break;
            case PROJECT_SUBTYPE.MINOR_REPAIRS:
               requiredFields = ['requestName', 'description','mhfdDollarRequest',
                        'maintenanceEligility'];
               break;
            case PROJECT_SUBTYPE.RESTORATION:
               requiredFields = ['requestName', 'description','mhfdDollarRequest',
                        'maintenanceEligility'];
               break;
         }
      } else {
         if(req.body.projectType == PROJECT_TYPE.PROPERTY_ACQUISITION) {
            requiredFields = ['requestName', 'description', 'mhfdDollarRequest', 'localDollarsContributed'];
         } else {
            if(req.body.projectType == PROJECT_TYPE.STUDY) {
               if(req.body.projectSubType == PROJECT_SUBTYPE.MASTER_PLAN) {
                  requiredFields = ['requestName', 'sponsor', 'coSponsor', 'requestedStartyear', 'goal'];
               } else {
                  requiredFields = ['requestName', 'sponsor', 'coSponsor', 'requestedStartyear'];
               }
            } else {
               requiredFields = ['requestName', 'description'];
            }
         }
      }
   }
   var isValid = true;
   for(const field of requiredFields) {
      if(!fields.includes(field)) {
         isValid = false;
         if(missingFields == '') {
            missingFields = field;
         } else {
            missingFields += ', ' + field;
         }
         
      }
   }
   if(isValid) {
      next();
   } else {
      res.status(400).send({message: "There are required fields: " + missingFields});
   }
}

router.get('/:id', async (req, res, next) => {
   Project.findById(req.params.id)
   .then(project => {
      if(!project) {
         return res.status(404).send({
            message: 'Project not found with id ' + req.params.id
         });
      }
      res.send(project);
   }).catch(err => {
      if(err.kind === 'ObjectId') {
         return res.status(404).send({
            message: 'Project not found with id ' + req.params.id
         });
      }
      return err.status(500).send({
         message: 'Error retrieving Project with id ' + req.params.id
      });
   });
});

router.get('/', async (req, res) => {
   Project.find()
   .then(projects => {
      res.send(projects);
   }).catch(err => {
      res.status(500).send({
         message: err.message || 'Some error ocurred while retrieving Project'
      });
   });
});

router.get('/get-enumerator/:enumerator', function (req, res) {
   var data;
   switch(req.params.enumerator) {
      case 'projectStatus':
         data = Object.values(PROJECT_STATUS);
         break;
      case 'goalCapital':
         data = Object.values(GOAL_CAPITAL);
         break;
      case 'goalStudy':
         data = Object.values(GOAL_STUDY)
         break;
      case 'maintenanceEligibility':
         data = Object.values(MAINTENANCE_ELIGIBILITY);
         break;
      case 'frequency':
         data = Object.values(FRECUENCY);
         break;
      case 'recurrence':
         data = Object.values(RECURRENCE);
         break;
      case 'task':
         data = Object.values(TASK);
         break;
      default:
         data = [];
   }
   res.status(200).send(data);
});

module.exports = router;