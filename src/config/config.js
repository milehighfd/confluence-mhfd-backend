import dotenv from 'dotenv';
dotenv.config({
  path: '.env'
});
export const POSTGRESQL_DB = process.env.POSTGRESQL_DB || 'mhfd';
export const POSTGRESQL_HOST = process.env.POSTGRESQL_HOST || 'localhost';
export const POSTGRESQL_USER = process.env.POSTGRESQL_USER || 'postgres';
export const POSTGRESQL_PASSWORD = process.env.POSTGRESQL_PASSWORD || 'postgres';
export const DB_DIALECT = process.env.DB_DIALECT || 'postgres';
export const JWT_KEY = process.env.JWT_KEY || 'jwtkey';
export const JWT_EXPIRANCY = process.env.JWT_EXPIRANCY || 60 * 60 * 24 * 1000;
export const MHFD_FRONTEND = process.env.MHFD_FRONTEND || 'http://localhost';
export const MHFD_EMAIL = process.env.MHFD_EMAIL || 'email';
export const MHFD_PASSWORD = process.env.MHFD_PASSWORD || 'password';
export const STORAGE_NAME = process.env.STORAGE_NAME || 'mhfd-cloud.appspot.com'
export const CARTO_TOKEN = process.env.CARTO_TOKEN || 'b0f91f29fd34765bb173da66ad06d0630a8d3c74';
export const STORAGE_URL = process.env.STORAGE_URL || 'https://storage.googleapis.com'
export const NUMBER_PER_PAGE = process.env.NUMBER_PER_PAGE || 20;
export const INITIAL_PAGE = process.env.INITIAL_PAGE || 1;
export const PROJECT_TABLE = process.env.PROJECT_TABLE || 'projects';
export const GUEST_USER = process.env.GUEST_USER || 'guest@mhfd.com';
export const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'example-password';
export const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
export const SMTP_PORT = process.env.SMTP_PORT || 465;
export const DB_PORT = process.env.DB_PORT || 5432;
export const BASE_SERVER_URL = process.env.BASE_SERVER_URL || 'http://localhost:3003';
// NODE_ENV has three posible values dev, test y prod
export const MAIN_PROJECT_TABLE = 'mhfd_projects';
// ${(process.env.NODE_ENV ? process.env.NODE_ENV : 'dev')}    // TODO this shoud be added to the end of Confluence suposably
export const ARCGIS_SERVICE = `https://gis.mhfd.org/server/rest/services/Confluence/MHFDProjects/FeatureServer/0`;
export const CREATE_PROJECT_TABLE = process.env.CREATE_PROJECT_TABLE + '_' + (process.env.NODE_ENV ? process.env.NODE_ENV : 'dev');
export const CREATE_PROJECT_TABLE_V2 = 'project'
export const PROBLEM_TABLE = 'problem_boundary';
export const COMPLETE_YEAR_COLUMN = 'completeyear';
export const COSPONSOR1 = 'cosponsor1';
export const COSPONSOR = 'cosponsor';
export const PROPSPROBLEMTABLES = {
  problems: [
    'solutioncost',  //0
    'solutionstatus',  //1
    'jurisdiction',   //2
    'mhfdmanager',   //3
    'problemdescription',   //4
    'problemid',    //5
    'problemname',    //6
    'problempriority',    //7
    'problemtype',    //8
    'servicearea',    //9
    'shape_area',    //10
    'shape_length',  //11
    'sourcedate',    //12
    'sourcename',    //13
    'source',       //14
    'streamname',   //15
    'component_cost',   //16
    'component_count'
  ], 
  problem_boundary: [
    'estimated_cost',  //0
    'component_status',  //1
    'local_government',  //2
    'mhfd_manager',  //3
    'problem_description',  //4
    'problem_id',  //5
    'problem_name',  //6
    'problem_severity',  //7
    'problem_type',  //8
    'service_area',  //9
    'shape_starea',  //10
    'shape_stlength',  //11
    'source_complete_year',  //12
    'source_name',  //13
    'source_type',  //14
    'stream_name',  //15
    'component_cost',  //16
    'component_count'   //17
  ]
};
export const PROBLEM_PART_TABLES = ['flood_hazard_polygon_', 'flood_hazard_line_', 'flood_hazard_point_',
'stream_function_polygon_', 'stream_function_point_', 'future_development_polygon_',
'stream_function_line_', 'future_development_line_'];
export const CARTO_DOMAIN = 'denver-mile-high-admin';
export const CARTO_URL = encodeURI(
  `https://${CARTO_DOMAIN}.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`
);
export const CARTO_URL_MAP = encodeURI(
  `https://${CARTO_DOMAIN}.carto.com/api/v1/map?api_key=${CARTO_TOKEN}`
);

export default {
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
  CREATE_PROJECT_TABLE_V2,
  SMTP_HOST,
  SMTP_PORT,
  DB_PORT,
  BASE_SERVER_URL,
  PROBLEM_TABLE,
  PROPSPROBLEMTABLES,
  MAIN_PROJECT_TABLE,
  CARTO_URL,
  CARTO_URL_MAP,
  COMPLETE_YEAR_COLUMN,
  COSPONSOR1,
  COSPONSOR,
  PROBLEM_PART_TABLES,
  ARCGIS_SERVICE
};
