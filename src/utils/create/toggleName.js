import sequelize from 'sequelize';
import db from 'bc/config/db.js';

const { Op } = sequelize;
const Attachment = db.projectAttachment;

export const toggleName = async (name, transaction = null) => {
  try {
    await Attachment.update(
      { 
        is_cover: false 
      },
      {
        where: {
          [Op.not]: { attachment_reference_key: name }
        },
        transaction: transaction
      }
    );
    await Attachment.update(
      { 
        is_cover: true 
      },
      {
        where: { attachment_reference_key: name },
        transaction: transaction
      }
    );
  } catch (error) {
    throw error;
  }
}