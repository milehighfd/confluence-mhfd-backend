import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const router = express.Router();
const Consultants = db.consultants;

router.get('/', async (req, res) => {
  logger.info(`Starting endpoint consultants.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    logger.info(`Starting function findAll for configuration.route/`);
    const consultants = await Consultants.findAll();
    logger.info(`Finished function findAll for configuration.route/`);
    return res.send(consultants);
  } catch(error) {
    res.status(500).send(error);
  }
});
//This endpoint fails the test
router.post('/', async (req, res) => {
  logger.info(`Starting endpoint consultants.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  const { body } = req;
  let newConsultant = new Consultants(body);
  logger.info(`Starting function save for configuration.route/`);
  await newConsultant.save();
  logger.info(`Finished function save for configuration.route/`);
  return res.send(newConsultant);
});

export default router;
