import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const router = express.Router();
const streams = db.stream;
const streamSegments = db.streamSegment;

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
    let streamSegment = await streamSegments.findOne({
      where: {
        mhfd_code_segment: objectid
      },
      attributes: [
        'mhfd_code_stream',
        'mhfd_code_segment',
        'stream_name',
        'slope_ft',
      ],
    });
    console.log(streamSegment)
    if (!streamSegment) {
      res.status(404).send('Not found');
      return;
    }
    let streamData = await streams.findAll({
      where: {
        mhfd_code_stream: streamSegment.mhfd_code_stream
      },
      attributes: [
        'stream_name',
        'mhfd_code_stream',
        'sum_catchment_area_ac',
        'sum_stream_length_ft',
        //'slope_ft'
      ],
    });
    logger.info(`Finished function findAll for streams.route/:OBJECTID`);
    if (streamData) {
      streamData = streamData.map(data => {
        return {
          ...data.dataValues,
          slope_ft: streamSegment.slope_ft
        };
      });
      res.send(streamData);
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