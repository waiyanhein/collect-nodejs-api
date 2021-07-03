'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExchangeRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ExchangeRequest.belongsToMany(models.Region, {
        through: 'RegionExchangeRequests',
        as: 'regions',
        foreignKey: 'exchange_request_id',
        otherKey: "region_id"
      })

      ExchangeRequest.belongsTo(models.User, { foreignKey: 'userId', as: 'user', onDelete: 'cascade' });
    }
  };
  ExchangeRequest.init({
    exchange_rate: DataTypes.DECIMAL,
    currency: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
    buy_or_sell: DataTypes.INTEGER,
    note: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ExchangeRequest',
  });
  return ExchangeRequest;
};
