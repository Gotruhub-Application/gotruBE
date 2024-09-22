import Joi from 'joi';

export const notificationSettingsSchema = Joi.object({
  gotrupassAlerts: Joi.object({
    signIn: Joi.boolean(),
    signOut: Joi.boolean()
  }),
  gotrumonitorAlerts: Joi.object({
    signIn: Joi.boolean(),
    signOut: Joi.boolean()
  }),
  gotruAlerts: Joi.object({
    credit: Joi.boolean(),
    debit: Joi.boolean()
  })
});

