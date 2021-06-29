require('dotenv').config();
const request = require('supertest');
const testHelper = require('./testHelper.js');
let app = null;
// boilerplate ends here
const each = require('jest-each').default;
const faker = require('faker');
const date = require('date-and-time');
const models = require('../models');
const { Op } = require("sequelize");
const mailMock = require('nodemailer').mock;
let User = models.User;
let VerificationToken = models.VerificationToken;

const registerRequestBody = () => {
  return {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  };
}

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

  it("can resend confirm registration email", async () => {
    let body = {
      email: testHelper.testUser.email
    }

    const res = await request(app).post('/api/auth/resend-confirm-registration-email')
    .send(body);

    expect(res.statusCode).toBe(200);
    const sentEmails = mailMock.getSentMail();
    // there should be one
    expect(sentEmails.length).toBe(1);
    expect(sentEmails[0].to).toBe(body.email);
  })

  it ("send confirm registration email - validation fails when email is empty", async () => {
    let body = {
      email: ""
    }

    const res = await request(app).post('/api/auth/resend-confirm-registration-email')
    .send(body);

    expect(res.statusCode).toBe(400);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, "email", "Email is required.")).toBe(true);
  })

  it ("send confirm registration email - validation fails when email format is invalid", async () => {
    let body = {
      email: "invalidemailformat"
    }

    const res = await request(app).post('/api/auth/resend-confirm-registration-email')
    .send(body);

    expect(res.statusCode).toBe(400);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, "email", "Email format is not valid.")).toBe(true);
  })

  it ("send confirm registration email - validation fails when account with email does not exist", async () => {
    let body = {
      email: "idonotexist@gmail.com"
    }

    const res = await request(app).post('/api/auth/resend-confirm-registration-email')
    .send(body);

    expect(res.statusCode).toBe(400);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, "email", "User account with the email does not exist.")).toBe(true);
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

  it ('user can verify account email', async () => {
    const requestBody = {
      email: faker.internet.email(),
      token: "testing"
    }

    let user = await User.create({
      name: faker.name.findName(),
      email: requestBody.email,
      password: faker.internet.password(),
      verifiedAt: null
    })

    let now = new Date();
    let expiresAt = date.addSeconds(now, 3000);
    let verificationToken = await VerificationToken.create({
      userId: user.id,
      expiresAt: expiresAt,
      verificationToken: "testing",
      verifiedAt: null
    })

    const res = await request(app).post('/api/auth/verify-account-email').send(requestBody);

    user = await User.findOne({
      where: {
        id: {
          [Op.eq]: user.id
        }
      }
    })
    verificationToken = await VerificationToken.findOne({
      where: {
        id: {
          [Op.eq]: verificationToken.id
        }
      }
    })

    expect(res.statusCode).toBe(200);
    expect(user.verifiedAt!=null && user.verifiedAt!=undefined).toBe(true);
    expect(verificationToken.verifiedAt != null && verificationToken.verifiedAt != undefined).toBe(true);
  })

  it ('verifying account email fails when the email is empty', async () => {
    let requestBody = {
      email: "",
      token: "testing"
    }

    const res = await request(app).post('/api/auth/verify-account-email').send(requestBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, "email", "Email is required.")).toBe(true);
  })

  it ('verifying account email fails when the email format is not valid', async () => {
    let requestBody = {
      email: "invalidemailformat",
      token: "testing"
    }

    const res = await request(app).post('/api/auth/verify-account-email').send(requestBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, "email", "Email format is not valid.")).toBe(true);
  })

  it ('verifying account email fails when the email does not match the token', async () => {
    let user = await User.create({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    })

    let now = new Date();
    let expiresAt = date.addSeconds(now, 3000);
    let verificationToken = await VerificationToken.create({
      userId: user.id,
      expiresAt: expiresAt,
      verificationToken: "testing",
      verifiedAt: null
    })

    let requestBody = {
      email: faker.internet.email(),
      token: verificationToken.verificationToken
    }

    const res = await request(app).post('/api/auth/verify-account-email').send(requestBody);

    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe('Invalid account.');
  })

  it ('verifying account email fails when the token is empty', async () => {
    let requestBody = {
      email: faker.internet.email(),
      token: ""
    }

    const res = await request(app).post('/api/auth/verify-account-email').send(requestBody);

    expect(res.body.error).toBe(true);
    expect(testHelper.hasValidationErrorMessage(res.body.errors, "token", "Token is required.")).toBe(true);
  })

  it ('verifying account email fails when the token is not valid', async () => {
    let requestBody = {
      email: faker.internet.email(),
      token: "testing"
    }

    let user = User.create({
      name: faker.name.findName(),
      email: requestBody.email,
      password: faker.internet.password()
    })

    const res = await request(app).post('/api/auth/verify-account-email').send(requestBody);

    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe('Invalid token.');
  })

  it ('verifying account email fails when the token is expired', async () => {
    const requestBody = {
      email: faker.internet.email(),
      token: "testing"
    }

    let user = await User.create({
      name: faker.name.findName(),
      email: requestBody.email,
      password: faker.internet.password(),
      verifiedAt: null
    })

    let now = new Date();
    let expiresAt = date.addSeconds(now, -3000);
    let verificationToken = await VerificationToken.create({
      userId: user.id,
      expiresAt: expiresAt,
      verificationToken: "testing",
      verifiedAt: null
    })

    const res = await request(app).post('/api/auth/verify-account-email').send(requestBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Token been expired.");
  })

  it ('verifying account email fails when the token is already verified', async () => {
    const requestBody = {
      email: faker.internet.email(),
      token: "testing"
    }

    let user = await User.create({
      name: faker.name.findName(),
      email: requestBody.email,
      password: faker.internet.password(),
      verifiedAt: null
    })

    let now = new Date();
    let expiresAt = date.addSeconds(now, 3000);
    let verificationToken = await VerificationToken.create({
      userId: user.id,
      expiresAt: expiresAt,
      verificationToken: "testing",
      verifiedAt: now
    })

    const res = await request(app).post('/api/auth/verify-account-email').send(requestBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Token has already been used");
  })
})
