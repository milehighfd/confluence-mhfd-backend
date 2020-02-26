const jwt = require('jsonwebtoken')
const User = require('../models/user.model')
const config = require('../config/config');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const data = jwt.verify(token, config.JWT_KEY);
    const user = await User.findOne({
      _id: data._id,
      'tokens.token': token
    });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({
      error: 'Not authorized to access this resource'
    });
  }
};

module.exports = auth;
