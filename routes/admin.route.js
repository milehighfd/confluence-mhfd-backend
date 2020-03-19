const express = require('express');
const router = express.Router();
const auth = require('../auth/auth');

const {ROLES} = require('../lib/enumConstants');
const User = require('../models/user.model')
const NUMBER_PER_PAGE = 20;

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
    const organization = req.query.organization;
    const serviceArea = req.query.serviceArea;
    const designation = req.query.designation;
    const search_obj = {activated: !isPending};
    const limit = +req.query.limit || NUMBER_PER_PAGE;
    const page = +req.query.page || 1;
    const name = req.query.name;
    const sort = req.query.sort;
    const sortObject = {};
    if (organization) {
      search_obj['organization'] = organization;
    }
    if (serviceArea) {
      search_obj['serviceArea'] = serviceArea;
    }
    if (designation) {
      search_obj['designation'] = designation;
    }
    if (name) {
      const array_name = name.split(' ');
      const options_to_search = [];
      for (const part of array_name) {
        options_to_search.push({firstName: {"$regex": part, "$options": "i"}});
        options_to_search.push({lastName: {"$regex": part, "$options": "i"}});
      }
      search_obj['$or'] = options_to_search;
    }
    if (sort) {
      sortObject[sort] = 1;
    }
    try {
      console.log(search_obj, limit, page, sort);
      const userCount = await User.count(search_obj);
      const userList = await User.find(search_obj).limit(limit).skip(limit * (page - 1)).sort(sortObject);
      const numberOfPages = Math.ceil(userCount / limit);
      return res.status(200).send({users: userList, pages: numberOfPages});
    } catch(error) {
      return res.status(500).send(error);
    }
  } else {
    return res.status(403).send( `You're not allowed to do that`);
  }
});
module.exports = router;