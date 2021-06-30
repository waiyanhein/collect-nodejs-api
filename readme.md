### Node version 12.0.0 was used when setting up the project

### Setting up nodejs projects
- npm init
- Then install the required npm packages mentioned below

### Packages required for basic project set up.
- npm install express --save
- npm install body-parser --save
- npm install nodemon --save -dev
- npm install dotenv --save
- npm install --save express-validator
- npm install cors --save
- npm install --save-dev jest supertest (for testing)
- npm install --save-dev jest-each // Data provider for jest test -> https://www.npmjs.com/package/jest-each
- Authentication packages
- npm install jsonwebtoken --save
- npm install bcryptjs --save
- Datbase packages
- npm install --save sequelize
- npm install --save-dev sequelize-cli
- Sending email
- npm install nodemailer --save https://stackabuse.com/how-to-send-emails-with-node-js/
- npm install nodemailer-mock --save-dev https://www.npmjs.com/package/nodemailer-mock (For mocking nodemailer)
- npm install faker --save-dev https://www.npmjs.com/package/faker
- npm install uuid --save // used to generate verification tokens -> https://www.npmjs.com/package/uuid
- npm install date-and-time --save // for manupulating date and time //https://www.npmjs.com/package/date-and-time

### Database Driver - install one of the followings
$ npm install --save pg pg-hstore # Postgres
$ npm install --save mysql2
$ npm install --save mariadb
$ npm install --save sqlite3
$ npm install --save tedious # Microsoft SQL Server

### After installing all the packages, initialize the database migrations
- https://sequelize.org/master/manual/migrations.html
-> Creating first model -> `npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string`
- Run migrations -> `npx sequelize-cli db:migrate`
- Undo migrations -> `npx sequelize-cli db:migrate:undo`
- Undo all migrations -> `npx sequelize-cli db:migrate:undo:all`
- Creating the seed -> `npx sequelize-cli seed:generate --name demo-user`
- Running all seeds -> `npx sequelize-cli db:seed:all`
- Undoing the seeds -> `npx sequelize-cli db:seed:undo`
- Undoing all the seeds -> `npx sequelize-cli db:seed:undo:all`

### Running the application locally
- npm install
- nodemon server.js

### API authentication
https://www.freecodecamp.org/news/securing-node-js-restful-apis-with-json-web-tokens-9f811a92bb52/

### Node JS and Postgres simple CRUD
https://blog.logrocket.com/nodejs-expressjs-postgresql-crud-rest-api-example/
https://medium.com/dailyjs/node-js-postgresql-tutorial-7a19d945767f

ORM for postgres -> https://sequelize.org/#:~:text=Sequelize%20is%20a%20promise%2Dbased,loading%2C%20read%20replication%20and%20more.

Postgres connection string format -> postgres://YourUserName:YourPassword@YourHostname:5432/YourDatabaseName
postgres://postgres:root@localhost:5432/collect

### Testing Jest and Sequelize and Postgres (There is a Docker compose file there)
- https://jaygould.co.uk/2020-07-28-jest-sequelize-testing-dedicated-database/

### When you are setting up the project for the first time, make sure that you initialize the config/config.json file.
- This is just for the migration to work when working locally.
```
{
  "development": {
    "username": "postgres",
    "password": "root",
    "database": "collect",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "test": {
    "username": "postgres",
    "password": "root",
    "database": "collect",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "postgres",
    "password": "root",
    "database": "collect",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
```
