import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const Configuration = db.configuration;
const router = express.Router();

router.get('/:key', async (req, res) => {
  const key = req.params.key;
  let configuration = await Configuration.findOne({
    where: {
      key
    }
  });
  res.send(configuration);
});

router.put('/:key', async (req, res) => {
  const key = req.params.key;
  let configuration = await Configuration.findOne({
    where: {
      key
    }
  });
  logger.info(configuration);
  if (configuration !== null) {
    const value = req.body.value;
    configuration.value = value;
    await configuration.save();
    res.send(configuration);
  } else {
    res.status(404).send({
      error: 'Configuration not found'
    });
  }
});

export default router;
