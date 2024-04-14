import Joi from "joi";


export const LoginValidator=Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),

  })

  
  export const NewPasswordValidator=Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    token: Joi.string().min(6).max(6).required(),

  })