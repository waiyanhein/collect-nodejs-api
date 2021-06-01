const isTest = process.env.JEST_WORKER_ID;

const config = {
  appName: process.env.APP_NAME,
  appEnv: (isTest)? "test": process.env.NODE_ENV, // if there is jest worker id, no matter what env is set, it will always be test.
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    expiresIn: process.env.AUTH_TOKEN_EXPIRES_IN // in seconds
  },
  database: {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    name: (isTest)? process.env.DB_TEST_NAME: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
    //TODO: configure more databases if you are using in the future
  },
  mail: {
    address: process.env.MAIL_ADDRESS,
    password: process.env.MAIL_PASSWORD,
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    service: process.env.MAIL_SERVICE
  }
}

module.exports = config;
