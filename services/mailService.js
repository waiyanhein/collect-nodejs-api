const nodemailer = require('nodemailer');
const config = require('../config.js');

// if the service is present, host and port are not used.
let transportData = {
    auth: {
       user: config.mail.address,
       pass: config.mail.password
    }
}
if (config.mail.service) {
    transportData.service = config.mail.service;
} else {
    transportData.host = config.mail.host;
    transportData.port = config.mail.port;
}
let transport = nodemailer.createTransport(transportData);

// this is the underlying function to send email and is used by other functions for sending email
const sendMail = async ({
  to,
  subject,
  body
}) => {
  const message = {
    from: config.mail.address, // Sender address
    to: to,         // List of recipients
    subject: subject, // Subject line
    text: body // Plain text body
  };

  return new Promise(function(resolve, reject) {
    transport.sendMail(message, function(err, info) {
      if (err) {
        console.log(err)

        reject({
          error: true,
          message: err.message
        })
      } else {
        console.log(info);

        resolve({
          error: false
        })
      }
    });
  });
}

const sendConfirmRegistration = async (user) => {
  try {
    await sendMail({
      to: user.email,
      subject: `Welcome to ${config.appName}`,
      body: `Welcome to ${config.appName}. Your registration has been successful. Please, confirm your account clicking on the link below.`
    })

    return {
      error: false
    }
  } catch (e) {
    //TOOD: send error to sentry
    console.log(e);
    return {
      code: 500,
      error: true,
      message: e.message
    }
  }
}

exports.sendConfirmRegistration = sendConfirmRegistration;
