const express = require('express');
const router = express.Router();

const db = require('../config/db');

const Consultants = db.consultants;

router.get('/', async (req, res) => {
  const consultants = Consultants.findAll();
  return res.send(consultants);
});

module.exports = router;
