require('dotenv').config();
const request = require('supertest');
let express = require('express');
const { Op } = require("sequelize");
var faker = require('faker');
let database = require('../utilities/database.js');
let models = require('../models');
const { mock } = require('nodemailer');
let app = null;
let server = null;
let User = models.User;

//TODO: find a way to create a base test class.
//TODO: refresh the database.
beforeEach(async () => {
  let indexJs = require('../index.js');
  app = indexJs.app;
  server = app.listen(3001, () => {

    console.log("Test server is running");
  })
})

afterEach(async () => {
  //this will refresh the database.
  await database.sequelize.sync({
    force: true
  })
  mock.reset();
  await server.close(() => {

  })
})

describe("Auth Test", () => {
  it("user can register a new account", async () => {
    let body = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    };
    const res = await request(app)
    .post("/api/auth/register")
    .send(body)

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

  })

  it("sends welcome email when registrations is successful", async () => {
    let body = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    };
    const res = await request(app)
    .post("/api/auth/register")
    .send(body)

    expect(res.statusCode).toEqual(200);
    const sentEmails = mock.getSentMail();
    // there should be one
    expect(sentEmails.length).toBe(1);
  })

  it("cannot register new account when the email is already taken", async () => {

  })

  //TOOD: find a way to test the validation rules in the re-usable way
})
