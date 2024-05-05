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
  }),
  phone: Joi.string(),
  email: Joi.when('role', {
    is: Joi.valid('guardian', 'staff', 'admin'), // If role is not 'student'
    then: Joi.string().email().required(), // Email is required
    otherwise: Joi.string().email() // Email is optional
  }),
  guardians: Joi.when('role', {
    is: Joi.valid('student'), // If role is not 'student'
    then:objectIdValidator.objectId().required()
  }),
  children:  Joi.when('role', {
    is: Joi.valid('guardian'), // If role is not 'student'
    then:Joi.array().unique().items(objectIdValidator.objectId()).min(1).required()
  }),
  relationImage:  Joi.when('role', {
    is: Joi.valid('student'), // If role is not 'student'
    then:objectIdValidator.objectId().required().min(1).required()
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
  subscriptionType: objectIdValidator.objectId().required()
})