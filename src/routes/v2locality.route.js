import express from 'express';
// import { ROLES } from 'bc/lib/enumConstants.js';
import db from 'bc/config/db.js';
// mimport auth2 from 'bc/auth/auth2.js';

const router = express.Router();
const ServiceArea = db.codeServiceArea;

router.get('/', async (req, res) => {
  const sa = await ServiceArea.findAll({
    include: { all: true, nested: true }
  }).map(result => result.dataValues).map(res => {
    return {
      ...res,
      Shape:  res.Shape.toString()
    }
  });
  console.log(sa);
  res.send(sa);
});

export default router;
