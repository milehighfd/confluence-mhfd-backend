const express = require('express');
const User = require('../models/user.model');
const router = express.Router();
const auth = require('../auth/auth');

router.post('/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;
    const user = await User.findByCredentials(email, password);
    if (!user) {
      return res.status(401).send({
        error: 'Login failed! Check authentication credentials'
      });
    }
    const token = await user.generateAuthToken();
    res.send({
      // user,
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
