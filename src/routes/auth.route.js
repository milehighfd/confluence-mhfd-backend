import express from 'express';
import db from 'bc/config/db.js';
const User = db.user;
const router = express.Router();
import auth from 'bc/auth/auth.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import config from 'bc/config/config.js';
import logActivityService from 'bc/services/logActivity.service.js';
import LogActivity from 'bc/models/logActivity.model.js';
import { ACTIVITY_TYPE } from 'bc/lib/enumConstants.js';

router.get('/guest', async (req, res) => {
  const user = await User.findOne({
    where: {
      email: config.GUEST_USER
    }
  });
  const token = await user.generateGuestAuthToken();
  let result = {};
  result['_id'] = user._id;
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
})

router.post('/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;
    const user = await User.findByCredentials(email, password);

    const userResult = {
      email: user.email,
      designation: user.designation
    };
    if (!user) {
      return res.status(401).send({
        error: 'Login failed! Check authentication credentials'
      });
    }
    const token = await user.generateAuthToken();

    let logActivity = {};
    logActivity.user_id = user._id;
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
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens.splice(0, req.user.tokens.length);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
