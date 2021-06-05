require('dotenv').config();
const request = require('supertest');
const testHelper = require('./testHelper.js');
let app = null;
// boilerplate ends here
const each = require('jest-each').default;
const faker = require('faker');

let requestBody = null;

const generateRequestBody = () => {
  // email: faker.internet.email(),
  // password: faker.internet.password()
  return {
    email: faker.internet.email(),
    password: faker.internet.password()
  }
}

beforeEach(async () => {
  let data = await testHelper.beforeEachTest();
  app = testHelper.getApp();
})

afterEach(async () => {
  await testHelper.afterEachTest();
})

describe("Login Test", () => {
  it ("user can log in", () => {

  })

  it ("login fails when the email and password are incorrect", () => {

  })

  it ("returns the expected json data when login is successful", () => {

  })

  //@TODO: validation rules
  each([
    {
      body: {

      },
      fieldName: "",
      expectedError: "",
      before: null
    }
  ]).test("login - validation fails when the fields are not valid", async ({ body, fieldName, expectedError, before }) => {

  })
})
