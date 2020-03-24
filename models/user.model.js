const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');

const Schema = mongoose.Schema;

var UserSchema = new Schema({
  activated: {
    type: Boolean,
    default: false
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    lowercase: true
  },
  designation: {
    type: String,
    default: 'other'
  },
  password: String,
  organization: String,
  //designation: String,

  city: String,
  county: String,
  serviceArea: String,

  changePasswordId: {
    type: String,
    default: ''
  },
  changePasswordExpiration: {
    type: Date,
    default: null
  },

  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
});

UserSchema.pre('save', async function (next) {
  const user = this;
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
      console.log(token);
      console.log(error);
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
      error: 'E-mail not exist'
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
    throw new Error({
      error: 'Invalid login credentials'
    });
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error({
      error: 'Invalid login credentials'
    });
  }
  return user;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
