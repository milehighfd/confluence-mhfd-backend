const fs = require('fs');
const logger = require('../config/logger');

const db = require('../config/db');
const Attachment = db.attachment;
const User = db.user;
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { STORAGE_NAME, STORAGE_URL } = require('../config/config');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../config/mhfd-dev-14f5db72ccee.json'),
  projectId: 'mhfd-dev'
});

function getPublicUrl(filename) {
  return `${STORAGE_URL}/${STORAGE_NAME}/${filename}`;
}

const listAttachments = async (page, limit, sortByField, sortType) => {
  const attachments = await Attachment.findAll({
    offset: limit * (page - 1),
    limit: limit,
    order: [
      [sortByField, sortType]
    ]
  });
  return attachments;
}

const migrateFilesFromCloud = async () => {

  const attachments = await Attachment.findAll();
  //console.log('attach', attachments.size);
  if (attachments.length === 0) {
    const [files] = await storage.bucket(STORAGE_NAME).getFiles();
    const users = await User.findAll();

    const user = users[0];
    //console.log('Files:');
    files.forEach(file => {
      //if (file.name.includes('projects/') && file.name !== 'projects/') {
      //console.log('file', file);
      //console.log(file.name.lastIndexOf('/'));
      //console.log(file.name.substring(file.name.lastIndexOf('/') + 1, file.name.length));
      let attach = {};
      attach.value = getPublicUrl(file.name);
      attach.user_id = user._id;
      attach.filename = file.name; //.substring(file.name.lastIndexOf('/') + 1, file.name.length);
      attach.mimetype = file.metadata.contentType;
      attach.register_date = new Date();
      attach.filesize = file.metadata.size;
      Attachment.create(attach);
      //}
      //console.log(file.name);
    });
  }

}

const countAttachments = async () => {
  return await Attachment.count();
}

const removeAttachment = async (id) => {
  const attach = await Attachment.findByPk(id, { raw: true }); // 'projects/' + 
  await storage.bucket(STORAGE_NAME).file(attach.filename).delete();
  await Attachment.destroy({
    where: {
      _id: attach._id
    }
  });
}

const uploadFiles = async (user, files) => {
  const bucket = storage.bucket(STORAGE_NAME);

  files.forEach(file => {
    const name = file.originalname;
    const blob = bucket.file(name);
    let attach = {};
    attach.value = getPublicUrl(name);
    attach.user_id = user._id;
    attach.filename = file.originalname;
    attach.mimetype = file.mimetype;
    attach.register_date = new Date();
    attach.filesize = file.size;
    Attachment.create(attach);
    const newPromise = new Promise((resolve, reject) => {
      blob.createWriteStream({
        metadata: { contentType: file.mimetype }
      }).on('finish', async response => {
        await blob.makePublic();
        resolve(getPublicUrl(name));
      }).on('error', err => {
        reject('upload error: ', err);
      }).end(file.buffer);
    });
  });
}

module.exports = {
  listAttachments,
  uploadFiles,
  countAttachments,
  removeAttachment,
  migrateFilesFromCloud
}