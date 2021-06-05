require('dotenv').config();
const request = require('supertest');
let database = require('../utilities/database.js');
let app = null;
let server = null;

const getApp = () => {
  if (app != null) {
    return app;
  }

  let indexJs = require('../index.js');
  app = indexJs.app;

  return app;
}

const beforeEachTest = async () => {
  app = getApp();
  server = await app.listen(3001, () => {

    console.log("Test server is running");
  })
}

const afterEachTest = async () => {
  await database.sequelize.sync({
    force: true
  })
  await server.close(() => {

  })
}

exports.getApp = getApp;
exports.beforeEachTest = beforeEachTest;
exports.afterEachTest = afterEachTest;
