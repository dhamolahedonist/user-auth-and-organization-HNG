const express = require('express');
const AppDataSource = require('./data-source');
const { createUser, loginUser } = require('./src/controllers/userController');
require('dotenv').config();

const app = express();
app.use(express.json());

AppDataSource.initialize().then(() => {
  console.log('Connected to the database');

  app.post('/auth/register', createUser);
  app.post('/auth/login', loginUser);

  const port = 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(error => console.log('Error connecting to the database:', error));
