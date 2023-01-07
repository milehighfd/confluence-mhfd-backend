"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.STORAGE_URL = exports.STORAGE_NAME = exports.SMTP_PORT = exports.SMTP_HOST = exports.PROPSPROBLEMTABLES = exports.PROJECT_TABLE = exports.PROBLEM_TABLE = exports.PROBLEM_PART_TABLES = exports.POSTGRESQL_USER = exports.POSTGRESQL_PASSWORD = exports.POSTGRESQL_HOST = exports.POSTGRESQL_DB = exports.NUMBER_PER_PAGE = exports.MHFD_PASSWORD = exports.MHFD_FRONTEND = exports.MHFD_EMAIL = exports.MAIN_PROJECT_TABLE = exports.JWT_KEY = exports.JWT_EXPIRANCY = exports.INITIAL_PAGE = exports.GUEST_USER = exports.DEFAULT_PASSWORD = exports.DB_PORT = exports.DB_DIALECT = exports.CREATE_PROJECT_TABLE_V2 = exports.CREATE_PROJECT_TABLE = exports.COSPONSOR1 = exports.COSPONSOR = exports.COMPLETE_YEAR_COLUMN = exports.CARTO_URL_MAP = exports.CARTO_URL = exports.CARTO_TOKEN = exports.CARTO_DOMAIN = exports.BASE_SERVER_URL = void 0;

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_dotenv["default"].config({
  path: '.env'
});

var POSTGRESQL_DB = process.env.POSTGRESQL_DB || 'mhfd';
exports.POSTGRESQL_DB = POSTGRESQL_DB;
var POSTGRESQL_HOST = process.env.POSTGRESQL_HOST || 'localhost';
exports.POSTGRESQL_HOST = POSTGRESQL_HOST;
var POSTGRESQL_USER = process.env.POSTGRESQL_USER || 'postgres';
exports.POSTGRESQL_USER = POSTGRESQL_USER;
var POSTGRESQL_PASSWORD = process.env.POSTGRESQL_PASSWORD || 'postgres';
exports.POSTGRESQL_PASSWORD = POSTGRESQL_PASSWORD;
var DB_DIALECT = process.env.DB_DIALECT || 'postgres';
exports.DB_DIALECT = DB_DIALECT;
var JWT_KEY = process.env.JWT_KEY || 'jwtkey';
exports.JWT_KEY = JWT_KEY;
var JWT_EXPIRANCY = process.env.JWT_EXPIRANCY || 60 * 60 * 24 * 1000;
exports.JWT_EXPIRANCY = JWT_EXPIRANCY;
var MHFD_FRONTEND = process.env.MHFD_FRONTEND || 'http://localhost';
exports.MHFD_FRONTEND = MHFD_FRONTEND;
var MHFD_EMAIL = process.env.MHFD_EMAIL || 'email';
exports.MHFD_EMAIL = MHFD_EMAIL;
var MHFD_PASSWORD = process.env.MHFD_PASSWORD || 'password';
exports.MHFD_PASSWORD = MHFD_PASSWORD;
var STORAGE_NAME = process.env.STORAGE_NAME || 'mhfd-cloud.appspot.com';
exports.STORAGE_NAME = STORAGE_NAME;
var CARTO_TOKEN = process.env.CARTO_TOKEN || 'b0f91f29fd34765bb173da66ad06d0630a8d3c74';
exports.CARTO_TOKEN = CARTO_TOKEN;
var STORAGE_URL = process.env.STORAGE_URL || 'https://storage.googleapis.com';
exports.STORAGE_URL = STORAGE_URL;
var NUMBER_PER_PAGE = process.env.NUMBER_PER_PAGE || 20;
exports.NUMBER_PER_PAGE = NUMBER_PER_PAGE;
var INITIAL_PAGE = process.env.INITIAL_PAGE || 1;
exports.INITIAL_PAGE = INITIAL_PAGE;
var PROJECT_TABLE = process.env.PROJECT_TABLE || 'projects';
exports.PROJECT_TABLE = PROJECT_TABLE;
var GUEST_USER = process.env.GUEST_USER || 'guest@mhfd.com';
exports.GUEST_USER = GUEST_USER;
var DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'example-password';
exports.DEFAULT_PASSWORD = DEFAULT_PASSWORD;
var SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
exports.SMTP_HOST = SMTP_HOST;
var SMTP_PORT = process.env.SMTP_PORT || 465;
exports.SMTP_PORT = SMTP_PORT;
var DB_PORT = process.env.DB_PORT || 5432;
exports.DB_PORT = DB_PORT;
var BASE_SERVER_URL = process.env.BASE_SERVER_URL || 'http://localhost:3003'; // NODE_ENV has three posible values dev, test y prod

