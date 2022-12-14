import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectAttachment = db.projectAttachment;
const Project = db.Project;

const saveAttachment = async (attachment) => {
  try {
    
    const newAttachment = ProjectAttachment.build({
      attachment_url: attachment.attachment_url,
      attachment_reference_key: attachment.attachment_reference_key,
      attachment_reference_key_type: attachment.attachment_reference_key_type,
      created_by: attachment.created_by,
      created_date: attachment.created_date,
      last_modified_by: attachment.last_modified_by,
      mime_type: attachment.mime_type,
      project_id: attachment.project_id,
      last_modified_date: attachment.last_modified_date
    });
    delete attachment.project_attachment_id;
    await newAttachment.save();
    logger.info(`Saved ${JSON.stringify(newAttachment.toJSON())}`);
    return newAttachment;
  } catch (error) {
    logger.error(`SOME ERROR: ${error}`)
    return null;
  }
}

const getAttachmentsByProjectId = async (id) => {
  const project = await ProjectAttachment.findAll({
    where: {
      project_id: id
    }
  });
  logger.info(`Found attachment for project: ${project}`)
  return project;
}

export default {
  saveAttachment,
  getAttachmentsByProjectId
}