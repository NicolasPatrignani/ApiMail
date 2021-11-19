const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Attachment = sequelize.define('api_mail_attachments', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  filename: {
    type: Sequelize.STRING,
    allowNull: false
  },
  uniqueFileName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  path: {
    type: Sequelize.STRING,
    allowNull: true
  },
  mimetype: {
    type: Sequelize.STRING,
    allowNull: true
  },
  application: {
    type: Sequelize.STRING,
    allowNull: false
  },
});

module.exports = Attachment;