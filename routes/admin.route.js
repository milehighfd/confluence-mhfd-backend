const express = require('express');
const router = express.Router();
const auth = require('../auth/auth');

const {ROLES} = require('../lib/enumConstants');
const User = require('../models/user.model');
const { validator } = require('../utils/utils');

const NUMBER_PER_PAGE = 20;
const updateable_fields = ['firstName', 'lastName', 'email', 'organization', 'designation', 'city', 'county', 'serviceArea'];

router.put('/change-user-state/:id', auth, async (req, res, next) => {
  if (req.user.designation === ROLES.MFHD_ADMIN || req.user.designation ===  ROLES.MFHD_STAFF) {
    const id = req.params.id;
    try{
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).send( 'User not found');
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

router.put('/edit-user/:id', [auth, validator(updateable_fields)], async(req, res, next) => {
  if (req.user.designation === ROLES.MFHD_ADMIN || req.user.designation ===  ROLES.MFHD_STAFF) {
    const id = req.params.id;
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).send( 'User not found');
      }
      for (const field of updateable_fields) {
        user[field] = req.body[field];
      }
      user['name'] = user.firstName + " " + user.lastName;
      await user.save();
      return res.status(200).send(user);
    }  catch (error) {
      return res.status(500).send(error);
    }
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
        options_to_search.push({firstName: {"$regex": "^" + part, "$options": "im"}});
        options_to_search.push({lastName: {"$regex": "^" + part, "$options": "im"}});
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