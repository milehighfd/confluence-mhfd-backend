const multer = require('multer');
const path = require('path');

const storageEngine = multer.diskStorage({
   destination: './public/files',
   filename: function(req, file, fn) {
      console.log('msg 1');
      fn(null, new Date().getTime().toString() + '-' +
      file.fieldname + path.extname(file.originalname));
   }
});

const upload = multer({
   storage: storageEngine,
   limits: { fieldSize: 200000 },
   fileFilter: function(req, file, callback) {
      console.log('msg 2');
      validateFile(file, callback);
   }
}).single('attachment');

var validateFile = function(file, cb) {
   allowedFileTypes = /jpeg|jpg|png|gif/;
   const extension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
   const mimeType = allowedFileTypes.test(file.mimeType);
   console.log('msg 3');
   if(extension && mimeType) {
      return cb(null, true);
   } else {
      cb('Invalid file type. Only JPEG, PNG and GIF file are allowed.')
   }
}

module.exports = upload;