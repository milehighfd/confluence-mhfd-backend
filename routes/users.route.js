const express = require('express');
const User = require('../models/user.model');
const router = express.Router();
const auth = require('../auth/auth');

router.get('/', async (req, res, next) => {
  const users = await User.find({});
  res.send(users);
});

router.post('/', auth, async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({
      user,
      token
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/me', auth, async(req, res) => {
  res.send(req.user);
});

module.exports = router;
