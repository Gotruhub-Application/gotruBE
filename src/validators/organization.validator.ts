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
