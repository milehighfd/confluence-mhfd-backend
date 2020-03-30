const User = require('../models/user.model');
const fs = require('fs');
const {
  MHFD_FRONTEND,
  MHFD_EMAIL,
  MHFD_PASSWORD,
} = require('../config/config');
const nodemailer = require('nodemailer');
const {FIELDS} = require('../lib/enumConstants');

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
  console.log("Type:" + (typeof template));
  const emailToSend = template.split('{{url}}').join(redirectUrl);

  const transporter = getTransporter();
  const options = {
    from: MHFD_EMAIL,
    to: email,
    subject: "MHFD Confluence App - Reset your password",
    html: emailToSend,
  };

  const info = await transporter.sendMail(options);
  console.log('INFO: ' + JSON.stringify(info, null, 2));
};

const changePassword = async (changePasswordId, password) => {
  const user = await User.findOne({
    changePasswordId
  });
  if (!user) {
    throw new Error({
      error: 'Invalid recovery password id'
    });
  }
  const now = new Date();
  if (now.getTime() > user.changePasswordExpiration.getTime()) {
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
  requiredFields
};
