const express = require('express');
const router = express.Router();
const db = require('../config/db');
const Attachment = db.attachment;
const path = require('path');
const auth = require('../auth/auth');
var fs = require('fs');
const Multer = require('multer');
const attachmentService = require('../services/attachment.service');
const logger = require('../config/logger');
const { sequelize } = require('../config/db');
const { BASE_SERVER_URL } = require('../config/config');

const multer = Multer({
   storage: Multer.MemoryStorage,
   limits: {
     fileSize: 50 * 1024 * 1024
   }
 });

 function getImageURL() {
   return `${BASE_SERVER_URL}/${'images'}/`;
 }

router.get('/update-gs', async (req, res) => {
   const update = await sequelize.query(`UPDATE attachments 
   SET 
       value = REPLACE(value,
           'https://storage.googleapis.com/mhfd-cloud.appspot.com/',
           '${getImageURL()}')`);
   console.log(update);
   let boards = await Attachment.findAll();
  res.send(boards);
});

router.post('/upload-file', [auth, multer.array('file')], async (req, res) => {
   try {
      if (!req.files) {
         logger.error('You must send user photo');
         return res.status(400).send({ error: 'You must send user photo' });
      }
      const user = req.user;
      await attachmentService.uploadFiles(user, req.files);
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

router.get('/by-project/:projectid', async (req, res) => {
   const { projectid } = req.params;
   let attachments = await Attachment.findAll({
      where: {
         project_id: projectid
      }
   })
   res.send({
      attachments 
   })
})

router.get('/get-files', async (req, res) => {
   try {
      const { page = 1, limit = 10, sort = 'register_date',
          sorttype = 'desc', projectid } = req.query;
      //console.log('sort', sortby);
      const files = await attachmentService.listAttachments(page, limit, sort, sorttype, projectid);
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

router.put('/toggle/:id', auth, async (req, res) => {
   const id = req.params.id;
   let attach = await attachmentService.toggle(id);
   res.send(attach);
})

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