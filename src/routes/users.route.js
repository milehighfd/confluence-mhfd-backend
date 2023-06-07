import express from 'express';
import sequelize from 'sequelize';
import Multer from 'multer';
import bcrypt from 'bcryptjs';
import { parse } from 'wkt';
import https from 'https';
import UserService from 'bc/services/user.service.js';
import auth from 'bc/auth/auth.js';
import { validator } from 'bc/utils/utils.js';
import { EMAIL_VALIDATOR, PROJECT_TYPES_AND_NAME } from 'bc/lib/enumConstants.js';
import logger from 'bc/config/logger.js';
import db from 'bc/config/db.js';
import { CARTO_URL, MAIN_PROJECT_TABLE } from 'bc/config/config.js';

const Op = sequelize.Op;

const router = express.Router();
const User = db.user;
const ORGANIZATION_DEFAULT = 'Mile High Flood District';
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

router.get('/', async (req, res, next) => {
  logger.info(`Starting endpoint users.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  logger.info(`Starting function findAllUsers for users.route/`);
  const users = await UserService.findAllUsers();
  logger.info(`Finished function findAllUsers for users.route/`);
  res.send(users);
});

router.get('/get-signup-email', async (req, res) => {
  const { token } = req.query;
  try {
    logger.info(`Starting endpoint users.route/get-signup-email with params ${JSON.stringify(req.params, null, 2)}`);
    const user = await User.findOne({
      where: {
        changePasswordId: token,
        status: 'pending-signup',
      }
    });
    if (!user) {
      return res.status(422).send({ error: 'The token is invalid' });
    }
    const maximumDate = user.changePasswordExpiration.getTime();
    const currentDate = new Date().getTime();
    if (currentDate > maximumDate) {
      return res.status(422).send({ error: 'The token has expired' });
    }
    res.send({ email: user.email });
  } catch (error) {
    logger.error(`Error in endpoint users.route/get-signup-email with params ${JSON.stringify(req.params, null, 2)} ERROR: ${error}`);
    res.status(500).send({ error: error });
  }
});

router.post('/signup', validator(UserService.requiredFields('signup')), async (req, res) => {
  logger.info(`Starting endpoint users.route/signup with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    const { user, tokenId } = req.body;
    const processed = await User.findOne({
      where: {
        changePasswordId: tokenId,
        status: 'pending-signup',
      }
    });
    if (!processed) {
      return res.status(422).send({ error: 'The token is invalid' });
    }
    const maximumDate = processed.changePasswordExpiration.getTime();
    const currentDate = new Date().getTime();
    if (currentDate > maximumDate) {
      return res.status(422).send({ error: 'The token has expired' });
    }
    if (user.email !== processed.email) {
      return res.status(422).send({ error: 'The email does not match' });
    }
    // delete fake user
    await User.destroy({
      where: {
        id: processed.id,
        email: processed.email,
      }});
    logger.info(`Starting function count for users.route/signup`);
    const foundUser = await User.count({
      where: {
        email: user.email
      }
    });
    logger.info(`Finished function count for users.route/signup`);
    if (foundUser) {
      res.status(422).send({ error: 'The email has already been registered' });
    } else {

      if (EMAIL_VALIDATOR.test(user.email)) {
        user['activated'] = true;
        user['status'] = 'pending';
        user.is_sso = false;
        logger.info(`Starting function hash for users.route/signup`);
        user.password = await bcrypt.hash(user.password, 8);
        logger.info(`Finished function hash for users.route/signup`);
        user.name = user.firstName + ' ' + user.lastName;
        logger.info(`Starting function create for users.route/signup`);
        const user1 = await User.create(user);
        logger.info(`Finished function create for users.route/signup`);
        logger.info(`Starting function generateAuthToken for users.route/signup`);
        const token = await user1.generateAuthToken();
        logger.info(`Finished function generateAuthToken for users.route/signup`);
        UserService.sendConfirmAccount(user);
        res.status(201).send({
          user,
          token
        });
      } else {
        return res.status(400).send({ error: 'You entered an invalid email direction' });
      }
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error });
  }
});

