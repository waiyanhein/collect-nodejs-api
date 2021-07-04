require('dotenv').config();
const request = require('supertest');
let database = require('../utilities/database.js');
let app = null;
let server = null;
// import related to seeders
const userFactory = require('../seeders/factories/user.js');
const models = require('../models');
let User = models.User;
// end seeders

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


const beforeEachTest = async (testGlobalData) => {
  await seedData();
  app = getApp();
  server = await app.listen((testGlobalData.port_id), () => {

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

//import the factories and seed
const seedData = async () => {
  await User.bulkCreate(userFactory.users);
}

// same as the one in the seeder
//TODO: if you delete or update the users in the seeder, please make sure that you update this too.
const testUser = {
  name: "tester",
  email: "tester@gmail.com",
  password: "password1234"
}

const getTestUserModel = async () => {
  let userModel = User.findOne({
    where: {
      email: testUser.email
    }
  })
}

exports.getApp = getApp;
exports.beforeEachTest = beforeEachTest;
exports.afterEachTest = afterEachTest;
exports.hasValidationErrorMessage = hasValidationErrorMessage;
exports.testUser = testUser;
