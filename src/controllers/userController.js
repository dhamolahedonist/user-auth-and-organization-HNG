// controllers/userController.js
const { Repository } = require('typeorm');
const UserSchema = require('../entity/User');
const userValidationSchema = require('../validation/userValidator');
const AppDataSource = require('../../data-source');

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
        return res.status(422).json({ errors: [{ field: 'email', message: 'Email already exists. Please use a different email.' }] });
    }

    // Create and save new user
    const user = userRepository.create({ firstName, lastName, email, password, phone });
    await userRepository.save(user);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ errors: { server: 'Internal server error' } });
  }
};

module.exports = {
  createUser,
};
