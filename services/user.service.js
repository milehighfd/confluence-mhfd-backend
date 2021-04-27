const db = require('../config/db');
const User = db.user; 
const fs = require('fs');
const bcrypt = require('bcryptjs');
const {
  MHFD_FRONTEND,
  MHFD_EMAIL,
  MHFD_PASSWORD,
} = require('../config/config');
const nodemailer = require('nodemailer');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { FIELDS } = require('../lib/enumConstants');
const logger = require('../config/logger');
const { STORAGE_NAME, STORAGE_URL } = require('../config/config');
const LogActivity = db.logActivity;

const storage = new Storage({
  keyFilename: path.join(__dirname, '../config/mhfd-cloud-8212a0689e50.json'),
  projectId: 'mhfd-cloud'
});

function getPublicUrl(filename) {
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

const findAllUsers = () => {
  const users = User.findAll();
  return users;
}

const getAttachmentsCidList = (cids) => {
  return cids.map((cid) => {
    return {
      filename: `${cid}.png`,
      path: `${__dirname}/images/${cid}.png`,
      cid: `${cid}`
    }
  })
}

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
    attachments: getAttachmentsCidList(['logo', 'facebook', 'youtube','twitter', 'linkedin'])
  };
  const info = await transporter.sendMail(options);
  logger.info('Email sent INFO: ' + JSON.stringify(info, null, 2));
};

const sendApprovedAccount = async (user) => {
  const email = user.email;
  const redirectUrl = MHFD_FRONTEND
  const template = fs.readFileSync(__dirname + '/templates/email_approved.html', 'utf8');
  const emailToSend = template.split('{{completeName}}').join(user.name).split('{{url}}').join(redirectUrl);

  const transporter = getTransporter();
  const options = {
    from: MHFD_EMAIL,
    to: email,
    subject: "MHFD Confluence App - Account approved",
    html: emailToSend
  };
  const info = await transporter.sendMail(options);
  logger.info('Email sent INFO: ' + JSON.stringify(info, null, 2));
}

const sendConfirmAccount = async (user) => {
  const email = user.email; 

  const redirectUrl = MHFD_FRONTEND;
  const template = fs.readFileSync(__dirname + '/templates/email_registered-MHFD.html', 'utf8');
  const completeName = user.firstName + ' ' + user.lastName;
  console.log(redirectUrl, completeName);
  const emailToSend = template.split('{{completeName}}').join(user.name).split('{{url}}').join(redirectUrl);

  const transporter = getTransporter();
  const options = {
    from: MHFD_EMAIL,
    to: email,
    subject: "MHFD Confluence App - Account created",
    html: emailToSend,
    attachments: getAttachmentsCidList(['logo', 'facebook', 'youtube','twitter', 'linkedin', 'map'])
  };
  const info = await transporter.sendMail(options); 

  logger.info('Email sent INFO: ' + JSON.stringify(info, null, 2));
}

const uploadPhoto = async (user, files) => {
  const bucket = storage.bucket(STORAGE_NAME);

  const newPromise = new Promise((resolve, reject) => {
    files.forEach(file => {
      const name = Date.now() + file.originalname;
      console.log('NAME USER', name);
      user.photo = getPublicUrl(name);
      user.save();
      const blob = bucket.file(name);
      console.log('BUFFER', file.buffer);
      blob.createWriteStream({
        metadata: { contentType: file.mimetype }
      }).on('finish', async response => {
        await blob.makePublic();
        resolve(getPublicUrl(name));
      }).on('error', err => {
        reject('upload error: ', err);
      }).end(file.buffer);
    });
  });
  await newPromise;
}

const findById = async (userId) => {
  return await User.find({ _id: userId });
}

const deleteUser = async (userId) => {
  LogActivity.destroy({
    where: {
      user_id: userId
    }
  });

  User.destroy({
    where: {
      _id: userId
    }
  });

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

  const user1 = await User.findByPk(user._id, { raw: true });

  const newPwd = await bcrypt.hash(password, 8);
  user1.password = newPwd;
  user1.changePasswordId = '';
  user1.changePasswordExpiration = null;
  
  await User.update(user1, {
    where: {
      _id: user._id
    }
  }).then(function () {
    console.log('guardando');
  }).catch(err1 => {
    console.log(err1);
  }); 

  return user1;
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
    SERVICE_AREA,
    PHONE,
    TITLE,
    ZOOM_AREA
  } = FIELDS;
  if (type === 'signup') {
    return [FIRST_NAME, LAST_NAME, DESIGNATION, EMAIL, ORGANIZATION, PASSWORD];
  }
  if (type === 'edit') {
    return [FIRST_NAME, LAST_NAME, EMAIL, CITY, COUNTY, SERVICE_AREA, PHONE, TITLE, ORGANIZATION, DESIGNATION, ZOOM_AREA];
  }
}

module.exports = {
  sendRecoverPasswordEmail,
  changePassword,
  requiredFields,
  uploadPhoto,
  findById,
  sendConfirmAccount,
  findAllUsers,
  sendApprovedAccount,
  deleteUser
};
