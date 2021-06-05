require('dotenv').config();
const request = require('supertest');
const testHelper = require('./testHelper.js');
let app = null;
// boilerplate ends here
const each = require('jest-each').default;
const faker = require('faker');
const models = require('../models');
const { Op } = require("sequelize");
const mailMock = require('nodemailer').mock;
let User = models.User;

const registerRequestBody = () => {
  return {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  };
}

//TODO: find a way to create a base test class.
beforeEach(async () => {
  let data = await testHelper.beforeEachTest();
  app = testHelper.getApp();
})

afterEach(async () => {
  mailMock.reset();

  await testHelper.afterEachTest();
})

describe("Register Test", () => {
  it("user can register a new account", async () => {
    let body = registerRequestBody();
    const res = await request(app).post("/api/auth/register").send(body)

    // check if the user is saved in the database.
    let user = await User.findOne({
      where: {
        email: {
          [Op.eq]: body.email
        }
      }
    })

    expect(res.statusCode).toEqual(200);
    expect(user).not.toBe(null);
    expect(user.email).toEqual(body.email);
  })

  it("register returns the correct json data", async () => {
    let body = registerRequestBody();
    const res = await request(app).post("/api/auth/register").send(body)

    // get the user by email
    let user = await User.findOne({
      where: {
        email: {
          [Op.eq]: body.email
        }
      }
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.error).toEqual(false);
    expect(res.body.data.id).toEqual(user.id);
    expect(res.body.data.name).toEqual(user.name);
    expect(res.body.data.email).toEqual(user.email);
    expect(res.body.data.hasOwnProperty('createdAt')).toEqual(true);
    expect(res.body.data.hasOwnProperty('updatedAt')).toEqual(true);
    expect(res.body.data.hasOwnProperty('verifiedAt')).toEqual(true);
  })

  it("sends welcome email when registrations is successful", async () => {
    let body = registerRequestBody();
    const res = await request(app).post("/api/auth/register").send(body)

    expect(res.statusCode).toEqual(200);
    const sentEmails = mailMock.getSentMail();
    // there should be one
    expect(sentEmails.length).toBe(1);
    expect(sentEmails[0].to).toBe(body.email);
  })

  const requestBody = registerRequestBody();

  each([
    {
      body: {
        "name": "",
        "email": requestBody.email,
        "password": requestBody.password
      },
      fieldName: "name", // field name under test
      expectedError: "Name is required.",
      before: null // sometimes you might need to run a function before each test.
    },
    {
      body: {
        "name": requestBody.name,
        "email": "",
        "password": requestBody.password
      },
      fieldName: "email", // field name under test
      expectedError: "Email is required.",
      before: null
    },
    {
      body: {
        "name": requestBody.name,
        "email": requestBody.name,
        "password": requestBody.password
      },
      fieldName: "email", // field name under test
      expectedError: "Email format is not valid.",
      before: null
    },
    {
      body: {
        "name": requestBody.name,
        "email": requestBody.email,
        "password": requestBody.password
      },
      fieldName: "email", // field name under test
      expectedError: "Email address is already taken.",
      before: async () => {
        // seed the user with the same email
        await User.create(requestBody);
      }
    },
    {
      body: {
        "name": requestBody.name,
        "email": requestBody.name,
        "password": ""
      },
      fieldName: "password", // field name under test
      expectedError: "Password is required.",
      before: null
    },
  ]).test("register - validation fails when the fields are not valid", async ({ body, fieldName, expectedError, before }) => {
    //Password is required.
    if (before != null) {
      if (before.constructor.name === "AsyncFunction") {
        await before();
      } else {
        before();
      }
    }

    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, fieldName, expectedError)).toBe(true);
  })
})
