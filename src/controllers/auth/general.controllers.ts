import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger"; 
import { failedResponse, successResponse } from "../../support/http";
import { BlackListedTokenValidator } from "../../validators/auth/general.validators";
import { BlackListedToken } from "../../models/general.models";




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