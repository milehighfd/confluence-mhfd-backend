const express = require('express');
const router = express.Router();
const auth = require('../auth/auth');

const {ROLES} = require('../lib/enumConstants');
const User = require('../models/user.model')

router.get('/change-user-state', auth, async (req, res, next) => {
  if (req.user.designation === ROLES.MFHD_ADMIN || req.user.designation ===  ROLES.MFHD_STAFF) {
    const id = req.query.id;
    if (!id) {
      return res.status(400).send('The id is required');
    }
    try{
      const user = await User.findById(id);
      if (!user) {
        return res.status(422).send( 'Email not found');
      }
      user.activated = !user.activated;
      await user.save();
      return res.status(200).send(user);
    } catch (error) {
        return res.status(500).send(error);
    }
  } else {
    return res.status(403).send( `You're not allowed to do that`);
  }
});

router.put('/edit-user', auth, async(req, res, next) => {
  if (req.user.designation === ROLES.MFHD_ADMIN || req.user.designation ===  ROLES.MFHD_STAFF) {
    const id = req.body._id;
    if (!id) {
      return res.status(400).send('The id is required');
    }
    try {

    } catch (error) {
        return res.status(500).send(error);
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(422).send( 'Email not found');
    }
    const updateable_fields = ['firstName', 'lastName', 'email', 'organization', 'designation', 'city', 'county', 'serviceArea'];
    for (const field of updateable_fields) {
      if (!req.body[field]) {
        return res.status(400).send('Missing field ' + field);
      }
      user[field] = req.body[field];
    }
    await user.save();
    return res.status(200).send(user);
  } else {
    return res.status(403).send( `You're not allowed to do that`);
  }
});
router.get('/list', auth, async(req, res, next) => {
  if (req.user.designation === ROLES.MFHD_ADMIN || req.user.designation ===  ROLES.MFHD_STAFF) {
    const isPending = req.query.pending || false;
    try {
      const userList = await User.find({ activated: !isPending});
      return res.status(200).send(userList);
    } catch(error) {
      return res.status(500).send(error);
    }
  } else {
    return res.status(403).send( `You're not allowed to do that`);
  }
});
module.exports = router;