import Joi from 'joi';
import { objectIdValidator } from '../../../validators/auth/organizations';

export const adminSignInOutMessage = Joi.object({
    parentId: objectIdValidator.objectId().required(),
    adminSenderId: objectIdValidator.objectId().required(),
    childrenArray:Joi.array().items(objectIdValidator.objectId()).unique().required().min(1),
    actionType:Joi.string().valid("signin","signout"),
    customPayload: Joi.any()  // This allows any data type

})