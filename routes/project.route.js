const express = require('express');
const router = express.Router();
const Multer = require('multer');
const {Storage} = require('@google-cloud/storage');
var path = require('path');

const Project = require('../models/project.model');
const auth = require('../auth/auth');
const { PROJECT_STATUS, PROJECT_TYPE, PROJECT_SUBTYPE, GOAL_CAPITAL, GOAL_STUDY, MAINTENANCE_ELIGIBILITY, FRECUENCY, RECURRENCE, TASK, PRIORITY } = require('../lib/enumConstants');

const MAIN_IMAGE_POSTION = 0;

function getPublicUrl (filename) {
   return `https://storage.googleapis.com/mhfd2-test/${filename}`;
}

const multer = Multer({
   storage: Multer.MemoryStorage,
   limits: {
      fileSize: 50 * 1024 * 1024
   }
});
const storage = new Storage({
   keyFilename: path.join(__dirname, '../config/develop-test-271312-20b199f0adbe.json'),
   projectId: 'develop-test-271312'
});

router.post('/', async (req, res) => {
   try {
      const project = new Project(req.body);
      await project.save();
      res.status(201).send(project);
   } catch(error) {
      res.status(500).send(error);
   }
});

router.post('/create', [auth, multer.array('file', 5), validate], async(req, res) => {
   try {
      var project = new Project(req.body);
      console.log('project');
      project.status = PROJECT_STATUS.DRAFT;
      project.dateCreated = new Date();
      project.creator = req.user;
      project.priority = PRIORITY.HIGH;
      project.estimatedCost = 1200000;
      if (project.projectType === PROJECT_TYPE.CAPITAL || project.projectType === PROJECT_TYPE.MAINTENANCE) {
         if (!req.files) {
            return res.status(400).send('You must send the image logo');
         }
         const bucket = storage.bucket('mhfd2-test');
         const promises = [];
         const files = req.files;
         const logoMimetype = files[MAIN_IMAGE_POSTION].mimetype.includes('png') || 
         files[MAIN_IMAGE_POSTION].mimetype.includes('jpeg') || files[MAIN_IMAGE_POSTION].mimetype.includes('jpg');
         if (!logoMimetype) {
            return res.status(400).send('You must send the image logo');
         }
         files.forEach(file => {
            const name = Date.now() + file.originalname;
            const blob = bucket.file(name);
            const newPromise =  new Promise((resolve, reject) => {
               blob.createWriteStream({
                  metadata: { contentType: file.mimetype }
               }).on('finish', async response => {
                  await blob.makePublic();
                  resolve(getPublicUrl(name));
               }).on('error', err => {
                  reject('upload error: ', err);
               }).end(file.buffer);
            });
          promises.push(newPromise);
         });    
         Promise.all(promises).then(async response => {
            project.mainImage = response[0];
            project.attachList = response.slice(1);
            await project.save();
            return res.status(201).send(project);
         }).catch((err) => {
            return res.status(400).send(err.message)
         });
      }
      else {
         await project.save();
         res.status(201).send(project);
      }
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

router.post('/filters', async(req, res) => {
   const data = req.body;
   var query = Project.find();
   for(const key in req.body) {
      if(key == 'requestName' && req.body[key] != null) {
         query.where(key).equals(new RegExp(req.body[key], 'i'));
      } else if(key == 'estimatedCost' && req.body[key] != null) {
         const initValue = req.body[key];
         const range = initValue.split(",");
         query.find({"estimatedCost": {
            "$gte" : Number(range[0]),
            "$lt": Number(range[0])
         }});
      } else {
         query.where(key).equals(req.body[key]);
      }
   }
   query.exec(function(err, data) {
      res.send(data);
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