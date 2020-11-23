const fs = require('fs');
const logger = require('../config/logger');

const db = require('../config/db');
const Attachment = db.attachment;
const User = db.user;
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { STORAGE_NAME, STORAGE_URL } = require('../config/config');
const { Op } = require("sequelize");
const { resolve } = require('path');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../config/mhfd-cloud-8212a0689e50.json'),
  projectId: 'mhfd-cloud'
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
  return attachments.map((resp) => {
    return {
      '_id': resp._id,
      'filename': {
        'filename': resp.filename,
        'mimetype': resp.mimetype,
        'value': resp.value
      },
      'mimetype': resp.mimetype,
      'user_id': resp.user_id,
      'value': resp.value,
      'register_date': resp.register_date,
      'filesize': resp.filesize,
      'createdAt': resp.createdAt
    }
  });
}

const migrateFilesFromCloud = async () => {

  const attachments = await Attachment.findAll();
  if (attachments.length === 0) {
    const [files] = await storage.bucket(STORAGE_NAME).getFiles();
    const users = await User.findAll();

    const user = users[0];
    files.forEach(file => {
      let attach = {};
      attach.value = getPublicUrl(file.name);
      attach.user_id = user._id;
      attach.filename = file.name;
      attach.mimetype = file.metadata.contentType;
      attach.register_date = new Date();
      attach.filesize = file.metadata.size;
      Attachment.create(attach);
    });
  }

}

const findCoverImage = async (name) => {
  let urlImage = null;
  try {
    const attach = await Attachment.findOne({
      where: {
        filename: { [Op.iLike]: '%' + name + '%' }
      }
    });
    if (attach) {
      urlImage = await attach.value;
    } else {
      urlImage = null;
    }
  } catch (err) {
    logger.error(err);
    urlImage = null;
  }

  return await urlImage;
}

const exists = async (name) => {
  console.log('NAME', name);
  const file = await storage.bucket(STORAGE_NAME).file(name).exists();
  console.log('ATTACHMENTSSSSS', file);
}

const findByName = async (name) => {
  let urlImage = [];
  try {
    const attach = await Attachment.findAll({
      where: {
        filename: { [Op.iLike]: '%' + name + '%' }
      }
    });    
    
    if (attach.length > 0) {
      for (const url of attach) {
        urlImage.push(url.value);
      }
    }
  } catch (err) {
    logger.error(err);
    urlImage = null;
  }

  return await urlImage;
}

const findByFilename = async (name) => {
  let urlImage = [];
  try {
    const attach = await Attachment.findAll({
      where: {
        filename: { [Op.iLike]: '%' + name + '%' }
      }
    });    
    
    if (attach.length > 0) {
      for (const url of attach) {
        urlImage.push(url.filename);
      }
    }
  } catch (err) {
    logger.error(err);
    urlImage = null;
  }

  return await urlImage;
}

const countAttachments = async () => {
  return await Attachment.count();
}

const removeAttachment = async (id) => {
  const attach = await Attachment.findByPk(id, { raw: true });
  await storage.bucket(STORAGE_NAME).file(attach.filename).delete();
  console.log(attach.filename);
  await Attachment.destroy({
    where: {
      _id: attach._id
    }
  });

}

const uploadFiles = async (user, files) => {
  const bucket = storage.bucket(STORAGE_NAME);
  console.log('iniciando attach');
  for (const file of files) {
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
    const complete = path.join(__dirname, './tmp/' + file.originalname) ;
    const prom = new Promise((resolve, reject) => {
      fs.writeFile(complete, file.buffer, (error) => {
        if (error) {
          console.log('error');
          reject('the error ', error);
        }
        console.log('bla bla bla');
        resolve('OK');
      });
    });
    console.log('entro');
    const t1 = await prom;
    console.log('paso');
    const read = new Promise((res, rej) => {
      fs.readFile(complete, (error, data) => {
        console.log(error, data);
        if (error) {
          return rej('error');
        }
        console.log('my data is ', data);
        return res('ok');
      });
    });
    const t2 = await read;
    console.log('step');
    const newPromise = new Promise((resolve, reject) => {
      blob.createWriteStream({
        metadata: { contentType: file.mimetype }
      }).on('finish', async response => {
        await blob.makePublic();
        resolve(attach);

      }).on('error', err => {
        reject('upload error: ', err);
      }).end(file.buffer);
    });
    await newPromise;
  }
}

module.exports = {
  listAttachments,
  uploadFiles,
  countAttachments,
  removeAttachment,
  migrateFilesFromCloud,
  findByName,
  findCoverImage,
  exists,
  findByFilename
}