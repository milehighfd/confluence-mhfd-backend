import fs from 'fs';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import path from 'path';
import db from 'bc/config/db.js';
import {
  MHFD_FRONTEND,
  MHFD_EMAIL,
  SMTP_HOST,
  SMTP_PORT,
  BASE_SERVER_URL
} from 'bc/config/config.js';
import { FIELDS } from 'bc/lib/enumConstants.js';
import logger from 'bc/config/logger.js';

const User = db.user; 
const LogActivity = db.logActivity;

function getPublicUrl(filename) {
  return `${BASE_SERVER_URL}/${'images'}/${filename}`;
}

const getTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    //secure: true,
    //auth: {
    //  user: MHFD_EMAIL,
    //  pass: MHFD_PASSWORD,
    //}
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
  const redirectUrl = MHFD_FRONTEND + '/confirm-password/?id=' + changePasswordId;
  const template = fs.readFileSync(__dirname + '/templates/email_reset-pass-MHFD.html', 'utf8');
  const emailToSend = template.split('{{url}}').join(redirectUrl);

  const transporter = getTransporter();
  const options = {
    from: MHFD_EMAIL,
    to: email,
    subject: "MHFD Confluence - Reset your password",
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
    subject: "MHFD Confluence - Account approved",
    html: emailToSend,
    attachments: getAttachmentsCidList(['logo', 'facebook', 'youtube','twitter', 'linkedin'])
  };
  const info = await transporter.sendMail(options);
  logger.info('Email sent INFO: ' + JSON.stringify(info, null, 2));
}

const sendConfirmAccount = async (user) => {
  const redirectUrl = MHFD_FRONTEND;
  const transporter = getTransporter();
  const completeName = user.firstName + ' ' + user.lastName;
  // here
  const adminTemplate = fs.readFileSync(__dirname + '/templates/email_admin_new_user.html', 'utf8');
  const adminEmailToSend = adminTemplate.split('{{completeName}}').join(completeName).split('{{url}}').join(redirectUrl);
  logger.info(adminEmailToSend);
  const adminOptions = {
    from: MHFD_EMAIL,
    to: 'confluence.support@mhfd.org',
    subject: 'MHFD Confluence - New User Registered!',
    html: adminEmailToSend,
    attachments: getAttachmentsCidList(['logo', 'facebook', 'youtube','twitter', 'linkedin', 'map'])
  };
  //end here
  const email = user.email; 

  const template = fs.readFileSync(__dirname + '/templates/email_registered-MHFD.html', 'utf8');
  console.log(redirectUrl, completeName);
  const emailToSend = template.split('{{completeName}}').join(user.name).split('{{url}}').join(redirectUrl);

  const options = {
    from: MHFD_EMAIL,
    to: email,
    subject: "Welcome to MHFD Confluence!",
    html: emailToSend,
    attachments: getAttachmentsCidList(['logo', 'facebook', 'youtube','twitter', 'linkedin', 'map'])
  };
  const adminInfo = await transporter.sendMail(adminOptions);
  logger.info(`Email sent to ADMIN: ${JSON.stringify(adminInfo, null, 2)}`);
  const info = await transporter.sendMail(options); 

  logger.info('Email sent INFO: ' + JSON.stringify(info, null, 2));
}

const sendBoardNotification = async (email, type, locality, year, fullName) => {
  let bodyOptions;
  let url;
  if (type === 'WORK_REQUEST') {
    url = `${MHFD_FRONTEND}/work-request?year=${year}&locality=${locality}`
    bodyOptions = {
      title: `${locality}'s Work Request has been submitted!`,
      body: `${fullName} has submitted all requested projects from the jurisdiction of ${locality}. All projects are viewable in the applicable County and Service Area Work Plans in Confluence and are now ready for MHFD review.`,
      url,
      buttonName: 'View Work Request',
    }
  } else {
    url = `${MHFD_FRONTEND}/work-plan?year=${year}&locality=${locality}`
    bodyOptions = {
      title: `${locality}'s Work Plan has been approved!`,
      body: `
      The ${locality} Manager has reviewed and approved the ${locality} Work Plan and is ready for final management review and approval by the Board. A final notification will be provided when the MHFD Board has approved the Work Plan.
      `,
      url,
      buttonName: 'View Work Plan',
    }
  }
  const template = fs.readFileSync(__dirname + '/templates/email_board-notification.html', 'utf8');
  let content = template;
  Object.keys(bodyOptions).forEach((key) => {
    content = content.split(`{{${key}}}`).join(bodyOptions[key]);
  });
  const transporter = getTransporter();
  const options = {
    from: MHFD_EMAIL,
    to: email,
    subject: `MHFD Confluence - ${bodyOptions.title}`,
    html: content,
    attachments: getAttachmentsCidList(['logo', 'facebook', 'youtube','twitter', 'linkedin', 'map'])
  };
  const info = await transporter.sendMail(options);
  logger.info('Email sent INFO: ' + JSON.stringify(info, null, 2));
}

function getDestFile(filename) {
  let root = path.join(__dirname, `../public/images`);
  return path.join(root, `/${filename}`); 
}

const uploadPhoto = async (user, files) => {
  const newPromise = new Promise((resolve, reject) => {
    files.forEach(file => {
      const name = Date.now() + file.originalname;
      user.photo = getPublicUrl(name);
      user.save();
      try {
        fs.writeFileSync(getDestFile(name), file.buffer);
        resolve(user.photo);
      } catch (e) {
        console.log(e);
        reject(e)
      }
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

export default {
  sendBoardNotification,
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
