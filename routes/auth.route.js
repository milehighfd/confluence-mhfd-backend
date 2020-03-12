const express = require('express');
const User = require('../models/user.model');
const router = express.Router();
const auth = require('../auth/auth');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

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

router.post('/reset-password', async (req, res) => {
  const email = req.body.email;
  User.findOne({ email: email })
    .then(function (user) {
      if (!user) {
        res.status(404).send({message: 'No exist user with e-mail: ' + email});
      } else {
        var token = crypto.randomBytes(32).toString('hex');
        user.changePasswordId = token;
        user.changePasswordExpiration = Date.now() + 7200000; //expires in two hour
        user.save();
        res.status(200).send({message: 'Please see your e-mail to continue change your password'});
      }
    });
});

router.post('/change-password', async (req, res) => {
  User.findOne({changePasswordId: req.body.changePasswordId})
    .then(function (user) {
      if (!user) {
        res.status(404).send({message: 'No there register '});
      } else {
        user.changePasswordExpiration = null;
        user.changePasswordId = null;
        var hashPassword = async function(){
          var hashPwd = await bcrypt.hash(req.body.newPassword,10);
          user.password = hashPwd;
        }
        hashPassword();
        user.save();
        res.status(200).send({message: 'Password was changed successfully'});
      }
    });
});
 
module.exports = router;
