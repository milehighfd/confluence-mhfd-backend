const bcrypt = require('bcryptjs');
//const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('user', {
    activated: {
      type: Sequelize.BOOLEAN
    },
    firstName: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    designation: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    organization: {
      type: Sequelize.STRING
    },
    city: {
      type: Sequelize.STRING
    },
    county: {
      type: Sequelize.STRING
    },
    serviceArea: {
      type: Sequelize.STRING
    },
    changePasswordId: {
      type: Sequelize.STRING
    },
    changePasswordExpiration: {
      type: Sequelize.DATE
    },
    photo: {
      type: Sequelize.STRING
    },
    token: {
      type: Sequelize.STRING
    }
  });

  //User.hasMany()

  User.prototype.generateAuthToken = async function () {
    const user = this;
    console.log('user', user);
    const token = jwt.sign({
      _id: user._id
    }, config.JWT_KEY, {
      expiresIn: config.JWT_EXPIRANCY
    });
    user.token = token;
    console.log('token', token);
    /* user.tokens = user.tokens.concat({
      token
    }); */
    await user.save();
    console.log('guardado')
    return token;
  };

  User.findByEmail = async (email) => {
    const user = await User.findOne({
      email
    });
  
    if(!user) {
      throw new Error({
        error: 'Email does not exist'
      });
    }
  
    return user;
  }

  User.generateChangePassword = async function () {
    const user = this;
    const random = crypto.randomBytes(16).toString('base64');
    const salt = new Buffer(random, 'base64');
    const newId = this._id + (new Date().getTime());
    const result = crypto.pbkdf2Sync(newId, salt, 10000, 64, 'sha512').toString('base64');
    user.changePasswordId = "";
    for (var i = 0; i < result.length; i++) {
      if (result.charAt(i) == '/') {
        this.changePasswordId = this.changePasswordId + '-';
      } else {
        this.changePasswordId = this.changePasswordId + result.charAt(i);
      }
    }
    this.changePasswordExpiration = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    this.save();
  };

  User.findByCredentials = async (email, password) => {
    const user = await User.findOne({
      where: {
        email: email
      }
    });
    if (!user) {
      logger.error('Invalid login email: ' + email);
      throw new Error({
        error: 'Invalid login credentials'
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      logger.error('Invalid login password for email: ' + email);
      throw new Error({
        error: 'Invalid login credentials'
      });
    }
    return user;
  };

  User.beforeValidate(async function(user) {
    for (let field in user.dataValues) {
      if (field instanceof String) {
        if (user[field] && field !== 'password') {
          user[field] = user[field].trim();
        }
      }
    }
    
    user.name = user.firstName + ' ' + user.lastName;
    //if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 8);
    //}
    const validTokens = [];
    /* for (let token of user.tokens) {
      try {
        if (jwt.verify(token.token, config.JWT_KEY)) {
          validTokens.push(token);
        }
      } catch(error) {
        logger.error('Token validation error: ' + token + ' - ' + error);
      }
    }
    user.tokens = validTokens; */
  });

  return User;
}

/* UserSchema.pre('save', async function (next) {
  const user = this;
  const fields = Object.keys(user.schema.paths);
  for (const field of fields) {
    if (user.schema.path(field) instanceof mongoose.Schema.Types.String) {
      if (user[field] && field !== 'password') {
        user[field] = user[field].trim();
      }
    }
  }

  user.name = user.firstName + ' ' + user.lastName;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  const validTokens = [];
  for (let token of user.tokens) {
    try {
      if (jwt.verify(token.token, config.JWT_KEY)) {
        validTokens.push(token);
      }
    } catch(error) {
      logger.error('Token validation error: ' + token + ' - ' + error);
    }
  }
  user.tokens = validTokens;
  next();
});

UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({
    _id: user._id
  }, config.JWT_KEY, {
    expiresIn: config.JWT_EXPIRANCY
  });
  user.tokens = user.tokens.concat({
    token
  });
  await user.save();
  return token;
};

UserSchema.statics.findByEmail = async (email) => {
  const user = await User.findOne({
    email
  });

  if(!user) {
    throw new Error({
      error: 'Email does not exist'
    });
  }

  return user;
}

UserSchema.methods.generateChangePassword = async function () {
  const user = this;
  const random = crypto.randomBytes(16).toString('base64');
  const salt = new Buffer(random, 'base64');
  const newId = this._id + (new Date().getTime());
  const result = crypto.pbkdf2Sync(newId, salt, 10000, 64, 'sha512').toString('base64');
  user.changePasswordId = "";
  for (var i = 0; i < result.length; i++) {
    if (result.charAt(i) == '/') {
      this.changePasswordId = this.changePasswordId + '-';
    } else {
      this.changePasswordId = this.changePasswordId + result.charAt(i);
    }
  }
  this.changePasswordExpiration = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  this.save();
};

UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({
    email
  });
  if (!user) {
    logger.error('Invalid login email: ' + email);
    throw new Error({
      error: 'Invalid login credentials'
    });
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    logger.error('Invalid login password for email: ' + email);
    throw new Error({
      error: 'Invalid login credentials'
    });
  }
  return user;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
 */