const { DataTypes, DECIMAL } = require('sequelize');

module.exports = (sequelize) => {
  const Publication = sequelize.define('Publication', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    meli_id: { type: DataTypes.STRING(40), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    price: { type: DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
    available_quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'active' },
    last_sync: { type: DataTypes.DATE, allowNull: true }
  }, { tableName: 'publications' });

  return Publication;
};
