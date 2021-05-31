require('dotenv').config();
const fs = require('fs');
const config = require('../config.js');

module.exports = {
  development: {
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    dialectOptions: {
      bigNumberStrings: true
    }
  },
  test: {
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    dialectOptions: {
      bigNumberStrings: true
    }
  },
  production: {
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    dialectOptions: {
      bigNumberStrings: true
    }
  }
};
