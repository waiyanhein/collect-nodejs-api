const regionService = require('../services/regionService');

const get = async (req, res) => {
  // get all
  let regionsResult = await regionService.get();

  if (regionsResult.error) {
    return res.status(regionsResult.code).json(regionsResult);
  }

  return res.status(200).json(regionsResult);
}

exports.get = get;
