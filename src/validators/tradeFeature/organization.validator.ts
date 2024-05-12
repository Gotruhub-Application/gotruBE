import Joi from 'joi';
import { objectIdValidator } from '../auth/organizations';

// Joi schema for category creation
export const createCategorySchema = Joi.object({
  name: Joi.string().required(),
  image: objectIdValidator.objectId().allow(""),
});

// Joi schema for product creation
export const createProductSchema = Joi.object({
  productCoverImage: objectIdValidator.objectId().required(),
  uploadedBy: objectIdValidator.objectId().required(),
  colors: Joi.array().unique().items(Joi.string()).allow(""),
  price: Joi.number().required(),
  quantity: Joi.number().required(),
  size: Joi.array().unique().items(Joi.string()).allow(""),
  category: objectIdValidator.objectId().required(),
  productName: Joi.string().required(),
  description: Joi.string().required(),
  flavor: Joi.array().unique().items(Joi.string()).allow(""),
  minimumQuantity: Joi.number().required(),
});

// Joi schema for product update
export const updateProductSchema = Joi.object({
  productCoverImage: objectIdValidator.objectId(),
  uploadedBy: objectIdValidator.objectId(),
  colors: Joi.array().unique().items(Joi.string()),
  price: Joi.number(),
  quantity: Joi.number(),
  size: Joi.array().items(Joi.string()),
  category: objectIdValidator.objectId(),
  productName: Joi.string(),
  description: Joi.string(),
  flavor: Joi.array().items(Joi.string()),
  minimumQuantity: Joi.number(),
});
