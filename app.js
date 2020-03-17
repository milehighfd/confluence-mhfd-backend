var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//const expressValidator = require('express-validator');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users.route');
var authRouter = require('./routes/auth.route');
var projectRouter = require('./routes/project.route');
var attachmentRouter = require('./routes/attachment.route');

require('./config/db');
require('./config/seed');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(expressValidator());
// app.use(express.static(path.join(__dirname, 'public')));
// add CORS headers
app.use(function(res, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/projects', projectRouter);
app.use('/attachmments', attachmentRouter);

app.listen(3003, () => {
  console.log("Server is listening on port 3003");
});


module.exports = app;
