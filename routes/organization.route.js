const express = require('express');
const router = express.Router();

const db = require('../config/db');

const Locality = db.locality;

router.get('/', async (req, res) => {
  const localities = await Locality.findAll();
  return res.send(localities);
});

module.exports = router;
