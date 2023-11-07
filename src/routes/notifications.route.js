import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';
import { createNotifications,deleteNotifications } from 'bc/utils/functionsNotifications.js';

const router = express.Router();
const Notifications = db.notifications;
const User = db.user;
const ProjectStatusNotification = db.projectStatusNotification;
const ProjectStatus = db.projectStatus;
const CodePhaseType = db.codePhaseType;
const Project = db.project;
const codeProjectType = db.codeProjectType;

const getNotifications = async (req, res) => {
  logger.info(`Starting endpoint notifications.route/filters with params ${JSON.stringify(req.user, null, 2)}`);
  try {
    let notification = await Notifications.findAll({
      attributes: ['notification_id','subject','created_by','created_date'],
      include: [{
        model: Project,
        attributes: ['project_id', 'project_name'],
        include: [{
          model: codeProjectType,
          attributes: ['project_type_name']
        }]
      }, {
        model: User,
        attributes: ['user_id', 'name']
      }, {
        model: ProjectStatusNotification,
        attributes: ['project_status_notification'],
        include: [{
          model: ProjectStatus,
          attributes: ['code_phase_type_id', 'planned_end_date'],
          include: [{
            attributes: ['phase_name'],
            model: CodePhaseType,
          }]
        }]
      }],
      where: [{ recipient_user_id: req.user.user_id }, { is_read: false }],
      order: [['created_date', 'DESC']]
    });
    const createdBys = notification.map(n => n.created_by);
    const users = await User.findAll({
      attributes: ['firstName', 'lastName', 'email'],
      where: { email: createdBys }
    });    
    const notificationsWithNames = notification.map(n => {
      const user = users.find(u => u.email === n.created_by);
      return {
        ...n.toJSON(),
        firstName: user?.firstName,
        lastName: user?.lastName
      };
    });
    res.send(notificationsWithNames);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
}

const updateNotification = async (req, res) => {
  logger.info(`Starting endpoint notifications.route/filters with params ${JSON.stringify(req.user, null, 2)}`);
  const notification_id = req.body.notification_id;
  try {
    await Notifications.update(
      { is_read: true },
      { where: { notification_id: notification_id } }
    )
    return res.status(200).send({ message: 'SUCCESS' });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
}

const testNotifications = async (req, res) => {
  try {
    //createNotifications();
    //deleteNotifications();
    return res.status(200).send({ message: 'SUCCESS' });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
}

const readAllNotifications = async (req, res) => {
  console.log(req.user)
  try {
    const user_id = req.user.user_id;
    await Notifications.update(
      { is_read: true },
      { where: { recipient_user_id: user_id } }
    )
    return res.status(200).send({ message: 'SUCCESS' });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
}

router.get('/', auth, getNotifications);
router.post('/', auth, updateNotification);
router.get('/test', testNotifications);
router.post('/read-all', auth, readAllNotifications)

export default router;