import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

// use in case the table SERVICE_AREA_LOCAL_GOVERNMENT is required

const router = express.Router();
const ServiceAreaLocalGov = db.serviceAreaLocalGovernment;

router.get('/', async (req, res) => {
  logger.info(`Starting endpoint servicearealocalgovernment.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  logger.info(`Starting function findAll for servicearealocalgovernment.route/`);
  const sa = await ServiceAreaLocalGov.findAll({
    include: { all: true, nested: true }
  });
  logger.info(`Finished function findAll for servicearealocalgovernment.route/`);
  // console.log(sa);
  res.send(sa);
});

export default router;
