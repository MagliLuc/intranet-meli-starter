// backend/src/utils/ensureDatabase.js
const { Sequelize } = require('sequelize')
const envCfg = require('../config/sequelize.config')
const { logger } = require('../config/logger')

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

function makeMasterSequelize(baseCfg, username, password) {
  // Conexión explícita a la base 'master'
  return new Sequelize('master', username, password, {
    ...baseCfg,
    logging: false,
    // Evitamos que Sequelize overridee 'database' del DSN
    database: undefined,
    dialectOptions: {
      ...(baseCfg.dialectOptions || {}),
      options: {
        ...(baseCfg.dialectOptions?.options || {}),
        database: 'master'
      }
    }
  })
}

/**
 * Crea la base `dbName` si no existe. Idempotente y con reintentos, útil
 * cuando SQL Server tarda en quedar listo al iniciar el contenedor.
 */
async function ensureDatabaseExists(dbName, { timeoutMs = 120000, intervalMs = 2000 } = {}) {
  const NODE_ENV = process.env.NODE_ENV || 'development'
  const base = envCfg[NODE_ENV]
  const username = base.username
  const password = base.password
  const host = base.host
  const port = base.port

  logger.info(`[DB] Verificando existencia de base '${dbName}' en ${host}:${port} (user=${username})`)

  const start = Date.now()
  let attempt = 0
  while (true) {
    attempt++
    let masterSequelize
    try {
      masterSequelize = makeMasterSequelize(base, username, password)
      await masterSequelize.authenticate()

      // CREATE DATABASE si no existe (idempotente)
      await masterSequelize.query(`
        IF DB_ID(:dbname) IS NULL
          CREATE DATABASE [${dbName.replace(/]/g, ']]')}];
      `, { replacements: { dbname: dbName } })

      logger.info(`[DB] Base '${dbName}' verificada/creada (intento ${attempt})`)
      return
    } catch (e) {
      const elapsed = Date.now() - start
      if (elapsed > timeoutMs) {
        logger.error(`[DB] Falló ensureDatabaseExists tras ${attempt} intentos / ${Math.round(elapsed/1000)}s: ${e.message}`)
        throw e
      }
      logger.warn(`[DB] Aún no disponible (intento ${attempt}): ${e.message}. Reintento en ${Math.round(intervalMs/1000)}s...`)
      await sleep(intervalMs)
    } finally {
      if (masterSequelize) await masterSequelize.close().catch(() => {})
    }
  }
}

module.exports = { ensureDatabaseExists }
