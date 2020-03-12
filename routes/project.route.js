const express = require('express');
const router = express.Router();
const Project = require('../models/project.model');
const { check, validationResult } = require('express-validator');
const auth = require('../auth/auth');
const { ProjectStatus, ProjectType, ProjectSubtype } = require('../lib/enumConstants');

router.post('/', async (req, res) => {
   try {
      const project = new Project(req.body);
      await project.save();
      res.status(201).send(project);
   } catch(error) {
      res.status(500).send(error);
   }
});

router.post('/createCapital', auth, [
   check('requestName', 'Request Name is required').not().isEmpty(),
   ], async (req, res) => {});

router.post('/createMaintenanceDebris', auth, [
   check('requestName', 'Request Name is required').not().isEmpty(),
   // check('projectType', 'Project Type is required').not().isEmpty(),
   // check('projectSubType', 'Project Sub Type is required').not().isEmpty(),
   check('description', 'Description is required').not().isEmpty(),
   check('mhfdDollarRequest', 'MHFD Dolllar Request is required').not().isEmpty(),
   check('maintenanceEligility', 'Maintenance Eligility is required').not().isEmpty(),
   check('frecuency', 'Frecuency is required').not().isEmpty()
   ], async (req, res) => {
   try {
      // console.log(auth);
      // console.log('user ' + req.user);
      // check validate data
      const result = validationResult(req);
      var errors = result.errors;

      for (var key in errors) {
         console.log(errors[key]);
      }
      if(!result.isEmpty()) {
         res.status(500).send({
            message: 'Existen campos requeridos'
         });
      } else {
         // console.log(req.body);
         var project = new Project(req.body);
         project.projectType = ProjectType.Maintenance;
         project.projectSubType = ProjectSubtype.DebrisManagement;
         project.status = ProjectStatus.Draft;
         project.dateCreated = new Date();
         project.creator = req.user;
         await project.save();
         res.status(201).send(project);
      }
      
   } catch(error) {
      res.status(500).send(error);
   }
});

router.post('/createMaintenanceVegetation', auth, [
   check('requestName', 'Request Name is required').not().isEmpty(),
   // check('projectType', 'Project Type is required').not().isEmpty(),
   // check('projectSubType', 'Project Sub Type is required').not().isEmpty(),
   check('description', 'Description is required').not().isEmpty(),
   check('mhfdDollarRequest', 'MHFD Dolllar Request is required').not().isEmpty(),
   check('recurrence', 'Recurrence is required').not().isEmpty(),
   check('frecuency', 'Frecuency is required').not().isEmpty(),
   check('maintenanceEligility', 'Maintenance Eligility is required').not().isEmpty()
], async (req, res) => {
   try {
      // check validate data
      const result = validationResult(req);
      var errors = result.errors;

      for (var key in errors) {
         console.log(errors[key]);
      }
      if(!result.isEmpty()) {
         res.status(500).send({
            message: 'Existen campos requeridos'
         });
      } else {
         var project = new Project(req.body);
         project.projectType = ProjectType.Maintenance;
         project.projectSubType = ProjectSubtype.VegetationManagement;
         project.status = ProjectStatus.Draft;
         project.dateCreated = new Date();
         project.creator = req.user;
         await project.save();
         res.status(201).send(project);
      }
      
   } catch(error) {
      res.status(500).send(error);
   }
});

router.post('/createMaintenanceSediment', auth, [
   check('requestName', 'Request Name is required').not().isEmpty(),
   // check('projectType', 'Project Type is required').not().isEmpty(),
   // check('projectSubType', 'Project Sub Type is required').not().isEmpty(),
   check('description', 'Description is required').not().isEmpty(),
   check('mhfdDollarRequest', 'MHFD Dolllar Request is required').not().isEmpty(),
   check('recurrence', 'Recurrence is required').not().isEmpty(),
   check('frecuency', 'Frecuency is required').not().isEmpty(),
   check('maintenanceEligility', 'Maintenance Eligility is required').not().isEmpty()
], async (req, res) => {
   try {
      // check validate data
      const result = validationResult(req);
      var errors = result.errors;

      for (var key in errors) {
         console.log(errors[key]);
      }
      if(!result.isEmpty()) {
         res.status(500).send({
            message: 'Existen campos requeridos'
         });
      } else {
         var project = new Project(req.body);
         project.projectType = ProjectType.Maintenance;
         project.projectSubType = ProjectSubtype.SedimentRemoval;
         project.status = ProjectStatus.Draft;
         project.dateCreated = new Date();
         project.creator = req.user;
         await project.save();
         res.status(201).send(project);
      }
      
   } catch(error) {
      res.status(500).send(error);
   }
})

router.post('/createMaintenanceMinorRepair', auth, [
   check('requestName', 'Request Name is required').not().isEmpty(),
   // check('projectType', 'Project Type is required').not().isEmpty(),
   // check('projectSubType', 'Project Sub Type is required').not().isEmpty(),
   check('description', 'Description is required').not().isEmpty(),
   check('mhfdDollarRequest', 'MHFD Dolllar Request is required').not().isEmpty(),
   check('maintenanceEligility', 'Maintenance Eligility is required').not().isEmpty()
], async (req, res) => {
   try {
      // check validate data
      const result = validationResult(req);
      var errors = result.errors;

      for (var key in errors) {
         console.log(errors[key]);
      }
      if(!result.isEmpty()) {
         res.status(500).send({
            message: 'Existen campos requeridos'
         });
      } else {
         var project = new Project(req.body);
         project.projectType = ProjectType.Maintenance;
         project.projectSubType = ProjectSubtype.MinorRepairs;
         project.status = ProjectStatus.Draft;
         project.dateCreated = new Date();
         project.creator = req.user;
         await project.save();
         res.status(201).send(project);
      }
      
   } catch(error) {
      res.status(500).send(error);
   }
});

