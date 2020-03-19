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