const express = require('express');
const User = require('../models/user.model');
const router = express.Router();
const auth = require('../auth/auth');

router.get('/', async (req, res, next) => {
  const users = await User.find({});
  res.send(users);
});

router.post('/', async (req, res) => {
  try {
    var user = new User(req.body);
    const userRegistered = User.findByEmail(user.email); //async User.findByEmail(user.email);
    //console.log(existeEmail);
    if(!userRegistered) {
      res.status(500).send({message: 'The e-mail has already been registered'});
    } else {
      user.activated = true;
      await user.save();
      const token = await user.generateAuthToken();
      res.status(201).send({
        user,
        token
      });
    }
  } catch (error) {
    res.status(400).send(error);
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

module.exports = router;
