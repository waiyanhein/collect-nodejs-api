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

let testGlobalData = {
  port_id: 3002
}

beforeAll(async () => {
  app = await testHelper.beforeAllTests(testGlobalData);
})

afterAll(async () => {
  await testHelper.afterAllTests(testGlobalData);
})

beforeEach(async () => {
  await testHelper.beforeEachTest(testGlobalData);
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

  // email in the request is not valid basically.
  it ('password reset fails when the verification token does not match the email', async () => {
    let requestBody = {
      email: faker.internet.email(),
      token: "testing",
      password: "Newpassword123",
      confirm_password: "Newpassword123"
    }

    let user = await User.create({
      name: faker.name.findName(),
      email: faker.internet.email(), // another email different from the one in the request
      password: faker.internet.password()
    })

    let now = new Date();
    let expiresAt = date.addSeconds(now, 3000);
    let verificationToken = await VerificationToken.create({
      userId: user.id,
      expiresAt: expiresAt,
      verificationToken: requestBody.token,
      verifiedAt: null
    })

    const res = await request(app).put("/api/auth/reset-password").send(requestBody);

    expect(res.body.error).toBe(true);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, "token", "Invalid token.")).toBe(true);
  })

  // token in the request is not valid basically
  it ('password reset fails when the email does not match the verification token', async () => {
    let requestBody = {
      email: faker.internet.email(),
      token: "testing123",
      password: "Newpassword123",
      confirm_password: "Newpassword123"
    }

    let user = await User.create({
      name: faker.name.findName(),
      email: requestBody.email,
      password: faker.internet.password()
    })

    let now = new Date();
    let expiresAt = date.addSeconds(now, 3000);
    let verificationToken = await VerificationToken.create({
      userId: user.id,
      expiresAt: expiresAt,
      verificationToken: "anothertoken",
      verifiedAt: null
    })

    const res = await request(app).put("/api/auth/reset-password").send(requestBody);

    expect(res.body.error).toBe(true);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, "token", "Invalid token.")).toBe(true);
  })

  it ('password reset fails when the verification token is expired', async () => {
    let requestBody = {
      email: faker.internet.email(),
      token: "testing",
      password: "Newpassword123",
      confirm_password: "Newpassword123"
    }

    let user = await User.create({
      name: faker.name.findName(),
      email: requestBody.email,
      password: faker.internet.password()
    })

    let now = new Date();
    let expiresAt = date.addSeconds(now, -3000);
    let verificationToken = await VerificationToken.create({
      userId: user.id,
      expiresAt: expiresAt,
      verificationToken: requestBody.token,
      verifiedAt: null
    })

    const res = await request(app).put("/api/auth/reset-password").send(requestBody);

    expect(res.body.error).toBe(true);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, "token", "Invalid token.")).toBe(true);
  })

  it ('password reset fails when the verification token is already used', async () => {
    let requestBody = {
      email: faker.internet.email(),
      token: "testing",
      password: "Newpassword123",
      confirm_password: "Newpassword123"
    }

    let user = await User.create({
      name: faker.name.findName(),
      email: requestBody.email,
      password: faker.internet.password()
    })

    let now = new Date();
    let expiresAt = date.addSeconds(now, 3000);
    let verificationToken = await VerificationToken.create({
      userId: user.id,
      expiresAt: expiresAt,
      verificationToken: requestBody.token,
      verifiedAt: now
    })

    const res = await request(app).put("/api/auth/reset-password").send(requestBody);

    expect(res.body.error).toBe(true);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, "token", "Invalid token.")).toBe(true);
  })

  it ('reset password validation fails when the old password is provided', async () => {
    let plainPassword = "Password.123456"
    let hashPassword = authService.hashPassword(plainPassword);

    let testUser = await User.findOne({
      where: {
        email: {
          [Op.eq]: testHelper.testUser.email
        }
      }
    })
    //update the password
    await testUser.update({
      password: hashPassword
    });

    let now = new Date();
    //genrate the token in the database before making the request.
    let verificationToken = await VerificationToken.create({
      userId: testUser.id,
      verificationToken: "testing",
      expiresAt: date.addSeconds(now, 40000)
    })

    let requestBody = {
      email: testUser.email,
      password: plainPassword,
      confirm_password: plainPassword,
      token: verificationToken.verificationToken
    }
    const res = await request(app).put("/api/auth/reset-password").send(requestBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, "password", "You have provided the old password")).toBe(true);
  })

  each([
    //validation fails when the email is isEmpty
    {
      body: {
        email: '',
        token: "testing",
        password: "Newpassword123",
        confirm_password: "Newpassword123"
      },
      fieldName: "email",
      expectedError: "Email is required.",
      before: null
    },
    //validation fails when the email format is invalid
    {
      body: {
        email: 'invalidemailformat',
        token: "testing",
        password: "Newpassword123",
        confirm_password: "Newpassword123"
      },
      fieldName: "email",
      expectedError: "Email format is not valid.",
      before: null
    },
    //validation fails when the email does not exist.
    {
      body: {
        email: faker.internet.email(),
        token: "testing",
        password: "Newpassword123",
        confirm_password: "Newpassword123"
      },
      fieldName: "email",
      expectedError: "User account with the email does not exist.",
      before: null
    },
    //validation fails when the token is empty
    {
      body: {
        email: faker.internet.email(),
        token: "",
        password: "Newpassword123",
        confirm_password: "Newpassword123"
      },
      fieldName: "token",
      expectedError: "Token is required.",
      before: null
    },
    //validation fails when the password is empty
    {
      body: {
        email: faker.internet.email(),
        token: "testing",
        password: "",
        confirm_password: "Newpassword123"
      },
      fieldName: "password",
      expectedError: "New password is required.",
      before: null
    },
    // validation fails when confirm password is empty
    {
      body: {
        email: faker.internet.email(),
        token: "testing",
        password: "Newpassword123",
        confirm_password: ""
      },
      fieldName: "confirm_password",
      expectedError: "Please confirm the password.",
      before: null
    },
  ]).test("reset password - validation fails when the field value is not valid", async ({
    body,
    fieldName,
    expectedError,
    before
  }) => {
      if (before != null) {
        if (before.constructor.name === "AsyncFunction") {
          await before();
        }   else {
          before();
        }
      }

      const res = await request(app).put("/api/auth/reset-password").send(body);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe(true);
      expect(testHelper.hasValidationErrorMessage(res.body.errors, fieldName, expectedError)).toBe(true);
  })
})
