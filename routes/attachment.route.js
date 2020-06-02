const express = require('express');
const router = express.Router();
const Attachement = require('../models/attachment.model');
//const uploadFile = require('express-fileupload');
const path = require('path');
const auth = require('../auth/auth');
var fs = require('fs');
const Multer = require('multer');
const attachmentService = require('../services/attachment.service');
const logger = require('../config/logger');

const multer = Multer({
   storage: Multer.MemoryStorage,
   limits: {
     fileSize: 50 * 1024 * 1024
   }
 });

router.post('/upload-file', [auth, multer.array('file')], async (req, res) => {
   try {
      if (!req.files) {
         logger.error('You must send user photo');
         return res.status(400).send({ error: 'You must send user photo' });
      }
      const user = req.user;
      //console.log('LLAMANDO METODO')
      await attachmentService.uploadFiles(user, req.files);
      //console.log('FIN UPLOAD');
      res.send({message: "upload files"});
   } catch (error) {
      logger.error(error);
      res.status(500).send(error);
   }
});

router.get('/list-files', async (req, res) => {
   try {
      attachmentService.migrateFilesFromCloud();
      res.send({message: "list files"});
   } catch (error) {
      logger.error(error);
      res.status(500).send(error);
   }
})

router.get('/get-files', auth, async (req, res) => {
   try {
      const { page = 1, limit = 10, sort = 'register_date',
          sorttype = 'desc' } = req.query;
      //console.log('sort', sortby);
      const files = await attachmentService.listAttachments(page, limit, sort, sorttype);
      const count = await attachmentService.countAttachments();
      const result = {
         data: files,
         totalPages: Math.ceil(count / limit),
         currentPage: page
      };
      res.status(200).send(result);
   } catch (error) {
      logger.error(error);
      res.status(500).send(error);
   }
});

router.delete('/remove/:id', auth, async (req, res) => {
   try {
      const id = req.params.id;
      await attachmentService.removeAttachment(id);
      res.send({message: "Attachment remove successfully."});
   } catch (error) {
      logger.error(error);
      res.status(500).send(error);
   }
})

module.exports = router;