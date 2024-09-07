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
    basePrice: Joi.when('name',{
      is:"monitorsource",
      then:Joi.number().required(),
      otherwise:Joi.number().allow('')
    })
  })

export const SubscriptionValidator=Joi.object({
  name: Joi.string().required().max(30),
  features:Joi.array().unique().items(objectIdValidator.objectId()).required().min(1),
  duration: Joi.string().allow(""),
  planValidity: Joi.number().allow("").default(0),
  amount: Joi.number().positive().required(),
  description: Joi.string().required().max(300),
})

export const UpdateSubscriptionValidator=Joi.object({
  name: Joi.string().max(30),
  features:Joi.array().unique().items(objectIdValidator.objectId()).required().min(1),
  duration: Joi.string().allow(""),
  planValidity: Joi.number().positive().allow(""),
  amount: Joi.number().positive(),
  description: Joi.string().max(300),
});

export const ContractpurchasePlanValidator = Joi.object({
  quantity: Joi.number().required(),
  subscriptionType: objectIdValidator.objectId().required(),
  organizationId:objectIdValidator.objectId().required(),
}).options({ abortEarly: false });

export const createAnnouncementSchema = Joi.object({
  title: Joi.string().required().messages({}),
  content: Joi.string().required().messages({}),
});
export const updateAnnouncementSchema = Joi.object({
  title: Joi.string().allow(""),
  content: Joi.string().allow("")
});