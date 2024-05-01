import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger"; 
import { failedResponse, successResponse } from "../../support/http";
import { BlackListedTokenValidator } from "../../validators/auth/general.validators";
import { BlackListedToken } from "../../models/general.models";
import crypto from "crypto"
import { sendTemplateMail, sentMail } from "../../support/helpers";


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
        await sendTemplateMail("nwaforglory6@gmail.com","paystack webhook","templates/paystack.html",event)
        // Do something with event  
        res.send(200);
    }
    const event = req.body;
    return failedResponse (res, 400, ".")
  }