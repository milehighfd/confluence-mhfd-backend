const express = require('express');

const db = require('../config/db');
const Configuration = db.configuration;
const router = express.Router();

router.get('/:key', async (req, res) => {
  const key = req.params.key;
  let configurations = await Configuration.findOne({
    where: {
      key
    }
  });
  res.send(configurations);
});

module.exports = router;
