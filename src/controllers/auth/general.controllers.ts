import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger"; 
import { failedResponse, successResponse } from "../../support/http";
import { BlackListedTokenValidator } from "../../validators/auth/general.validators";
import { BlackListedToken } from "../../models/general.models";
import crypto from "crypto"
import { sendTemplateMail, sentMail } from "../../support/helpers";
import { Plan } from "../../models/organization.models";
import { pl } from "@faker-js/faker";


const secret:any = process.env.PAYSTACK_SECRET_KEY;

export const logout = async(req:Request, res:Response)=>{
    try {
        const { error, value } = BlackListedTokenValidator.validate(req.body);
        if (error) {
            return failedResponse (res, 400, `${error.details[0].message}`)
        }
        
        // check if the token has been blacklistedAlready
        const isBlackListed = await BlackListedToken.findOne(value)
        if (isBlackListed){
            return failedResponse (res, 400, "Token cannot be blacklisted twice")
        }
        await BlackListedToken.create(value)

        return failedResponse (res, 400, "Logout successful.")
      
    } catch (error:any) {
      logger.error(`Error in OrganizationUpdateProfile at line ${error.lineNumber}: ${error.message}\n${error.stack}`);
        return failedResponse(res, 500, error.message);
    }
  }

export const paystackWebhook = async(req:Request, res:Response)=>{
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash == req.headers['x-paystack-signature']) {
        // Retrieve the request's body
        const event = req.body;
        const plans = event.data.metadata
        for (const plan of plans){
            await Plan.findByIdAndUpdate(plan.custom_fields._id,{$set:{paidStatus:true}})
        }

        const context ={
            date:new Date(event.data.paid_at).toLocaleDateString(),
            email:event.data.customer.email,
            amount: event.data.amount,
        }

        await sendTemplateMail(event.data.customer.email,"Subscription payment successful","templates/paystack.html",context)
        // Do something with event  
        return successResponse(res, 200, "Success")
    }
    return failedResponse (res, 400, ".")
  }