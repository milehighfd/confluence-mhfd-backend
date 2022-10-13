import express from 'express';
import db from 'bc/config/db.js';

const router = express.Router();
const Locality = db.locality;

router.get('/', async (req, res) => {
  const localities = await Locality.findAll();
  return res.send(localities);
});

export default router;
