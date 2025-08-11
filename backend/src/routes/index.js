// backend/src/routes/index.js
const express = require('express')
const { sequelize } = require('../db')

const router = express.Router()

// Ping simple
router.get('/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

// Salud de DB: autentica y consulta @@VERSION + DB_NAME()
router.get('/db/health', async (req, res) => {
  try {
    await sequelize.authenticate()
    const [dbNameRows] = await sequelize.query('SELECT DB_NAME() AS current_db')
    const [verRows] = await sequelize.query('SELECT @@VERSION AS version')

    return res.json({
      ok: true,
      connected: true,
      current_db: dbNameRows?.[0]?.current_db || null,
      version: verRows?.[0]?.version || null,
      ts: new Date().toISOString()
    })
  } catch (err) {
    return res.status(500).json({
      ok: false,
      connected: false,
      error: err.message,
      ts: new Date().toISOString()
    })
  }
})

router.use('/auth', require('./auth.routes'))
router.use('/meli', require('./meli.routes'))
router.use('/publications', require('./publications.routes'))
router.use('/sales', require('./sales.routes'))

module.exports = router
