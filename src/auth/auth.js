import db from 'bc/config/db.js';

const User = db.user;
const businessAssociateContact = db.businessAssociateContact;
const businessAssociates = db.businessAssociates;
const businessAdress = db.businessAdress;

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const user = await User.findOne({
      include: {
        model: businessAssociateContact,
        include: {
          model: businessAdress,
          include: {
            model: businessAssociates,
            required: false
          },
          required: false
        },
        required: false
      },
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

export default auth;
