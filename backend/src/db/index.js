const { Sequelize } = require('sequelize');
const envCfg = require('../config/sequelize.config');
require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const cfg = envCfg[NODE_ENV];

const sequelize = new Sequelize(
  cfg.database,
  cfg.username,
  cfg.password,
  cfg
);

// Load models
const models = {};
models.User = require('./models/User')(sequelize);
models.MeliToken = require('./models/MeliToken')(sequelize);
models.Publication = require('./models/Publication')(sequelize);
models.Sale = require('./models/Sale')(sequelize);

// Associations
models.User.hasOne(models.MeliToken, { foreignKey: 'user_id', as: 'meliToken' });
models.MeliToken.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, models };
