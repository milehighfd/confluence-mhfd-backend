const express = require('express');
const router = express.Router();

const db = require('../config/db');

const Consultants = db.consultants;

router.get('/', async (req, res) => {
  const consultants = await Consultants.findAll();
  return res.send(consultants);
});

router.post('/', async (req, res) => {
  const { body } = req;
  let newConsultant = new Consultants(body);
  await newConsultant.save();
  return res.send(newConsultant);
});

module.exports = router;
