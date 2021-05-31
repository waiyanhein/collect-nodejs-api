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
- Datbase packages
- npm install --save sequelize

### Database Driver - install one of the followings
$ npm install --save pg pg-hstore # Postgres
$ npm install --save mysql2
$ npm install --save mariadb
$ npm install --save sqlite3
$ npm install --save tedious # Microsoft SQL Server

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
