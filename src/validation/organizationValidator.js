const Joi = require("joi");

const organizationSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
  }),
  description: Joi.string().required().messages({
    "any.required": "description is required",
    "string.empty": "description cannot be empty",
  }),
});

module.exports = organizationSchema;
