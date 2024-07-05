// controllers/userController.js
const { Repository } = require('typeorm');
const UserSchema = require('../entity/User');
const userValidationSchema = require('../validation/userValidator');
const AppDataSource = require('../../data-source');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

const createUser = async (req, res) => {
  const { error } = userValidationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.context.key,
      message: detail.message
    }));
    return res.status(422).json({ errors: validationErrors });
  }

  const { firstName, lastName, email, password, phone } = req.body;

  try {
    // Initialize the data source and repository
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const userRepository = new Repository(UserSchema, AppDataSource.manager);

    // Check if email already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json({
          status: 'Bad request',
          message: 'Registration unsuccessful',
          statusCode: 400,
          errors: [{ field: 'email', message: 'Email already exists. Please use a different email.' }]
        });
      }
    const hashedPassword = await bcrypt.hash(password, 10); 

    // Create and save new user
    const user = userRepository.create({ firstName, lastName, email, password: hashedPassword, phone });
    await userRepository.save(user);

     // Generate JWT token
     const accessToken = jwt.sign({ userId: user.userId, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1h' // Token expiration time
      });
      const responseData = {
        status: 'success',
        message: 'Registration successful',
        data: {
          accessToken,
          user: {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
          }
        }
      };

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ errors: { server: 'Internal server error' } });
  }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Initialize the data source and repository
      if (!AppDataSource.isInitialized) await AppDataSource.initialize();
      const userRepository = new Repository(UserSchema, AppDataSource.manager);
  
      // Check if user with provided email exists
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          status: 'Bad Request',
          message: 'Authentication failed'
        });
      }
  
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'Unauthorized',
          message: 'Login failed. Invalid credentials.'
        });
      }
  
      // Generate JWT token
      const accessToken = jwt.sign({ userId: user.userId, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1h' // Token expiration time
      });
  
      // Prepare success response object
      const responseData = {
        status: 'success',
        message: 'Login successful',
        data: {
          accessToken,
          user: {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
          }
        }
      };
  
      res.json(responseData);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 'Internal server error', statusCode: 500 });
    }
  };
  

module.exports = {
  createUser,
  loginUser
};
