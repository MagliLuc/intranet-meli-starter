const jwt = require('jsonwebtoken');
require('dotenv').config();

function sign(payload, expiresIn = process.env.JWT_EXPIRES || '8h') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

module.exports = { sign };
