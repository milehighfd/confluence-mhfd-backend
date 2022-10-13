import db from 'bc/config/db.js';

const User = db.user;

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

export default auth2;
