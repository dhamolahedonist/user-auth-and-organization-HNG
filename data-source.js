const { DataSource } = require("typeorm");
const path = require('path');
const User = require('./src/entity/User');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: process.env.TYPE,
  host: process.env.HOST,
  port: process.env.PORT,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  synchronize: true,
  logging: false,
  entities: [
    User
  ],
  migrations: [
    path.join(__dirname, '../migration/**/*.js')
  ],
  subscribers: [
    path.join(__dirname, '../subscriber/**/*.js')
  ],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

module.exports = AppDataSource;
