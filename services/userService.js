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

// only the fields supplied to the data will be updated.
const update = async (data) => {
  try {
    let id = data.id;
    delete data.id;

    await User.update(data, {
      where: {
        id: {
          [Op.eq]: id
        }
      }
    })

    return {
      error: false
    }
  } catch (e) {
    return {
      error: true,
      message: e.message,
      code: 500
    }
  }
}

exports.create = create;
exports.findUserByEmail = findUserByEmail;
exports.update = update;
