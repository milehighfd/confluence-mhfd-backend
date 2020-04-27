const express = require('express');
const router = express.Router();
const Multer = require('multer');

const User = require('../models/user.model');
const auth = require('../auth/auth');
const { validator } = require('../utils/utils');
const {EMAIL_VALIDATOR} = require('../lib/enumConstants');
const userService = require('../services/user.service');
const logger = require('../config/logger');

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
     fileSize: 50 * 1024 * 1024
  }
});

router.get('/', async (req, res, next) => {
  const users = await User.find({});
  res.send(users);
});

router.post('/signup', validator(userService.requiredFields('signup')), async (req, res) => {
  try {
    const user = new User(req.body);
    const foundUser = await User.count({email: user.email}); 
    if(foundUser) {
      res.status(422).send({error: 'The email has already been registered'});
    } else {
      if (EMAIL_VALIDATOR.test(user.email)) {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({
          user,
          token
        });
      } else {
        return res.status(400).send({error: 'You entered an invalid email direction'});
      }
    }
  } catch (error) {
    res.status(500).send({error: error});
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const user = new User();
    user.status(201).send({
      user
    });
  } catch(error) {
    res.status(500).send(error);
  }
});

router.get('/me', auth, async(req, res) => {
  res.send(req.user);
});

router.post('/upload-photo', [auth, multer.array('file')], async(req, res) => {
  try {
    if (!req.files) {
      logger.error('You must send user photo');
      return res.status(400).send({error: 'You must send user photo'});
    }
    await userService.uploadPhoto(req.user, req.files);
    res.status(200).send({message: 'photo updated'});
  } catch(error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

router.post('/recovery-password', async(req, res) => {
  const email = req.body.email;
  if (!EMAIL_VALIDATOR.test(email)) { 
    return res.status(400).send({error: 'You entered an invalid email direction'});
  }
  const user = await User.findOne({email});
  if (!user) {
    return res.status(422).send({error: 'Email not found!'});
  }
  console.log(user);
  console.log("ID: " + user._id);
  await user.generateChangePassword();
  await userService.sendRecoverPasswordEmail(user);
  res.send(user);
});

router.post('/reset-password', validator(['id', 'password']), async (req, res) => {
  try {
    const user = await userService.changePassword(req.body.id, req.body.password);
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
