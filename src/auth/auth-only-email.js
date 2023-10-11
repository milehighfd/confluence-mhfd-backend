import db from 'bc/config/db.js';

const User = db.user;

const authOnlyEmail = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const user = await User.findOne({
      attributes: ['email'],
      where: {
        token: token
      },
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

export default authOnlyEmail;
