const config = require('../config.js');
const { Sequelize } = require('sequelize');

//TODO: change the database config here if you are using the different database
//const sequelize = new Sequelize(config.database.postgres.connectionString); using connection string for postgres
const sequelize = new Sequelize(config.database.name, config.database.username, config.database.password, {
  host: config.database.host,
  dialect: config.database.dialect /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
});

exports.sequelize = sequelize;
