import express from 'express';
import db from 'bc/config/db.js';

const router = express.Router();
const streams = db.stream;

router.get('/', async (req, res) => {

  const sa = await streams.findAll({
    include: { all: true, nested: true }
  });
  console.log('-------------------------------------')
  //console.log(sa);
  res.send(sa);
});

const getStreamDatabyID = async (req, res) => {
  console.log(req.params);
  const objectid = req.params['OBJECTID'];
  let streamData = await streams.findAll({
    where: {
      OBJECTID: objectid
    }
  });
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