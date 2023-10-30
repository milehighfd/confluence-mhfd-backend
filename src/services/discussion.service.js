import sequelize from "sequelize";
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';

const { Op } = sequelize;
const ProjectDiscussionThread = db.projectDiscussionThread;
const ProjectDiscussionTopic = db.projectDiscussionTopic;
const ProjectStaff = db.projectStaff;
const User = db.user;

async function createTopic(projectId, topicType, user, transaction) {
  try {
    return await ProjectDiscussionTopic.create({
      project_id: projectId,
      topic: topicType,
      is_discussion_thread_open: true,
      created_date: moment().format('YYYY-MM-DD HH:mm:ss'),
      modified_date: moment().format('YYYY-MM-DD HH:mm:ss'),
      last_modified_by: user?.email,
      created_by: user?.email,
      related_project_discussion_topic_id: null
    }, { transaction });
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function createThread(topicId, message, user, transaction) {
  try {
    const date = moment().format('YYYY-MM-DD HH:mm:ss');
    return await ProjectDiscussionThread.create({
      project_discussion_topic_id: topicId,
      is_internal: false,
      message: message,
      user_id: user?.user_id,
      created_date: date
    }, { transaction });
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function getStaff(projectId) {
  try {
    return await ProjectStaff.findAll({
      where: {
        project_id: projectId,
      },
      attributes: ['project_id', 'is_active'],
      include: [
        {
          model: User,
          attributes: ['user_id', 'email']
        }
      ]
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export default {
  createTopic,
  createThread,
  getStaff
}
