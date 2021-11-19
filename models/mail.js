const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Product = sequelize.define('api_mail_log', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  to: {
    type: Sequelize.STRING,
    allowNull: false
  },
  cc: {
    type: Sequelize.STRING,
    allowNull: true
  },
  bcc: {
    type: Sequelize.STRING,
    allowNull: true
  },
  subject: {
    type: Sequelize.STRING,
    allowNull: false
  },
  message: {
    type: Sequelize.STRING
  },
  sender: {
    type: Sequelize.STRING,
    allowNull: false
  },
  replyTo:{
    type: Sequelize.STRING,
    allowNull: false
  },
  application: {
    type: Sequelize.STRING,
  },
  priority: {
    type: Sequelize.INTEGER,
  },
  company: {
    type: Sequelize.INTEGER,
  },
  template: {
    type: Sequelize.INTEGER,
  },
  attachments_id: {
    type: Sequelize.STRING,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('attachments_id');
      return rawValue ? rawValue.split(',').map(Number) : null;
    }
  },
  attachments: {
    type: Sequelize.VIRTUAL
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  sendedAt: {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: null,
  },
  error: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  tries: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
});

module.exports = Product;