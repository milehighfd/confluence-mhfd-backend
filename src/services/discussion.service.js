import sequelize from "sequelize";
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';

const { Op } = sequelize;
const ProjectDiscussionThread = db.projectDiscussionThread;
const ProjectDiscussionTopic = db.projectDiscussionTopic;

async function createTopic(projectId, topicType, userId) {
  return await ProjectDiscussionTopic.create({
    project_id: projectId,
    topic: topicType,
    is_discussion_thread_open: true,
    created_date: new Date(),
    modified_date: new Date(),
    last_modified_by: userId,
    created_by: userId,
    related_project_discussion_topic_id: null
  });
}

async function createThread(topicId, message, userId) {
  return await ProjectDiscussionThread.create({
    project_discussion_topic_id: topicId,
    is_internal: false,
    message: message,
    user_id: userId,
    created_date: new Date()
  });
}

export default {
  createTopic,
  createThread
}
