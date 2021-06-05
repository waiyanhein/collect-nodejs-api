require('dotenv').config();
const request = require('supertest');
const testHelper = require('./testHelper.js');
let app = null;
// boilerplate ends here
const each = require('jest-each').default;
const faker = require('faker');

let requestBody = {
  email: testHelper.testUser.email,
  password: testHelper.testUser.password
};

beforeEach(async () => {

  let data = await testHelper.beforeEachTest();
  app = testHelper.getApp();
})

afterEach(async () => {
  await testHelper.afterEachTest();
})

describe("Login Test", () => {
  it ("user can log in", async () => {
    const res = await request(app).post("/api/auth/login").send(requestBody);

    expect(res.statusCode).toBe(200);
    // check the response
  })

  it ("login fails when the email and password are incorrect", () => {

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
