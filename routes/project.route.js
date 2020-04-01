const express = require('express');
const router = express.Router();
const Multer = require('multer');

const Project = require('../models/project.model');
const projectService = require('../services/project.service');
const auth = require('../auth/auth');
const { PROJECT_TYPE, PROJECT_SUBTYPE } = require('../lib/enumConstants');

const MAIN_IMAGE_POSITION = 0;
const QUANTITY_FILES_ALLOWED = 6;

const multer = Multer({
   storage: Multer.MemoryStorage,
   limits: {
      fileSize: 50 * 1024 * 1024
   }
});

router.post('/', async (req, res) => {
   try {
      const project = new Project(req.body);
      await project.save();
      res.status(201).send(project);
   } catch (error) {
      res.status(500).send(error);
   }
});

router.post('/create', [auth, multer.array('file', QUANTITY_FILES_ALLOWED), validate], async(req, res) => {
   try {
      var project = new Project(req.body);
      project.creator = req.user;
      if (project.projectType === PROJECT_TYPE.CAPITAL || project.projectType === PROJECT_TYPE.MAINTENANCE) {
         if (!req.files) {
            return res.status(400).send('You must send the image logo');
         }
         const logoMimetype = req.files[MAIN_IMAGE_POSITION].mimetype.includes('png') ||
            req.files[MAIN_IMAGE_POSITION].mimetype.includes('jpeg') || req.files[MAIN_IMAGE_POSITION].mimetype.includes('jpg');
         if (!logoMimetype) {
            return res.status(400).send('You must send the image logo');
         }
      }
      await projectService.saveProject(project, req.files);
      res.status(201).send(project);
   } catch (error) {
      console.log('Error: ' + error)
      res.status(500).send(error);
   }
});

function validate(req, res, next) {
   const fields = [];
   let requiredFields = [];
   let missingFields = '';
   for (const key in req.body) {
      fields.push(key);
   }
   if (req.body.projectType === PROJECT_TYPE.CAPITAL) {
      requiredFields = ['requestName', 'description', 'mhfdFundingRequest',
         'localDollarsContributed', 'requestFundingYear', 'goal'];
   } else {
      if (req.body.projectType === PROJECT_TYPE.MAINTENANCE) {
         switch (req.body.projectSubtype) {
            case PROJECT_SUBTYPE.DEBRIS_MANAGEMENT:
               requiredFields = ['requestName', 'description', 'mhfdDollarRequest',
                  'maintenanceEligility', 'frecuency'];
               break;
            case PROJECT_SUBTYPE.VEGETATION_MANAGEMENT:
               requiredFields = ['requestName', 'description', 'mhfdDollarRequest',
                  'recurrence', 'frecuency', 'maintenanceEligility'];
               break;
            case PROJECT_SUBTYPE.SEDIMENT_REMOVAL:
               requiredFields = ['requestName', 'description', 'mhfdDollarRequest',
                  'recurrence', 'frecuency', 'maintenanceEligility'];
               break;
            case PROJECT_SUBTYPE.MINOR_REPAIRS:
               requiredFields = ['requestName', 'description', 'mhfdDollarRequest',
                  'maintenanceEligility'];
               break;
            case PROJECT_SUBTYPE.RESTORATION:
               requiredFields = ['requestName', 'description', 'mhfdDollarRequest',
                  'maintenanceEligility'];
               break;
         }
      } else {
         if (req.body.projectType === PROJECT_TYPE.PROPERTY_ACQUISITION) {
            requiredFields = ['requestName', 'description', 'mhfdDollarRequest', 'localDollarsContributed'];
         } else {
            if (req.body.projectType == PROJECT_TYPE.STUDY) {
               if (req.body.projectSubType == PROJECT_SUBTYPE.MASTER_PLAN) {
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
   for (const field of requiredFields) {
      if (!fields.includes(field)) {
         isValid = false;
         if (missingFields == '') {
            missingFields = field;
         } else {
            missingFields += ', ' + field;
         }
      }
   }
   if (isValid) {
      next();
   } else {
      res.status(400).send({ message: "There are required fields: " + missingFields });
   }
}

router.post('/filters', auth, async (req, res) => {
   const data = req.body;
   const result = await projectService.filterProject(data);
   res.status(200).send(result);
});

router.get('/:id', async (req, res, next) => {
   Project.findById(req.params.id)
      .then(project => {
         if (!project) {
            return res.status(404).send({
               message: 'Project not found with id ' + req.params.id
            });
         }
         res.send(project);
      }).catch(err => {
         if (err.kind === 'ObjectId') {
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

module.exports = router;