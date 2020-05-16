const express = require('express');
const router = express.Router();
const Multer = require('multer');
const bcrypt = require('bcryptjs');

//const User = require('../models/user.model');
const db = require('../config/db');
const User = db.user;
const UserService = require('../services/user.service');
const auth = require('../auth/auth');
const { validator } = require('../utils/utils');
const {EMAIL_VALIDATOR} = require('../lib/enumConstants');
const userService = require('../services/user.service');
const UPDATEABLE_FIELDS = userService.requiredFields('edit');
const logger = require('../config/logger');

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
     fileSize: 50 * 1024 * 1024
  }
});

router.get('/', async (req, res, next) => {
  const users = await UserService.findAllUsers();
  res.send(users);
});

router.post('/signup', validator(userService.requiredFields('signup')), async (req, res) => {
  try {
    const user = req.body; 
    const foundUser = await User.count({
      where: {
        email: user.email
      }
    });
    if(foundUser) {
      res.status(422).send({error: 'The email has already been registered'});
    } else {

      if (EMAIL_VALIDATOR.test(user.email)) {
        user['activated'] = false;
        user.password = await bcrypt.hash(user.password, 8);
        const user1 = await User.create(user);
        const token = await user1.generateAuthToken();
        res.status(201).send({
          user,
          token
        });
      } else {
        return res.status(400).send({error: 'You entered an invalid email direction'});
      }
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error});
  }
});

router.put('/update', auth, async (req, res) => {
  try {
    let user = await User.findByPk(req.user._id, { raw: true });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (user.email !== req.body.email) {
      /* if (User.count({ email: user.email })) {
        return res.status(422).send({ error: 'the email has already been registered' });
      } */
      if (EMAIL_VALIDATOR.test(user.email)) {
        return res.status(400).send({ error: 'the email must be valid' });
      }
    }
    for (const key in req.body) {
      if (key !== '_id') {
        console.log(key, req.body[key]);
        user[key] = req.body[key];
      }
    }
    await User.update(user, {
      where: {
        _id: req.user._id
      }
    });
    return res.status(200).send(user);
  } catch(error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

router.get('/me', auth, async(req, res) => {
  // Disable caching for content files
  // res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  // res.header("Pragma", "no-cache");
  // res.header("Expires", 0);

  res.status(200).send(req.user);
});

router.post('/upload-photo', [auth, multer.array('file')], async(req, res) => {
  try {
    if (!req.files) {
      logger.error('You must send user photo');
      return res.status(400).send({error: 'You must send user photo'});
    }
    let user = req.user;
    await userService.uploadPhoto(user, req.files);
    res.status(200).send(user);
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
    logger.error(error);
    res.status(500).send(error);
  }
});

module.exports = router;
