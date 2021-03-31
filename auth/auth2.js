const jwt = require('jsonwebtoken')
//const User = require('../models/user.model')
const db = require('../config/db');
const User = db.user;
const config = require('../config/config');

const auth2 = async (req, res, next) => {
    let authHeader = req.header('Authorization');
    let user = null;
    let token = null;
    if (authHeader) {
        token = authHeader.replace('Bearer ', '');
        user = await User.findOne({
          where: {
            token: token
          }
        });
    }
    req.user = user;
    req.token = token;
    next();
};

module.exports = auth2;
