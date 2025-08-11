require('dotenv').config();

const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 1433),
  dialect: process.env.DB_DIALECT || 'mssql',
  logging: String(process.env.SEQUELIZE_LOGGING || 'false') === 'true' ? console.log : false,
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
    }
  },
  define: {
    timestamps: true,
    underscored: true,
  },
  pool: {
    max: 10,
    min: 0,
    idle: 10000
  }
};

module.exports = {
  development: config,
  test: { ...config, logging: false },
  production: { ...config, logging: false }
};
