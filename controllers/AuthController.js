let validators = require('../utilities/validators.js');
let config = require('../config.js');
const authService = require('../services/authService.js');
const mailService = require('../services/mailService.js');
const userService = require('../services/userService.js');

const register = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  let result = await authService.register(req.body);
  if (result.error) {
    res.status(500).json(result);
  } else {
    // generate the account verification link
    let verificationLinkResult = await authService.generateAccountVerificationLink(result.data);
    if (! verificationLinkResult.error) {
        await mailService.sendConfirmRegistration(result.data, verificationLinkResult.data.link);
    }

    res.status(200).json(result);
  }
}

const login = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  let result = await authService.login(req.body);
  if (result.error) {
    res.status(result.code).json(result);
  }

  res.status(200).json(result);
}

const me = (req, res) => {
  if (! req.auth.access_token) {
    return res.status(401).json({
      error: true,
      message: "Access token is missing."
    })
  }

  authService.me(req.auth.access_token)
  .then(result => {
    if (result.error) {
      res.status(result.code).json(result)
    } else {
      res.status(200).json(result);
    }
  })
}

// used by both reset password and the account verification links
const verifyVerificationToken = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  let result = await authService.verifyVerificationToken({
    email: req.body.email,
    token: req.body.token
  });

  if (result.error) {
    return res.status(result.code).json(result);
  } else {
    return res.status(200).json(result);
  }
}

const resetPassword = (req, res) => {
  // verify the token here too
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  return res.status(200).json({
    error: false
  })
}

const sendResetPasswordEmail = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  let userResult = await userService.findUserByEmail(req.body.email);

  if (userResult.error) {
    return res.status(userResult.code).json(userResult);
  }

  let passwordResetLinkResult = await authService.generateResetPasswordLink(userResult.data);
  if (passwordResetLinkResult.error) {
    return res.status(passwordResetLinkResult.status).json(passwordResetLinkResult);
  }

  await mailService.sendResetPassword(userResult.data, passwordResetLinkResult.data.link);

  return res.status(200).json({
    error: false
  })
}

const resendConfirmRegistrationEmail = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  // checking if the user accout exists by email is already done by the validation
  let userResult = await userService.findUserByEmail(req.body.email);

  if (userResult.error) {
      return res.status(userResult.code).json(userResult);
  }

  let verificationLinkResult = await authService.generateAccountVerificationLink(userResult.data);
  if (verificationLinkResult.error) {
      return res.status(verificationLinkResult.status).json(verificationLinkResult);
  }

  await mailService.sendConfirmRegistration(userResult.data, verificationLinkResult.data.link);

  return res.status(200).json({
    error: false
  })
}

exports.register = register;
exports.login = login;
exports.me = me;
exports.verifyVerificationToken =  verifyVerificationToken;
exports.resendConfirmRegistrationEmail = resendConfirmRegistrationEmail;
exports.sendResetPasswordEmail = sendResetPasswordEmail;
exports.resetPassword = resetPassword;
