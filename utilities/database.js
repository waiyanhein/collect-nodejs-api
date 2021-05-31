const config = require('../config.js').config;
const { Sequelize } = require('sequelize');

//TODO: change the database config here if you are using the different database
const sequelize = new Sequelize(config.database.postgres.connectionString);

exports.sequelize = sequelize;
