import express from 'express';
import sequelize from 'sequelize';
import auth from 'bc/auth/auth.js';
import { EMAIL_VALIDATOR } from 'bc/lib/enumConstants.js';
import db from 'bc/config/db.js';
import userService from 'bc/services/user.service.js';
import logger from 'bc/config/logger.js';
import { NUMBER_PER_PAGE, INITIAL_PAGE }from 'bc/config/config.js';
import { isAdminAccount }from 'bc/utils/utils.js';

const { Op, literal } = sequelize;
const router = express.Router();
const User = db.user;
const UPDATEABLE_FIELDS = userService.requiredFields('edit');

const BusinessAssociateContact = db.businessAssociateContact;
const BusinessAssociates = db.businessAssociates;
const BusinessAdress = db.businessAdress;

router.put('/change-user-state/:id/:status', [auth, isAdminAccount], async (req, res, next) => {
  logger.info(`Starting endpoint admin.route/change-user-state/:id/:status with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params.id;
  const status = req.params.status;
  try {
    logger.info(`Starting function findByPk for admin.route/change-user-state/:id/:status`);
    const user = await User.findByPk(id, { raw: true });
    logger.info(`Finished function findByPk for admin.route/change-user-state/:id/:status`);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    user.status = status;
    logger.info(`Starting function update for admin.route/change-user-state/:id/:status`);
    await User.update(user, {
      where: {
        user_id: id
      }
    });
    logger.info(`Starting function update for admin.route/change-user-state/:id/:status`);

    if (user.activated) {
      userService.sendApprovedAccount(user);
    }
    
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.put('/edit-user/:id', [auth, isAdminAccount], async (req, res, next) => {
  logger.info(`Starting endpoint admin.route/edit-user/:id with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params.id;
  try {
    logger.info(`Starting function findByPk for admin.route/edit-user/:id`);
    const user = await User.findByPk(id, { raw: true });
    logger.info(`Finished function findByPk for admin.route/edit-user/:id`);

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    if (user.email !== req.body.email) {
      logger.info(`Starting function count for admin.route/edit-user/:id`);
      const count = await User.count({
        where: { email: req.body.email }
      });
      logger.info(`Finished function count for admin.route/edit-user/:id`);
      if (count !== 0) {
        return res.status(422).send({ error: 'the email has already been registered' });
      }
      if (!EMAIL_VALIDATOR.test(req.body.email)) {
        return res.status(400).send({ error: 'the email must be valid' });
      }
    }
    
    for (const field of UPDATEABLE_FIELDS) {
      if (req.body[field])  {
        user[field] = req.body[field];
      }
    }
    user.name = user.firstName + ' ' + user.lastName;
    delete user.user_id;
    logger.info(`Starting function apdate for admin.route/edit-user/:id`);
    await User.update(user, {
      where: {
        user_id: id
      }
    });
    logger.info(`Finished function update for admin.route/edit-user/:id`);
    return res.status(200).send({message:'SUCCESS'});
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

router.put('/delete-user/:id', [auth, isAdminAccount], async (req, res, next) => {
  logger.info(`Starting endpoint admin.route/delete-user/:id with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params.id;
  try {
    logger.info(`Starting function findByPk for admin.route/delete-user/:id`);
    const user = await User.findByPk(id, { raw: true });   
    logger.info(`Finished function findByPk for admin.route/delete-user/:id`);
    user.status = 'deleted';
    user.activated = 0;
    user.name = user.firstName + ' ' + user.lastName;
    delete user.user_id;
    logger.info(`Starting function update for admin.route/delete-user/:id`);
    await User.update(user, {
      where: {
        user_id: id
      }
    });
    logger.info(`Finished function update for admin.route/delete-user/:id`);
    return res.status(200).send({message:'SUCCESS'});
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

router.delete('/delete-entry/:id', [auth, isAdminAccount], async (req, res, next) => {
  logger.info(`Starting endpoint admin.route/delete-entry/:id with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params.id;  
  try {    
    logger.info(`Starting function destroy for admin.route/delete-entry/:id`);
    await User.destroy({
      where: {
        user_id: +id
      }
    });
    logger.info(`Finished function destroy for admin.route/delete-entry/:id`);
    return res.status(200).send({message:'SUCCESS'});
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

router.put('/modify-user-status/:id', [auth, isAdminAccount], async (req, res, next) => {
  logger.info(`Starting endpoint admin.route/modify-user-status/:id with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params.id;
  try {
    logger.info(`Starting function findByPk for admin.route/modify-user-status/:id`);
    const user = await User.findByPk(id, { raw: true });   
    logger.info(`Finished function findByPk for admin.route/modify-user-status/:id`);
    user.status = 'approved';    
    user.activated = 1;
    user.name = user.firstName + ' ' + user.lastName;
    delete user.user_id;
    logger.info(`Starting function update for admin.route/modify-user-status/:id`);
    await User.update(user, {
      where: {
        user_id: id
      }
    });
    logger.info(`Finished function update for admin.route/modify-user-status/:id`);
    return res.status(200).send({message:'SUCCESS'});
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

router.get('/list', [auth, isAdminAccount], async (req, res, next) => {
  logger.info(`Starting endpoint admin.route/list with params ${JSON.stringify(req.params, null, 2)}`);
  //const isPending = req.query.pending || false;
  const organization = req.query.organization;
  const serviceArea = req.query.serviceArea;
  const designation = req.query.designation;
  const search_obj = { }; // activated: !isPending
  const search_org = { };
  const status = req.query.status;
  //console.log('status', status);  
  const limit = +req.query.limit || NUMBER_PER_PAGE;
  const page = +req.query.page || INITIAL_PAGE;
  const name = req.query.name;
  const sort = req.query.sort ? req.query.sort : 'name';
  const sortObject = {};
  let required = false;
  if (status){
    search_obj['status'] = status;
  }  
  if (organization) {
    search_org['business_associates_id'] = (organization);
    required = true;
  }
  if (serviceArea) {
    search_obj['serviceArea'] = String(serviceArea);
  }
  if (designation) {
    search_obj['designation'] = String(designation);
  }
  if (name) {
    search_obj[Op.or] = { name: { [Op.like]: '%'+name+'%' }};
  }
  if (sort) {
    sortObject[sort] = 1;
  }
  try {
    console.log(search_obj, limit, page, sort);
    logger.info(`Starting function count for admin.route/list`);
    const userCount = await User.count({
      where: search_obj
    });
    logger.info(`Finished function count for admin.route/list`);
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
    logger.info(`Starting function findAll for admin.route/list`);
    const userList = await User.findAll({
      where: search_obj,
      offset: limit * (page - 1),
      limit: limit,
      order: sortField,
      include: {
        model: BusinessAssociateContact,
        include: {
          model: BusinessAdress,
          include: {
            model: BusinessAssociates,
            where: search_org,
            required: required
          },
          required: required
        },
        required: required
      },
    });
    logger.info(`Finished function findAll for admin.route/list`);
    //console.log('user list', userList.length);
    const numberOfPages = Math.ceil(userCount / limit);
    return res.status(200).send({ users: userList, totalPages: numberOfPages, currentPage: page });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

router.get('/listTotal', [auth, isAdminAccount], async (req, res, next) => {
  logger.info(`Starting endpoint admin.route/list with params ${JSON.stringify(req.params, null, 2)}`); 
  try {    
    const userList = await User.findAll({
      attributes: ['user_id','status'],
      include: {
        model: BusinessAssociateContact,        
        attributes: ['business_associate_contact_id','business_address_id'],
        include: {          
          model: BusinessAdress,
          attributes: ['business_address_id','business_associate_id'],
          include: {
            model: BusinessAssociates,  
            attributes: ['business_associates_id','business_name'],
          },
        },
      },
    });
    return res.status(200).send({ users: userList });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

export default router;