router.post('/createMaintenanceRestoration', auth, [
   check('requestName', 'Request Name is required').not().isEmpty(),
   // check('projectType', 'Project Type is required').not().isEmpty(),
   // check('projectSubType', 'Project Sub Type is required').not().isEmpty(),
   check('description', 'Description is required').not().isEmpty(),
   check('mhfdDollarRequest', 'MHFD Dolllar Request is required').not().isEmpty(),
   check('maintenanceEligility', 'Maintenance Eligility is required').not().isEmpty()
], async (req, res) => {
   try {
      // check validate data
      const result = validationResult(req);
      var errors = result.errors;

      for (var key in errors) {
         console.log(errors[key]);
      }
      if(!result.isEmpty()) {
         res.status(500).send({
            message: 'Existen campos requeridos'
         });
      } else {
         var project = new Project(req.body);
         project.projectType = ProjectType.Maintenance;
         project.projectSubType = ProjectSubtype.Restoration;
         project.status = ProjectStatus.Draft;
         project.dateCreated = new Date();
         project.creator = req.user;
         await project.save();
         res.status(201).send(project);
      }
      
   } catch(error) {
      res.status(500).send(error);
   }
});

router.post('/createStudyMasterPlan', auth, [
   check('requestName', 'Request Name is required').not().isEmpty(),
   // check('projectType', 'Project Type is required').not().isEmpty(),
   // check('projectSubType', 'Project Sub Type is required').not().isEmpty(),
   check('sponsor', 'Sponsor is required').not().isEmpty(),
   check('coSponsor', 'Co-Sponsor is required').not().isEmpty(),
   check('requestedStartyear', 'Request Start Year is required').not().isEmpty(),
   check('goal', 'Goal is required').not().isEmpty()
], async (req, res) => {
   try {
      // check validate data
      const result = validationResult(req);
      var errors = result.errors;

      for (var key in errors) {
         console.log(errors[key]);
      }
      if(!result.isEmpty()) {
         res.status(500).send({
            message: 'Existen campos requeridos'
         });
      } else {
         var project = new Project(req.body);
         project.projectType = ProjectType.Study;
         project.projectSubType = ProjectSubtype.MasterPlan;
         project.status = ProjectStatus.Draft;
         project.dateCreated = new Date();
         project.creator = req.user;
         await project.save();
         res.status(201).send(project);
      }
      
   } catch(error) {
      res.status(500).send(error);
   }
});

router.post('/createStudyFHAD', auth, [
   check('requestName', 'Request Name is required').not().isEmpty(),
   // check('projectType', 'Project Type is required').not().isEmpty(),
   // check('projectSubType', 'Project Sub Type is required').not().isEmpty(),
   check('sponsor', 'Sponsor is required').not().isEmpty(),
   check('coSponsor', 'Co-Sponsor is required').not().isEmpty(),
   check('requestedStartyear', 'Request Start Year is required').not().isEmpty()
], async (req, res) => {
   try {
      // check validate data
      const result = validationResult(req);
      var errors = result.errors;

      for (var key in errors) {
         console.log(errors[key]);
      }
      if(!result.isEmpty()) {
         res.status(500).send({
            message: 'Existen campos requeridos'
         });
      } else {
         var project = new Project(req.body);
         project.projectType = ProjectType.Study;
         project.projectSubType = ProjectSubtype.FHAD;
         project.status = ProjectStatus.Draft;
         project.dateCreated = new Date();
         project.creator = req.user;
         await project.save();
         res.status(201).send(project);
      }
      
   } catch(error) {
      res.status(500).send(error);
   }
});

router.post('/createAcquisition', auth, [
   check('requestName', 'Request Name is required').not().isEmpty(),
   // check('projectType', 'Project Type is required').not().isEmpty(),
   check('description', 'Description is required').not().isEmpty(),
   check('mhfdDollarRequest', 'MHFD Dollar Request is required').not().isEmpty(),
   check('localDollarsContributed', 'Local Dollar Contribution is required').not().isEmpty()
], async (req, res) => {
   try {
      // check validate data
      const result = validationResult(req);
      var errors = result.errors;

      for (var key in errors) {
         console.log(errors[key]);
      }
      if(!result.isEmpty()) {
         res.status(500).send({
            message: 'Existen campos requeridos'
         });
      } else {
         var project = new Project(req.body);
         project.projectType = ProjectType.PropertyAcquisition;
         project.status = ProjectStatus.Draft;
         project.dateCreated = new Date();
         project.creator = req.user;
         await project.save();
         res.status(201).send(project);
      }
      
   } catch(error) {
      res.status(500).send(error);
   }
});

router.post('/createSpecial', auth, [
   check('requestName', 'Request Name is required').not().isEmpty(),
   // check('projectType', 'Project Type is required').not().isEmpty(),
   check('description', 'Description is required').not().isEmpty()
], async (req, res) => {
   try {
      // check validate data
      const result = validationResult(req);
      var errors = result.errors;

      for (var key in errors) {
         console.log(errors[key]);
      }
      if(!result.isEmpty()) {
         res.status(500).send({
            message: 'Existen campos requeridos'
         });
      } else {
         var project = new Project(req.body);
         project.projectType = ProjectType.Special;
         project.status = ProjectStatus.Draft;
         project.dateCreated = new Date();
         project.creator = req.user;
         await project.save();
         res.status(201).send(project);
      }
   } catch(error) {
      res.status(500).send(error);
   }
});

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

module.exports = router;