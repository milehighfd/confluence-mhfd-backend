const express = require('express');
const { ROLES } = require('../lib/enumConstants');

const router = express.Router();

const db = require('../config/db');
const Locality = db.locality; 

const auth = require('../auth/auth');

const getData = async (req, res, next) => {
  if(req.user.designation === ROLES.MFHD_STAFF) {
    let localities = await Locality.findAll({
      where: {
        type: 'JURISDICTION'
      }
    })
    res.locals.data = localities;
    next();
  } else if (req.user.designation === ROLES.GOVERNMENT_STAFF) {
    let localities = await Locality.findAll({
      where: {
        name: req.user.organization
      }
    })
    organization
    res.locals.data = localities;
    next();
  } else {
    return res.status(403).send({ error: `You're not allowed to do that` });
  }
}

router.get('/', [auth, getData],  (req, res) => {
    res.send({
        localities: res.locals.data
    })
})

module.exports = router;
