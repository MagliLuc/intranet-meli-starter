const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MeliToken = sequelize.define('MeliToken', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    access_token: { type: DataTypes.TEXT, allowNull: false },
    refresh_token: { type: DataTypes.TEXT, allowNull: false },
    expires_in: { type: DataTypes.DATE, allowNull: false }
  }, {
    tableName: 'meli_tokens',
    indexes: [{ unique: true, fields: ['user_id'] }]
  });

  return MeliToken;
};
