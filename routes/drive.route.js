const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const express = require('express');
const router = express.Router();

const auth = require('../auth/auth');
const logger = require('../config/logger');

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const TOKEN_PATH = __dirname + '/token.json';
const CREDENTIALS_PATH = __dirname + '/credentials.json';

router.get('/get-images-drive', async (req, res) => {
  try {
    let files = [''];
    
    fs.readFile(CREDENTIALS_PATH, async (err, content) => {
      if (err) {
        logger.error('Error loading client secret file: ' + err);
      }
      files = await authorize(JSON.parse(content), listFiles);

      res.status(200).send(files);
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

async function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]
  );
  let filesfinal = [];
  try {
    const newProm = new Promise((resolve, reject) => {
      fs.readFile(TOKEN_PATH, async (err, token) => {
        if (err) {
          return getAccessToken(oAuth2Client, callback);
        }
        oAuth2Client.setCredentials(JSON.parse(token));
        const files = await listFiles(oAuth2Client);
        resolve(files);
      });
    });
    filesfinal = await newProm;
  } catch (error) {
    logger.error(error);
  }
  
  return filesfinal;
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  console.log('Authorize this app by visiting this url:', authUrl);
  const readlineCode = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readlineCode.question('Enter the code from that page here: ', (code) => {
    readlineCode.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        return console.error('Error retrieving access token', err);
      }
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) {
          console.error(err);
        }
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

async function listFiles(auth) {
  const drive = google.drive({ version: 'v3', auth });
  let files = [];
  try {
    const newProm = new Promise((resolve, reject) => {
      drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
      }, (err, res) => {
        if (err) {
          return console.log('The API returned an error: ' + err);
        }
        resolve(res.data.files);
      });
    })
    const respuesta = await newProm;
    
    respuesta.map((resp) => {
      if (isImage(resp.name) ) {
        files.push({
          image: 'https://drive.google.com/uc?id=' + resp.id,
          name: resp.name
        });
      }
    });
  } catch(error) {
    logger.error(error);
  }
  
  return files;
}

function isImage(name) {
  if (name.search('.jpg') > 0 || name.search('.JPG') > 0 ||
      name.search('.jepg') > 0 || name.search('.JEPG') > 0 ||
      name.search('.png') > 0 || name.search('.PNG') > 0
  ) {
    return true;
  } else {
    return false;
  }
}

module.exports = router;