const { DataSource } = require("typeorm");
const path = require('path');
const User = require('./src/entity/User');
const Organization = require('./src/entity/Organization');
require('dotenv').config();

const AppDataSource = new DataSource({
    type: process.env.TYPE,
    host: process.env.HOST,
    port: process.env.DB_PORT,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    synchronize: true,
    logging: false,
    entities: [
      User,
      Organization // Ensure all entities are listed here
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
