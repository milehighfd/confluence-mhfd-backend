const User = require('../models/user.model');

const seed = async () => {
  const count = await User.count();
  if (count == 0) {
    const userAdmin = {
      email: "admin@admin.com",
      password: "admin",
      designation: "admin",
      activated: "true"
    };
    User.create(userAdmin);
  }
};
seed();
