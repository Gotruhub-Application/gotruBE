import Joi from "joi";


export const LoginValidator=Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fcmToken: Joi.string().allow("")

  })

  
  export const NewPasswordValidator=Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    token: Joi.string().min(4).max(4).required(),

  })

  export const BlackListedTokenValidator=Joi.object({
    token: Joi.string().required()
  })

  export const passwordValidator=Joi.object({
    password: Joi.string().min(6).required(),
  })

  export const ChangePasswordInDashboardValidator=Joi.object({
    oldPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required(),
  })