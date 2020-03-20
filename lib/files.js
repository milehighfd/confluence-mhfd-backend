const {Storage} = require('@google-cloud/storage');
var path = require('path');

// const gc = Storage({
//    keyFilename: path.join(__dirname, './config/develop-test-271312-20b199f0adbe.json'),
//    projectId: 'develop-test-271312'
// });
const storage = new Storage({
   keyFilename: path.join(__dirname, '../config/develop-test-271312-20b199f0adbe.json'),
   projectId: 'develop-test-271312'
});

const mhfdBucket = storage.bucket('mhfd2-test');

function getPublicUrl (filename) {
   return `https://storage.googleapis.com/mhfd2-test/${filename}`;
}

function sendToUploadToGCS(req, res, next) {
   //console.log(req);
   if(!req.file) {
      console.log('no file');
      return next();
   }

   const gcsname = req.file.originalname;
   const file = mhfdBucket.file(gcsname);

   const stream = file.createWriteStream({
      metadata: {
         contentType: req.file.mimetype
      },
      resumable: false
   });

   stream.on('error', (err) => {
      req.file.cloudStorageError = err;
      next(err);
   });

   stream.on('finish', () => {
      req.file.cloudStorageObject = gcsname;
      file.makePublic().then(() => {
        req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
        next();
      });
   });
  
   stream.end(req.file.buffer);
}

const Multer = require('multer');
const multer = Multer({
   storage: Multer.MemoryStorage,
   limits: {
      fileSize: 50 * 1024 * 1024
   }
});

module.exports = {
   getPublicUrl,
   sendToUploadToGCS,
   multer
};