//const User = require('../models/user.model');
const db = require('../config/db');
const User = db.user;
const bcrypt = require('bcryptjs');
const attachmentService = require('../services/attachment.service');

const seed = async () => {
  const count = await User.count(); 
  if (count == 0) {
    const userAdmin = {
      email: "admin@admin.com",
      password: "admin",
      designation: "admin",
      activated: "true",
      firstName: "admin",
      lastName: "admin",
      name: "admin"
    };
    userAdmin.password = await bcrypt.hash('admin', 8);
    User.create(userAdmin);
    
  }
  //attachmentService.migrateFilesFromCloud();
};
seed();
