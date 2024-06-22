import Joi from 'joi';

export const adminUserSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } }) // Allows email without checking top-level domains
      .required(),
    
    fullname: Joi.string()
      .min(3)
      .max(30)
      .required(),
    
    password: Joi.string()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,30}$')) // At least one uppercase, one lowercase, one number, one special char, 8-30 chars
      .required()
      .messages({
        'string.pattern.base': 'Password must be 8-30 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
      }),
  });
  