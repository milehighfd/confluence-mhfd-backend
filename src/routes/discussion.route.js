import express from 'express';
import db from 'bc/config/db.js';
import discussionService from 'bc/services/discussion.service.js';
import auth from 'bc/auth/auth.js';

const router = express.Router();
const ProjectDiscussionThread = db.projectDiscussionThread;
const ProjectDiscussionTopic = db.projectDiscussionTopic;
const DiscussionModerator = db.discussionModerator;
const User = db.user;

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
    if (topicExist) {
      const thread = await discussionService.createThread(
        topicExist.project_discussion_topic_id,
        message,
        userId,
        transaction
      );
      result = { topic: topicExist, thread };
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
      result = { topic, thread };
    }
    await transaction.commit();
    return res.send(result);
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

export default router;
