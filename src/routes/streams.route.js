import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const router = express.Router();
const streams = db.stream;

router.get('/', async (req, res) => {
  try {
    logger.info(`Starting endpoint streams.route/ with params ${JSON.stringify(req.params, null, 2)}`);
    logger.info(`Starting function findAll for streams.route/`);
    const sa = await streams.findAll({
      include: { all: true, nested: true }
    });
    logger.info(`Finished  function findAll for streams.route/`);
    //console.log(sa);
    res.send(sa);
  } catch (error) {
    res.status(500).send(error);
  }
});

const getStreamDatabyID = async (req, res) => {
  try {
    logger.info(`Starting endpoint streams.route/ with params ${JSON.stringify(req.params, null, 2)}`);
    console.log(req.params);
    const objectid = req.params['OBJECTID'];
    logger.info(`Starting function findAll for streams.route/:OBJECTID`);
    let streamData = await streams.findAll({
      where: {
        mhfd_code: objectid
      },
      attributes: [
        'stream_name',
        'mhfd_code',
        'catchment_area_sum_ac',
        'stream_length_ft',
        'slope_ft'
      ],
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
  } catch (error) {
    res.status(500).send(error);
  }
}

router.get('/:OBJECTID',getStreamDatabyID);

export default router;