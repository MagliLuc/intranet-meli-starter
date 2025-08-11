const axios = require('axios')
const { Op } = require('sequelize')
const { models } = require('../db')
const meliService = require('./meli.service')

async function getMeliUserId(internalUserId) {
  const access_token = await meliService.getValidAccessToken(internalUserId)
  if (!access_token) {
    const err = new Error('El usuario no tiene una cuenta de Mercado Libre conectada')
    err.status = 400
    throw err
  }
  const { data } = await axios.get('https://api.mercadolibre.com/users/me', {
    headers: { Authorization: `Bearer ${access_token}` }
  })
  return { access_token, meli_user_id: data.id }
}

async function syncFromMeli(internalUserId, { max = 500 } = {}) {
  const { access_token, meli_user_id } = await getMeliUserId(internalUserId)

  let offset = 0
  const pageSize = 50
  let total = 0

  while (true) {
    const url = `https://api.mercadolibre.com/users/${meli_user_id}/items/search?limit=${pageSize}&offset=${offset}`
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${access_token}` } })

    const ids = data.results || []
    if (!ids.length) break

    for (let i = 0; i < ids.length; i += 20) {
      const batchIds = ids.slice(i, i + 20).join(',')
      const { data: itemsData } = await axios.get(
        `https://api.mercadolibre.com/items?ids=${batchIds}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      )

      for (const row of itemsData) {
        const item = row.body || row
        if (!item || !item.id) continue
        const payload = {
          meli_id: item.id,
          title: item.title || '',
          price: item.price ?? 0,
          available_quantity: item.available_quantity ?? 0,
          status: item.status || 'active',
          last_sync: new Date()
        }
        const existing = await models.Publication.findOne({ where: { meli_id: item.id } })
        if (existing) await existing.update(payload)
        else await models.Publication.create(payload)
        total++
      }
    }

    offset += pageSize
    if (offset >= (data.paging?.total || max) || total >= max) break
  }

  return { synced: total }
}

async function listFromDb({ page = 1, pageSize = 20, search, status }) {
  const where = {}
  if (status) where.status = status
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { meli_id: { [Op.like]: `%${search}%` } }
    ]
  }

  const { rows, count } = await models.Publication.findAndCountAll({
    where,
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize),
    order: [['updated_at', 'DESC']]
  })

  return {
    items: rows,
    page: Number(page),
    pageSize: Number(pageSize),
    total: count,
    totalPages: Math.ceil(count / Number(pageSize))
  }
}

async function createOnMeli(internalUserId, payload) {
  const { access_token } = await getMeliUserId(internalUserId)

  const body = {
    title: payload.title,
    category_id: payload.category_id,
    price: payload.price,
    currency_id: payload.currency_id || 'ARS',
    available_quantity: payload.available_quantity || 0,
    buying_mode: payload.buying_mode || 'buy_it_now',
    condition: payload.condition || 'new',
    listing_type_id: payload.listing_type_id || 'gold_special',
    site_id: process.env.MELI_SITE_ID || 'MLA',
    pictures: payload.pictures || [],
    attributes: payload.attributes || []
  }

  const { data: item } = await axios.post('https://api.mercadolibre.com/items', body, {
    headers: { Authorization: `Bearer ${access_token}` }
  })

  await models.Publication.upsert({
    meli_id: item.id,
    title: item.title,
    price: item.price ?? 0,
    available_quantity: item.available_quantity ?? 0,
    status: item.status || 'active',
    last_sync: new Date()
  }, { where: { meli_id: item.id } })

  return item
}

async function updateOnMeli(internalUserId, meli_id, patch) {
  const { access_token } = await getMeliUserId(internalUserId)
  const { data: item } = await axios.put(
    `https://api.mercadolibre.com/items/${meli_id}`,
    patch,
    { headers: { Authorization: `Bearer ${access_token}` } }
  )

  await models.Publication.upsert({
    meli_id: item.id,
    title: item.title,
    price: item.price ?? 0,
    available_quantity: item.available_quantity ?? 0,
    status: item.status || 'active',
    last_sync: new Date()
  }, { where: { meli_id: item.id } })

  return item
}

async function changeStatus(internalUserId, meli_id, status) {
  const allowed = ['active', 'paused', 'closed']
  if (!allowed.includes(status)) {
    const err = new Error('Estado inválido. Usa: active | paused | closed')
    err.status = 400
    throw err
  }
  const item = await updateOnMeli(internalUserId, meli_id, { status })
  return { id: item.id, status: item.status }
}

module.exports = { syncFromMeli, listFromDb, createOnMeli, updateOnMeli, changeStatus }
