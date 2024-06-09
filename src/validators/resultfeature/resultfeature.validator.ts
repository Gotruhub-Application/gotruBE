import Joi from 'joi';

// Define the Joi schema for IResult
export const ResultSchema = Joi.object({
    user: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': 'user must be a valid ObjectId',
        'any.required': 'user is a required field'
    }),
    term: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': 'term must be a valid ObjectId',
        'any.required': 'term is a required field'
    }),
    file: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': 'file must be a valid ObjectId',
        'any.required': 'file is a required field'
    })
});

