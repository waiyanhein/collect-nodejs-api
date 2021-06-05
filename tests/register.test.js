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

  it("cannot register new account when the email is already taken", async () => {
    let body = registerRequestBody();
    let user = await User.create(body);
    const res = await request(app).post("/api/auth/register").send(body)

    expect(res.statusCode).toEqual(400);
  })

  each([
    {
      body: {

      },
      fieldName: "", // field name under test
      expectedError: "",
      before: null // sometimes you might need to run a function before each test.
    },
    {
      body: {

      },
      fieldName: "", // field name under test
      expectedError: "",
      before: null
    }
  ]).test("register - validation fails when the fields are not valid", ({ body, fieldName, expectedError, before }) => {
    //const isAsync = myFunction.constructor.name === "AsyncFunction";
  })
})
