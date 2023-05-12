import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';

const router = express.Router();
const Notifications = db.notifications;

const getNotifications = async (req, res) => {
  logger.info(`Starting endpoint notifications.route/filters with params ${JSON.stringify(req.user, null, 2)}`);
  let notification = await Notifications.findAll({
    include: {
      all: true
    },
    where : {recipient_user_id : req.user.user_id}
    });
  res.send(notification);
}

router.get('/', auth, getNotifications);

export default router;