const express = require('express');
const router = express.Router();
const Attachement = require('../models/attachment.model');

router.post('/', async (req, res) => {
   try {
      const attachment = new Attachement(req.body);
      await attachment.save();
   } catch(error) {
      res.status(500).send(error);
   }
});

router.get('/:id', async (req, res, next) => {
   Attachement.findById(req.params.id)
   .then(attachment => {
      if(!attachment) {
         return res.status(404).send({
            message: 'Attachment not found with id ' + req.params.id
         });
      }
      res.send(attachment);
   }).catch(err => {
      if(err.kind === 'ObjectId') {
         return res.status(404).send({
            message: 'Attachment not found with id ' + req.params.id
         });
      }
      return err.status(500).send({
         message: 'Error retrieving Attachment with id ' + req.params.id
      });
   });
});

// router.get('/:idProject', async (req, res) => {
// });

module.exports = router;