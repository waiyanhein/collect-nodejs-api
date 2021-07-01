let models = require('../models');
const { Op } = require("sequelize");
let Region = models.Region;

// get all the regions
const get = async () => {
  try {
    let regions = await Region.findAll({
      order: [
        [ 'name', 'ASC' ]
      ]
    });

    return {
      error: false,
      data: regions
    }
  } catch (e) {
    return {
      error: true,
      code: 500,
      message: e.message
    }
  }
}

exports.get = get;
