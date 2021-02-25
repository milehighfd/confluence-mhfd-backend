const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Op, literal } = require("sequelize");
const auth = require('../auth/auth');

const { ROLES, EMAIL_VALIDATOR } = require('../lib/enumConstants');
const db = require('../config/db');
const User = db.user;
const { validator } = require('../utils/utils');
const userService = require('../services/user.service');
const logger = require('../config/logger');

const { NUMBER_PER_PAGE, INITIAL_PAGE } = require('../config/config');
const UPDATEABLE_FIELDS = userService.requiredFields('edit');
const { isAdminAccount } = require('../utils/utils');

router.put('/change-user-state/:id/:status', [auth, isAdminAccount], async (req, res, next) => {
  const id = req.params.id;
  const status = req.params.status;
  try {
    const user = await User.findByPk(id, { raw: true });
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    user.status = status;

    await User.update(user, {
      where: {
        _id: id
      }
    });

    if (user.activated) {
      userService.sendApprovedAccount(user);
    }
    
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.put('/edit-user/:id', [auth, isAdminAccount], async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.findByPk(id, { raw: true });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    if (user.email !== req.body.email) {
      const count = await User.count({
        where: { email: req.body.email }
      });
      if (count !== 0) {
        return res.status(422).send({ error: 'the email has already been registered' });
      }
      if (!EMAIL_VALIDATOR.test(req.body.email)) {
        return res.status(400).send({ error: 'the email must be valid' });
      }
    }
    
    for (const field of UPDATEABLE_FIELDS) {
      user[field] = req.body[field];
    }
    user.name = user.firstName + ' ' + user.lastName;

    await User.update(user, {
      where: {
        _id: id
      }
    });
    return res.status(200).send(user);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

router.delete('/delete-user/:id', [auth, isAdminAccount], async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    return res.status(200).send({message: 'User deleted successfully'});
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
})

router.get('/list', [auth, isAdminAccount], async (req, res, next) => {
  //const isPending = req.query.pending || false;
  const organization = req.query.organization;
  const serviceArea = req.query.serviceArea;
  const designation = req.query.designation;
  const search_obj = { }; // activated: !isPending
  const status = req.query.status;
  //console.log('status', status);
  
  const limit = +req.query.limit || NUMBER_PER_PAGE;
  const page = +req.query.page || INITIAL_PAGE;
  const name = req.query.name;
  const sort = req.query.sort ? req.query.sort : 'name';
  const sortObject = {};
  
  search_obj['status'] = status;

  if (organization) {
    search_obj['organization'] = String(organization);
  }
  if (serviceArea) {
    search_obj['serviceArea'] = String(serviceArea);
  }
  if (designation) {
    search_obj['designation'] = String(designation);
  }
  if (name) {
    search_obj[Op.or] = { firstName: { [Op.iLike]: '%'+name+'%' }, lastName: {[Op.iLike]: '%'+name+'%'}};
  }
  if (sort) {
    sortObject[sort] = 1;
  }
  try {
    console.log(search_obj, limit, page, sort);
    const userCount = await User.count({
      where: search_obj
    });
    let sortField = [
      [sort, "asc"]
    ];
    if (sort === 'designation') {
      sortField = literal(`
        CASE
          WHEN designation='consultant' THEN 1
          WHEN designation='government_staff' THEN 2
          WHEN designation='other' THEN 3
          WHEN designation='government_admin' THEN 4
          WHEN designation='staff' THEN 5
          WHEN designation='admin' THEN 6
          ELSE 7
        END
      `);
    }
    const userList = await User.findAll({
      where: search_obj,
      offset: limit * (page - 1),
      limit: limit,
      order: sortField
    });
    //console.log('user list', userList.length);
    const numberOfPages = Math.ceil(userCount / limit);
    return res.status(200).send({ users: userList, totalPages: numberOfPages, currentPage: page });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});
module.exports = router;