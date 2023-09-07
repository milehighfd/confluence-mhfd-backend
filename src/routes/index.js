import express from 'express';
import https from 'https';
// read sync file and get the first line
import logger from 'bc/config/logger.js';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  logger.info(`Starting endpoint index/ with params ${JSON.stringify(req.params, null, 2)}`);
  res.send({ title: 'Express', env: process.env });
});

router.get('/echo', (_, res) => {
  const filePath = join(__dirname, '../../scripts/DATEFILE');
  const date = fs.readFileSync(filePath, 'utf8').split('\n')[0];
  res.send({ echo: 'success', version: date });
});

const server_style = function(req, res, next) {
  logger.info(`Starting endpoint index/style/:styleId/:styleUser/:accessToken with params ${JSON.stringify(req.params, null, 2)}`);
  var accessToken = req.params.accessToken;
  var styleUser = req.params.styleUser;
  var styleId = req.params.styleId;
  var originUrl = req.header('referer');
  if (originUrl) {
    originUrl = originUrl.split('/').slice(0,3).join('/');
  }
  var url = 'https://api.mapbox.com/styles/v1/' + styleUser + '/' + styleId + '?access_token=' + accessToken;
  var callback = function(response) {
    var str = '';
    if (response.statusCode == 200) {
      response.on('data', function (chunk) {
        str += chunk;
      });
      response.on('end', function () {
        var data = JSON.parse(str);
        data.sprite = originUrl + '/sprite/mhfd';
        res.send(data);
      });
    } else {
      console.log('Error ', response.statusCode);
      res.send(url);
    }
  };
  https.get(url, callback).on('error', err => {
    console.log('error ', err);
    res.send(url);
  });
}

router.get('/style/:styleId/:styleUser/:accessToken', server_style);

export default router;
