import express from 'express';
import db from 'bc/config/db.js';

const router = express.Router();
const ServiceAreaLocalGov = db.serviceAreaLocalGovernment;

router.get('/', async (req, res) => {

  const sa = await ServiceAreaLocalGov.findAll({
    include: { all: true, nested: true }
  }).map(result => result.dataValues);
  // console.log(sa);
  res.send(sa);
});

export default router;