router.put('/me', auth, async (req, res) => {
  logger.info(`Starting endpoint users.route/me with params ${JSON.stringify(req.params, null, 2)}`);
  try { 
    logger.info(`Starting function findByPk for users.route/me`);   
    let user = await User.findByPk(req.user.user_id, { raw: true });
    logger.info(`Finished function findByPk for users.route/me`);   
   
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    logger.info(`Starting function count for users.route/me`);   
    let checkEmail = await User.count({
      where: {
        email: req.body.email,
        user_id:{
          [Op.not]:user.user_id
         }
      }
    })
    logger.info(`Finished function count for users.route/me`);   
    if (user.email !== req.body.email) {
      if (checkEmail) 
      {
        console.log(user.user_id)
        return res.status(422).send({ error: 'the email has already been registered' });
      }
      if (!EMAIL_VALIDATOR.test(user.email)) {
        return res.status(400).send({ error: 'the email must be valid' });
      }
    }    
    
    for (const key in req.body) {
      user[key]=req.body[key];      
    }
    user.name = user.firstName + ' ' + user.lastName;
    user.password = req.user.password;
    delete user.user_id;
    
    logger.info(`Starting function update for users.route/me`);   
    await User.update(user, {
      where: {
        user_id: req.user.user_id
      }
    });
    logger.info(`Finished function update for users.route/me`);   
    return res.status(200).send(user);
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

router.get('/me', auth, async (req, res) => {
  logger.info(`Starting endpoint users.route/me with params ${JSON.stringify(req.params, null, 2)}`);
  let organization_query = '';
  let user = req.user
  let result1 = {};
  let polygon = [];
  let coordinates = {
    longitude: -104.9063129121965,
    latitude: 39.768682416183
  };
  //console.log('USER ME', user);
  result1['user_id'] = user.user_id;
  result1['firstName'] = user.firstName;
  result1['lastName'] = user.lastName;
  result1['name'] = user.name;
  result1['email'] = user.email;
  result1['organization'] = user.organization;
  result1['city'] = user.city;
  result1['county'] = user.county;
  result1['serviceArea'] = user.serviceArea;
  result1['phone'] = user.phone;
  result1['zipCode'] = user.zipCode;
  result1['title'] = user.title;
  result1['activated'] = user.activated;
  result1['designation'] = user.designation;
  result1['photo'] = user.photo;
  result1['zoomarea'] = user.zoomarea ? user.zoomarea : '';
  result1['status'] = user.status;
  result1['business_associate_contact'] = user.business_associate_contact;
  
  const LOCALGOV = 'local_government';
  const COUNTY = 'county';
  const SERVICEAREA = 'service_area';
  let type = LOCALGOV;
  
  try {
    if (req.user.zoomarea) {
      if (req.user.zoomarea.includes('County')) {
        type = COUNTY;
        organization_query = req.user.zoomarea.replace(' County', '');
      } else if (req.user.zoomarea.includes('Service Area')) {
        type = SERVICEAREA;
        organization_query = req.user.zoomarea.replace(' Service Area', '');
      } else if (req.user.zoomarea == "Mile High Flood District") {
        type = 'MHFD';
        organization_query = req.user.zoomarea;
      } else {
        organization_query = req.user.zoomarea;
      }
    } else {
      organization_query = ORGANIZATION_DEFAULT;
    }
    let geom = `Shape.STEnvelope().STAsText() as bbox, `;
    let query = '';
    switch (type) {
      case SERVICEAREA:
        query = `SELECT ${geom}
        code_service_area_id,
        service_area_name FROM CODE_SERVICE_AREA_4326
        WHERE service_area_name = '${organization_query}'
        `;
        break;
      case COUNTY: 
        query = `SELECT  ${geom}
        state_county_id,
        county_name FROM CODE_STATE_COUNTY_CLIP_4326
        WHERE county_name = '${organization_query}'
        `;
        break
      case LOCALGOV:
        query = `SELECT  ${geom}
        code_local_government_id,
        local_government_name FROM CODE_LOCAL_GOVERNMENT_4326
        WHERE local_government_name = '${organization_query}'
        `;
        break;
      default:
        query = `SELECT  ${geom}
        OBJECTID,
        'Mile High Flood District' as name FROM MHFD_BOUNDARY_4326`
        break;
    }
 
    const proms = [
      db.sequelize.query(query),
    ];
    logger.info(`Starting function all for users.route/me`);   
    const solved = await Promise.all(proms);
    logger.info(`Finished function all for users.route/me`); 
    const [geomData] = solved[0];
    const all_coordinates = geomData.map(result => {
      return parse(result.bbox)?.coordinates;
    })[0];
    let latitude_array = [];
    let longitude_array = [];
    for (const key in all_coordinates[0]) {
      const row = JSON.stringify(all_coordinates[0][key]).replace("[", "").replace("]", "").split(',')
      let coordinate_num = [];
      coordinate_num.push(parseFloat(row[0]));
      coordinate_num.push(parseFloat(row[1]));
      longitude_array.push(parseFloat(row[0]));
      latitude_array.push(parseFloat(row[1]));
      polygon.push(coordinate_num);
    }
    const latitude_min = Math.min.apply(Math, latitude_array);
    const latitude_max = Math.max.apply(Math, latitude_array);
    const longitude_min = Math.min.apply(Math, longitude_array);
    const longitude_max = Math.max.apply(Math, longitude_array);
    coordinates = {
      longitude: (longitude_max + longitude_min) / 2,
      latitude: (latitude_max + latitude_min) / 2
    };
    console.log('coordinates', coordinates, 'polygon', polygon);
  } catch (error) {
    logger.error(error);
  }
  const mapProjects = {};
  const counters = {};
  console.log(PROJECT_TYPES_AND_NAME);
  for (const element of PROJECT_TYPES_AND_NAME) {
    mapProjects[element.name] = element.id;
    counters[element.id] = 0;
  }
  result1['coordinates'] = coordinates;
  result1['polygon'] = polygon;
  for (const table of [MAIN_PROJECT_TABLE]) {
    let condition = '';
    if (user.zoomarea) {
      condition = `WHERE jurisdiction='${user.zoomarea}'`;
    }
    const sql = `SELECT COUNT( projecttype), projecttype  FROM ${table}  ${condition} group by projecttype`;
    console.log('my zoom area sql is now update', sql);
    const URL = `${CARTO_URL}&q=${sql}`;
    logger.info(`Starting function Promise for users.route/me`);
    const promise = await new Promise(resolve => {
      https.get(URL, response => {
        console.log('status ' + response.statusCode);
    logger.info(`Finished function Promise for users.route/me`);
        if (response.statusCode === 200) {
          let str = '';
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', function () {

            const result = JSON.parse(str).rows;
            const counter = {};
            for (const element of result) {
              counter[mapProjects[element.projecttype]] = +element.count;
            }
            resolve(counter);

          });
        }
      }).on('error', err => {
        logger.error(`failed call to  with error  ${err}`)
        resolve({});
      });

    });
    for (const key in promise) {
      counters[key] += promise[key];
    }
  }
  result1['counters'] = counters;
  res.status(200).send(result1);
});

router.post('/upload-photo', [auth, multer.array('file')], async (req, res) => {
  logger.info(`Starting endpoint users.route/upload-photo with params ${JSON.stringify(req.params, null, 2)}`);
  console.log(req.files)  
  try {
    if (!req.files) {
      logger.error('You must send user photo');
      return res.status(400).send({ error: 'You must send user photo' });
    }
    let user = req.user;
    logger.info(`Starting function uploadPhoto for users.route/upload-photo`);
    await UserService.uploadPhoto(user, req.files);
    logger.info(`Finished function uploadPhoto for users.route/upload-photo`);
    res.status(200).send({message:'Success'});
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

router.post('/generate-signup-url', async (req, res) => {
  logger.info(`Beginning endpoint users.route/generate-signup-url with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    const { email } = req.body;
    if (!EMAIL_VALIDATOR.test(email)) {
      return res.status(400).send({ error: 'You entered an invalid email direction' });
    }
    logger.info(`Beginning function findOne for users.route/generate-signup-url`);
    const countUser = await User.count({
      where: {
        email: email,
        status: {
          [Op.notIn]: ['pending-signup']
        }
      }
    });
    logger.info(`Finished function findOne for users.route/generate-signup-url`);
    if (countUser) {
      return res.status(422).send({ error: 'Email already exists!' });
    }
    logger.info(`Beginning function generateSignupUrl for users.route/generate-signup-url`);
    let newUser = await User.findOne({
      where: {
        email: email,
    }});
    let user = null;
    if (!newUser) {
      newUser = {
        email: email,
        status: 'pending-signup',
        is_sso: 0,
      };
      logger.info(`Beginning function create fake user`);
      user = await User.create(newUser);
      logger.info(`Finished function create fake user`);
    } else {
      user = newUser;
    }
    logger.info(`Beginning function generateSignupToken for users.route/generate-signup-url`);
    await user.generateSignupToken();
    logger.info(`Finished function generateSignupToken for users.route/generate-signup-url`);
    logger.info(`Beginning function sendEmail for users.route/generate-signup-url`);
    await UserService.sendSignupEmail(user, 'signup');
    logger.info(`Finished function sendEmail for users.route/generate-signup-url`);
    res.send(user);
  } catch(error) {
    logger.info(`Error in endpoint users.route/generate-signup-url ${JSON.stringify(error, null, 2)}`);
    res.status(500).send(error);
  }
});


router.post('/generate-reset-confirm', async (req, res) => {
  logger.info(`Beginning endpoint users.route/generate-signup-url with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    const { email } = req.body;
    if (!EMAIL_VALIDATOR.test(email)) {
      return res.status(400).send({ error: 'You entered an invalid email direction' });
    }
    logger.info(`Beginning function findOne for users.route/generate-signup-url`);
    let user = await User.findOne({
      where: {
        email: email,
    }});
    logger.info(`Finished function findOne for users.route/generate-signup-url`);
    if (!user) {
      return res.status(422).send({ error: 'Email not exists!' });
    }
    logger.info(`Beginning function generateChangePassword for users.route/generate-signup-url`);
    await user.generateChangePassword();
    logger.info(`Finished function generateChangePassword for users.route/generate-signup-url`);
    logger.info(`Beginning function sendEmail for users.route/generate-signup-url`);
    await UserService.sendRecoverAndConfirm(user);
    logger.info(`Finished function sendEmail for users.route/generate-signup-url`);
    res.send(user);
  } catch(error) {
    logger.info(`Error in endpoint users.route/generate-signup-url ${JSON.stringify(error, null, 2)}`);
    res.status(500).send(error);
  }
});

router.post('/recovery-password', async (req, res) => {
  logger.info(`Starting endpoint users.route/recovery-password with params ${JSON.stringify(req.params, null, 2)}`);
  const email = req.body.email;
  if (!EMAIL_VALIDATOR.test(email)) {
    return res.status(400).send({ error: 'You entered an invalid email direction' });
  }
  logger.info(`Starting function findOne for users.route/recovery-password`);
  const user = await User.findOne({
    where: {
      email: email
    }
  });
  logger.info(`Finished function findOne for users.route/recovery-password`);
  if (!user) {
    return res.status(422).send({ error: 'Email not found!' });
  }
  logger.info(`Starting function generateChangePassword for users.route/recovery-password`);
  await user.generateChangePassword();
  logger.info(`Finished function generateChangePassword for users.route/recovery-password`);
  logger.info(`Starting function sendRecoverPasswordEmail for users.route/recovery-password`);
  await UserService.sendRecoverPasswordEmail(user);
  logger.info(`Finished function sendRecoverPasswordEmail for users.route/recovery-password`);
  res.send(user);
});

router.post('/change-password', validator(['email', 'password', 'newpassword']), async (req, res) =>{
  logger.info(`Starting endpoint users.route/change-password with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    const { confirmation } = req.query;
    const {email, password, newpassword} = req.body;
    logger.info(`Starting function findByCredentials for users.route/change-password`);
    const user = await User.findByCredentials(email, password);
    logger.info(`Finished function findByCredentials for users.route/change-password`);
    if (!user) {
      return res.status(401).send({
        error: 'Login failed! Check authentication credentials'
      });
    }
    logger.info(`Starting function hash for users.route/change-password`);
    const newPwd = await bcrypt.hash(newpassword, 8);
    logger.info(`Finished function hash for users.route/change-password`);
    user.password = newPwd;
    if (confirmation) {
      user.status = 'approved';
    }
    user.save();
    res.send(use);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post('/reset-password', validator(['id', 'password']), async (req, res) => {
  logger.info(`Starting endpoint users.route/reset-password with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    const chgId = req.body.id;
    logger.info(`Starting function findOne for users.route/reset-password`);
    const user = await User.findOne({
      where: {
        changePasswordId: chgId,
      },
    });
    logger.info(`Finished function findOne for users.route/reset-password`);
    if (!user) {
      logger.error('Invalid recovery password id: ' + changePasswordId);
      throw new Error({
        error: 'Invalid recovery password id'
      });
    }
    const now = new Date();
    console.log(user.changePasswordExpiration);
    console.log(typeof user.changePasswordExpiration);
    if (now.getTime() > user.changePasswordExpiration.getTime()) {
      logger.error('Recovery password id expired: ' + changePasswordId + ', ' + user.changePasswordExpiration);
      throw new Error({
        error: 'Recovery password id expired'
      });
    }
    logger.info(`Starting function hash for users.route/reset-password`);
    const newPwd = await bcrypt.hash(req.body.password, 8);
    logger.info(`Finished function hash for users.route/reset-password`);
    const { confirmation } = req.query;
    if (confirmation) {
      user.status = 'approved';
    }
    user.password = newPwd;
    user.changePasswordId = '';
    user.changePasswordExpiration = null;
    user.save();
    res.send(user);
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

export default router;
