const User = require('../models/user.model');
const fs = require('fs');
const {
  MHFD_FRONTEND,
  MHFD_EMAIL,
  MHFD_PASSWORD,
} = require('../config/config');
const nodemailer = require('nodemailer');
const path = require('path');
const {Storage} = require('@google-cloud/storage');
const {FIELDS} = require('../lib/enumConstants');
const logger = require('../config/logger');
const { STORAGE_NAME, STORAGE_URL } = require('../config/config');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../config/develop-test-271312-20b199f0adbe.json'),
  projectId: 'develop-test-271312'
});

function getPublicUrl (filename) {
  return `${STORAGE_URL}/${STORAGE_NAME}/${filename}`;
}

const getTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: MHFD_EMAIL,
      pass: MHFD_PASSWORD,
    }
  });
  return transporter;
};  

const sendRecoverPasswordEmail = async (user) => {
  const email = user.email;
  const changePasswordId = user.changePasswordId;
  const redirectUrl = MHFD_FRONTEND + '/confirm-password/' + changePasswordId;
  const template = fs.readFileSync(__dirname + '/templates/email_reset-pass-MHFD.html', 'utf8');
  const emailToSend = template.split('{{url}}').join(redirectUrl);

  const transporter = getTransporter();
  const options = {
    from: MHFD_EMAIL,
    to: email,
    subject: "MHFD Confluence App - Reset your password",
    html: emailToSend,
  };

  const info = await transporter.sendMail(options);
  logger.info('Email sent INFO: ' + JSON.stringify(info, null, 2));
};

const sendConfirmAccount = async (user) => {
  const email = user.email; // registered_account
  const template = fs.readFileSync(__dirname + '/templates/email_confirm-MHFD.html', 'utf8');
  let completeName = user.firstName + ' ' + user.lastName;
  const emailToSend = template.split('{{completeName}}').join(completeName);

  const transporter = getTransporter();
  const options = {
    from: MHFD_EMAIL,
    to: email,
    subject: "MHFD Confluence App - Account created",
    html: emailToSend
  };

  const info = await transporter.sendMail(options);
  logger.info('Email sent INFO: ' + JSON.stringify(info, null, 2));
}

const uploadPhoto = async (user, files) => {
  const bucket = storage.bucket(STORAGE_NAME);
  
  const newPromise = new Promise((resolve, reject) => {
    files.forEach(file => {
      const name = Date.now() + file.originalname;
      user.photo = getPublicUrl(name);
      user.save();
      const blob = bucket.file(name);
      blob.createWriteStream({
        metadata: { contentType: file.mimetype}
      }).on('finish', async response => {
        await blob.makePublic();
        resolve(getPublicUrl(name));
      }).on('error', err => {
        reject('upload error: ', err);
      }).end(file.buffer);
    });
  });
}

const findById = async (userId) => {
  return await User.find({_id: userId});
}

const changePassword = async (changePasswordId, password) => {
  const user = await User.findOne({
    changePasswordId
  });
  if (!user) {
    logger.error('Invalid recovery password id: ' + changePasswordId);
    throw new Error({
      error: 'Invalid recovery password id'
    });
  }
  const now = new Date();
  if (now.getTime() > user.changePasswordExpiration.getTime()) {
    logger.error('Recovery password id expired: ' + changePasswordId + ', ' + user.changePasswordExpiration);
    throw new Error({
      error: 'Recovery password id expired'
    });
  }
  user.password = password;
  user.changePasswordId = '';
  user.changePasswordExpiration = new Date();
  await user.save();
  return user;
};

const requiredFields = (type) => {
  const {
    FIRST_NAME,
    LAST_NAME,
    DESIGNATION,
    EMAIL,
    ORGANIZATION,
    PASSWORD,
    CITY,
    COUNTY,
    SERVICE_AREA
  } = FIELDS;
  if (type === 'signup') {
    return [FIRST_NAME, LAST_NAME, DESIGNATION, EMAIL, ORGANIZATION, PASSWORD];
  }
  if (type === 'edit') {
    return [FIRST_NAME, LAST_NAME, EMAIL, ORGANIZATION, DESIGNATION, CITY, COUNTY, SERVICE_AREA]; 
  }
}

module.exports = {
  sendRecoverPasswordEmail,
  changePassword,
  requiredFields,
  uploadPhoto,
  findById,
  sendConfirmAccount
};
