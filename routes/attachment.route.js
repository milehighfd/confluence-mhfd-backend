const express = require('express');
const router = express.Router();
const Attachement = require('../models/attachment.model');
const uploadFile = require('express-fileupload');
const path = require('path');
const { createWriteStream, existsSync, mkdirSync } = require('fs');
const { ApolloServer, gql } = require('apollo-server-express');
const { Storage } = require('@google-cloud/storage');

const files = [];
const typeDefs = gql`
type Query {
  files: [String]
}

type Mutation {
  uploadFile(file: Upload!): Boolean
}
`;

const gc = new Storage({
   keyFilename: path.join(__dirname, '../config/develop-test-271312-20b199f0adbe.json'),
   projectId: 'develop-test-271312'
});

const mhfdBucket = gc.bucket('mhfd2-test');

const resolvers = {
   Query: {
      files: () => files
   },
   Mutation: {
      uploadFile: async (_, { file }) => {
         const { createReadStream, filename } = await file;
         await new Promise(res => 
            createReadStream()
               .pipe(
                  mhfdBucket.file(filename).createWriteStream({
                     resumable: false,
                     gzip: true
                  })
               )
               .on("finish", res)
            );

            files.push(filename);
            return true;
      }
   }
}

/*existsSync(path.join(__dirname, "../images")) || mkdirSync(path.join(__dirname, "../images"));

const server = new ApolloServer({ typeDefs, resolvers});
const app1 = express();
app1.use("/images", express.static(path.join(__dirname, "../images")));
server.applyMiddleware({router});*/
//const GridFsStorage = require("multer-gridfs-storage");
//const cors = require("cors");
//const Grid = require("gridfs-stream");

// router.use(uploadFile());

var upload = require('./upload');
var fs = require('fs');
var multer = require('multer');

router.post('/', async (req, res) => {
   try {
      const attachment = new Attachement(req.body);
      await attachment.save();
   } catch (error) {
      res.status(500).send(error);
   }
});

router.get('/:id', async (req, res, next) => {
   Attachement.findById(req.params.id)
      .then(attachment => {
         if (!attachment) {
            return res.status(404).send({
               message: 'Attachment not found with id ' + req.params.id
            });
         }
         res.send(attachment);
      }).catch(err => {
         if (err.kind === 'ObjectId') {
            return res.status(404).send({
               message: 'Attachment not found with id ' + req.params.id
            });
         }
         return err.status(500).send({
            message: 'Error retrieving Attachment with id ' + req.params.id
         });
      });
});


// const storage = multer.diskStorage({
//    destination: './public/uploads/',
//    filename: function (req, file, cb) {
//       cb(null, "IMAGE-" + Date.now() +
//          path.extname(file.originalname));
//    }
// });

// const upload = multer({
//    storage: storage,
//    limits: { fieldSize: 1000000 },
// }).single("myFile");

router.post('/upload', function(req, res) {
   upload(req, res, (error) => {
      if(error) {
         res.status(500).send({message: 'Error file upload ' + error });
      } else {
         if(req.file == undefined) {
            res.status(500).send({message: 'File no attached'});
         } else {
            var fullPath = 'files/' +  req.file.filename;
            console.log('msg 4');
            var document = {
               path: fullPath,
               caption: req.body.caption
            };
            var attachment = new Attachement(document);
            console.log('msg 5');
            attachment.save();
            res.status(200).send({message: 'file attached successfully'});
         }
      }
   })
});

router.post('/uploadFile', async (req, res) => {
   if(req.files) {
      var file = req.files.filename;
      console.log(file);
   }
});

module.exports = router;