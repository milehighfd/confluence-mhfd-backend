import express from 'express';
import json2csv from 'json2csv';
import auth from 'bc/auth/auth.js';
import logActivityService from 'bc/services/logActivity.service.js';
import logger from 'bc/config/logger.js';
import { isAdminAccount } from 'bc/utils/utils.js';

const router = express.Router();

router.post('/save', auth, async (req, res) => {
  try {
    let data = req.body;
    data = req.user;
    const result = await logActivityService.saveLogActivity(data);
    res.status(200).send(result);
  } catch(error) {
    logger.error(error);
    res.status(500).send({error: error});
  }
});

router.get('/get-all', [auth, isAdminAccount], async (req, res) => {
  try {
    const { page = 1, limit = 10, sortby = 'registerDate',
          sorttype = 'desc' } = req.query;
    
    const activities = await logActivityService.getLogActivities(page, limit, sortby, sorttype);
    const count = await logActivityService.countLogActivities();
    
    const result = {
      data: activities,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
    res.status(200).send(result);
  } catch(error) {
    logger.error(error);
  	res.status(500).send({error: error});
  }
});

router.get('/csv', [auth, isAdminAccount], async (req, res) => {
  try {
    let activity = await logActivityService.getLogActivities(1, 1000000, 'registerDate', 'desc');
    
    res.set('Content-Type', 'application/octet-stream');
    const fields = ['registerDate', 'city', 'activityType', 'firstName', 'lastName'];
    const data = json2csv.parse(activity, {fields});
    
    res.attachment('activity.csv');
    res.send(data);
  } catch(error) {
    logger.error(error);
    res.status(500).send({error: error})
  }

});

router.get('/count-login', auth, async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    const counter = await logActivityService.timesLogin(user._id);
    console.log(counter);
    res.send({times: counter + 1});
  } catch (error) {
    logger.error(error);
    res.sendStatus(500).send({error: error});
  }
});

export default router;
