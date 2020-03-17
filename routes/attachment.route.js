const express = require('express');
const router = express.Router();
const Attachement = require('../models/attachment.model');
const uploadFile = require('express-fileupload');
//const GridFsStorage = require("multer-gridfs-storage");
//const cors = require("cors");
//const Grid = require("gridfs-stream");

router.use(uploadFile());

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
// router.post("/upload", {
//    upload(req, res, (err) => {
//    console.log("Request ---", req.body);
//    console.log("Request file ---", req.file);//Here you get file.
//    /*Now do where ever you want to do*/
//    if(!err)
//          return res.send(200).end();
// });
// };
// );
// router.get('/:idProject', async (req, res) => {
// });

module.exports = router;