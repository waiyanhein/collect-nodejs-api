let validators = require('../utilities/validators.js');
let exchangeRequestService = require('../services/exchangeRequestService.js');

const create = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  let createResult = await exchangeRequestService.create(req.body);

  if (createResult.error) {
    return res.status(createResult.code).json(createResult);
  }

  return res.status(200).json(createResult);
}

const update = async (req, res) => {

}

const search = async (req, res) => {

}

const find = async (req, res) => {

}

const deleteExchangeRequest = async (req, res) => {

}

exports.create = create;
