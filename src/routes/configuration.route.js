import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const Configuration = db.configuration;
const router = express.Router();

router.get('/:key', async (req, res) => {
  logger.info(`Starting endpoint configuration.route/:key with params ${JSON.stringify(req.params, null, 2)}`);
  const key = req.params.key;
  logger.info(`Starting function findOne for configuration.route/:key`);
  let configuration = await Configuration.findOne({
    where: {
      key
    }
  });
  logger.info(`Finished function findOne for configuration.route/:key`);
  res.send(configuration);
});

router.put('/:key', async (req, res) => {
  logger.info(`Starting endpoint cardfilters.route/:key with params ${JSON.stringify(req.params, null, 2)}`);
  const key = req.params.key;
  logger.info(`Starting function findOne for configuration.route/:key`);
  let configuration = await Configuration.findOne({
    where: {
      key
    }
  });
  logger.info(`Finished function findOne for configuration.route/:key`);
  logger.info(configuration);
  if (configuration !== null) {
    const value = req.body.value;
    configuration.value = value;
    logger.info(`Starting function save for configuration.route/:key`);
    await configuration.save();
    logger.info(`Finished function save for configuration.route/:key`);
    res.send(configuration);
  } else {
    res.status(404).send({
      error: 'Configuration not found'
    });
  }
});

export default router;
