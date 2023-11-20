import sequelize from "sequelize";
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';

const { Op } = sequelize;
const ProjectDiscussionThread = db.projectDiscussionThread;
const ProjectDiscussionTopic = db.projectDiscussionTopic;
const ProjectStaff = db.projectStaff;
const User = db.user;
const Project = db.project;
const ProjectServiceArea = db.projectServiceArea;
const BoardLocality = db.boardLocality;
const CodeServiceArea = db.codeServiceArea;
const Notifications = db.notifications;
const BusinessAssociateContact = db.businessAssociateContact;
const businessAdress = db.businessAdress;
const businessAssociates = db.businessAssociates;

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

async function getStaff(projectId, transaction) {
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
        }, {
          model: BusinessAssociateContact,
          attributes: [
            'contact_name',
            'business_associate_contact_id'
          ]
        }
      ],
      transaction
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function getLocalityEmailsIds(project_id, transaction) {
  try {
    const creatorEmail = await Project.findOne({
      where: { project_id },
      attributes: ['created_by'],
      transaction
    });
    const creatorId = await User.findOne({
      where: { email: creatorEmail.created_by },
      attributes: ['user_id'],
      transaction
    });
    const projectServiceArea = await ProjectServiceArea.findAll({
      where: { project_id },
      attributes: [],
      include: [
        {
          model: CodeServiceArea,
          attributes: ['service_area_name']
        }
      ],
      transaction
    });    
    const boardLocalityEmails = await BoardLocality.findAll({
      where: { toLocality : projectServiceArea.map(area => area.CODE_SERVICE_AREA.service_area_name) },
      attributes: ['email'],
      transaction
    });
    const uniqueEmails = [...new Set(boardLocalityEmails.map(email => email.email))];
    const users = await User.findAll({
      where: { email: uniqueEmails },
      attributes: ['user_id', 'email'],
      transaction
    });    
    let userIds = users.map(user => user.user_id);
    let emailList = users.map(user => user.email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;    
    if (emailRegex.test(creatorEmail.created_by)){
      emailList.push(creatorEmail.created_by);
    }
    if (creatorId?.user_id){
      userIds.push(creatorId.user_id);
    }
    return { ids: userIds, emails: emailList };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function createNotifications(userIds, topicType, projectId, user, transaction) {
  try {
    const DISCUSSION_CODE = 3;
    const notifications = userIds.map(userId => ({
      recipient_user_id: userId,
      project_id: projectId,
      is_read: false,
      created_date: moment().format('YYYY-MM-DD HH:mm:ss'),
      modified_date: moment().format('YYYY-MM-DD HH:mm:ss'),
      last_modified_by: user.email,
      created_by: user.email,
      code_notification_type_id: DISCUSSION_CODE,
      subject: topicType
    }));
    return await Notifications.bulkCreate([...notifications], { transaction });
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function editThread(threadId, message, user, transaction) {
  try {
    const date = moment().format('YYYY-MM-DD HH:mm:ss');
    return await ProjectDiscussionThread.update({
      message,
      modified_date: date,
      last_modified_by: user?.email
    }, {
      where: { project_discussion_thread_id: threadId },
      transaction
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function getEmailAndIdInThread(topicId, transaction) {
  try {
    const topicThreads = await ProjectDiscussionTopic.findOne({
      where: { project_discussion_topic_id: topicId },
      attributes: ['project_discussion_topic_id'],
      include: [
        {
          model: ProjectDiscussionThread,
          attributes: ['project_discussion_thread_id'],
          include: [
            {
              model: User,
              attributes: ['email', 'user_id']
            }
          ]
        }
      ],
      transaction
    });
    const uniqueEmails = [...new Set(topicThreads.project_discussion_threads.map(thread => thread.user.email))];
    const uniqueIds = [...new Set(topicThreads.project_discussion_threads.map(thread => thread.user.user_id))];
    return { emails: uniqueEmails, ids: uniqueIds };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function getMhfdIdsAndEmails ( ids, transaction) {
  try {
    const MHFD_NAME = 'MHFD';
    const mhfdIds = await User.findAll({
      where: { user_id: ids },
      attributes: ['user_id', 'email'],
      include: [
        {
          model: BusinessAssociateContact,
          attributes: ['business_associate_contact_id'],
          required: true,
          include: [
            {
              model: businessAdress,
              attributes: ['business_address_id'],
              required: true,
              include: [
                {
                  model: businessAssociates,
                  attributes: ['business_associates_id','business_name'],
                  required: true,
                  where: { business_name: MHFD_NAME }
                }
              ]
            }
          ]
        }
      ],
      transaction
    });
    const mhfdEmails = mhfdIds.map(id => id?.email);
    const uniqueEmails = [...new Set(mhfdEmails)];
    const uniqueIds = [...new Set(mhfdIds?.map(id => id?.user_id))];
    return { emails: uniqueEmails, ids: uniqueIds };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export default {
  createTopic,
  createThread,
  getStaff,
  getLocalityEmailsIds,
  createNotifications,
  editThread,
  getEmailAndIdInThread,
  getMhfdIdsAndEmails
}
