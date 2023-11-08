import express from 'express';
import db from 'bc/config/db.js';
import discussionService from 'bc/services/discussion.service.js';
import auth from 'bc/auth/auth.js';
import userService from 'bc/services/user.service.js';
import moment from 'moment';

const router = express.Router();
const ProjectDiscussionThread = db.projectDiscussionThread;
const ProjectDiscussionTopic = db.projectDiscussionTopic;
const DiscussionModerator = db.discussionModerator;
const User = db.user;
const Project = db.project;

async function getProjectDiscussionThreads(req, res) {
  try {
    const threads = await ProjectDiscussionThread.findAll();
    return res.send(threads);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getProjectDiscussionTopics(req, res) {
  try {
    const topics = await ProjectDiscussionTopic.findAll();
    return res.send(topics);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getDiscussionModerators(req, res) {
  try {
    const moderators = await DiscussionModerator.findAll();
    return res.send(moderators);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getProjectDiscussion(req, res) {
  const { project_id, topic_place } = req.body;
  const topic_type = topic_place === 'details' ? 'DETAILS' : 'CREATE';
  try {
    const threads = await ProjectDiscussionTopic.findOne(
      {
        where: {
          project_id: project_id,
          topic: topic_type
        },
        include: [
          {
            model: ProjectDiscussionThread,
            include: [
              {
                model: User,
                attributes: ['user_id', 'firstName', 'lastName', 'email', 'photo']
              }
            ],           
            order: [['created_date', 'DESC']] 
          }
        ]
      }
    );
    if (threads && threads.project_discussion_threads) {
      threads.project_discussion_threads.sort((a, b) => 
        moment(b.created_date).diff(moment(a.created_date))
      );
    }
    return res.send({ threads });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error", error: error.toString() });
  }
}

async function createThreadTopic(req, res) {
  const { project_id, topic_place, message } = req.body;
  const topic_type = topic_place === 'details' ? 'DETAILS' : 'CREATE';
  const userData = req.user;
  const transaction = await db.sequelize.transaction();
  let result;
  try {
    let topicExist = await ProjectDiscussionTopic.findOne({
      where: { project_id, topic: topic_type },
      transaction
    });
    let userIds = []; 
    let emailList = [];
    if (topic_type === 'DETAILS') {
      const projectStaff = await discussionService.getStaff(project_id, transaction);
      userIds = projectStaff.map(staff => staff.user.user_id);
      emailList = projectStaff.map(staff => staff.user.email);
    } else {
      const {ids, emails} = await discussionService.getLocalityEmailsIds(project_id, transaction);
      userIds = ids;
      emailList = emails;
    }
    if (topicExist) {
      const dataInThread = await discussionService.getEmailAndIdInThread(topicExist.project_discussion_topic_id, transaction);
      const emailsInThread = dataInThread.emails;
      const idsInThread = dataInThread.ids;
      userIds = [...new Set([...userIds, ...idsInThread])];
      emailList = [...new Set([...emailList, ...emailsInThread])];
    }
    userIds = userIds.filter(id => id !== userData.user_id);
    emailList = emailList.filter(email => email !== userData.email);
    if (topicExist) {
      const thread = await discussionService.createThread(
        topicExist.project_discussion_topic_id,
        message,
        userData,
        transaction
      );
      result = { topic: topicExist, thread};
    } else {
      const topic = await discussionService.createTopic(
        project_id,
        topic_type,
        userData,
        transaction
      );
      const thread = await discussionService.createThread(
        topic.project_discussion_topic_id,
        message,
        userData,
        transaction
      );
      result = { topic, thread };
    }
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev' || !process.env.NODE_ENV){
      const MhfdEmailsAndIds = await discussionService.getMhfdIdsAndEmails(userIds, transaction);
      const MhfdIds = MhfdEmailsAndIds.ids;
      const MhfdEmails = MhfdEmailsAndIds.emails;
      userIds = MhfdIds;
      emailList = MhfdEmails;
    }
    const createNotifications = await discussionService.createNotifications(
      userIds,
      topic_type,
      project_id,
      userData,
      transaction
    );
    result = { ...result, userId: userIds, emails: emailList };
    const currentProject = await Project.findOne({
      where: { project_id: project_id },
      transaction
    });
    const projectName = currentProject.project_name;
    const type = topic_place === 'details' ? 'Project Detail' : 'Edit Project';
    if (emailList.length > 0 && process.env.NODE_ENV === 'prod') {    
      for (const email of emailList) {
        const nameSender = `${userData.firstName} ${userData.lastName}`;
        await userService.sendDiscussionEmail(nameSender, projectName, type, email, message);
      }
    }else{
      if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev'){
        const nameSender = `${userData.firstName} ${userData.lastName}`;
        for (const email of emailList) {          
          await userService.sendDiscussionEmail(nameSender, projectName, type, email, message);
        }
        //enable for testing
        //await userService.sendDiscussionEmail(nameSender, projectName, type, 'ricardo@vizonomy.com', message);
      }      
    }
    result = { ...result };
    await transaction.commit();
    return res.send(result);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).send({ message: "Internal Server Error", error: error.toString() });
  }
}

async function sendTestEmail(req, res) {
  try {
    const { project_id, topic_place } = req.body;
    const userId = req.user;
    const nameSender =  `${userId.firstName} ${userId.lastName}`;
    const currentProject = await Project.findOne({
      where: { project_id: project_id }
    });
    const projectName = currentProject.project_name;
    const type = topic_place === 'details' ? 'Project Detail' : 'Edit Project';
    await userService.sendDiscussionEmail(nameSender, projectName, type, 'danilson@vizonomy.com', 'test message');
    return res.send({ message: 'SUCCESS' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error", error: error.toString() });
  }   
}

async function deleteThreadTopic(req, res) {
  const { message_id } = req.body;
  const transaction = await db.sequelize.transaction();
  try {
    const thread = await ProjectDiscussionThread.findOne({
      where: { project_discussion_thread_id: message_id },
      transaction
    });
    if (thread) {
      await thread.destroy({ transaction });
    }
    await transaction.commit();
    return res.send({ message: 'SUCCESS' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).send(error);
  }
}

async function editThreadTopic(req, res) {
  const { message_id, message } = req.body;
  const userData = req.user;
  const transaction = await db.sequelize.transaction();
  let result = {};
  try {
    const threadData = await ProjectDiscussionThread.findOne({
      where: { project_discussion_thread_id: message_id },
      transaction
    });
    const topicData = await ProjectDiscussionTopic.findOne({
      where: { project_discussion_topic_id: threadData.project_discussion_topic_id },
      transaction
    });   
    let userIds = []; 
    let emailList = [];    
    if (topicData.topic === 'DETAILS') {
      const projectStaff = await discussionService.getStaff(topicData.project_id, transaction);
      userIds = projectStaff.map(staff => staff.user.user_id);
      emailList = projectStaff.map(staff => staff.user.email);
    } else {
      const {ids, emails} = await discussionService.getLocalityEmailsIds(topicData.project_id, transaction);
      userIds = ids;
      emailList = emails;
    }
    const dataInThread = await discussionService.getEmailAndIdInThread(topicData.project_discussion_topic_id, transaction);
    const emailsInThread = dataInThread.emails;
    const idsInThread = dataInThread.ids;
    userIds = [...new Set([...userIds, ...idsInThread])];
    emailList = [...new Set([...emailList, ...emailsInThread])];
    userIds = userIds.filter(id => id !== userData.user_id);
    emailList = emailList.filter(email => email !== userData.email);
    const thread = await discussionService.editThread(
      message_id,
      message,
      userData,
      transaction
    );   
    const topic_type = topicData.topic;
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev' || !process.env.NODE_ENV){
      const MhfdEmailsAndIds = await discussionService.getMhfdIdsAndEmails(userIds, transaction);
      const MhfdIds = MhfdEmailsAndIds.ids;
      const MhfdEmails = MhfdEmailsAndIds.emails;
      userIds = MhfdIds;
      emailList = MhfdEmails;
    }
    const createNotifications = await discussionService.createNotifications(
      userIds,
      topic_type,
      topicData.project_id,
      userData,
      transaction
    );
    const currentProject = await Project.findOne({
      where: { project_id: topicData.project_id },
      transaction
    });
    const projectName = currentProject.project_name;
    const type = topic_type === 'DETAILS' ? 'Project Detail' : 'Edit Project';
    if (emailList.length > 0 && process.env.NODE_ENV === 'prod') {    
      for (const email of emailList) {
        const nameSender = `${userData.firstName} ${userData.lastName}`;
        await userService.sendDiscussionEmail(nameSender, projectName, type, email, message);
      }
    }else{
      if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev'){
        const nameSender = `${userData.firstName} ${userData.lastName}`;
        for (const email of emailList) {          
          await userService.sendDiscussionEmail(nameSender, projectName, type, email, message);
        }
        //enable for testing
        //await userService.sendDiscussionEmail(nameSender, projectName, type, 'ricardo@vizonomy.com', message);
      }
    }
    result = { ...thread, userId: userIds, emails: emailList, createNotifications };
    await transaction.commit();
    return res.send(result);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).send({ message: "Internal Server Error", error: error.toString() });
  }
}


router.get('/', getProjectDiscussionThreads);
router.get('/project-discussion-topics', getProjectDiscussionTopics);
router.get('/discussion-moderators', getDiscussionModerators);
router.post('/', getProjectDiscussion);
router.put('/', [auth], createThreadTopic);
router.delete('/', [auth], deleteThreadTopic);
router.post('/test-email', [auth], sendTestEmail);
router.post('/edit-thread', [auth], editThreadTopic)

export default router;
