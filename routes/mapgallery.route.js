const express = require('express');
const router = express.Router();
const https = require('https');
const fs = require('fs');
const { google } = require('googleapis');

const { CARTO_TOKEN } = require('../config/config');
const attachmentService = require('../services/attachment.service');
/* const TOKEN_PATH = __dirname + '/token.json';
const CREDENTIALS_PATH = __dirname + '/credentials.json';
const FOLDER_CONFLUENCE_IMAGES = '1KxAtCizoff5g__SEj3ESs5unPZHD4n3W' */; // TODO id de la carpeta

router.get('/', async (req, res) => {
  try {
    console.log('enter here');
    if (req.query.isproblem) {
      const PROBLEM_SQL = `SELECT problemname, solutioncost, jurisdiction, problempriority, solutionstatus, problemtype FROM problems `;
      const URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${PROBLEM_SQL}&api_key=${CARTO_TOKEN}`);
      https.get(URL, response => {
        if (response.statusCode === 200) {
          let str = '';
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', function () {
            const result = JSON.parse(str).rows;
            return res.status(200).send(result);
          });
        } else {
          return res.status(response.statusCode).send({ error: 'Error with C connection' });
        }
      }).on('error', err => {
        logger.error(`failed call to ${url}  with error  ${err}`)
        return res.status(500).send({ error: err });
      });
    }
    else {
      const PROJECT_FIELDS = `objectid, coverimage, sponsor, finalCost, estimatedCost, status, attachments `;
      const LINE_SQL = `SELECT ${PROJECT_FIELDS} FROM projects_line_1`;
      const POLYGON_SQL = `SELECT ${PROJECT_FIELDS} FROM projects_polygon_`;
      const LINE_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${LINE_SQL}&api_key=${CARTO_TOKEN}`);
      const POLYGON_URL = encodeURI(`https://denver-mile-high-admin.carto.com/api/v2/sql?q=${POLYGON_SQL}&api_key=${CARTO_TOKEN}`);
      https.get(LINE_URL, response => {
        if (response.statusCode === 200) {
          let str = '';
          response.on('data', function (chunk) {
            str += chunk;
          });
          response.on('end', function () {
            let result = JSON.parse(str).rows;
            https.get(POLYGON_URL, response => {
              console.log(response.statusCode);
              if (response.statusCode === 200) {
                let str2 = '';
                response.on('data', function (chunk) {
                  str2 += chunk;
                });
                response.on('end', async function () {
                  result = result.concat(JSON.parse(str2).rows);
                  //console.log(result);
                  result = result.map(element => {
                    return {
                      ...element,
                      attachments: attachmentService.findByName(element.coverimage)
                    }
                  })
                  return res.status(200).send(result);
                });
              } else {
                return res.status(response.statusCode);
              }
            }).on('error', err => {
              logger.error(`failed call to ${url}  with error  ${err}`)
              return res.status(500).send({ error: err });
            });
          });
        } else {
          return res.status(response.statusCode).send({ error: 'Error with C connection' });
        }
      }).on('error', err => {
        logger.error(`failed call to ${url}  with error  ${err}`)
        return res.status(500).send({ error: err });
      });
      console.log(URL);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error }).send({ error: 'Error with C connection' });
  }

});

module.exports = (router);