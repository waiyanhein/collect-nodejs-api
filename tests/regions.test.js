require('dotenv').config();
const request = require('supertest');
const testHelper = require('./testHelper.js');
let app = null;
// boilerplate ends here
const models = require('../models');
const { Op } = require("sequelize");
let Region = models.Region;

beforeEach(async () => {

  let data = await testHelper.beforeEachTest();
  app = testHelper.getApp();
})

afterEach(async () => {
  await testHelper.afterEachTest();
})

describe('Region Test', () => {
  it ('can get all the regions', async () => {
    let regions = await Region.bulkCreate([
      { name: "Region C", latitude: 4, longitude: 4 },
      { name: "Region B", latitude: 3, longitude: 2 },
      { name: "Region A", latitude: 1, longitude: 7 }
    ])

    const res = await request(app).get("/api/regions").send({ });

    expect(res.body.error).toBe(false);
    expect(res.body.data[0].name).toBe('Region A');
    expect(res.body.data[0].latitude).toBe(1);
    expect(res.body.data[0].longitude).toBe(7);
    expect(res.body.data[1].name).toBe('Region B');
    expect(res.body.data[1].latitude).toBe(3);
    expect(res.body.data[1].longitude).toBe(2);
    expect(res.body.data[2].name).toBe('Region C');
    expect(res.body.data[2].latitude).toBe(4);
    expect(res.body.data[2].longitude).toBe(4);
  })
})
