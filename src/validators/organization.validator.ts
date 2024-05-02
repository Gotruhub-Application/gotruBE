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


// export const orgUserValidator = Joi.object({
//   fullName: Joi.string().required().max(30),
//   regNum: Joi.string().max(20),
//   phone: Joi.string(),
//   email: Joi.string().email(),
//   password: Joi.string()
//   .min(8) // Minimum length of 8 characters
//   .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
//   .message('Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'),
//   guardians: Joi.array().unique().items(objectIdValidator.objectId()).min(1),
//   piviotUnit: objectIdValidator.objectId(),
//   subUnit:objectIdValidator.objectId(),
//   profileImage: objectIdValidator.objectId(),
//   signature: objectIdValidator.objectId(),
//   role: Joi.string().valid('student', 'guardian', 'staff', 'admin').required()
// }).options({ abortEarly: false });

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
  guardians: Joi.array().unique().items(objectIdValidator.objectId()).min(1),
  children:  Joi.when('role', {
    is: Joi.valid('guardian'), // If role is not 'student'
    then:Joi.array().unique().items(objectIdValidator.objectId()).min(1).required()
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
  guardians: Joi.array().unique().items(objectIdValidator.objectId()).min(1),
  children:  Joi.when('role', {
    is: Joi.valid('guardian'), // If role is not 'student'
    then:Joi.array().unique().items(objectIdValidator.objectId()).min(1).required()
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