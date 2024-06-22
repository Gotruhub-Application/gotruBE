import Joi from "joi"

export const UpdateWalletPinSchema = Joi.object({
    newPin: Joi.string().required().max(4).min(4),
    oldPin: Joi.string().required().max(4).min(4),
});

export const fundWalletSchema = Joi.object({
    amount: Joi.number().required(),
})

export const UpdateWithdrawalAccount = Joi.object({
    bankName: Joi.string().required().max(20).min(4),
    accountNum: Joi.string().required().max(20).min(10),
    accountName: Joi.string().required().max(50)
});

export const createWithdrawalRequestSchema = Joi.object({
    amount: Joi.number().positive().required(),
});
