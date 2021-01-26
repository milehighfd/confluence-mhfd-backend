//const User = require('../models/user.model');
const db = require('../config/db');
const User = db.user;
const bcrypt = require('bcryptjs');
const attachmentService = require('../services/attachment.service');
const config = require('./config');


const seed = async () => {
  const count = await User.count(); 
  if (count == 0) {
    const userAdmin = {
      email: "admin@admin.com",
      password: config.DEFAULT_PASSWORD,
      designation: "admin",
      activated: "true",
      firstName: "admin",
      lastName: "admin",
      name: "admin",
      status: "approved"
    };
    userAdmin.password = await bcrypt.hash('admin', 8);
    User.create(userAdmin);
    
  }
  attachmentService.migrateFilesFromCloud();
};
seed();
