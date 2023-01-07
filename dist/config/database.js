"use strict";

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DB,
    host: process.env.POSTGRESQL_HOST,
    dialect: process.env.DB_DIALECT
  },
  test: {
    username: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DB,
    host: process.env.POSTGRESQL_HOST,
    dialect: process.env.DB_DIALECT
  },
  production: {
    username: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DB,
    host: process.env.POSTGRESQL_HOST,
    dialect: process.env.DB_DIALECT
  }
};