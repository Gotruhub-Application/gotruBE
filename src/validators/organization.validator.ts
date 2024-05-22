import Joi from "joi"
import mongoose  from 'mongoose';
import { objectIdValidator } from "./auth/organizations";
import { Organization } from "../models/organization.models";

export const unitValidator=Joi.object({
    name: Joi.string().required(),
  })

export const SubUnitValidator=Joi.object({
  name: Joi.string().required(),
  unit: objectIdValidator.objectId().required(),
})

export const orgStudentValidator = Joi.object({
  fullName: Joi.string().required().max(30),
  regNum: Joi.string().required().max(20),
  guardians: Joi.array().unique().items(objectIdValidator.objectId()).min(1),
  piviotUnit: objectIdValidator.objectId().required(),
  subUnit:objectIdValidator.objectId().required(),
  profileImage: objectIdValidator.objectId(),
}).options({ abortEarly: false });


export const orgUserValidator = Joi.object({
  fullName: Joi.string().required().max(30),
  regNum: Joi.string().when('role', { // Apply validation when role is 'student'
    is: 'student',
    then: Joi.string().required().max(20),
    otherwise: Joi.string().max(20) // Not required if role is not 'student'
  }).allow(""),
  phone: Joi.string().allow(""),
  email: Joi.when('role', {
    is: Joi.valid('guardian', 'staff', 'admin'), // If role is not 'student'
    then: Joi.string().email().required(), // Email is required
    otherwise: Joi.string().email() // Email is optional
  }).allow(""),
  guardians: Joi.when('role', {
    is: Joi.valid('student'), // If role is not 'student'
    then:objectIdValidator.objectId(),
    otherwise: Joi.optional()
  }).allow(""),
  children:  Joi.when('role', {
    is: Joi.valid('guardian'), // If role is not 'student'
    then:Joi.array().unique().items(objectIdValidator.objectId()).min(1),
    otherwise: Joi.optional()
  }).allow(""),
  relationImage:  Joi.when('role', {
    is: Joi.valid('student'), // If role is not 'student'
    then:objectIdValidator.objectId().required().min(1).required(),
    otherwise: Joi.optional()
  }).allow(""),
  piviotUnit: Joi.when('role', { // Apply validation when role is 'student'
    is: 'student',
    then: objectIdValidator.objectId().required(),
    otherwise: Joi.optional() // Not required if role is not 'student'
  }).allow(""),
  subUnit: objectIdValidator.objectId().allow(""),
  profileImage: objectIdValidator.objectId().required(),
  signature: Joi.when('role', { // Apply validation when role is 'guardian'
    is: 'guardian',
    then: Joi.required(),
    otherwise: Joi.optional() // Not required if role is not 'guardian'
  }).allow(""),
  appPermissions: Joi.when('role',{
    is:"staff",
    then:Joi.array().unique().items(Joi.string().valid('pass', 'trade', 'monitor')).required().min(1),
    otherwise: Joi.optional()
  }),
  role: Joi.string().valid('student', 'guardian', 'staff', 'admin').required()
}).options({ abortEarly: false });

export const orgUpdateUserValidator = Joi.object({
  fullName: Joi.string().required().max(30),
  phone: Joi.string(),
  guardians: objectIdValidator.objectId(),
  children:  Joi.when('role', {
    is: Joi.valid('guardian'), // If role is not 'student'
    then:Joi.array().unique().items(objectIdValidator.objectId()).min(1).required()
  }),
  relationImage:  Joi.when('role', {
    is: Joi.valid('guardian'), // If role is not 'student'
    then:objectIdValidator.objectId().required()
  }),
  piviotUnit: objectIdValidator.objectId().when('role', { // Apply validation when role is 'student'
    is: 'student',
    then: Joi.required(),
    otherwise: Joi.optional() // Not required if role is not 'student'
  }),
  subUnit: objectIdValidator.objectId(),
  profileImage: objectIdValidator.objectId().required(),
  signature: Joi.when('role', { // Apply validation when role is 'guardian'
    is: 'guardian',
    then: Joi.required(),
    otherwise: Joi.optional() // Not required if role is not 'guardian'
  }),
  role: Joi.string().valid('student', 'guardian', 'staff', 'admin').required()
}).options({ abortEarly: false });

export const purchasePlanValidator = Joi.object({
  quantity: Joi.number().required(),
  subscriptionType: objectIdValidator.objectId().required(),
}).options({ abortEarly: false });

export const sendUsersTokenValidator = Joi.object({
  users: Joi.array().unique().items(objectIdValidator.objectId()).min(1).max(10),
  plan: objectIdValidator.objectId().required(),
})

export const signInOutRecordValidator = Joi.object({
  user:  objectIdValidator.objectId(),
  authorizedFor: Joi.array().items(objectIdValidator.objectId()).min(1),
  guardians: objectIdValidator.objectId().required(),
  coordinate: Joi.array().items(Joi.string()).required().max(2).min(2), 
  approvalBy: objectIdValidator.objectId().required(),
  other: Joi.when('authorizationType',{
    is:"other",
    then: objectIdValidator.objectId().required(),
    otherwise: Joi.optional()
  }),
  authorizationType: Joi.string().valid('guardian', 'other', 'admin').required(),
  scannedBy: objectIdValidator.objectId().required(),
  scannedUser: objectIdValidator.objectId().required(),
  actionType:Joi.string().valid("sign_in","sign_out").required()
}).options({ abortEarly: false });

export const useAppTokenValidator = Joi.object({
  child: objectIdValidator.objectId().required(),
  token: Joi.string().required(),
  // subscriptionType: objectIdValidator.objectId().required()
})

export const subaccountJoiSchema = Joi.object({
  business_name: Joi.string().required(),
  settlement_bank: Joi.string().required(),
  account_number: Joi.string().required(),
  // percentage_charge: Joi.number().min(0).max(100).required(),
  description: Joi.string().required(),
  primary_contact_email: Joi.string().email().required(),
  primary_contact_name: Joi.string().required(),
  primary_contact_phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Primary contact phone number must be a valid international phone number.',
      'any.required': 'Primary contact phone number is required.',
    }),
  // metadata: Joi.string().optional(),
  // organization: Joi.string().required(), // Assuming organization is a string representing ObjectId
});


export const UnpdatesubaccountJoiSchema = Joi.object({
  business_name: Joi.string().optional(),
  settlement_bank: Joi.string().optional(),
  account_number: Joi.string().optional(),
  description: Joi.string().optional(),
  primary_contact_email: Joi.string().email().optional(),
  primary_contact_name: Joi.string().optional(),
  primary_contact_phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Primary contact phone number must be a valid international phone number.',
      'any.required': 'Primary contact phone number is required.',
    }),

});