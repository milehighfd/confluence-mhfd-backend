const express = require('express');
const { ROLES } = require('../lib/enumConstants');

const router = express.Router();

const db = require('../config/db');
const Locality = db.locality; 

const auth = require('../auth/auth');

const getData = (req, res, next) => {
  if(req.user.designation === ROLES.MFHD_STAFF) {

    res.locals.data = ['ROLES.MFHD_STAFF']
    next();
  } else if (req.user.designation === ROLES.GOVERNMENT_STAFF) {
    res.locals.data = ['ROLES.GOVERNMENT_STAFF']
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
