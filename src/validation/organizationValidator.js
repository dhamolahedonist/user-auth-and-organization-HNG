const Joi = require('joi');

const organizationSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Name is required',
        'string.empty': 'First name cannot be empty'
    }),
    description: Joi.string().required().messages({
        'any.required': 'description is required',
        'string.empty': 'Last name cannot be empty'
    }),
});

module.exports = organizationSchema;
