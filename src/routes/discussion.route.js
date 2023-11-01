import express from 'express';
import db from 'bc/config/db.js';
import discussionService from 'bc/services/discussion.service.js';
import auth from 'bc/auth/auth.js';
import userService from 'bc/services/user.service.js';

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
            ]
          }
        ]
      }
    );
    return res.send({ threads });
  } catch (error) {
    res.status(500).send(error);
  }
}

async function createThreadTopic(req, res) {
  const { project_id, topic_place, message } = req.body;
  const topic_type = topic_place === 'details' ? 'DETAILS' : 'CREATE';
  const userId = req.user;
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
      const thread = await discussionService.createThread(
        topicExist.project_discussion_topic_id,
        message,
        userId,
        transaction
      );
      result = { topic: topicExist, thread, userId: userIds, emails: emailList };
    } else {
      const topic = await discussionService.createTopic(
        project_id,
        topic_type,
        userId,
        transaction
      );
      const thread = await discussionService.createThread(
        topic.project_discussion_topic_id,
        message,
        userId,
        transaction
      );
      result = { topic, thread, userId: userIds, emails: emailList };
    }
    const createNotifications = await discussionService.createNotifications(
      userIds,
      topic_type,
      project_id,
      userId,
      transaction
    );
    const currentProject = await Project.findOne({
      where: { project_id: project_id },
      transaction
    });
    const projectName = currentProject.project_name;
    const type = topic_place === 'details' ? 'Project Detail' : 'Edit Project';
    if (emailList.length > 0) {
      emailList.foreach(email => {
        const nameSender = `${userId.firstName} ${userId.lastName}`;
        userService.sendDiscussionEmail(nameSender, projectName, type, email);
      });
    }
    result = { ...result, createNotifications };
    await transaction.commit();
    return res.send(result);
  } catch (error) {
    await transaction.rollback();
    res.status(500).send(error);
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
    await userService.sendDiscussionEmail(nameSender, projectName, type, 'danilson@vizonomy.com');
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


router.get('/', getProjectDiscussionThreads);
router.get('/project-discussion-topics', getProjectDiscussionTopics);
router.get('/discussion-moderators', getDiscussionModerators);
router.post('/', getProjectDiscussion);
router.put('/', [auth], createThreadTopic);
router.delete('/', [auth], deleteThreadTopic);
router.post('/test-email', [auth], sendTestEmail);

export default router;
