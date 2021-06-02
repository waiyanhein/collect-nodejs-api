let models = require('../models');
const { Op } = require("sequelize");
let User = models.User;

const create = async (data) => {
  try {
    let user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password
    })

    return {
      error: false,
      data: user
    }
  } catch (e) {
    return {
      error: true,
      code: 500,
      message: e.message
    }
  }
}

const findUserByEmail = async (email) => {
  try {
    let user = await User.findOne({
      where: {
        email: {
          [Op.eq]: email
        }
      }
    })

    if (user) {
      return {
        error: false,
        data: user
      }
    } else {
      return {
        error: true,
        data: null,
        message: "User not found",
        code: 404
      }
    }
  } catch (e) {
    return {
      error: true,
      message: e.message,
      code: 500
    }
  }
}

const update = async (data) => {

}

exports.create = create;
exports.findUserByEmail = findUserByEmail;
exports.update = update;
