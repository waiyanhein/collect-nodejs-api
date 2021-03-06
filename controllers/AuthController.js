let validators = require('../utilities/validators.js');
let config = require('../config.js');
const authService = require('../services/authService.js');
const mailService = require('../services/mailService.js');
const userService = require('../services/userService.js');

//TODO: unset the password field from the response
//TODO: find a solution like Laravel resource.
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
    return res.status(result.code).json(result);
  }

  return res.status(200).json(result);
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

// only validate if the token is valid
const validateVerificationToken = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  let validateResult = await authService.validateVerificationToken({
    email: req.body.email,
    token: req.body.token
  });

  if (validateResult.error) {
    return res.status(validateResult.code).json(validateResult);
  } else {
    return res.status(200).json(validateResult);
  }
}

// used by both reset password and the account verification links
// verify means validate and expires the token marking it as verified if it is valid
const verifyVerificationToken = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  let validateResult = await authService.validateVerificationToken({
    email: req.body.email,
    token: req.body.token
  });

  if (validateResult.error) {
    return res.status(validateResult.code).json(validateResult);
  } else {
    let tokenUpdateResult = await authService.markVerificationTokenAsVerified(validateResult.data);
    if (tokenUpdateResult.error) {
      return res.status(tokenUpdateResult.error).json(tokenUpdateResult);
    } else {
      return res.status(200).json(validateResult);
    }
  }
}

const resetPassword = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  let resetPasswordResult = await authService.resetPassword({
    email: req.body.email,
    newPassword: req.body.password
  })

  if (resetPasswordResult.error) {
    return res.status(resetPasswordResult.code).json(resetPasswordResult);
  }

  let tokenValidationResult = await authService.validateVerificationToken({
    email: req.body.email,
    token: req.body.token
  })

  // expires the token
  if (tokenValidationResult.error) {
    return res.status(tokenValidationResult.code).json(tokenValidationResult);
  }
  let verifyResult = await authService.markVerificationTokenAsVerified(tokenValidationResult.data);

  if (verifyResult.error) {
    return res.status(verify.code).json(verifyResult);
  }

  return res.status(200).json({ error: false });
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

const verifyUserAccount = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  let validateResult = await authService.validateVerificationToken({
    email: req.body.email,
    token: req.body.token
  });

  if (validateResult.error) {
    return res.status(validateResult.code).json(validateResult);
  } else {
    let tokenUpdateResult = await authService.markVerificationTokenAsVerified(validateResult.data);
    if (tokenUpdateResult.error) {
      return res.status(tokenUpdateResult.error).json(tokenUpdateResult);
    } else {
      // mark the user account as verified
      let userResult = await userService.findUserByEmail(req.body.email);
      if (userResult.error) {
        return res.status(userResult.error).json(userResult);
      } else {
        // mark as verified.
        let updateUserResult = await userService.update({
          id: userResult.data.id,
          verifiedAt: new Date()
        })

        if (updateUserResult.error) {
          return res.status(updateUserResult.code).json(updateUserResult);
        } else {
          return res.status(200).json(validateResult);
        }
      }
    }
  }
}

exports.register = register;
exports.login = login;
exports.me = me;
exports.verifyVerificationToken =  verifyVerificationToken;
exports.validateVerificationToken = validateVerificationToken;
exports.verifyUserAccount = verifyUserAccount;
exports.resendConfirmRegistrationEmail = resendConfirmRegistrationEmail;
exports.sendResetPasswordEmail = sendResetPasswordEmail;
exports.resetPassword = resetPassword;
