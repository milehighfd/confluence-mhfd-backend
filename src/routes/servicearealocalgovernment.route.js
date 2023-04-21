import express from 'express';
import db from 'bc/config/db.js';

// use in case the table SERVICE_AREA_LOCAL_GOVERNMENT is required

const router = express.Router();
const ServiceAreaLocalGov = db.serviceAreaLocalGovernment;

router.get('/', async (req, res) => {

  const sa = await ServiceAreaLocalGov.findAll({
    include: { all: true, nested: true }
  });
  // console.log(sa);
  res.send(sa);
});

export default router;
