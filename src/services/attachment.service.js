import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from 'sequelize';
import logger from 'bc/config/logger.js';
import { BASE_SERVER_URL } from 'bc/config/config.js';
import db from 'bc/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Op } = sequelize;
const Attachment = db.attachment;

function getPublicUrl(filename) {
  return `${BASE_SERVER_URL}/${'images'}/${filename}`;
}

function getDestFile(filename) {
  let root = path.join(__dirname, `../../public/images`);
  if (filename.includes('/')) {
    let folders = filename.split('/');
    for (var i = 0 ; i < folders.length - 1; i++) {
      root = path.join(root, folders[i]);
      if (!fs.existsSync(root)) {
        console.log('creating', root)
        fs.mkdirSync(root);
      }
    }
    return path.join(root, `/${folders[folders.length - 1]}`);
  } else {
    return path.join(root, `/${filename}`); 
  }
}

const listAttachments = async (page, limit, sortByField, sortType, projectid) => {
  const json = {
    offset: limit * (page - 1),
    limit: limit,
    order: [
      [sortByField, sortType]
    ]
  };
  if (projectid) {
    json['where'] = {
      project_id: projectid
    }
  }
  const attachments = await Attachment.findAll(json);
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

const findCoverImage = async (name) => {
  let urlImage = null;
  try {
    const attach = await Attachment.findOne({
      where: {
        filename: { [Op.like]: '%' + name + '%' }
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

const findByName = async (name) => {
  let urlImage = [];
  try {
    const attach = await Attachment.findAll({
      where: {
        filename: { [Op.like]: '%' + name + '%' }
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
        filename: { [Op.like]: '%' + name + '%' }
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
  // TODO: review delete image from folder
  let name;
  if (attach.project_id) {
    name = `${attach.project_id}/${attach.filename}`;
  } else {
    name = attach.filename;
  }
  let fileName = getDestFile(name);
  try {
    fs.unlinkSync(fileName);
  } catch (e) {
    console.log(e);
    console.log('Not able to delete file');
  }
  await Attachment.destroy({
    where: {
      _id: attach._id
    }
  });

}

const isImage = (type) => {
  if (type === 'image/png' || type === 'image/jpg' || type === 'image/jpeg' || type === 'image/gif') {
    return true;
  } else {
    return false;
  }
}

const uploadFiles = async (user, files, projectid, cover) => {
  for (const file of files) {
    let name = file.originalname;
    if (projectid) {
      name = `${projectid}/${name}`
    }
    let attach = {};
    attach.value = getPublicUrl(name);
    attach.user_id = user._id;
    attach.filename = file.originalname;
    attach.mimetype = file.mimetype;
    attach.register_date = new Date();
    attach.filesize = file.size;
    attach.isCover = cover ? file.originalname === cover : false
    if (projectid) {
      attach.project_id = projectid
    }
    Attachment.create(attach);
    console.log(file.mimetype);
    const complete = getDestFile(name);
    logger.info(complete);
    const prom = new Promise((resolve, reject) => {
      fs.writeFile(complete, file.buffer, (error) => {
        if (error) {
          logger.error('error ' + JSON.stringify(error));
          reject({error: error});
        }
        resolve('OK');
      });
    });
    try {
      await prom;
    } catch (error) {
      throw error;
    }
  }
}

const toggle = async (id) => {
  const attach = await Attachment.findByPk(id);
  attach.update({
    isCover: !attach.isCover
  });
  return attach;
}
const toggleValue = async (id, newIsCover) => {
  const attach = await Attachment.findByPk(id);
  attach.update({
    isCover: newIsCover
  });
  return attach;
}

export default {
  listAttachments,
  uploadFiles,
  countAttachments,
  removeAttachment,
  findByName,
  findCoverImage,
  findByFilename,
  toggle,
  toggleValue
};
