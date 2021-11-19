const Sequelize = require('sequelize');

const sequelize = new Sequelize('SATELITE', 'NPATRI', '1234', {
  dialect: 'mssql',
  host: '10.10.1.2'
});

module.exports = sequelize;
