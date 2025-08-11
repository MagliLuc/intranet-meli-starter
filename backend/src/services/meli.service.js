const axios = require('axios');
const jwt = require('jsonwebtoken');
const { models } = require('../db');
require('dotenv').config();

const MELI_AUTH_URL = 'https://auth.mercadolibre.com/authorization';
const MELI_TOKEN_URL = 'https://api.mercadolibre.com/oauth/token';

function buildAuthUrl(internalUser, appUrl) {
  const state = jwt.sign(
    { uid: internalUser.id },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.MELI_APP_ID,
    redirect_uri: process.env.MELI_REDIRECT_URI,
    state
  });

  return `${MELI_AUTH_URL}?${params.toString()}`;
}

async function handleCallback({ code, state }) {
  let payload;
  try {
    payload = jwt.verify(state, process.env.JWT_SECRET);
  } catch (e) {
    const err = new Error('State inválido o vencido');
    err.status = 400;
    throw err;
  }
  const internalUserId = payload.uid;

  const resp = await axios.post(MELI_TOKEN_URL, new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.MELI_APP_ID,
    client_secret: process.env.MELI_CLIENT_SECRET,
    code,
    redirect_uri: process.env.MELI_REDIRECT_URI
  }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

  const { access_token, refresh_token, expires_in } = resp.data;
  const expiresDate = new Date(Date.now() + (Number(expires_in) - 60) * 1000);

  const existing = await models.MeliToken.findOne({ where: { user_id: internalUserId } });
  if (existing) {
    await existing.update({ access_token, refresh_token, expires_in: expiresDate });
  } else {
    await models.MeliToken.create({ user_id: internalUserId, access_token, refresh_token, expires_in: expiresDate });
  }

  return { ok: true, user_id: internalUserId, expires_in: expiresDate };
}

async function refreshForUser(internalUserId) {
  const rec = await models.MeliToken.findOne({ where: { user_id: internalUserId } });
  if (!rec) {
    const err = new Error('No hay tokens almacenados para este usuario');
    err.status = 404;
    throw err;
  }

  const resp = await axios.post(MELI_TOKEN_URL, new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.MELI_APP_ID,
    client_secret: process.env.MELI_CLIENT_SECRET,
    refresh_token: rec.refresh_token
  }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

  const { access_token, refresh_token, expires_in } = resp.data;
  const expiresDate = new Date(Date.now() + (Number(expires_in) - 60) * 1000);

  await rec.update({ access_token, refresh_token, expires_in: expiresDate });

  return { ok: true, user_id: internalUserId, expires_in: expiresDate };
}

async function getValidAccessToken(internalUserId) {
  const rec = await models.MeliToken.findOne({ where: { user_id: internalUserId } });
  if (!rec) return null;

  const now = new Date();
  if (new Date(rec.expires_in) <= now) {
    await refreshForUser(internalUserId);
    const updated = await models.MeliToken.findOne({ where: { user_id: internalUserId } });
    return updated.access_token;
  }
  return rec.access_token;
}

module.exports = { buildAuthUrl, handleCallback, refreshForUser, getValidAccessToken };
