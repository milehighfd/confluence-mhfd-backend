import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
const router = express.Router();
const Notifications = db.notifications;

const getNotifications = async (req, res) => {
    let notification = await Notifications.findAll({
        attributes: ['project_id', 'project_action_item_id', 'code_rule_action_item_id'],
        include: {
            all: true
        },
    });
    logger.info(`Finished function findAll for projectationitem.route/`);
    res.send(notification);
}

router.get('/', getNotifications);

export default router;