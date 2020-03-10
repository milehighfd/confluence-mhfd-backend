const express = require('express');
const router = express.Router();
const Project = require('../models/project.model');
router.post('/', async (req, res) => {
   try {
      const project = new Project(req.body);
      await project.save();
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