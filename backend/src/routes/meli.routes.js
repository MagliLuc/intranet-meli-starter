const express = require('express')
const authGuard = require('../middlewares/auth.middleware')
const controller = require('../controllers/meli.controller')

const router = express.Router()

router.get('/oauth/login', authGuard, controller.oauthLogin)
router.get('/oauth/callback', controller.oauthCallback)
router.post('/oauth/refresh', authGuard, controller.refresh)
router.get('/token', authGuard, controller.getToken)

module.exports = router
