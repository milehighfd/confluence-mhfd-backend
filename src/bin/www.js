import dotenv from 'dotenv';
import debug from 'debug';

dotenv.config({
  path: '.env'
});
console.log('POSTGRESQL_PASSWORD');
console.log(process.env.POSTGRESQL_PASSWORD);
console.log('POSTGRESQL_HOST');
console.log(process.env.POSTGRESQL_HOST);
console.log('POSTGRESQL_USER');
console.log(process.env.POSTGRESQL_USER);
console.log('POSTGRESQL_DB');
console.log(process.env.POSTGRESQL_DB);
console.log('DB_PORT');
console.log(process.env.DB_PORT);

import server from '../app.js';

const debugBackend = debug('mhfd-backend-express:server');

const port = normalizePort(process.env.PORT || '3003');
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debugBackend('Listening on ' + bind);
  console.log("Server is listening on " + bind);
}
