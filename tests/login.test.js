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
    expect(res.body.error).toBe(false);
    expect(res.body.data.hasOwnProperty('id')).toBe(true);
    expect(res.body.data.name).toBe(testHelper.testUser.name);
    expect(res.body.data.email).toBe(testHelper.testUser.email);
    expect(res.body.data.hasOwnProperty('token')).toBe(true);
  })

  it ("login fails when the email and password are incorrect", async () => {
    let body = { ...requestBody };
    body.password = "invalidpassword";

    const res = await request(app).post("/api/auth/login").send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Account details are incorrect.')
  })

  it ("access token from login can fetch me information", async () => {
    let res = await request(app).post("/api/auth/login").send(requestBody);

    expect(res.statusCode).toBe(200);

    res = await request(app).get("/api/auth/me")
    .set("Authorization", `Bearer ${res.body.data.token}`)
    .send({ });

    expect(res.statusCode).toBe(200);
    expect(res.body.error).toBe(false);
    expect(res.body.data.hasOwnProperty('id')).toBe(true);
    expect(res.body.data.hasOwnProperty('name')).toBe(true);
    expect(res.body.data.hasOwnProperty('email')).toBe(true);
  })

  it ('cannot get me information when the access token is not provided', async () => {
    let res = await request(app).get("/api/auth/me")
    .send({ });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe('Access token is missing.');
  })

  it ('me endpoint will return error when the invalid access token is provided', async () => {
    let res = await request(app)
    .get("/api/auth/me")
    .set("Authorization", `Bearer invalidtoken`)
    .send({ });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe('Invalid token.');
  })

  each([
    {
      body: {
        email: "",
        password: requestBody.password
      },
      fieldName: "email",
      expectedError: "Email is required.",
      before: null
    },
    {
      body: {
        email: "invalidemailformat",
        password: requestBody.password
      },
      fieldName: "email",
      expectedError: "Email format is not valid.",
      before: null
    },
    {
      body: {
        email: requestBody.email,
        password: ""
      },
      fieldName: "password",
      expectedError: "Password is required.",
      before: null
    }
  ]).test("login - validation fails when the fields are not valid", async ({ body, fieldName, expectedError, before }) => {
    if (before != null) {
      if (before.constructor.name === "AsyncFunction") {
        await before();
      } else {
        before();
      }
    }

    const res = await request(app).post("/api/auth/login").send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, fieldName, expectedError)).toBe(true);
  })
})
