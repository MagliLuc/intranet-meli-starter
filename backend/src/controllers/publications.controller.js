const svc = require('../services/publications.service')

async function list(req, res) {
  const { page, pageSize, search, status } = req.query
  const data = await svc.listFromDb({ page, pageSize, search, status })
  res.json(data)
}

async function sync(req, res) {
  const data = await svc.syncFromMeli(req.user.id, { max: Number(req.body?.max || 500) })
  res.json({ message: 'Sync completado', ...data })
}

async function create(req, res) {
  const item = await svc.createOnMeli(req.user.id, req.body)
  res.status(201).json(item)
}

async function update(req, res) {
  const { meli_id } = req.params
  const item = await svc.updateOnMeli(req.user.id, meli_id, req.body)
  res.json(item)
}

async function pause(req, res) {
  const { meli_id } = req.params
  const data = await svc.changeStatus(req.user.id, meli_id, 'paused')
  res.json({ message: 'Publicación pausada', ...data })
}

async function activate(req, res) {
  const { meli_id } = req.params
  const data = await svc.changeStatus(req.user.id, meli_id, 'active')
  res.json({ message: 'Publicación activada', ...data })
}

module.exports = { list, sync, create, update, pause, activate }
