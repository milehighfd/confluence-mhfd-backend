const express = require('express');
const router = express.Router();

const User = require('../models/user.model');
const auth = require('../auth/auth');
const { validator } = require('../utils/utils');
const {EMAIL_VALIDATOR} = require('../lib/enumConstants');
const userService = require('../services/user.service');

router.get('/', async (req, res, next) => {
  const users = await User.find({});
  res.send(users);
});

router.post('/signup', validator(userService.requiredFields('signup')), async (req, res) => {
  try {
    const user = new User(req.body);
    const foundUser = await User.count({email: user.email}); 
    if(foundUser) {
      res.status(422).send({error: 'The e-mail has already been registered'});
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

router.post('/recovery-password', async(req, res) => {
  const email = req.body.email;
  if (!EMAIL_VALIDATOR.test(email)) { 
    return res.status(400).send({error: 'You entered an invalid email direction'});
  }
  const user = await User.findOne({email});
  if (!user) {
    return res.status(422).send({error: 'E-mail not found!'});
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
