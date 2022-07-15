const express = require('express');
const Multer = require('multer');
const bcrypt = require('bcryptjs');
const https = require('https');
const db = require('../config/db');
const UserService = require('../services/user.service');
const auth = require('../auth/auth');
const { validator } = require('../utils/utils');
const { EMAIL_VALIDATOR } = require('../lib/enumConstants');
const userService = require('../services/user.service');
const logger = require('../config/logger');
const { CARTO_URL, MAIN_PROJECT_TABLE } = require('../config/config');
const { PROJECT_TYPES_AND_NAME } = require('../lib/enumConstants');

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
        user['activated'] = true;
        user['status'] = 'pending';
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
      switch (key) {
        case 'firstName':
          user[key] = req.body[key];
          break;
        case 'lastName':
          user[key] = req.body[key];
          break;
        case 'city':
          user[key] = req.body[key];
          break;
        case 'phone':
          user[key] = req.body[key];
          break;
        case 'county':
          user[key] = req.body[key];
          break;
        case 'organization':
          user[key] = req.body[key];
          break;
        case 'title':
          user[key] = req.body[key];
          break;
        case 'county':
          user[key] = req.body[key];
          break;
        case 'serviceArea':
          user[key] = req.body[key];
          break;
        case 'zoomarea':
          user[key] = req.body[key];
          break;
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
  let organization_query = '';
  let user = req.user
  let result1 = {};
  let polygon = [];
  let coordinates = {
    longitude: -104.9063129121965,
    latitude: 39.768682416183
  };
  //console.log('USER ME', user);
  result1['_id'] = user._id;
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

  if (req.user.zoomarea) {
    organization_query = req.user.zoomarea;
  } else {
    organization_query = ORGANIZATION_DEFAULT;
  }
  try {
    const newProm = new Promise((resolve, reject) => {
      const sql = `SELECT ST_AsGeoJSON(ST_Envelope(the_geom)) FROM mhfd_zoom_to_areas WHERE aoi = '${organization_query}' `;
      const URL = `${CARTO_URL}&q=${sql}`;
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
            if (result.length > 0) {
              const all_coordinates = JSON.parse(result[0].st_asgeojson).coordinates;
              let latitude_array = [];
              let longitude_array = [];
              console.log('COORDENADAS', all_coordinates);
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

            } else {
              coordinates = {
                longitude: -104.9063129121965,
                latitude: 39.768682416183
              };
              //console.log('NO HAY DATOS');
              polygon = [
                [
                  -105.32366831,
                  39.40578787
                ],
                [
                  -105.32366831,
                  40.13157697
                ],
                [
                  -104.48895751,
                  40.13157697
                ],
                [
                  -104.48895751,
                  39.40578787
                ],
                [
                  -105.32366831,
                  39.40578787
                ]
              ];

            }

            resolve({
              polygon: polygon,
              coordinates: coordinates
            });

          });
        }
      }).on('error', err => {
        logger.error(`failed call to  with error  ${err}`)

      });
    });

    const respuesta = await newProm;

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
    console.log('my zoom area sql is ', sql);
    const URL = `${CARTO_URL}&q=${sql}`;
    const promise = await new Promise(resolve => {
      https.get(URL, response => {
        console.log('status ' + response.statusCode);
        if (response.statusCode === 200) {
          let str = '';
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', function () {
            result = JSON.parse(str).rows;
            const counter = {};
            for (const element of result) {
              counter[mapProjects[element.projecttype]] = +element.count;
            }
            resolve(counter);

          });
        }
      }).on('error', err => {
        //console.log('failed call to ', url, 'with error ', err);
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
  try {
    if (!req.files) {
      logger.error('You must send user photo');
      return res.status(400).send({ error: 'You must send user photo' });
    }
    let user = req.user;
    await userService.uploadPhoto(user, req.files);
    let result1 = {};
    let polygon = [];
    let coordinates = {
      longitude: -104.9063129121965,
      latitude: 39.768682416183
    };
    //console.log('USER ME', user);
    result1['_id'] = user._id;
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

    let organization_query = '';
    if (req.user.zoomarea) {
      organization_query = user.zoomarea;
    } else {
      organization_query = ORGANIZATION_DEFAULT;
    }

    const newProm = new Promise((resolve, reject) => {
      const sql = `SELECT ST_AsGeoJSON(ST_Envelope(the_geom)) FROM mhfd_zoom_to_areas WHERE aoi = '${organization_query}' `;
      const URL = `${CARTO_URL}&q=${sql}`;
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
            if (result.length > 0) {
              const all_coordinates = JSON.parse(result[0].st_asgeojson).coordinates;
              let latitude_array = [];
              let longitude_array = [];
              //console.log('COORDENADAS', all_coordinates);
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

            } else {
              coordinates = {
                longitude: -104.9063129121965,
                latitude: 39.768682416183
              };
              //console.log('NO HAY DATOS');
              polygon = [
                [
                  -105.32366831,
                  39.40578787
                ],
                [
                  -105.32366831,
                  40.13157697
                ],
                [
                  -104.48895751,
                  40.13157697
                ],
                [
                  -104.48895751,
                  39.40578787
                ],
                [
                  -105.32366831,
                  39.40578787
                ]
              ];

            }

            resolve({
              polygon: polygon,
              coordinates: coordinates
            });

          });
        }
      }).on('error', err => {
        logger.error(`failed call to  with error  ${err}`)

      });
    });

    const respuesta = await newProm;
    //console.log('COORDIANTES', respuesta);
    result1['coordinates'] = respuesta.coordinates;
    result1['polygon'] = respuesta.polygon;
    res.status(200).send(result1);
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
  await user.generateChangePassword();
  await userService.sendRecoverPasswordEmail(user);
  res.send(user);
});

router.post('/change-password', validator(['email', 'password', 'newpassword']), async (req, res) =>{
  try {
    const {email, password, newpassword} = req.body;
    const user = await User.findByCredentials(email, password);
    if (!user) {
      return res.status(401).send({
        error: 'Login failed! Check authentication credentials'
      });
    }
    const newPwd = await bcrypt.hash(newpassword, 8);
    user.password = newPwd;
    user.save();
    res.send(use);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post('/reset-password', validator(['id', 'password']), async (req, res) => {
  try {
    const chgId = req.body.id;
    const user = await User.findOne({
      where: {
        changePasswordId: chgId,
      },
    });
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
    const newPwd = await bcrypt.hash(req.body.password, 8);
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

module.exports = router;
