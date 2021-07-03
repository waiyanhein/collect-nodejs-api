require('dotenv').config();
const request = require('supertest');
const testHelper = require('./testHelper.js');
let app = null;
// boilerplate ends here
const faker = require('faker');
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
    let regionIds = [ ];
    for (let i=0; i< regions.length; i++) {
      regionIds.push(regions[i].id);
    }
    // exchange_rate,
    // currency,
    // amount,
    // buy_or_sell,
    // note,
    // email,
    // phone,
    // address,
    let body = {
      region_ids: regionIds,
      exchange_rate: 1400,
      currency: "GBD",
      amount: 500,
      buy_or_sell: 1,
      note: faker.lorem.sentence(),
      email: faker.internet.email(),
      phone: '07412287904'
    }
    const res = await request(app).post("/api/exchange-request").send(body)
  })
})
