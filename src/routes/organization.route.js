import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const router = express.Router();
const Locality = db.locality;

router.get('/', async (req, res) => {
  logger.info(`Starting endpoint organization.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  // const localities = await Locality.findAll();
  return res.send([]);
});

export default router;
