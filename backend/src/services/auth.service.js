const bcrypt = require('bcrypt');
const { models } = require('../db');
const { sign } = require('./jwt.service');

async function register({ username, password, role = 'operador' }) {
  const exists = await models.User.findOne({ where: { username } });
  if (exists) {
    const err = new Error('El usuario ya existe');
    err.status = 400;
    throw err;
  }
  const password_hash = await bcrypt.hash(password, 10);
  const user = await models.User.create({ username, password_hash, role });
  const token = sign({ id: user.id, username: user.username, role: user.role });
  return { user: { id: user.id, username: user.username, role: user.role }, token };
}

async function login({ username, password }) {
  const user = await models.User.findOne({ where: { username } });
  if (!user) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }
  const token = sign({ id: user.id, username: user.username, role: user.role });
  return { user: { id: user.id, username: user.username, role: user.role }, token };
}

module.exports = { register, login };
