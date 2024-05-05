import Joi from 'joi';
import { objectIdValidator } from '../../../validators/auth/organizations';

export const parentSignInOutResponseValidator = Joi.object({
    parentId: objectIdValidator.objectId().required(),
    adminSenderId: objectIdValidator.objectId().required(),
    childrenArray:Joi.array().items(objectIdValidator.objectId()).unique().required().min(1),
    action:Joi.string().valid("approve","decline")
})