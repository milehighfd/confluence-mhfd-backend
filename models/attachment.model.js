const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var AttachmentSchema = new Schema({
   file: String,
   projectId: [{
      type: Schema.Types.ObjectId,
      ref: 'Project'
   }]
});

const Attachment = mongoose.model('Attachment', AttachmentSchema);

module.exports = Attachment;