let models = require('../models');
const { Op } = require("sequelize");
let ExchangeRequest = models.ExchangeRequest;
let RegionExchangeRequest = models.RegionExchangeRequest;

// data format -> {}
const create = async ({
  exchange_rate,
  currency,
  amount,
  buy_or_sell,
  note,
  email,
  phone,
  address,
  region_ids
}) => {
  try {
    let exchangeRequest = await ExchangeRequest.create({
      exchange_rate,
      currency,
      amount,
      buy_or_sell,
      note,
      email,
      phone,
      address
    });

    let pivotData = [ ];
    region_ids.forEach(regionId => {
        pivotData.push({
          exchange_request_id: exchangeRequest.id,
          region_id: regionId
        })
    })
    let regionExchangeRequests = await RegionExchangeRequest.bulkCreate(pivotData);

    return {
      error: false,
      data: exchangeRequest
    }
  } catch (e) {
    return {
      error: true,
      code: 500,
      message: e.message
    }
  }
}

exports.create = create;
