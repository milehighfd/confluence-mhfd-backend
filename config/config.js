const MONGODB_DB = process.env.MONGODB_DB || 'mhfd';
const MONGODB_HOST = process.env.MONGODB_HOST || 'localhost';
const JWT_KEY = process.env.JWT_KEY || 'jwtkey';
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://' + MONGODB_HOST + '/' + MONGODB_DB;
const JWT_EXPIRANCY = process.env.JWT_EXPIRANCY || 60 * 60;
const MHFD_FRONTEND = process.env.MHFD_FRONTEND || 'http://localhost/';
const MHFD_EMAIL = process.env.MHFD_EMAIL || 'email';
const MHFD_PASSWORD = process.env.MHFD_PASSWORD || 'password';
const CARTO_TOKEN = process.env.CARTO_TOKEN || 'b0f91f29fd34765bb173da66ad06d0630a8d3c74';
const STORAGE_NAME = process.env.STORAGE_NAME || 'mhfd2-test'
const STORAGE_URL = process.env.STORAGE_URL || 'https://storage.googleapis.com'
const NUMBER_PER_PAGE = process.env.NUMBER_PER_PAGE || 20;
const INITIAL_PAGE = process.env.INITIAL_PAGE || 1;
module.exports = {
  JWT_KEY,
  MONGODB_URL,
  JWT_EXPIRANCY,
  MHFD_FRONTEND,
  MHFD_EMAIL,
  MHFD_PASSWORD,
  CARTO_TOKEN,
  STORAGE_NAME,
  STORAGE_URL,
  NUMBER_PER_PAGE,
  INITIAL_PAGE
};
