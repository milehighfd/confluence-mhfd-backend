const {ROLES } = require('../lib/enumConstants');

module.exports.validator = function(required_fields) {
  return function(req, res, next)  {
    for (const field of required_fields) {
      if (!req.body[field]) {
        return res.status(400).send('You need to send ' + field);
      }
    }
    next();
  }
}

module.exports.isAdminAccount = (req, res, next) => {
  if(req.user.designation === ROLES.MFHD_ADMIN || req.user.designation === ROLES.MFHD_STAFF) {
    next();
  } else {
    return res.status(403).send({error: `You're not allowed to do that`});
  }
}