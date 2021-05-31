const config = {
  appEnv: process.env.APP_ENV,
  database: {
    postgres: {
      connectionString: process.env.DB_CONNECTION_STRING
    }
    //TODO: configure more databases if you are using in the future
  }
}

exports.config = config;
