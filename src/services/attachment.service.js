import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from 'sequelize';
import logger from 'bc/config/logger.js';
import { BASE_SERVER_URL } from 'bc/config/config.js';
import db from 'bc/config/db.js';
import moment from 'moment';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Op } = sequelize;
const Attachment = db.projectAttachment;

function getPublicUrl(filename) {
  return `${BASE_SERVER_URL}/${'images'}/${filename}`;
}

function getDestFile(filename) {
  let root = path.join(__dirname, `../../public/images`);
  if (filename.includes('/')) {
    let folders = filename.split('/');
    for (let i = 0 ; i < folders.length - 1; i++) {
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

const getFileSize = async (filename) => {
  try {
    const stats = fs.statSync(getDestFile(filename));
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes;
  } catch (err) {
    logger.error(err);
    return 0;
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
  if (!json['where']) {
    json['where'] = {
      attachment_reference_key_type: 'FILENAME'
    }
  } else {
    json['where']['attachment_reference_key_type'] = 'FILENAME';
  }
  let attachments = await Attachment.findAll(json);
  for (const attachment of attachments) {
    attachment.size = await getFileSize(attachment.attachment_url);
  }
  return attachments.map((resp) => {
    return {
      'project_attachment_id': resp.project_attachment_id,
      'file_name': resp.attachment_reference_key,
      'mime_type': resp.mime_type,
      'created_by': resp.created_by,
      'attachment_url': getPublicUrl(resp.attachment_url),
      'register_date': resp.register_date,
      'created_date': resp.created_date,
      is_cover: resp.is_cover,
      size: resp.size 
    }
  });
}

const findCoverImage = async (name) => {
  let urlImage = null;
  try {
    const attach = await Attachment.findOne({
      where: {
        file_name: { [Op.like]: '%' + name + '%' }
      }
    });
    if (attach) {
      urlImage = await attach.attachment_url;
    } else {
      urlImage = null;
    }
  } catch (err) {
    logger.error(err);
    urlImage = null;
  }

  return await urlImage;
}


const FilterUrl = async (obj) => {
  try {
    const arrayOfUrls = obj.map((element)=> element.attachment_url)
    return await arrayOfUrls;
  } catch (error) {
    logger.error(error);
    return
  }
}


const findByName = async (name) => {
  let urlImage = [];
  try {
    const attach = await Attachment.findAll({
      where: {
        attachment_reference_key: { [Op.like]: '%' + name + '%' },
        attachment_reference_key_type: 'FILENAME'
      }
    });

    if (attach.length > 0) {
      for (const url of attach) {
        urlImage.push(url.attachment_url);
      }
    }
  } catch (err) {
    logger.error(err);
    urlImage = null;
  }

  return urlImage;
}

const findByFilename = async (name) => {
  let urlImage = [];
  try {
    const attach = await Attachment.findAll({
      where: {
        attachment_reference_key: { [Op.like]: '%' + name + '%' },
        attachment_reference_key_type: 'FILENAME'
      }
    });

    if (attach.length > 0) {
      for (const url of attach) {
        urlImage.push(url.file_name);
      }
    }
  } catch (err) {
    logger.error(err);
    urlImage = null;
  }

  return urlImage;
}

const countAttachments = async () => {
  return await Attachment.count();
}

const removeAttachment = async (id) => {
  const attach = await Attachment.findByPk(id, { raw: true });
  // TODO: review delete image from folder
  let name;
  if (attach.project_id) {
    name = `${attach.project_id}/${attach.file_name}`;
  } else {
    name = attach.file_name;
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
      project_attachment_id: attach.project_attachment_id
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
  try {
    const formatTime = moment().format('YYYY-MM-DD HH:mm:ss');
    for (const file of files) {
      let name = file.originalname;
      const none = 'NONE';
      const FILENAME = 'FILENAME';
      if (projectid) {
        name = `${projectid}/${name}`
      }
      const attachmentObject = {
        attachment_url: name,
        attachment_reference_key: file.originalname,
        attachment_reference_key_type: FILENAME,
        created_by: user.email,
        user_id: user.user_id,
        created_date: formatTime,
        last_modified_by: user.email,
        last_modified_date: formatTime,
        mime_type: file.mimetype,
        project_id: projectid ? projectid : null,
        is_cover: cover ? file.originalname === cover : false
      };
      const created = await Attachment.create(attachmentObject);
    
  
      const complete = getDestFile(name);
      logger.info(`Saved ${JSON.stringify(created)}`);
      
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
  } catch (error) {
    console.log(error)
  }
}

const toggle = async (id) => {
  const attach = await Attachment.findByPk(id);
  attach.update({
    is_cover: !attach.is_cover
  });
  return attach;
}
const toggleValue = async (id, newIsCover) => {
  const attach = await Attachment.findByPk(id);
  attach.update({
    is_cover: newIsCover
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
  toggleValue,
  FilterUrl
};
