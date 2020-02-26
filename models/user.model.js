const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const config = require('../config/config');

const Schema = mongoose.Schema;

var UserSchema = new Schema({
  activated: {
    type: Boolean,
    default: false
  },
  firstName: String,
  lastName: String,
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
  designation: String,

  city: String,
  country: String,
  serviceArea: String,

  changePasswordId: String,
  changePasswordExpiration: Date,

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
