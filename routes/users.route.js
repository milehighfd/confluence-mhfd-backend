const express = require('express');
const User = require('../models/user.model');
const router = express.Router();
const auth = require('../auth/auth');
const { validator } = require('../utils/utils');

router.get('/', async (req, res, next) => {
  const users = await User.find({});
  res.send(users);
});

router.post('/signup', validator(['firstName', 'lastName', 'designation', 'email', 'organization', 'password']), async (req, res) => {
  try {
    const user = new User(req.body);
    const foundUser = await User.count({email: user.email}); 
    if(foundUser) {
      res.status(422).send({message: 'The e-mail has already been registered'});
    } else {
      if (/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(user.email)) {
        user.name = user.firstName + " " + user.lastName;
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({
          user,
          token
        });
      } else {
        return res.status(400).send('You entered an invalid email direction');
      }
    }
  } catch (error) {
    res.status(500).send(error);
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
