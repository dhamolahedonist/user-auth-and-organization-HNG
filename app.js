const express = require('express');
const AppDataSource = require('./data-source');
const { createUser, loginUser, getUserById } = require('./src/controllers/userController');
const authMiddleware = require('./src/middleware/authMiddleware');
const { getOrganizations, getOrganisationById } = require('./src/controllers/organizationController');
require('dotenv').config();

const app = express();
app.use(express.json());

AppDataSource.initialize().then(() => {
  console.log('Connected to the database');

  app.post('/auth/register', createUser);
  app.post('/auth/login', loginUser);
  app.get('/api/users/:id',authMiddleware, getUserById)
  app.get('/api/organisations',authMiddleware, getOrganizations)
  app.get('/api/organisations/:orgId',authMiddleware, getOrganisationById)

  const port = 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(error => console.log('Error connecting to the database:', error));
