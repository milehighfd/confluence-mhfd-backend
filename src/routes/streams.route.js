import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const router = express.Router();
const streams = db.stream;

router.get('/', async (req, res) => {
  logger.info(`Starting endpoint streams.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  logger.info(`Starting function findAll for streams.route/`);
  const sa = await streams.findAll({
    include: { all: true, nested: true }
  });
  logger.info(`Finished  function findAll for streams.route/`);
  console.log('-------------------------------------')
  //console.log(sa);
  res.send(sa);
});

const getStreamDatabyID = async (req, res) => {
  logger.info(`Starting endpoint streams.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  console.log(req.params);
  const objectid = req.params['OBJECTID'];
  logger.info(`Starting function findAll for streams.route/:OBJECTID`);
  let streamData = await streams.findAll({
    where: {
      OBJECTID: objectid
    }
  });
  logger.info(`Finished function findAll for streams.route/:OBJECTID`);
  if (streamData) {
    res.send(streamData)
  }
  else {
    res.status(404).send('Not found');
    return;
  }
  console.log(streamData);
}

router.get('/:OBJECTID',getStreamDatabyID);

export default router;