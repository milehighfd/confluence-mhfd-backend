import express from  'express';
import cookieParser from  'cookie-parser';
import morgan from  'morgan';
import http from  'http';
import cors from  'cors';
import needle from 'needle';
import cron from 'node-cron';
import logger from 'bc/config/logger.js';
import indexRouter from 'bc/routes/index.js';
import usersRouter from 'bc/routes/users.route.js';
import authRouter from 'bc/routes/auth.route.js';
import adminRouter from 'bc/routes/admin.route.js';
import logActivityRouter from 'bc/routes/logActivity.route.js';
import mapRouter from 'bc/routes/map.route.js';
import problemRouter from 'bc/routes/problem.route.js';
import driveRouter from 'bc/routes/drive.route.js';
import attachmentRouter from 'bc/routes/attachment.route.js';
import galleryRouter from 'bc/routes/mapgallery.route.js';
import filterRouter from 'bc/routes/filters.route.js';
import zoomareaRouter from 'bc/routes/zoomarea.route.js';
import favoriteRouter from 'bc/routes/favorite.route.js';
import newProjectRouter from 'bc/routes/new-project/index.js';
import boardRouter from 'bc/routes/board.route.js';
import localityRouter from 'bc/routes/locality.route.js';
import noteRouter from 'bc/routes/note.route.js';
import newnoteRouter from 'bc/routes/newnotes.route.js';
import consultantsRouter from 'bc/routes/consultants.route.js';
import organizationRouter from 'bc/routes/organization.route.js';
import configurationRouter from 'bc/routes/configuration.route.js';
import projectRouter from 'bc/routes/project.route.js';
import v2Localities from 'bc/routes/v2locality.route.js';
import pmToolsRouter from 'bc/routes/pmtools.route.js';
import cardFilterRouter from 'bc/routes/cardfilters.route.js';
import seed from 'bc/config/seed.js'
import projectServiceArea from 'bc/routes/projectservicearea.route.js';
import streamsRouter from 'bc/routes/streams.route.js';
import phasetypeRouter from 'bc/routes/phasetype.route.js';
import projectactionitemRouter from 'bc/routes/projectactionitem.route.js'
import projectStatusRouter from 'bc/routes/projectStatus.route.js';
import businessRouter from 'bc/routes/business.route.js';
import notificationRouter from 'bc/routes/notifications.route.js';
import { createNotifications } from 'bc/utils/functionsNotifications.js';

seed();

console.log(`ENVIRONMENT ${process.env.NODE_ENV}`);
const app = express();
const server = http.createServer(app);

needle.defaults({
  open_timeout: 60000,
});
// 0 secs 0 mins 0 hours everyday will be triggered
const scheduleAtbegginigOfDay = '0 0 0 * * *';

// cron.schedule('*/5 * * * * *', function () {
//   console.log('Are you going to call?');
//   createNotifications();
// });

app.use(morgan('dev', {stream: logger.stream}));
app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());
// add CORS headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
  res.header("Access-Control-Max-Age", "86400");
  next();
});

app.use(express.static('public'))
app.use('/', indexRouter);
app.use('/pm-tools', pmToolsRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/admin/user-activity', logActivityRouter);
app.use('/map', mapRouter);
app.use('/problems', problemRouter);
app.use('/drive', driveRouter);
app.use('/attachments', attachmentRouter);
app.use('/gallery', galleryRouter);
app.use('/filters', filterRouter);
app.use('/zoomarea', zoomareaRouter);
app.use('/favorites', favoriteRouter);
app.use('/create', newProjectRouter);
app.use('/board', boardRouter);
app.use('/locality', localityRouter);
app.use('/notes', noteRouter);
app.use('/newnotes', newnoteRouter);
app.use('/consultants', consultantsRouter);
app.use('/phasetype', phasetypeRouter);
app.use('/actionitem', projectactionitemRouter);
app.use('/status', projectStatusRouter);
app.use('/organizations', organizationRouter);
app.use('/configuration', configurationRouter);
app.use('/projects', projectRouter);
app.use('/v2/locality', v2Localities);
app.use('/projectservicearea', projectServiceArea);
app.use('/streams', streamsRouter);
app.use('/card-filters', cardFilterRouter);
app.use('/business', businessRouter);
app.use('/notifications', notificationRouter);

export default server;
