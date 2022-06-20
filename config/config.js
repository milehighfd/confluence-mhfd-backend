const POSTGRESQL_DB = process.env.POSTGRESQL_DB || 'mhfd';
const POSTGRESQL_HOST = process.env.POSTGRESQL_HOST || 'localhost';
const POSTGRESQL_USER = process.env.POSTGRESQL_USER || 'mhfd';
const POSTGRESQL_PASSWORD = process.env.POSTGRESQL_PASSWORD || 'mhfd';
const DB_DIALECT = process.env.DB_DIALECT || 'postgres';
const JWT_KEY = process.env.JWT_KEY || 'jwtkey';
const JWT_EXPIRANCY = process.env.JWT_EXPIRANCY || 60 * 60 * 24 * 1000;
const MHFD_FRONTEND = process.env.MHFD_FRONTEND || 'http://localhost';
const MHFD_EMAIL = process.env.MHFD_EMAIL || 'email';
const MHFD_PASSWORD = process.env.MHFD_PASSWORD || 'password';
const STORAGE_NAME = process.env.STORAGE_NAME || 'mhfd-cloud.appspot.com'
const CARTO_TOKEN = process.env.CARTO_TOKEN || 'b0f91f29fd34765bb173da66ad06d0630a8d3c74';
const STORAGE_URL = process.env.STORAGE_URL || 'https://storage.googleapis.com'
const NUMBER_PER_PAGE = process.env.NUMBER_PER_PAGE || 20;
const INITIAL_PAGE = process.env.INITIAL_PAGE || 1;
const PROJECT_TABLE = process.env.PROJECT_TABLE || 'projects';
const GUEST_USER = process.env.GUEST_USER || 'guest@mhfd.com';
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'example-password';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT || 465;
const DB_PORT = process.env.DB_PORT || 5432;
const BASE_SERVER_URL = process.env.BASE_SERVER_URL || 'http://localhost:3003';
// NODE_ENV has three posible values dev, test y prod
const MHFD_PROJECTS_COPY = 'mhfd_projects_copy' + "_" + (process.env.NODE_ENV ? process.env.NODE_ENV : 'dev');
const CREATE_PROJECT_TABLE = process.env.CREATE_PROJECT_TABLE ? (process.env.CREATE_PROJECT_TABLE + '_' + (process.env.NODE_ENV ? process.env.NODE_ENV : 'dev')) : MHFD_PROJECTS_COPY;
module.exports = {
  JWT_KEY,
  POSTGRESQL_HOST,
  POSTGRESQL_DB,
  POSTGRESQL_USER,
  POSTGRESQL_PASSWORD,
  DB_DIALECT,
  JWT_EXPIRANCY,
  MHFD_FRONTEND,
  MHFD_EMAIL,
  MHFD_PASSWORD,
  CARTO_TOKEN,
  STORAGE_NAME,
  STORAGE_URL,
  NUMBER_PER_PAGE,
  INITIAL_PAGE,
  PROJECT_TABLE,
  GUEST_USER,
  DEFAULT_PASSWORD,
  CREATE_PROJECT_TABLE,
  SMTP_HOST,
  SMTP_PORT,
  DB_PORT,
  BASE_SERVER_URL,
  MHFD_PROJECTS_COPY
};
