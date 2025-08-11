// backend/src/app.js
require('dotenv').config()
require('express-async-errors')
const express = require('express')
const cors = require('cors')
const { httpLogger, logger } = require('./config/logger')
const { sequelize } = require('./db')
const routes = require('./routes')
const errorHandler = require('./middlewares/error.middleware')

const app = express()

// Middlewares base
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(httpLogger())

// Rutas API
app.use('/api', routes)

// Health simple
app.get('/', (_, res) => res.json({ name: 'Intranet Meli API', ok: true }))

// Manejo de errores
app.use(errorHandler)

// Inicializar DB: crea si falta, luego authenticate + sync
async function initDatabase() {
  const { ensureDatabaseExists } = require('./utils/ensureDatabase')

  const cfg = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    dialect: process.env.DB_DIALECT || 'mssql'
  }
  logger.info(`[DB] Inicio: host=${cfg.host} port=${cfg.port} db=${cfg.name} user=${cfg.user} dialect=${cfg.dialect}`)

  // 1) Crea/verifica la base (idempotente, con retry)
  await ensureDatabaseExists(cfg.name)

  // 2) Autenticación a la base de la app
  await sequelize.authenticate()
  logger.info('[DB] Conexión autenticada con éxito')

  // 3) Sincronizar modelos (crea/actualiza tablas)
  await sequelize.sync()
  logger.info('[DB] Modelos sincronizados (sequelize.sync())')
}

module.exports = { app, initDatabase }
