import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';
import { ProjectAttachmentError } from '../../errors/project.error';

const Attachment = db.attachment;

export const uploadFiles = async (user, files, projectid, cover, transaction) => {
  try {
    const formatTime = moment().format('YYYY-MM-DD HH:mm:ss');
    const attachments = [];
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
      const created = await Attachment.create(attachmentObject, { transaction: transaction });  
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
      attachments.push(created);
    }
    return { success: true, attachments };
  } catch (error) {
    throw ProjectAttachmentError('Error uploading files', { cause: error });
  }
};

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