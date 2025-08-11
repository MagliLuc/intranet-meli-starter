const { app, initDatabase } = require('./app');
const { logger } = require('./config/logger');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => logger.info(`API escuchando en http://localhost:${PORT}`));
  } catch (err) {
    logger.error('Fallo al iniciar la app', { error: err.message, stack: err.stack });
    process.exit(1);
  }
})();
