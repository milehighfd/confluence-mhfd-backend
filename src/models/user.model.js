import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from 'bc/config/config.js';
import logger from 'bc/config/logger.js';
import sequelize from 'sequelize';
const { Op } = sequelize;

export default (sequelize, DataType) => {
  const User = sequelize.define('user', {    
    user_id: {
      primaryKey: true,
      type: DataType.INTEGER,
      allowNull: false,
      autoIncrement: true     
    },
    activated: {
      type: DataType.BOOLEAN
    },
    firstName: {
      type: DataType.STRING
    },
    lastName: {
      type: DataType.STRING
    },
    name: {
      type: DataType.STRING
    },
    email: {
      type: DataType.STRING
    },
    designation: {
      type: DataType.STRING
    },
    password: {
      type: DataType.STRING
    },
    organization: {
      type: DataType.STRING
    },
    city: {
      type: DataType.STRING
    },
    county: {
      type: DataType.STRING
    },
    serviceArea: {
      type: DataType.STRING
    },
    changePasswordId: {
      type: DataType.STRING
    },
    changePasswordExpiration: {
      type: DataType.DATE
    },
    photo: {
      type: DataType.STRING
    },
    token: {
      type: DataType.STRING
    },
    phone: {
      type: DataType.STRING
    },
    zipCode: {
      type: DataType.STRING
    },
    title: {
      type: DataType.STRING
    },
    zoomarea: {
      type: DataType.STRING
    },
    business_associate_contact_id: {
      type: DataType.INTEGER,    
    },
    status: {
      type: DataType.ENUM,
      values: ['approved', 'pending', 'deleted']
    },
    createdAt: {
      type: DataType.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataType.DATE,
      allowNull: false
    },
    is_sso: {
      type: DataType.BOOLEAN,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'users'
    // createdAt: false,
    // updatedAt: false
  });
  User.prototype.generateAuthToken = async function () {
    const user = this;
    
    const token = jwt.sign({
      user_id: user.user_id
    }, config.JWT_KEY, {
      expiresIn: config.JWT_EXPIRANCY
    });
    user.token = token;
    await user.save();
    return token;
  };
  User.prototype.generateGuestAuthToken = async function () {
    const user = this;
    
    user.token = 'GUEST';
    await user.save();
    return user.token;
  };
  
  User.findByEmail = async (email) => {
    const user = await User.findOne({where: {
        [Op.like]: '%' + email + '%'
      }
    });

    if (!user) {
      throw new Error({
        error: 'Email does not exist'
      });
    }

    return user;
  }
  User.prototype.generateSignupToken = async function () {
    const user = this;
    const random = crypto.randomBytes(16).toString('hex');
    user.changePasswordId = random;
    // ten minutes for signup
    this.changePasswordExpiration = new Date(new Date().getTime() + 10 * 60 * 1000);
    await this.save();
  }
  // 
  User.prototype.generateChangePassword = async function () {
    const user = this;
    const random = crypto.randomBytes(16).toString('hex');
    // const salt = new Buffer(random, 'base64');
    // const newId = this._id + (new Date().getTime());
    // const result = crypto.pbkdf2Sync(newId, salt, 10000, 64, 'sha512').toString('base64');
    user.changePasswordId = random;
    // for (var i = 0; i < result.length; i++) {
    //   if (result.charAt(i) == '/') {
    //     this.changePasswordId = this.changePasswordId + '-';
    //   } else {
    //     this.changePasswordId = this.changePasswordId + result.charAt(i);
    //   }
    // }
    this.changePasswordExpiration = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    this.save();
  };

  User.findByCredentials = async (email, password) => {
    const user = await User.findOne({
      where: {
        email: {
          [Op.like]: '%' + email + '%'
        },
        status: {
          [Op.not]: 'deleted'
        },
        activated: 1
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
  return User;
}
