require('dotenv').config();
const request = require('supertest');
let express = require('express');
var app = null;
var server = null;

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
  await server.close(() => {

  })
})

describe("Auth Test", () => {
  it("user can register a new account", async () => {
    const res = await request(app)
    .post("/api/auth/register")
    .send({
      name: "waiyanhein",
      email: "waiyanhein.uk@gmail.com",
      password: "testing"
    })

    expect(res.statusCode).toEqual(200);
    expect(res.body.error).toEqual(false);
  })

  it("sends welcome email when registrations is successful", () => {

  })

  it("cannot register new account when the email is already taken", () => {

  })

  //TOOD: find a way to test the validation rules in the re-usable way
})
