
import { AdminUser } from '../../models/admin.models'; 
import { adminUserSchema } from '../../validators/auth/admin'; 
import { Request, Response, NextFunction } from "express";
import { failedResponse, successResponse } from "../../support/http";
import { IAdminUser } from '../../interfaces/admin.interface';
import { OtpToken, ValidateToken, verifyToken, writeErrosToLogs } from '../../support/helpers';
import { orgEmailVerificationValidator, resentTokenValidator } from '../../validators/auth/organizations';
import { LoginValidator, NewPasswordValidator } from '../../validators/auth/general.validators';
import { generateJwtToken } from '../../support/generateTokens';
import bcrypt from "bcrypt"

export class AdminAuth {
    static async createAdminUser(req:Request, res:Response){

        const { error, value } = adminUserSchema.validate(req.body);
        if (error) {
            return failedResponse(res, 400, `${error.details[0].message}`);
        }
        // email exist;
        const emailEXists = await AdminUser.findOne({email:value.email})
        if (emailEXists) return failedResponse(res, 400, "email already exists")
        const newUser: IAdminUser = new AdminUser(value);
      
        try {
            await newUser.save();
            const response = {email:newUser.email, fullname: newUser.fullname, isAdmin:newUser.isAdmin}
            const access_token: string = generateJwtToken({ id: newUser._id, isAdmin: newUser.isAdmin, email:newUser.email});
            return successResponse(res, 201, "Success", { access_token, response });
        } catch (error:any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while retrieving the subaccount.");
        }
    };

    static async login(req: Request, res: Response, next: NextFunction){
        try {
            const { error, value } = LoginValidator.validate(req.body);
            if (error) {
                return failedResponse(res, 400, `${error.details[0].message}`);
            }
      
            const userExist = await AdminUser.findOne({ email: value.email }).lean();
            if (!userExist) {
                return failedResponse(res, 404, "Email does not exist.");
            };
          
      
            const isValidPassword = await bcrypt.compare(value.password, userExist.password);
            if (!isValidPassword) {
                return failedResponse(res, 400, "Invalid credentials");
            }
      
            const {password, ...newData} = userExist
            const access_token: string = generateJwtToken(newData);
            return successResponse(res, 200, "Success", { access_token, details: newData });
        } catch (error:any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while retrieving the subaccount.");
        }
      };

}

export class AdminResetPasswordController {

    // get reset token
    static async getResetToken(req: Request, res: Response, next: NextFunction) {
      try {
        const { error, value } = resentTokenValidator.validate(req.body);
        if (error) {
          return failedResponse(res, 400, `${error.details[0].message}`);
        }
  
        const userExist = await AdminUser.findOne(value)
        if (!userExist) return failedResponse(res, 404, "User with this email does not exists.");

        await OtpToken(userExist?.email, "Reset token.", "templates/reset_password.html");
  
        return successResponse(res, 201, "Reset token sent.");
      } catch (error: any) {
        writeErrosToLogs(error)
        return failedResponse(res, 500, error.message);
      }
    };
  
    // verify reset token
    static async verifyToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { error, value } = orgEmailVerificationValidator.validate(req.body);
            if (error) {
            return failedResponse(res, 400, `${error.details[0].message}`);
            }
  
            const userExist = await AdminUser.findOne({email:value.email})
            if (!userExist) return failedResponse(res, 404, "User with this email does not exists.");

            const isValidToken = await ValidateToken(userExist?.email, value.token);
            if (!isValidToken){
                return failedResponse(res, 400, "Token not valid");
            }
  
            return successResponse(res, 200, "Valid token");
        } catch (error: any) {
            writeErrosToLogs(error)
            return failedResponse(res, 500, error.message);
        }
    };
  
    // update password
    static async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { error, value } = NewPasswordValidator.validate(req.body);
            if (error) {
            return failedResponse(res, 400, `${error.details[0].message}`);
            }
  
            const userExist = await AdminUser.findOne({email:value.email}).lean()
            if (!userExist) return failedResponse(res, 404, "User with this email does not exists.");

            const isValidToken = await verifyToken(userExist?.email, value.token);
            if (!isValidToken) return failedResponse(res, 400, "Invalid or expired token");

            value.password = await bcrypt.hash(value.password, 10);
            userExist.password = value.password;
            await userExist.save()
            const {password, ...newData} = userExist
            const access_token: string = generateJwtToken({ id: userExist._id, isAdmin: userExist.isAdmin, email:userExist.email});
            return successResponse(res, 200, "Password updated successfully.", { access_token, newData });
            
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
  
  }
  

