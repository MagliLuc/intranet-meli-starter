// backend/src/routes/auth.routes.js
const express = require('express')
const router = express.Router()
const controller = require('../controllers/auth.controller')
const authGuard = require('../middlewares/auth.middleware')

// Primer uso: saber si se permite registro abierto
router.get('/first-run', controller.firstRun)

// Registro (abierto solo si no hay usuarios; caso contrario requiere admin con Bearer)
router.post('/register', controller.register)

// Login
router.post('/login', controller.login)

// Perfil del token actual
router.get('/me', authGuard, controller.me)

module.exports = router
