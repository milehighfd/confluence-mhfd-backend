const express = require('express');
const { ROLES } = require('../lib/enumConstants');

const router = express.Router();

const db = require('../config/db');
const Locality = db.locality; 

const auth2 = require('../auth/auth2');

const getData = async (req, res, next) => {
  res.locals.data = [];
  console.log('req.user', req.user);
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
      })
      organization
      res.locals.data = localities;
    }
  }
  next();
}

router.get('/', [auth2, getData],  (req, res) => {
    res.send({
        localities: res.locals.data
    })
})

module.exports = router;
