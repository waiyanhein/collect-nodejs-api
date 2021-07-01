'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RegionExchangeRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  RegionExchangeRequest.init({
    id: DataTypes.INTEGER,
    region_id: DataTypes.INTEGER,
    exchange_request_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'RegionExchangeRequest',
  });
  return RegionExchangeRequest;
};
