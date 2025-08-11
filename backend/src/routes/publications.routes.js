const express = require('express')
const authGuard = require('../middlewares/auth.middleware')
const requireRole = require('../middlewares/role.middleware')
const ctrl = require('../controllers/publications.controller')

const router = express.Router()

router.get('/', authGuard, ctrl.list)
router.post('/sync', authGuard, requireRole('admin'), ctrl.sync)
router.post('/', authGuard, requireRole('admin'), ctrl.create)
router.patch('/:meli_id', authGuard, requireRole('admin'), ctrl.update)
router.post('/:meli_id/pause', authGuard, requireRole('admin'), ctrl.pause)
router.post('/:meli_id/activate', authGuard, requireRole('admin'), ctrl.activate)

module.exports = router
