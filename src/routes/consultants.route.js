import express from 'express';
import db from 'bc/config/db.js';

const router = express.Router();
const Consultants = db.consultants;

router.get('/', async (req, res) => {
  try {
    const consultants = await Consultants.findAll();
    return res.send(consultants);
  } catch(error) {
    res.status(500).send(error);
  }
});

router.post('/', async (req, res) => {
  const { body } = req;
  let newConsultant = new Consultants(body);
  await newConsultant.save();
  return res.send(newConsultant);
});

export default router;
