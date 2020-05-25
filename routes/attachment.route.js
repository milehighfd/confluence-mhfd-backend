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
/* const { createWriteStream, existsSync, mkdirSync } = require('fs');
const { ApolloServer, gql } = require('apollo-server-express');
const { Storage } = require('@google-cloud/storage');
const files = require('../lib/files');
 */
// const files = [];
// const typeDefs = gql`
// type Query {
//   files: [String]
// }

// type Mutation {
//   uploadFile(file: Upload!): Boolean
// }
// `;

/* const gc = new Storage({
   keyFilename: path.join(__dirname, '../config/develop-test-271312-20b199f0adbe.json'),
   projectId: 'develop-test-271312'
});

const mhfdBucket = gc.bucket('mhfd2-test'); */

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
      //console.log('attach', req.files);
      res.send({message: "ok"});
      await attachmentService.uploadFiles(user, req.files);
   } catch (error) {
      logger.error(error);
      res.status(500).send(error);
   }
});

router.get('/get-files', auth, async (req, res) => {
   try {
      const { page = 1, limit = 10, sortby = 'register_date',
          sorttype = 'desc' } = req.query;
      const files = await attachmentService.listAttachments(page, limit, sortby, sorttype);
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

router.delete('/remove', auth, async (req, res) => {
   try {
      res.send({message: "ok"});
   } catch (error) {
      logger.error(error);
      res.status(500).send(error);
   }
})

module.exports = router;