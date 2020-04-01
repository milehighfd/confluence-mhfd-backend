const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'silly'
    }),
    new winston.transports.File({
      level: 'silly',
      filename: './logs/mhfd.log',
      maxFiles: 3,
      maxsize: 1048576
    })
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
        return `${info.timestamp} [${info.level}]: ${info.message}`;
    })
  )
});

logger.stream = {
  write: function(message, encoding) {
    const newMessage = message.substring(0, message.length - 1);
    logger.info(newMessage);
  }
}

module.exports = logger;
