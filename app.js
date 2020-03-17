var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 
const { createWriteStream, existsSync, mkdirSync } = require('fs');
const { ApolloServer, gql } = require('apollo-server-express');
const { Storage } = require('@google-cloud/storage');
//const expressValidator = require('express-validator');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users.route');
var authRouter = require('./routes/auth.route');
var projectRouter = require('./routes/project.route');
var attachmentRouter = require('./routes/attachment.route');

require('./config/db');
require('./config/seed');

var app = express();

const files = [];
const typeDefs = gql`
type Query {
  files: [String]
}

type Mutation {
  uploadFile(file: Upload!): Boolean
}
`;

const gc = new Storage({
   keyFilename: path.join(__dirname, './config/develop-test-271312-20b199f0adbe.json'),
   projectId: 'develop-test-271312'
});

const mhfdBucket = gc.bucket('mhfd2-test');

const resolvers = {
   Query: {
      files: () => files
   },
   Mutation: {
      uploadFile: async (_, { file }) => {
         const { createReadStream, filename } = await file;
         await new Promise(res => 
            createReadStream()
               .pipe(
                  mhfdBucket.file(filename).createWriteStream({
                     resumable: false,
                     gzip: true
                  })
               )
               .on("finish", res)
            );
            console.log("filename " + filename);
            files.push(filename);
            return true;
      }
   }
}

existsSync(path.join(__dirname, "../images")) || mkdirSync(path.join(__dirname, "../images"));

const server = new ApolloServer({ typeDefs, resolvers});
app.use("/images", express.static(path.join(__dirname, "../images")));
server.applyMiddleware({ app });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(expressValidator());
// app.use(express.static(path.join(__dirname, 'public')));
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
app.use('/attachmments', attachmentRouter);

app.listen(3003, () => {
  console.log("Server is listening on port 3003");
});


module.exports = app;
