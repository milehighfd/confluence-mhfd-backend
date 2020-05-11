const express = require('express');
//const User = require('../models/user.model');
const db = require('../config/db');
const User = db.user;
const router = express.Router();
const auth = require('../auth/auth');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const logActivityService = require('../services/logActivity.service');
const LogActivity = require('../models/logActivity.model');
const { ACTIVITY_TYPE } = require('../lib/enumConstants');

router.post('/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;
    console.log('uno')
    const user = await User.findByCredentials(email, password);
    //console.log('USER', user)
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
    console.log('TOKEN', token)
    let logActivity = {}; //new LogActivity(); 
    logActivity.userId = user.id;
    logActivity.activityType = ACTIVITY_TYPE.USER_LOGIN;
    console.log(logActivity);
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
 
module.exports = router;
