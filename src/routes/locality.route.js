import express from 'express';
import { ROLES } from 'bc/lib/enumConstants.js';
import db from 'bc/config/db.js';
import auth2 from 'bc/auth/auth2.js';

const router = express.Router();

const getData = async (req, res, next) => {
  const [localities] = await db.sequelize.query(`SELECT name, type FROM Localities ORDER BY name ASC;`);
  res.locals.data = [];
  if (req.user) {
    if([ROLES.MFHD_STAFF, ROLES.GOVERNMENT_ADMIN, ROLES.MFHD_ADMIN].includes(req.user.designation)) {
      res.locals.data = localities.filter(l => l.type === 'JURISDICTION');
    } else if (req.user.designation === ROLES.GOVERNMENT_STAFF) {
      res.locals.data = localities;
    }
  }
  next();
}

const getData2 = async (req, res, next) => {
  const { type } = req.params;
  const [localities] = await db.sequelize.query(`SELECT name, type FROM Localities ORDER BY name ASC;`);
  res.locals.data = [];
  if (type === 'WORK_REQUEST') {
    if (req.user) {
      if(req.user.designation === ROLES.MFHD_STAFF || req.user.designation === ROLES.MFHD_ADMIN) {
        res.locals.data = localities.filter(l => l.type === 'LOCAL_GOVERNMENT');
      } else if (req.user.designation === ROLES.GOVERNMENT_STAFF) {
        res.locals.data = localities.filter(l => l.name === req.user.organization);
      }
    } else {
      res.locals.data = localities.filter(l => l.type === 'LOCAL_GOVERNMENT');
    }
  } else if (type === 'WORK_PLAN') {
    res.locals.data = localities.filter(l => l.type !== 'LOCAL_GOVERNMENT');
  }
  next();
}

router.get('/', [auth2, getData],  (req, res) => {
    res.send({
        localities: res.locals.data
    })
})

router.get('/:type', [getData2], async (req, res) => {
  let localities = res.locals.data;
  res.send({ localities });
})

export default router;
