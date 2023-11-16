import sequelize from 'sequelize';
import db from 'bc/config/db.js';
import moment from 'moment';

const { Op } = sequelize;
const Attachment = db.projectAttachment;

export const toggleName = async (name, project_id, transaction = null) => {
  try {
    await Attachment.update(
      { 
        is_cover: false,
        last_modified_date: moment().format('YYYY-MM-DD HH:mm:ss'), 
      },
      {
        where: {
          [Op.not]: { attachment_reference_key: name },
          [Op.and]: { project_id: project_id }
        },
        transaction: transaction
      }
    );
    await Attachment.update(
      { 
        is_cover: true,
        last_modified_date: moment().format('YYYY-MM-DD HH:mm:ss'), 
      },
      {
        where: { 
          project_id: project_id ,
          attachment_reference_key: name
        },
        transaction: transaction
      }
    );
  } catch (error) {
    throw error;
  }
}