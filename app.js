var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');

const logger = require('./config/logger');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users.route');
var authRouter = require('./routes/auth.route');
var projectRouter = require('./routes/project.route');
var adminRouter = require('./routes/admin.route');
const logActivityRouter = require('./routes/logActivity.route');
const mapRouter = require('./routes/map.route');
const problemRouter = require('./routes/problem.route');
const driveRouter = require('./routes/drive.route');
var attachmentRouter = require('./routes/attachment.route');

const db = require('./config/db');
db.sequelize.sync();

//require('./config/db');
require('./config/seed');

var app = express();

app.use(morgan('dev', {stream: logger.stream}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// add CORS headers
app.use(function(res, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
  res.header("Access-Control-Max-Age", "86400");
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/projects', projectRouter);
app.use('/admin', adminRouter);
app.use('/admin/user-activity', logActivityRouter);
app.use('/map', mapRouter);
app.use('/problems', problemRouter);
app.use('/drive', driveRouter);
app.use('/attachments', attachmentRouter);

app.listen(3003, () => {
  console.log("Server is listening on port 3003");
});


module.exports = app;
