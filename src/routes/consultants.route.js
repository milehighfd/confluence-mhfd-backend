import express from 'express';
import db from 'bc/config/db.js';

const router = express.Router();
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

export default router;
