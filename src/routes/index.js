import express from 'express';
import https from 'https';

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({ title: 'Express', env: process.env });
});

router.get('/env', (_, res) => {
  console.log('my env ', process.env.NODE_ENV);
  res.send({ env: process.env, version: 'Aug 233' });
})
const server_style = function(req, res, next) {
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