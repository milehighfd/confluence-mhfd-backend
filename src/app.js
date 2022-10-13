import express from  'express';
import cookieParser from  'cookie-parser';
import morgan from  'morgan';
import http from  'http';
import cors from  'cors';
import logger from 'bc/config/logger.js';
import indexRouter from 'bc/routes/index.js';
import usersRouter from 'bc/routes/users.route.js';
// const authRouter = require('./routes/auth.route');
// const adminRouter = require('./routes/admin.route');
// const logActivityRouter = require('./routes/logActivity.route');
// const mapRouter = require('./routes/map.route');
// const problemRouter = require('./routes/problem.route');
// const driveRouter = require('./routes/drive.route');
// const attachmentRouter = require('./routes/attachment.route');
// const galleryRouter = require('./routes/mapgallery.route');
// const filterRouter = require('./routes/filters.route');
// const zoomareaRouter = require('./routes/zoomarea.route');
// const favoriteRouter = require('./routes/favorite.route');
// const newProjectRouter = require('./routes/new-project');
// const boardRouter = require('./routes/board.route');
// const localityRouter = require('./routes/locality.route');
// const noteRouter = require('./routes/note.route');
// const newnoteRouter = require('./routes/newnotes.route');
// const consultantsRouter = require('./routes/consultants.route');
// const organizationRouter = require('./routes/organization.route');
// const configurationRouter = require('./routes/configuration.route');
import db from 'bc/config/db.js';
db.sequelize.sync();

// require('./config/seed');

console.log(`ENVIRONMENT ${process.env.NODE_ENV}`);
const app = express();

const server = http.createServer(app);

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
app.use('/users', usersRouter);
// app.use('/auth', authRouter);
// app.use('/admin', adminRouter);
// app.use('/admin/user-activity', logActivityRouter);
// app.use('/map', mapRouter);
// app.use('/problems', problemRouter);
// app.use('/drive', driveRouter);
// app.use('/attachments', attachmentRouter);
// app.use('/gallery', galleryRouter);
// app.use('/filters', filterRouter);
// app.use('/zoomarea', zoomareaRouter);
// app.use('/favorites', favoriteRouter);
// app.use('/create', newProjectRouter);
// app.use('/board', boardRouter);
// app.use('/locality', localityRouter);
// app.use('/notes', noteRouter);
// app.use('/newnotes', newnoteRouter);
// app.use('/consultants', consultantsRouter);
// app.use('/organizations', organizationRouter);
// app.use('/configuration', configurationRouter);

export default server;
