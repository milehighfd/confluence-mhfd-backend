const express = require('express');
const router = express.Router();
const auth = require('../auth/auth');
const logActivityService = require('../services/logActivity.service');
const logger = require('../config/logger');

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

module.exports = router;