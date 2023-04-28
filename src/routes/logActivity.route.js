import express from 'express';
import json2csv from 'json2csv';
import auth from 'bc/auth/auth.js';
import logActivityService from 'bc/services/logActivity.service.js';
import logger from 'bc/config/logger.js';
import { isAdminAccount } from 'bc/utils/utils.js';

const router = express.Router();

router.post('/save', auth, async (req, res) => {
  logger.info(`Starting endpoint logActivity.route/save with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    let data = req.body;
    data = req.user;
    logger.info(`Starting function saveLogActivity for logActivity.route/save`);
    const result = await logActivityService.saveLogActivity(data);
    logger.info(`Finished function saveLogActivity for logActivity.route/save`);
    res.status(200).send(result);
  } catch(error) {
    logger.error(error);
    res.status(500).send({error: error});
  }
});

router.get('/get-all', [auth, isAdminAccount], async (req, res) => {
  logger.info(`Starting endpoint logActivity.route/get-all with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    const { page = 1, limit = 10, sortby = 'registerDate',
          sorttype = 'desc' } = req.query;
    
    logger.info(`Starting function getLogActivities for logActivity.route/gett-all`);
    const activities = await logActivityService.getLogActivities(page, limit, sortby, sorttype);
    logger.info(`Finished function getLogActivities for logActivity.route/gett-all`);
    logger.info(`Starting function countLogActivities for logActivity.route/gett-all`);
    const count = await logActivityService.countLogActivities();
    logger.info(`Finished function countLogActivities for logActivity.route/gett-all`);
    
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
  logger.info(`Starting endpoint logActivity.route/csv with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    logger.info(`Starting function getLogActivities for logActivity.route/csv`);
    let activity = await logActivityService.getLogActivities(1, 1000000, 'registerDate', 'desc');
    logger.info(`Finished function getLogActivities for logActivity.route/csv`);
    
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
  logger.info(`Starting endpoint logActivity.route/count-login with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    const user = req.user;
    console.log(user);
    logger.info(`Starting function timesLogin for logActivity.route/count-login`);
    const counter = await logActivityService.timesLogin(user.user_id);
    logger.info(`Finished function timesLogin for logActivity.route/count-login`);
    console.log(counter);
    res.send({times: counter + 1});
  } catch (error) {
    logger.error(error);
    res.sendStatus(500).send({error: error});
  }
});

export default router;
