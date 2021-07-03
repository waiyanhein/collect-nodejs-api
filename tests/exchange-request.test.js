require('dotenv').config();
const request = require('supertest');
const testHelper = require('./testHelper.js');
let app = null;
// boilerplate ends here
const models = require('../models');
const { Op } = require("sequelize");
let Region = models.Region;
let ExchangeRequest = models.ExchangeRequest;

beforeEach(async () => {

  let data = await testHelper.beforeEachTest();
  app = testHelper.getApp();
})

afterEach(async () => {
  await testHelper.afterEachTest();
})

describe("ExchangeRequest Test", () => {
  it ('user can create the exchange request', async () => {
    let regions = await Region.bulkCreate([
      {
        name: "Region A",
        latitude: 1,
        longitude: 2
      },
      {
        name: "Region B",
        latitude: 1,
        longitude: 2
      }
    ])

    let body = {

    }
    const res = await request(app).post("/api/exchange-request").send(body)
  })
})
