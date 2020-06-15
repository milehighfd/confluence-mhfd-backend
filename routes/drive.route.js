const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../auth/auth');
const logger = require('../config/logger');

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const TOKEN_PATH = __dirname + '/token.json';
const CREDENTIALS_PATH = __dirname + '/credentials.json';
const https = require('https');
const request = require('request');
var schedule = require('node-schedule');
const { MHFD_BACKEND } = require('../config/config');

const FOLDER_CONFLUENCE_IMAGES = '1KxAtCizoff5g__SEj3ESs5unPZHD4n3W';
const IMAGES_FROM_GOOGLE_DRIVE = './public/images/';
const IMAGES_URL = '/images/';


router.get('/get-images-drive', async (req, res) => {
  try {
    let imagesFinal = [];

    const newProm = new Promise((resolve, reject) => {
      let images = [];
      fs.readdir(IMAGES_FROM_GOOGLE_DRIVE, async (err, files) => {
        if (err) throw err;
  
        for (const file of files) {
          await images.push(MHFD_BACKEND + path.join(IMAGES_URL, file));
        }
        resolve(images);
      });
    });
    
    imagesFinal = await newProm;
    res.status(200).send(imagesFinal);
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

var j = schedule.scheduleJob('5 * * * * *', function(){
  
  try {
    if (!fs.existsSync(IMAGES_FROM_GOOGLE_DRIVE)) {
      fs.mkdirSync(IMAGES_FROM_GOOGLE_DRIVE);
    }
    logger.info('Cleaning folfer '+ IMAGES_FROM_GOOGLE_DRIVE);
    fs.readdir(IMAGES_FROM_GOOGLE_DRIVE, (err, files) => {
      if (err) throw err;
      //console.log(files);
      for (const file of files) {
        fs.unlink(path.join(IMAGES_FROM_GOOGLE_DRIVE, file), err => {
          if (err) throw err;
        })
      }
    });

    logger.info('Downloading images from Google Drive');
    let files = [''];
    
    fs.readFile(CREDENTIALS_PATH, async (err, content) => {
      if (err) {
        logger.error('Error loading client secret file: ' + err);
      }
      files = await authorize(JSON.parse(content), listFiles);

      
    });
  } catch (error) {
    logger.error(error);
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
  let files2 = [];
  try {
    
    const newProm = new Promise((resolve, reject) => {
      drive.files.list({
        q: "mimeType contains 'image'",
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
      }, (err, res) => {
        if (err) {
          return console.log('The API returned an error: ' + err);
        }
        const files1 = res.data.files;
        if (files1.length) {
          
          files1.map((file) => {
            files2.push(file.id);
          });
        } else {
          console.log('No files found.');
        }
        resolve(res.data.files);
      });
    })
    const respuesta = await newProm;

    const newProm1 = new Promise((resolve, reject) => {
      drive.files.list({
        q: `'${FOLDER_CONFLUENCE_IMAGES}' in parents`,
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
      }, (err, res) => {
        if (err) {
          return console.log('The API returned an error: ' + err);
        }
        resolve(res.data.files);
      });
    });

    const respuesta2 = await newProm1;
    respuesta2.map((resp) => {
      if(files2.includes(resp.id)) {
        if (isImage(resp.name) ) {
          const localPath = IMAGES_FROM_GOOGLE_DRIVE + resp.name;
          download('https://drive.google.com/uc?id=' + resp.id, localPath, () => {
            console.log('done');
          });
          files.push({
            image: 'https://drive.google.com/uc?id=' + resp.id,
            name: resp.name
          });
        }
      }
    });
  } catch(error) {
    logger.error(error);
  }
  
  return files;
}

const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', callback)
  })
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