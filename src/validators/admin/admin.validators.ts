import Joi from "joi";
import mongoose  from 'mongoose';
import { features } from "process";

const objectIdValidator =Joi.extend((Joi)=>({
    type: 'objectId',
    base: Joi.string(),
    messages: {
      'objectId.invalid': 'objectId should be a valid id',
    },
    validate(value, helpers) {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return { value, errors: helpers.error('objectId.invalid') };
      }
    },
  }))

export const FeatureValidator=Joi.object({
    name: Joi.string().required(),
  })

export const SubscriptionValidator=Joi.object({
  name: Joi.string().required().max(30),
  features:Joi.array().unique().items(objectIdValidator.objectId()).required().min(1),
  duration: Joi.string().required(),
  planValidity: Joi.number().positive().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().required().max(300),
})

export const UpdateSubscriptionValidator=Joi.object({
  name: Joi.string().max(30),
  features:Joi.array().unique().items(objectIdValidator.objectId()).required().min(1),
  duration: Joi.string(),
  planValidity: Joi.number().positive(),
  amount: Joi.number().positive(),
  description: Joi.string().max(300),
})
