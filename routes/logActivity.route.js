const express = require('express');
const router = express.Router();
const auth = require('../auth/auth');
const logActivityService = require('../services/logActivity.service');
const logger = require('../config/logger');
const json2csv = require('json2csv');

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

router.get('/get-all', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortby = 'registerDate',
          sorttype = '-1' } = req.query;
    //console.log('pagina ', page, ' limit ', limit, ' sortby ', sortby, ' sorttype ', sorttype);
    const activities = await logActivityService.getLogActivities(page, limit, sortby, sorttype);
    const count = await logActivityService.countLogActivities();
    console.log(count);
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
router.get('/csv', auth, async (req, res) => {
  try {
    let activity = await logActivityService.getLogActivities(1, 1000000, 'registerDate', '-1');
    console.log(activity)
      //TODO Bladi fix please 
    activity = activity.map(element => {
      element.user = element.user.length ? element.user[0].name : element.userId[0];
      return element;
    });
      console.log(activity);
    res.set('Content-Type', 'application/octet-stream');
    //TODO Bladi put cool names
    const fields = ['registerDate', 'city', 'user'];
    const data = json2csv.parse(activity, {fields});
    console.log(activity);
    res.attachment('activity.csv');
    res.send(data);
  } catch(error) {
    logger.error(error);
    res.status(500).send({error: error})
  }

});
module.exports = router;