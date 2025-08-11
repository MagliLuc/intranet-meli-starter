const meliService = require('../services/meli.service')

async function oauthLogin(req, res) {
  const url = meliService.buildAuthUrl(req.user, process.env.APP_URL)
  return res.redirect(url)
}

async function oauthCallback(req, res) {
  const { code, state, error, error_description } = req.query
  const FRONTEND = process.env.FRONTEND_URL

  if (error) {
    if (FRONTEND) {
      const qs = new URLSearchParams({ meli: 'error', reason: error_description || error }).toString()
      return res.redirect(`${FRONTEND}?${qs}`)
    }
    return res.status(400).json({ message: 'Error de autorización', error, error_description })
  }

  try {
    const data = await meliService.handleCallback({ code, state })
    if (FRONTEND) {
      const qs = new URLSearchParams({ meli: 'ok' }).toString()
      return res.redirect(`${FRONTEND}?${qs}`)
    }
    return res.json({ message: 'Autorización completada', ...data })
  } catch (e) {
    if (FRONTEND) {
      const qs = new URLSearchParams({ meli: 'error', reason: e.message || 'callback_failed' }).toString()
      return res.redirect(`${FRONTEND}?${qs}`)
    }
    return res.status(e.status || 500).json({ error: e.message || 'Error en callback' })
  }
}

async function refresh(req, res) {
  const data = await meliService.refreshForUser(req.user.id)
  res.json({ message: 'Token renovado', ...data })
}

async function getToken(req, res) {
  const token = await meliService.getValidAccessToken(req.user.id)
  res.json({ access_token: token })
}

module.exports = { oauthLogin, oauthCallback, refresh, getToken }
