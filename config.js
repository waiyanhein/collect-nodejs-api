const config = {
  appEnv: process.env.NODE_ENV,
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    expiresIn: process.env.AUTH_TOKEN_EXPIRES_IN // in seconds
  },
  database: {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
    //TODO: configure more databases if you are using in the future
  }
}

module.exports = config;
