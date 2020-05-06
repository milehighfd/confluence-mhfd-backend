const User = require('../models/user.model');

const seed = async () => {
  const count = 0; //await User.count(); TODO
  if (count == 0) {
    const userAdmin = {
      email: "admin@admin.com",
      password: "admin",
      designation: "admin",
      activated: "true"
    };
    //User.create(userAdmin); TODO
  }
};
seed();
