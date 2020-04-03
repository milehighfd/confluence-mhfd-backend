const express = require('express');
const router = express.Router();
const Attachement = require('../models/attachment.model');
const uploadFile = require('express-fileupload');
const path = require('path');
const auth = require('../auth/auth');
const { createWriteStream, existsSync, mkdirSync } = require('fs');
const { ApolloServer, gql } = require('apollo-server-express');
const { Storage } = require('@google-cloud/storage');
const files = require('../lib/files');

// const files = [];
// const typeDefs = gql`
// type Query {
//   files: [String]
// }

// type Mutation {
//   uploadFile(file: Upload!): Boolean
// }
// `;

const gc = new Storage({
   keyFilename: path.join(__dirname, '../config/develop-test-271312-20b199f0adbe.json'),
   projectId: 'develop-test-271312'
});

const mhfdBucket = gc.bucket('mhfd2-test');

var fs = require('fs');
var multer = require('multer');

router.post('/', async (req, res) => {
   try {
      const attachment = new Attachement(req.body);
      await attachment.save();
   } catch (error) {
      res.status(500).send({error: error});
   }
});

router.post('/upload-file', [auth, 
   files.multer.single('file'),
   files.sendToUploadToGCS],
   async (req, res, next) => {
   //console.log(req);
   let data = req.body;
   var attachment = new Attachement();
   attachment.file = 'ruta'; //req.file.cloudStoragePublicUrl;
   attachment.save();
   res.status(200).send({message: ''});
   // if(req.files) {
   //    var file = req.files.filename;
   // }
});

module.exports = router;