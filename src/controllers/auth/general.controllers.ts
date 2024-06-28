import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger"; 
import { failedResponse, successResponse } from "../../support/http";
import { BlackListedTokenValidator } from "../../validators/auth/general.validators";
import { BlackListedToken } from "../../models/general.models";
import crypto from "crypto"
import { sendTemplateMail, sentMail } from "../../support/helpers";
import { Plan, WalletModel, WalletTransactionModel } from "../../models/organization.models";
import { pl } from "@faker-js/faker";
import { SubUnitCourseModel } from "../../models/organziation/monitorFeature.models";


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
        console.log(plans, "plansssss")
        for (const plan of plans){
            if(plan.custom_fields.type == "wallet"){

                const wallet = await WalletModel.findOneAndUpdate(
                    { user: plan.cart_id },
                    { $inc: { balance: event.data.amount/100 } },
                    { new: true }
                );
                if (wallet){
                    await WalletTransactionModel.create({
                        wallet: wallet._id,
                        user:wallet.user,
                        type:"credit",
                        amount:(event.data.amount/100),
                      });
                }
                

                const context ={
                    date:new Date(event.data.paid_at).toLocaleDateString(),
                    email:event.data.customer.email,
                    amount: event.data.amount/100,
                }
        
                await sendTemplateMail(event.data.customer.email,"Wallet fund successful","templates/paystack.html",context)

            }else if(plan.custom_fields.type == "subUnitCourses"){
                console.log(plan.cart_id, "xyzzzz")
                await SubUnitCourseModel.findByIdAndUpdate(plan.cart_id,{$set:{paid:true}})
                const context ={
                    date:new Date(event.data.paid_at).toLocaleDateString(),
                    email:event.data.customer.email,
                    amount: event.data.amount/100,
                }
        
                await sendTemplateMail(event.data.customer.email,"Course registraion payment successful","templates/paystack.html",context)
            }else{
                // console.log(plan, "sadbasdbsa")
                await Plan.findByIdAndUpdate(plan.custom_fields._id,{$set:{paidStatus:true}})
                const context ={
                    date:new Date(event.data.paid_at).toLocaleDateString(),
                    email:event.data.customer.email,
                    amount: event.data.amount/100,
                }
        
                await sendTemplateMail(event.data.customer.email,"Subscription payment successful","templates/paystack.html",context)
            }
            
        }

        
        // Do something with event  
        return successResponse(res, 200, "Success")
    }
    return failedResponse (res, 400, ".")
  }