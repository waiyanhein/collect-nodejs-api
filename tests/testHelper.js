require('dotenv').config();
const request = require('supertest');
let database = require('../utilities/database.js');
let app = null;
let server = null;

// errors is errors field from the response when the validation fails
const hasValidationErrorMessage = (errors, fieldName, errorMessage) => {
  if (! Array.isArray(errors)) {
    return false;
  }

  if (errors.length < 1) {
    return false;
  }

  let hasExpectedMessage = false;
  for (let i = 0; i < errors.length; i++) {
    if (errors[i].param == fieldName && errors[i].msg == errorMessage) {
      hasExpectedMessage = true;
    }
  }

  return hasExpectedMessage;
}

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
exports.hasValidationErrorMessage = hasValidationErrorMessage;
