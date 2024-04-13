import Joi from "joi";
import mongoose  from 'mongoose';


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

export const OrgRegistrationValidation = Joi.object({
  website: Joi.string(),
  email: Joi.string().email().required(),
  phone: Joi.string(),
  yearOfEstablishment: Joi.string(),
  referalCode: Joi.string(),
  nameOfEstablishment: Joi.string(),
  nameOfProprietor: Joi.string(),
  businessAddress: Joi.string(),
  personalAddress: Joi.string(),
  opLicenceImage: objectIdValidator.objectId(),
  cacImage: objectIdValidator.objectId(),
  // password: Joi.string().min(6).required(),
  state: Joi.string(),
  lga: Joi.string(),
  govtlevel: Joi.string().valid("federal", "state", "local_government"),
  agency: Joi.string(),
  bizType: Joi.string().valid("registered_organization", "personal_business", "government_licensed_institution"),
  });

  export const orgEmailVerificationValidator=Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().min(6).max(6).required(),

  })
  export const resentTokenValidator=Joi.object({
    email: Joi.string().email().required(),
  })