const db = require('../config/db');
const User = db.user;
const Consultants = db.consultants;
const bcrypt = require('bcryptjs');
const config = require('./config');
const defaultData = require('./defaultdata');

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
      status: "approved",
      organization: 'Mile High Flood Control District',
      zoomarea: 'Mile High Flood District'
    };
    userAdmin.password = await bcrypt.hash('admin', 8);
    User.create(userAdmin);
  }
  const consultantsCount = await Consultants.count();
  if (consultantsCount === 0) {
    for (var i = 0 ; i < defaultData.consultants.length ; i++) {
      await Consultants.create({ name: defaultData.consultants[i] });
    }
    console.log(`Added ${defaultData.consultants.length} consultants`);
  }
};

seed();
