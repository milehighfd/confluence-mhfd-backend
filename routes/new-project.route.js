const express = require('express');
const router = express.Router();
const Multer = require('multer');
const bcrypt = require('bcryptjs');
const https = require('https');
const needle = require('needle');
const { CARTO_TOKEN } = require('../config/config');

//const User = require('../models/user.model');
const db = require('../config/db');
const User = db.user;
const UserService = require('../services/user.service');
const auth = require('../auth/auth');
const { validator } = require('../utils/utils');
const { EMAIL_VALIDATOR, ROLES } = require('../lib/enumConstants');
const userService = require('../services/user.service');
const UPDATEABLE_FIELDS = userService.requiredFields('edit');
const logger = require('../config/logger');
const ORGANIZATION_DEFAULT = 'Mile High Flood District'; // 'Mile High Flood Control District';
const { count } = require('console');
const { PROJECT_TYPES_AND_NAME } = require('../lib/enumConstants');
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});



router.post('/capital', auth, async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, geom, 
    overheadcost, overheadcostdescription, additionalcost, additionalcostdescription} = req.body;
  const sponsor = user.sponsor;
  const status = 'Draft';
  const projecttype = 'Capital';
  const insertQuery = `INSERT INTO projects_line_1_copy (the_geom, projectname, description, servicearea, county, status, projecttype, sponsor, overheadcost, overheadcostdescription, additionalcost, additionalcostdescription)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${sponsor}', '${overheadcost}',
   '${overheadcostdescription}', '${additionalcost}', '${additionalcostdescription}')`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query);
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
    } else {
       logger.error('bad status ', data.statusCode, data.body);
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});

router.post('/maintenance', auth, async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, geom, projectsubtype, frequency, maintenanceeligibility, ownership} = req.body;
  const sponsor = user.sponsor;
  const status = 'Draft';
  const projecttype = 'Maintenance';
  const projectsubtype = 'Master Plan';
  const insertQuery = `INSERT INTO projects_line_1_copy (the_geom, projectname, description, servicearea, county, status, projecttype, projectsubtype, frequency, sponsor, maintenanceeligibility, ownership)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${projectsubtype}', '${frequency}', '${sponsor}', '${maintenanceeligibility}', '${ownership})`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query);
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
    } else {
       logger.error('bad status ', data.statusCode, data.body);
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});
router.post('/study', auth, async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, geom, cosponsor} = req.body;
  const sponsor = req.body.sponsor || user.sponsor;
  const status = 'Draft';
  const projecttype = 'Study';
  const projectsubtype = 'Master Plan';
  const insertQuery = `INSERT INTO projects_line_1_copy (the_geom, projectname, description, servicearea, county, status, projecttype, projectsubtype, cosponsor, sponsor)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${projectsubtype}', ${cosponsor}, '${sponsor}')`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query);
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
    } else {
       logger.error('bad status ', data.statusCode, data.body);
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});
router.post('/acquisition', auth, async (req, res) => {
  const user = req.user;
  const sponsor = user.sponsor;
  const {projectname, description, servicearea, county, geom, acquisitionprogress, acquisitionanticipateddate} = req.body;
  const status = 'Draft';
  const projecttype = 'Acquisition';
  const insertQuery = `INSERT INTO projects_line_1_copy (the_geom, projectname, description, servicearea, county, status, projecttype, acquisitionprogress, acquisitionanticipateddate, sponsor)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}', '${acquisitionprogress}', ${acquisitionanticipateddate}, '${sponsor}')`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query);
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
    } else {
      logger.error('bad status ', data.statusCode, data.body);
    }
  } catch (error) {
    logger.error(error);
  };
  res.send(result);
});
router.post('/special', auth, async (req, res) => {
  const user = req.user;
  const {projectname, description, servicearea, county, geom} = req.body;
  const status = 'Draft';
  const projecttype = 'Special';
  const insertQuery = `INSERT INTO projects_line_1_copy (the_geom, projectname, description, servicearea, county, status,projecttype)
   VALUES(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), '${projectname}', '${description}', '${servicearea}', '${county}', '${status}', '${projecttype}')`;
  const query = {
    q: insertQuery
  };
  console.log('my query ' , query);
  const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?api_key=${CARTO_TOKEN}`);
  let result = {};
  try {
    const data = await needle('post', URL, query, { json: true });
    //console.log('STATUS', data.statusCode);
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(result);
    } else {
      logger.error('bad status ', data.statusCode, data.body);
    }
 } catch (error) {
    logger.error(error);
 };
  res.send(result);
});
module.exports = router;