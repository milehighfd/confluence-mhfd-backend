const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const express = require('express');
const router = express.Router();
//const { au } = require('@google-cloud/local-auth')

const auth = require('../auth/auth');
const logger = require('../config/logger');

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const TOKEN_PATH = __dirname + '/token.json';
const CREDENTIALS_PATH = __dirname + '/credentials.json';

router.get('/get-images', async (req, res) => {
  try {
    fs.readFile(CREDENTIALS_PATH, (err, content) => {
      if (err) {
        logger.error('Error loading client secret file: ' + err);
      }
      //console.log('CONTENT', content);
      authorize(JSON.parse(content),listFiles);
      //console.log('FILES',listFiles);
    });
    res.send({message: 'Messages'});
  } catch(error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

function getFiles(credentials) {

}

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]
  );

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      return getAccessToken(oAuth2Client, callback);
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    const data = callback(oAuth2Client);
    console.log(data);
  })
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

function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  let files = [];
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) {
      return console.log('The API returned an error: ' + err);
    }
    const files = res.data.files;
    if(files.length) {
      console.log('Files:');
      files.map((file) => {
        files.push({
          name: file.name,
          id: file.id
        });
        logger.info(`${file.name} (${file.id})`);
      });
    } else {
      logger.info('No files found.');
    }
  });
  return files;
}

module.exports = router;