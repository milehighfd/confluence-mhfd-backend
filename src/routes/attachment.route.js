import express from 'express';
import Multer from 'multer';
import db from 'bc/config/db.js';
import auth from 'bc/auth/auth.js';
import attachmentService from 'bc/services/attachment.service.js';
import logger from 'bc/config/logger.js';
import { BASE_SERVER_URL } from 'bc/config/config.js';

const { sequelize } = db;
const router = express.Router();
const Attachment = db.projectAttachment;

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
   logger.info(`Starting endpoint attachment.rote/update-gs with params ${JSON.stringify(req.params, null, 2)}`); 
   logger.info(`Starting function query for attachment.rote/update-gs`);
   const update = await sequelize.query(`UPDATE attachments SET value = REPLACE(value, https://storage.googleapis.com/mhfd-cloud.appspot.com/', '${getImageURL()}')`);
   logger.info(`Finished function query for attachment.rote/update-gs`);
   console.log(update);
   let boards = await Attachment.findAll();
  res.send(boards);
});


router.post('/upload-file', [auth, multer.array('file')], async (req, res) => {
   logger.info(`Starting endpoint attachment.rote/update-file with params ${JSON.stringify(req.params, null, 2)}`);
   try {
      if (!req.files) {
         logger.error('You must send user photo');
         return res.status(400).send({ error: 'You must send user photo' });
      }
      const user = req.user;
      logger.info(`Starting function uploadFiles for attachment.rote/update-file`);
      await attachmentService.uploadFiles(user, req.files);
      logger.info(`Finished function uploadFiles for attachment.rote/update-file`);
      res.send({message: "upload files"});
   } catch (error) {
      logger.error(error);
      res.status(500).send(error);
   }
});

router.get('/by-project/:projectid', async (req, res) => {
   logger.info(`Starting endpoint attachment.rote/by-project/:projectid with params ${JSON.stringify(req.params, null, 2)}`);
   const { projectid } = req.params;
   logger.info(`Starting function findAll for attachment.rote/by-project/:projectid`);
   let attachments = await Attachment.findAll({
      where: {
         project_id: projectid
      }
   })
   res.send({
      attachments
   })
   logger.info(`Finished function findAll for attachment.rote/by-project/:projectid`);
});

router.get('/get-files', async (req, res) => {
   logger.info(`Starting endpoint attachment.rote/get-files with params ${JSON.stringify(req.params, null, 2)}`);
   try {
      const { page = 1, limit = 10, sort = 'created_date',
          sorttype = 'desc', projectid } = req.query;
      //console.log('sort', sortby);
      logger.info(`Starting function listAttachments for attachment.rote/get-files`);
      const files = await attachmentService.listAttachments(page, limit, sort, sorttype, projectid);
      logger.info(`Finished function listAttachments for attachment.rote/get-files`);
      logger.info(`Starting function countAttachments for attachment.rote/get-files`);
      const count = await attachmentService.countAttachments();
      logger.info(`Finished function countAttachments for attachment.rote/get-files`);
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
   logger.info(`Starting endpoint attachment.rote/toggle/:id with params ${JSON.stringify(req.params, null, 2)}`);
   const id = req.params.id;
   logger.info(`Starting function toggle for attachment.rote/toogle/:id`);
   let attach = await attachmentService.toggle(id);
   logger.info(`Finished function toggle for attachment.rote/toogle/:id`);
   res.send(attach);
})

router.put('/toggleput/:id/:value', auth, async (req, res) => {
   logger.info(`Starting endpoint attachment.rote/toggle/:id/:value with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params.id;
  const newIsCover = req.params.value
  logger.info(`Starting function toggleValue for attachment.rote/toggleput/:id/:value`);
  let attach = await attachmentService.toggleValue(id, newIsCover);
  logger.info(`Finished function toggleValue for attachment.rote/toggleput/:id/:value`);
  res.send(attach);
});

router.delete('/remove/:id', auth, async (req, res) => {
   logger.info(`Starting endpoint attachment.rote/remove/:id with params ${JSON.stringify(req.params, null, 2)}`);
   try {
      const id = req.params.id;
      logger.info(`Starting function removeAttachment for attachment.rote/remove/:id`);
      await attachmentService.removeAttachment(id);
      logger.info(`Finished function removeAttachment for attachment.rote/remove/:id`);
      res.send({message: "Attachment remove successfully."});
   } catch (error) {
      logger.error(error);
      res.status(500).send(error);
   }
});

router.delete('/remove', auth, async (req, res) => {
   logger.info(`Starting endpoint attachment.rote/remove/:id with params ${JSON.stringify(req.params, null, 2)}`);
   try {
      const ids = req.body.ids;
      console.log(ids)
      const promises = [];
      for (const id of ids) {
         promises.push(attachmentService.removeAttachment(id));
      }
      Promise.all(promises)
         .then(() => {
            res.send({ message: "Attachments removed successfully." });
         })
         .catch((error) => {
            res.status(500).send({ message: `Error removing attachments: ${error}` });
         });
   } catch (error) {
      logger.error(error);
      res.status(500).send(error);
   }
});

router.get('/download/:id', auth, async (req, res) => {
   try {
      const id = +req.params.id;
      const { images } = req.query;
      logger.info(`Starting function download for attachment.rote/download/:id`);
      const data = await attachmentService.downloadZip(id, images);
      logger.info(`Finished function download for attachment.rote/download/:id`);
      res.send(data);
   } catch(error) {
      res.status(500).send(error);
   }
});

export default router;
