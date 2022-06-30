var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var http = require('http');
const logger = require('./config/logger');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users.route');
const authRouter = require('./routes/auth.route');
const adminRouter = require('./routes/admin.route');
const logActivityRouter = require('./routes/logActivity.route');
const mapRouter = require('./routes/map.route');
const mapGalleryRouter = require('./routes/mapgallery.route');
const problemRouter = require('./routes/problem.route');
const driveRouter = require('./routes/drive.route');
const attachmentRouter = require('./routes/attachment.route');
const galleryRouter = require('./routes/mapgallery.route');
const filterRouter = require('./routes/filters.route');
const zoomareaRouter = require('./routes/zoomarea.route');
const favoriteRouter = require('./routes/favorite.route');
const newProjectRouter = require('./routes/new-project.route');
const boardRouter = require('./routes/board.route');
const localityRouter = require('./routes/locality.route');
const noteRouter = require('./routes/note.route');
const newnoteRouter = require('./routes/newnotes.route');
const consultantsRouter = require('./routes/consultants.route');
const organizationRouter = require('./routes/organization.route');
const db = require('./config/db');
db.sequelize.sync();

require('./config/seed');

var app = express();

var server = http.createServer(app);

app.use(morgan('dev', {stream: logger.stream}));
app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());
// add CORS headers
app.use(function(res, res, next) {
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
app.use('/organizations', organizationRouter);

module.exports = server;
