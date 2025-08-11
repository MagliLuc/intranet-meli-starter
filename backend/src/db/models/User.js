const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(200), allowNull: false },
    role: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'operador' }
  }, { tableName: 'users' });

  return User;
};
