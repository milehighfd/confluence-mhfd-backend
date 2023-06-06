import express from 'express';
import db from 'bc/config/db.js';
import moment from 'moment';
const User = db.user;
const router = express.Router();
import auth from 'bc/auth/auth.js';
import config from 'bc/config/config.js';
import logActivityService from 'bc/services/logActivity.service.js';
import { ACTIVITY_TYPE } from 'bc/lib/enumConstants.js';
import logger from 'bc/config/logger.js';
import userService from 'bc/services/user.service.js';

router.get('/guest', async (req, res) => {
  logger.info(`Starting endpoint auth.route/guest with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    logger.info(`Starting function findOne for auth.route/guest`);
    let user = await User.findOne({
      where: {
        email: config.GUEST_USER
      }
    });
    logger.info(`Finished function findOne for auth.route/guest`);
    if (!user) {
      const formatTime = moment().format('YYYY-MM-DD HH:mm:ss');
      const insertQuery = `INSERT INTO users (firstName, lastName, name, email, organization, city, county,
        serviceArea, phone, designation, zipCode, title, activated, status, photo, is_sso, updatedAt, createdAt)
    OUTPUT inserted . *
    VALUES( 'guest', 'guest', 'guest', '${config.GUEST_USER}', 'Mile High Flood District', NULL,NULL,
    NULL, NULL, 'Guest', NULL, NULL, 1, 'approved', NULL, 0, '${formatTime}', '${formatTime}')`;
    await db.sequelize.query(
      insertQuery,
      {
        type: db.sequelize.QueryTypes.INSERT,
      });
      logger.info(`Starting function findOne for auth.route/guest`);
      user = await User.findOne({
        where: {
          email: config.GUEST_USER
        }
      });
      logger.info(`Finished function findOne for auth.route/guest`);
    }
    logger.info(`Starting function generateGuestAuthToken for auth.route/guest`);
    const token = await user.generateGuestAuthToken();
    logger.info(`Finished function generateGuestAuthToken for auth.route/guest`);
    let result = {};
    result['user_id'] = user.user_id;
    result['firstName'] = user.firstName;
    result['lastName'] = user.lastName;
    result['name'] = user.name;
    result['email'] = user.email;
    result['organization'] = user.organization;
    result['city'] = user.city;
    result['county'] = user.county;
    result['serviceArea'] = user.serviceArea;
    result['phone'] = user.phone;
    result['zipCode'] = user.zipCode;
    result['title'] = user.title;
    result['activated'] = user.activated;
    result['designation'] = user.designation;
    result['photo'] = user.photo;
    result['zoomarea'] = user.zoomarea ? user.zoomarea : '';
    result['status'] = user.status;
    res.send({
      result,
      token
    });
  } catch (error){
    logger.error(error);
    res.status(500).send('Cannot log as guest')
  }
})
const NEED_RESET_AND_CONFIRM = 'need_reset_and_confirm';
router.post('/login', async (req, res) => {
  logger.info(`Starting endpoint auth.route/login with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    const {
      email,
      password
    } = req.body;
    logger.info(`Starting function findByCredentials for auth.route/login`);
    const user = await User.findByCredentials(email, password);
    logger.info(`Finished function findByCredentials for auth.route/login`);

    const userResult = {
      email: user.email,
      designation: user.designation
    };
    if (!user) {
      return res.status(401).send({
        error: 'Login failed! Check authentication credentials'
      });
    }
    if (user.status === NEED_RESET_AND_CONFIRM) {
      logger.info(`Starting function generateChangePassword for users.route/login`);
      await user.generateChangePassword();
      logger.info(`Finished function generateChangePassword for users.route/login`);
      logger.info(`Starting function sendRecoverPasswordEmail for users.route/login`);
      await userService.sendRecoverAndConfirm(user);  
      logger.info(`Finished function sendRecoverPasswordEmail for users.route/login`);
      return res.send({
        email: user.email,
        order: 'need_reset_and_confirm'
      });
    }
    logger.info(`Starting function generateAuthToken for auth.route/post`);
    const token = await user.generateAuthToken();
    logger.info(`Finished function generateAuthToken for auth.route/post`);

    let logActivity = {};
    logActivity.user_id = user.user_id;
    logActivity.activityType = ACTIVITY_TYPE.USER_LOGIN;

    logActivityService.saveLogActivity(logActivity);

    res.send({
      userResult,
      token
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/logout', auth, async (req, res) => {
  logger.info(`Starting endpoint auth.route/logout with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    logger.info(`Starting function save for auth.route/get`);
    await req.user.save();
    logger.info(`Finished function save for auth.route/get`);
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/logoutall', auth, async (req, res) => {
  logger.info(`Starting endpoint auth.route/logoutall with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    req.user.tokens.splice(0, req.user.tokens.length);
    logger.info(`Starting function save for auth.route/post`);
    await req.user.save();
    logger.info(`Starting function save for auth.route/post`);
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
