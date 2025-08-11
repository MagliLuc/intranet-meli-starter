const { logger } = require('../config/logger');

module.exports = function errorHandler(err, req, res, next) {
  logger.error(`[${req.method}] ${req.originalUrl} -> ${err.message}`, { stack: err.stack });
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno' });
};
