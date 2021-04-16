const express = require('express');
const { Op } = require("sequelize");

const { ROLES } = require('../lib/enumConstants');

const router = express.Router();

const db = require('../config/db');
const Locality = db.locality; 

const auth2 = require('../auth/auth2');

const getData = async (req, res, next) => {
  res.locals.data = [];
  if (req.user) {
    if(req.user.designation === ROLES.MFHD_STAFF) {
      let localities = await Locality.findAll({
        where: {
          type: 'JURISDICTION'
        }
      })
      res.locals.data = localities;
    } else if (req.user.designation === ROLES.GOVERNMENT_STAFF) {
      let localities = await Locality.findAll({
        where: {
          name: req.user.organization
        }
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
      if(req.user.designation === ROLES.MFHD_STAFF) {
        let localities = await Locality.findAll({
          where: {
            type: 'JURISDICTION'
          }
        })
        res.locals.data = localities;
      } else if (req.user.designation === ROLES.GOVERNMENT_STAFF) {
        let localities = await Locality.findAll({
          where: {
            name: req.user.organization
          }
        });
        res.locals.data = localities;
      }
    }
  } else if (type === 'WORK_PLAN') {
    let localities = await Locality.findAll({
      where: {
        type: {
          [Op.in]: ['SERVICE_AREA', 'COUNTY']
        }
      }
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

router.get('/:type', [auth2, getData2],  (req, res) => {
  res.send({
      localities: res.locals.data
  })
})

module.exports = router;
