// controllers/userController.js
const { Repository } = require('typeorm');
const UserSchema = require('../entity/User');
const userValidationSchema = require('../validation/userValidator');
const AppDataSource = require('../../data-source');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const OrganizationSchema = require('../entity/Organization');
const userSchema = require('../validation/userValidator');

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
      const userRepository = AppDataSource.getRepository('User');
      const organizationRepository = AppDataSource.getRepository('Organization');
  
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
  
      // Create default organization for the user
      const orgName = `${firstName}'s Organisation`;
      const organization = organizationRepository.create({ name: orgName, description: `Default organization for ${firstName}` });
      await organizationRepository.save(organization);
  
      // Create and save new user with the organization reference
      const user = userRepository.create({ 
        firstName, 
        lastName, 
        email, 
        password: hashedPassword, 
        phone,
        organization: organization  // Linking the user to the organization
      });
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
  
      // Check if user with provided email exists=
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
  const getUserById = async (req, res) => {
    const userId = req.params.id;
  
    // Ensure the user can only access their own record
    if (req.user.userId !== userId) {
      return res.status(403).json({
        status: 'Forbidden',
        message: 'Access denied',
      });
    }
  
    try {
      // Initialize the data source if it's not already initialized
      if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  
      const userRepository = AppDataSource.getRepository(UserSchema);
  
      // Find the user by ID
      const user = await userRepository.findOne({ where: { userId } });
  
      if (!user) {
        return res.status(404).json({
          status: 'Not Found',
          message: 'User not found',
          statusCode: 404,
        });
      }
  
      // Return the user data (excluding the password for security reasons)
      const { password, ...userWithoutPassword } = user;
  
      const responseData = {
        status: 'success',
        message: 'User retrieved successfully',
        data: {
          userId: userWithoutPassword.userId,
          firstName: userWithoutPassword.firstName,
          lastName: userWithoutPassword.lastName,
          email: userWithoutPassword.email,
          phone: userWithoutPassword.phone
        }
      };
  
      res.status(200).json(responseData);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };
  

module.exports = {
  createUser,
  loginUser,
  getUserById
};
