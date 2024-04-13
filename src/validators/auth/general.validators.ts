import Joi from "joi";


export const LoginValidator=Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),

  })

  export const setPasswordValidator=Joi.object({
    password: Joi.string().min(6).required(),

  })