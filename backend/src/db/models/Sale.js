const { DataTypes, DECIMAL } = require('sequelize');

module.exports = (sequelize) => {
  const Sale = sequelize.define('Sale', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    meli_order_id: { type: DataTypes.STRING(40), allowNull: false, unique: true },
    buyer_name: { type: DataTypes.STRING(120), allowNull: false },
    total: { type: DECIMAL(18, 2), allowNull: false },
    status: { type: DataTypes.STRING(40), allowNull: false }
  }, { tableName: 'sales' });

  return Sale;
};