exports.BASE_SERVER_URL = BASE_SERVER_URL;
var MAIN_PROJECT_TABLE = 'mhfd_projects';
exports.MAIN_PROJECT_TABLE = MAIN_PROJECT_TABLE;
var CREATE_PROJECT_TABLE = process.env.CREATE_PROJECT_TABLE + '_' + (process.env.NODE_ENV ? process.env.NODE_ENV : 'dev');
exports.CREATE_PROJECT_TABLE = CREATE_PROJECT_TABLE;
var CREATE_PROJECT_TABLE_V2 = 'project';
exports.CREATE_PROJECT_TABLE_V2 = CREATE_PROJECT_TABLE_V2;
var PROBLEM_TABLE = 'problem_boundary';
exports.PROBLEM_TABLE = PROBLEM_TABLE;
var COMPLETE_YEAR_COLUMN = 'completeyear';
exports.COMPLETE_YEAR_COLUMN = COMPLETE_YEAR_COLUMN;
var COSPONSOR1 = 'cosponsor1';
exports.COSPONSOR1 = COSPONSOR1;
var COSPONSOR = 'cosponsor';
exports.COSPONSOR = COSPONSOR;
var PROPSPROBLEMTABLES = {
  problems: ['solutioncost', //0
  'solutionstatus', //1
  'jurisdiction', //2
  'mhfdmanager', //3
  'problemdescription', //4
  'problemid', //5
  'problemname', //6
  'problempriority', //7
  'problemtype', //8
  'servicearea', //9
  'shape_area', //10
  'shape_length', //11
  'sourcedate', //12
  'sourcename', //13
  'source', //14
  'streamname', //15
  'component_cost', //16
  'component_count'],
  problem_boundary: ['estimated_cost', //0
  'component_status', //1
  'local_government', //2
  'mhfd_manager', //3
  'problem_description', //4
  'problem_id', //5
  'problem_name', //6
  'problem_severity', //7
  'problem_type', //8
  'service_area', //9
  'shape_starea', //10
  'shape_stlength', //11
  'source_complete_year', //12
  'source_name', //13
  'source_type', //14
  'stream_name', //15
  'component_cost', //16
  'component_count' //17
  ]
};
exports.PROPSPROBLEMTABLES = PROPSPROBLEMTABLES;
var PROBLEM_PART_TABLES = ['flood_hazard_polygon_', 'flood_hazard_line_', 'flood_hazard_point_', 'stream_function_polygon_', 'stream_function_point_', 'future_development_polygon_', 'stream_function_line_', 'future_development_line_'];
exports.PROBLEM_PART_TABLES = PROBLEM_PART_TABLES;
var CARTO_DOMAIN = 'denver-mile-high-admin';
exports.CARTO_DOMAIN = CARTO_DOMAIN;
var CARTO_URL = encodeURI("https://".concat(CARTO_DOMAIN, ".carto.com/api/v2/sql?api_key=").concat(CARTO_TOKEN));
exports.CARTO_URL = CARTO_URL;
var CARTO_URL_MAP = encodeURI("https://".concat(CARTO_DOMAIN, ".carto.com/api/v1/map?api_key=").concat(CARTO_TOKEN));
exports.CARTO_URL_MAP = CARTO_URL_MAP;
var _default = {
  JWT_KEY: JWT_KEY,
  POSTGRESQL_HOST: POSTGRESQL_HOST,
  POSTGRESQL_DB: POSTGRESQL_DB,
  POSTGRESQL_USER: POSTGRESQL_USER,
  POSTGRESQL_PASSWORD: POSTGRESQL_PASSWORD,
  DB_DIALECT: DB_DIALECT,
  JWT_EXPIRANCY: JWT_EXPIRANCY,
  MHFD_FRONTEND: MHFD_FRONTEND,
  MHFD_EMAIL: MHFD_EMAIL,
  MHFD_PASSWORD: MHFD_PASSWORD,
  CARTO_TOKEN: CARTO_TOKEN,
  STORAGE_NAME: STORAGE_NAME,
  STORAGE_URL: STORAGE_URL,
  NUMBER_PER_PAGE: NUMBER_PER_PAGE,
  INITIAL_PAGE: INITIAL_PAGE,
  PROJECT_TABLE: PROJECT_TABLE,
  GUEST_USER: GUEST_USER,
  DEFAULT_PASSWORD: DEFAULT_PASSWORD,
  CREATE_PROJECT_TABLE: CREATE_PROJECT_TABLE,
  CREATE_PROJECT_TABLE_V2: CREATE_PROJECT_TABLE_V2,
  SMTP_HOST: SMTP_HOST,
  SMTP_PORT: SMTP_PORT,
  DB_PORT: DB_PORT,
  BASE_SERVER_URL: BASE_SERVER_URL,
  PROBLEM_TABLE: PROBLEM_TABLE,
  PROPSPROBLEMTABLES: PROPSPROBLEMTABLES,
  MAIN_PROJECT_TABLE: MAIN_PROJECT_TABLE,
  CARTO_URL: CARTO_URL,
  CARTO_URL_MAP: CARTO_URL_MAP,
  COMPLETE_YEAR_COLUMN: COMPLETE_YEAR_COLUMN,
  COSPONSOR1: COSPONSOR1,
  COSPONSOR: COSPONSOR,
  PROBLEM_PART_TABLES: PROBLEM_PART_TABLES
};
exports["default"] = _default;