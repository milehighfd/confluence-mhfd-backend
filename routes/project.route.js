const express = require('express');
const router = express.Router();
const Multer = require('multer');

const Project = require('../models/project.model');
const projectService = require('../services/project.service');
const userService = require('../services/user.service');
const auth = require('../auth/auth');
const { PROJECT_TYPE, PROJECT_SUBTYPE } = require('../lib/enumConstants');
const logger = require('../config/logger');

const MAIN_IMAGE_POSITION = 0;
const QUANTITY_FILES_ALLOWED = 6;
const SORT_BY_FIELD_DEFAULT = 'dateCreated';
const SORT_TYPE_DEFAULT = '-1';

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
// auth, 
router.post('/create', [auth, multer.array('file', QUANTITY_FILES_ALLOWED), validate], async(req, res) => {
   try {
      console.log(req.body);
      var project = req.body;
      project.creator = req.user.id;
      /* if (project.projectType === PROJECT_TYPE.CAPITAL || project.projectType === PROJECT_TYPE.MAINTENANCE) {
         if (!req.files) {
            logger.error('You must send the image logo');
            return res.status(400).send({error: 'You must send the image logo'});
         }
         const logoMimetype = req.files[MAIN_IMAGE_POSITION].mimetype.includes('png') ||
            req.files[MAIN_IMAGE_POSITION].mimetype.includes('jpeg') || req.files[MAIN_IMAGE_POSITION].mimetype.includes('jpg');
         if (!logoMimetype) {
            logger.error('You must send the image logo');
            return res.status(400).send({error: 'You must send the image logo'});
         }
      } */
      //let project = '';
      await projectService.saveProject(project, req.files);
      res.status(201).send(project);
   } catch (error) {
      logger.error(error);
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
      res.status(400).send({ error: "There are required fields: " + missingFields });
   }
}

router.get('/get-project-collaborators', auth, async (req, res) => {
   try {
      const result = await projectService.getCollaboratorsByProject(req.user);
      res.status(200).send(result);
   } catch(error) {
      logger.error(error);
  	   res.status(500).send({error: error});
   }
})

router.post('/filters', auth, async (req, res) => {
  try {
    const data = req.body;
    const { fieldsort = 'dateCreated', sorttype = '-1' } = req.query;
    const result = await projectService.filterProject(data, fieldsort, sorttype);
    res.status(200).send(result);
  } catch(error) {
    logger.error(error);
  	 res.status(500).send({error: error});
  }
});

router.post('/filters-by-creator', auth, async (req, res) => {
   try {
      const data = req.body;
      data.creator = req.user;
      const result = await projectService.filterProject(data, 
                           SORT_BY_FIELD_DEFAULT, SORT_TYPE_DEFAULT);
      res.status(200).send(result);
   } catch(error) {
      logger.error(error);
      res.status(500).send({error: error});
   }
});

router.get('/counter-projects-by-creator', auth, async (req, res) => {
   try {
      const result = await projectService.counterProjectByCreator(req.user);
      res.status(200).send(result);
   } catch(error) {
      logger.error(error);
      res.status(500).send({error: error});
   }
});

router.get('/creators', async (req, res) => {
	try {
		const users = await projectService.userCreators();
		res.status(200).send(users);
	} catch(error) {
		logger.error(error);
  	res.status(500).send(error);
	}
});

router.get('/filter-by-field/:field', async (req, res) => {
   const data = await projectService.filterByFieldDistinct(req.params.field);
   res.status(200).send(data);
});

router.get('/:id', async (req, res, next) => {
   Project.findById(req.params.id)
      .then(project => {
         if (!project) {
            return res.status(404).send({
               error: 'Project not found with id ' + req.params.id
            });
         }
         res.send(project);
      }).catch(err => {
         if (err.kind === 'ObjectId') {
            return res.status(404).send({
               error: 'Project not found with id ' + req.params.id
            });
         }
         return err.status(500).send({
            error: 'Error retrieving Project with id ' + req.params.id
         });
      });
});

router.get('/', async (req, res) => {
   const projects = await projectService.findAll();
   res.send(projects);
   /* Project.find()
      .then(projects => {
         res.send(projects);
      }).catch(err => {
         res.status(500).send({
            error: err.message || 'Some error ocurred while retrieving Project'
         });
      }); */
});

module.exports = router;