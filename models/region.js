'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Region extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Region.belongsToMany(models.ExchangeRequest, {
        through: 'RegionExchangeRequests',
        as: 'exchangeRequests',
        foreignKey: "region_id",
        otherKey: "exchange_request_id"
      })
    }
  };
  Region.init({
    name: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Region',
  });
  return Region;
};