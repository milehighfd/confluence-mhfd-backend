import express from 'express';
import sequelize from 'sequelize';
import { ROLES } from 'bc/lib/enumConstants.js';
import db from 'bc/config/db.js';
import auth2 from 'bc/auth/auth2.js';

const { Op } = sequelize;
const router = express.Router();
const Locality = db.locality;

const getData = async (req, res, next) => {
  res.locals.data = [];
  if (req.user) {
    if([ROLES.MFHD_STAFF, ROLES.GOVERNMENT_ADMIN, ROLES.MFHD_ADMIN].includes(req.user.designation)) {
      let localities = await Locality.findAll({
        where: {
          type: 'JURISDICTION'
        },
        order: [['name', 'ASC']]
      })
      res.locals.data = localities;
    } else if (req.user.designation === ROLES.GOVERNMENT_STAFF) {
      let localities = await Locality.findAll({
        where: {
          name: req.user.organization
        },
        order: [['name', 'ASC']]
      });
      res.locals.data = localities;
    }
  }
  next();
}

const getData2 = async (req, res, next) => {
  const { type } = req.params;
  res.locals.data = [];
  if (type === 'WORK_REQUEST') {
    if (req.user) {
      if(req.user.designation === ROLES.MFHD_STAFF || req.user.designation === ROLES.MFHD_ADMIN) {
        let localities = await Locality.findAll({
          where: {
            type: 'JURISDICTION'
          },
          order: [['name', 'ASC']]
        })
        res.locals.data = localities;
      } else if (req.user.designation === ROLES.GOVERNMENT_STAFF) {
        let localities = await Locality.findAll({
          where: {
            name: req.user.organization
          },
          order: [['name', 'ASC']]
        });
        res.locals.data = localities;
      }
    } else {
      let localities = await Locality.findAll({
        where: {
          type: 'JURISDICTION'
        },
        order: [['name', 'ASC']]
      });
      res.locals.data = localities;
    }
  } else if (type === 'WORK_PLAN') {
    let localities = await Locality.findAll({
      where: {
        type: {
          [Op.in]: ['SERVICE_AREA', 'COUNTY']
        },
      },
      order: [['name', 'ASC']]
    })
    res.locals.data = localities;
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
