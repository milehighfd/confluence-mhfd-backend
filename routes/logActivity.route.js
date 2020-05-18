const express = require('express');
const router = express.Router();
const auth = require('../auth/auth');
const logActivityService = require('../services/logActivity.service');
const logger = require('../config/logger');
const json2csv = require('json2csv');
const { isAdminAccount } = require('../utils/utils');

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
    console.log('all');
    const { page = 1, limit = 10, sortby = 'registerDate',
          sorttype = 'desc' } = req.query;
    
    const activities = await logActivityService.getLogActivities(page, limit, sortby, 'DESC');
    const count = await logActivityService.countLogActivities();
    //console.log('count', count);
    
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
    let activity = await logActivityService.getLogActivities(1, 1000000, 'registerDate', '-1');
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
module.exports = router;