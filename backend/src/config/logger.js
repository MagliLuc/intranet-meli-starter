const winston = require('winston');
const morgan = require('morgan');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) =>
      `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
    ),
  ),
  transports: [new winston.transports.Console()]
});

function httpLogger() {
  return morgan('[:date[iso]] :method :url :status :response-time ms', {
    stream: { write: (msg) => logger.info(msg.trim()) }
  });
}

module.exports = { logger, httpLogger };
