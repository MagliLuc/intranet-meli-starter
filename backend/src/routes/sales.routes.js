const express = require('express');
const authGuard = require('../middlewares/auth.middleware');
const router = express.Router();

router.get('/', authGuard, async (req, res) => {
  res.json({ orders: [] });
});

module.exports = router;
