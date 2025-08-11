// backend/src/controllers/auth.controller.js
const jwt = require('jsonwebtoken')
const authService = require('../services/auth.service')
const { models } = require('../db')
const { logger } = require('../config/logger')

function decodeAuthHeader(req) {
  try {
    const header = req.headers['authorization'] || ''
    const [scheme, token] = header.split(' ')
    if (scheme === 'Bearer' && token) {
      return jwt.verify(token, process.env.JWT_SECRET)
    }
  } catch (_) {}
  return null
}

/**
 * Indica si el sistema está en "primer uso" (no existen usuarios).
 * GET /api/auth/first-run
 * Respuesta: { canSelfRegister: boolean }
 */
async function firstRun(req, res) {
  const count = await models.User.count()
  res.json({ canSelfRegister: count === 0 })
}

/**
 * Registro de usuario.
 * Reglas:
 *  - Si NO hay usuarios: registro abierto (crea el primer admin si role no viene)
 *  - Si YA hay usuarios: SOLO admin autenticado puede registrar nuevos usuarios
 *
 * Body: { username, password, role? }
 * Respuesta: { user, token }
 */
async function register(req, res) {
  const existing = await models.User.count()

  if (existing > 0) {
    const auth = decodeAuthHeader(req)
    if (!auth || auth.role !== 'admin') {
      return res.status(403).json({ error: 'Solo un administrador puede registrar usuarios nuevos' })
    }
  }

  const { username, password } = req.body
  let { role } = req.body
  if (!role) {
    role = (existing === 0) ? 'admin' : 'operador'
  }

  const data = await authService.register({ username, password, role })

  if (existing === 0) {
    logger.info(`[Auth] Primer usuario creado: ${username} (role=${role})`)
  } else {
    logger.info(`[Auth] Usuario creado por admin: ${username} (role=${role})`)
  }

  res.status(201).json(data)
}

/**
 * Login
 * Body: { username, password }
 * Respuesta: { user, token }
 */
async function login(req, res) {
  const { username, password } = req.body
  const data = await authService.login({ username, password })
  res.json(data)
}

/**
 * Perfil del token actual
 * GET /api/auth/me (Bearer)
 */
async function me(req, res) {
  res.json({ user: req.user })
}

module.exports = { firstRun, register, login, me }
