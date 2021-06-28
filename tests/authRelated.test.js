require('dotenv').config();
const request = require('supertest');
const testHelper = require('./testHelper.js');
let app = null;
// boilerplate ends here
const mailMock = require('nodemailer').mock;
const each = require('jest-each').default;
const faker = require('faker');
const models = require('../models');
let User = models.User;
let VerificationToken = models.VerificationToken;
const { Op } = require("sequelize");
const date = require('date-and-time');
const authService = require('../services/authService.js');

beforeEach(async () => {

  let data = await testHelper.beforeEachTest();
  app = testHelper.getApp();
})

afterEach(async () => {
  await testHelper.afterEachTest();
})

describe("Auth Related Test", () => {
  it ('it can send resetpassword email', async () => {
    let requestBody = {
      email: testHelper.testUser.email
    }
    const res = await request(app).post("/api/auth/send-resetpassword-link").send(requestBody)

    expect(res.statusCode).toBe(200);
    const sentEmails = mailMock.getSentMail();
    // there should be one
    expect(sentEmails.length).toBe(1);
    expect(sentEmails[0].to).toBe(requestBody.email);
  })

  it ('send resetpassword email - validation fails when email is empty', async () => {
    let requestBody = {
      email: ""
    }
    const res = await request(app).post("/api/auth/send-resetpassword-link").send(requestBody)

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, "email", "Email is required.")).toBe(true);
  })

  it ('send resetpassword email - validation fails when email format is invalid', async () => {
    let requestBody = {
      email: "invalid-email-format"
    }
    const res = await request(app).post("/api/auth/send-resetpassword-link").send(requestBody)

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, "email", "Email format is not valid.")).toBe(true);
  })

  it ('user can reset password', async () => {
    let testUser = await User.findOne({
      where: {
        email: {
          [Op.eq]: testHelper.testUser.email
        }
      }
    })

    let now = new Date();
    //genrate the token in the database before making the request.
    let verificationToken = await VerificationToken.create({
      userId: testUser.id,
      verificationToken: "testing",
      expiresAt: date.addSeconds(now, 40000)
    })

    let requestBody = {
      email: testUser.email,
      password: "Newpassword123",
      confirm_password: "Newpassword123",
      token: "testing"
    }
    const res = await request(app).put("/api/auth/reset-password").send(requestBody);

    expect(res.statusCode).toBe(200);
    expect(res.body.error).toBe(false);

    //refresh the user instance by fetching the new record from the database.
    let user = await User.findOne({
      where: {
        id: {
          [Op.eq]: testUser.id
        }
      }
    })

    let valid = await authService.checkPassword('Newpassword123', user.password);
    expect(valid).toBe(true);
  })

  it ("expires the verification token after the passsword has been reset", async () => {
    let testUser = await User.findOne({
      where: {
        email: {
          [Op.eq]: testHelper.testUser.email
        }
      }
    })

    let now = new Date();
    //genrate the token in the database before making the request.
    let verificationToken = await VerificationToken.create({
      userId: testUser.id,
      verificationToken: "testing",
      expiresAt: date.addSeconds(now, 40000)
    })

    let requestBody = {
      email: testUser.email,
      password: "Newpassword123",
      confirm_password: "Newpassword123",
      token: "testing"
    }
    const res = await request(app).put("/api/auth/reset-password").send(requestBody);

    expect(res.statusCode).toBe(200);
    expect(res.body.error).toBe(false);

    // check if the token is expired.
    verificationToken = await VerificationToken.findOne({
      where: {
        id: {
          [Op.eq]: verificationToken.id
        }
      }
    })

    expect((verificationToken.verifiedAt != null && verificationToken.verifiedAt != "" && verificationToken.verifiedAt != undefined)).toBe(true);
  })

  // TODO: validation rules for reset password
})
