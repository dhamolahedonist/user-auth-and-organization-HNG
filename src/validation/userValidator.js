const Joi = require('joi');

const userSchema = Joi.object({
    firstName: Joi.string().required().messages({
        'any.required': 'First name is required',
        'string.empty': 'First name cannot be empty'
    }),
    lastName: Joi.string().required().messages({
        'any.required': 'Last name is required',
        'string.empty': 'Last name cannot be empty'
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.empty': 'Email cannot be empty',
        'string.email': 'Email must be a valid email address'
    }),
    password: Joi.string().min(5).required().messages({
        'any.required': 'Password is required',
        'string.empty': 'Password cannot be empty'
    }),
    phone: Joi.string().pattern(/^\d+$/).optional().messages({
        'string.pattern.base': 'Phone number must contain only numbers'
    })
});

module.exports = userSchema;
