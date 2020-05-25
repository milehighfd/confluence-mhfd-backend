const fs = require('fs');
const logger = require('../config/logger');

const db = require('../config/db');
const Attachment = db.attachment;
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { STORAGE_NAME, STORAGE_URL } = require('../config/config');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../config/mhfd-dev-14f5db72ccee.json'),
  projectId: 'mhfd-dev'
});

function getPublicUrl (filename) {
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

const countAttachments = async () => {
  return await Attachment.count();
}

const removeAttachment = async (id) => {
  const attach = await Attachment.findByPk(id, {raw: true});
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
  removeAttachment
}