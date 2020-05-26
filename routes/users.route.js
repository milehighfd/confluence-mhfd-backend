const express = require('express');
const router = express.Router();
const Multer = require('multer');
const bcrypt = require('bcryptjs');
const https = require('https');

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
const ORGANIZATION_DEFAULT = 'Mile High Flood Control District Boundary';

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

router.get('/', async (req, res, next) => {
  const users = await UserService.findAllUsers();
  res.send(users);
});

router.post('/signup', validator(userService.requiredFields('signup')), async (req, res) => {
  try {
    const user = req.body;
    const foundUser = await User.count({
      where: {
        email: user.email
      }
    });
    if (foundUser) {
      res.status(422).send({ error: 'The email has already been registered' });
    } else {

      if (EMAIL_VALIDATOR.test(user.email)) {
        user['activated'] = false;
        user.password = await bcrypt.hash(user.password, 8);
        user.name = user.firstName + ' ' + user.lastName;
        const user1 = await User.create(user);
        const token = await user1.generateAuthToken();
        userService.sendConfirmAccount(user);
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

router.put('/update', auth, async (req, res) => {
  try {
    let user = await User.findByPk(req.user._id, { raw: true });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (user.email !== req.body.email) {
      if (User.count({
        where: {
          email: user.email,
          _id: { $not: user._id }
        }
      })) {
        return res.status(422).send({ error: 'the email has already been registered' });
      }
      if (EMAIL_VALIDATOR.test(user.email)) {
        return res.status(400).send({ error: 'the email must be valid' });
      }
    }
    for (const key in req.body) {
      if (key !== '_id') {
        console.log(key, req.body[key]);
        user[key] = req.body[key];
      }
    }
    user.name = user.firstName + ' ' + user.lastName;
    user.password = req.user.password;
    await User.update(user, {
      where: {
        _id: req.user._id
      }
    });
    return res.status(200).send(user);
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

router.get('/me', auth, async (req, res) => {

  res.status(200).send(req.user);
});

router.post('/upload-photo', [auth, multer.array('file')], async (req, res) => {
  try {
    if (!req.files) {
      logger.error('You must send user photo');
      return res.status(400).send({ error: 'You must send user photo' });
    }
    let user = req.user;
    await userService.uploadPhoto(user, req.files);
    res.status(200).send(user);
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

router.post('/recovery-password', async (req, res) => {
  const email = req.body.email;
  if (!EMAIL_VALIDATOR.test(email)) {
    return res.status(400).send({ error: 'You entered an invalid email direction' });
  }
  const user = await User.findOne({
    where: {
      email: email
    }
  });
  if (!user) {
    return res.status(422).send({ error: 'Email not found!' });
  }
  //console.log("ID: " + user._id);
  await user.generateChangePassword();
  await userService.sendRecoverPasswordEmail(user);
  res.send(user);
});

router.get('/get-position', auth, async (req, res) => {
  let organization_query = '';
  if (req.user.designation === ROLES.MFHD_ADMIN ||
    req.user.designation === ROLES.OTHER) {
    organization_query = ORGANIZATION_DEFAULT;
  } else {
    organization_query = req.user.organization;
  }
  //console.log('organ', organization_query);
  try {
    //console.log(CARTO_TOKEN);
    const sql = `SELECT ST_AsGeoJSON(the_geom) FROM organizations WHERE name = '${organization_query}' `;
    const URL = `https://denver-mile-high-admin.carto.com/api/v2/sql?q=${sql}&api_key=a53AsTjS8iBMU83uEaj3dw`;
    let result = [];
    //console.log('URL', URL);
    https.get(URL, response => {
      console.log('status ' + response.statusCode);
      if (response.statusCode === 200) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', function () {
          result = JSON.parse(str).rows;
          const all_coordinates = JSON.parse(result[0].st_asgeojson).coordinates;
          
          let latitude_array = [];
          let longitude_array = [];
          for(const key in all_coordinates[0][0]) {
            const coordinates = JSON.stringify(all_coordinates[0][0][key]).replace("[","").replace("]", "").split(',');
            longitude_array.push(parseFloat(coordinates[0]));
            latitude_array.push(parseFloat(coordinates[1]));
          } 
          let latitude_min = Math.min.apply(Math, latitude_array);
          let latitude_max = Math.max.apply(Math, latitude_array);
          let longitude_min = Math.min.apply(Math, longitude_array);
          let longitude_max = Math.max.apply(Math, longitude_array);
          /* console.log('latitude', latitude_max, latitude_min);
          console.log('longitude', longitude_max, longitude_min) */
          const final_coordinates = {
            longitude: (longitude_max + longitude_min) / 2,
            latitude: (latitude_max + latitude_min) / 2
          };
          //console.log('final', final_coordinates);
          return res.status(200).send(final_coordinates);
        });
      }
    }).on('error', err => {
      console.log('failed call to ', url, 'with error ', err);
      logger.error(`failed call to ${url}  with error  ${err}`)
      res.status(500).send({ error: err });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error });
  }
});

router.post('/reset-password', validator(['id', 'password']), async (req, res) => {
  try {
    const user = await userService.changePassword(req.body.id, req.body.password);
    res.send(user);
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

module.exports = router;
