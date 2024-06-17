import { Organization,Token, User} from "../../models/organization.models";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt"
import { orgEmailVerificationValidator, resentTokenValidator } from "../../validators/auth/organizations";
import { failedResponse, successResponse } from "../../support/http";
import { OtpToken, ValidateToken, generateOrganizationDOmainCode, generateQrcode, verifyToken, writeErrosToLogs } from "../../support/helpers"; 
import { LoginValidator, NewPasswordValidator, passwordValidator } from "../../validators/auth/general.validators";
import { generateJwtToken } from "../../support/generateTokens";
import { logger } from "../../logger"; 


export class CompleteOnboarding {
    
    public static async getUserByEmail(email:string)  {
        const user = await User.findOne({ email: email });
        return user;
        
    }
    public static async getUserById(id:string)  {
        const user = await User.findById(id);
        return user;
        
    }

    public static async changePassword (email:string, newPassword:string){
        logger.info(email)
        const user = await CompleteOnboarding.getUserByEmail(email);
        if (!user) throw new Error("User not found");
        
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(newPassword, salt);
        
        user.password = password;
        user.onboardingCompleted = true;
        await user.save();
        const details =  {
            _id: user._id,
            fullName: user.fullName,
            role: user.role,
            organization: user.organization,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            email:user.email,
            profileImage: user.profileImage,
            signature: user.signature,
            children: user.children,
            onboardingCompleted: user.onboardingCompleted,
            defaultEmail: user.defaultEmail,
            
        }
        return details;
        
    }


    static async onbaord (req:Request, res:Response) {

        try {
            const { error, value } = LoginValidator.validate(req.body);
            if (error) {
                return failedResponse(res, 400, `${error.details[0].message}`);
            }
            const userExist = await CompleteOnboarding.getUserByEmail(value.email)
            if (!userExist) return failedResponse(res, 404, "Email does not exist.");

            const userPassword: string | undefined = userExist.password;

            if (userPassword === undefined) return failedResponse(res, 500, "User password is undefined");

            const correctPassword = await bcrypt.compare(value.password, userPassword);
            if (!correctPassword) {
                return failedResponse(res, 400, "Incorrect password");
            }
            if (value.fcmToken){
                userExist.fcmToken = value.fcmToken
                await userExist.save()
            }
            // Exclude sensitive fields and unnecessary document details
            const details = {
                _id: userExist._id,
                fullName: userExist.fullName,
                role: userExist.role,
                organization: userExist.organization,
                createdAt: userExist.createdAt,
                updatedAt: userExist.updatedAt,
                email:userExist.email,
                profileImage: userExist.profileImage,
                signature: userExist.signature,
                children: userExist.children,
                onboardingCompleted: userExist.onboardingCompleted,
                defaultEmail: userExist.defaultEmail,
                
            }
            const jwtData = {
                _id: userExist._id,
                fullName: userExist.fullName,
                role: userExist.role,
                organization: userExist.organization,
                email:userExist.email,
                onboardingCompleted: userExist.onboardingCompleted,
                defaultEmail: userExist.defaultEmail,
                
            }
            const responseData = {
                access_token: generateJwtToken(jwtData),details,
            };
            return successResponse(res, 200, "Success", { responseData });

        } catch (error:any) {
            writeErrosToLogs(error)
            return failedResponse(res, 500, "Internal server error");
        }
    }

    static async updatePassword (req:Request, res:Response) {
        const reqUser = (req as any).user;

        try {
            const { error, value } = passwordValidator.validate(req.body);
            if (error) {
                return failedResponse(res, 400, `${error.details[0].message}`);
            };

            const userExist = await CompleteOnboarding.getUserByEmail(reqUser.email);
            if (!userExist) return failedResponse(res, 404, "User does not exist.");

            const updatedUser = await CompleteOnboarding.changePassword(reqUser.email, value.password);
            
            return successResponse(res, 200, "Success", {updatedUser});

        } catch (error:any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "Internal server error");
        }
    }
}



export class UserResetPasswordController {

    // get reset token
    static async getResetToken(req: Request, res: Response, next: NextFunction) {
      try {
        const { error, value } = resentTokenValidator.validate(req.body);
        if (error) {
          return failedResponse(res, 400, `${error.details[0].message}`);
        }
  
        const userExist = await CompleteOnboarding.getUserByEmail(value.email)
        if (!userExist) return failedResponse(res, 404, "User with this email does not exists.");
        const userEmail: string | undefined = userExist.defaultEmail;

        if (userEmail === undefined) return failedResponse(res, 500, "User password is undefined");

        await OtpToken(userEmail, "Reset token.", "templates/reset_password.html");
  
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
  
            const userExist = await CompleteOnboarding.getUserByEmail(value.email)
            if (!userExist) return failedResponse(res, 404, "User with this email does not exists.");
            
            const userEmail: string | undefined = userExist.defaultEmail;

            if (userEmail === undefined) return failedResponse(res, 500, "User password is undefined");

            const isValidToken = await ValidateToken(userEmail, value.token);
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
  
            const userExist = await CompleteOnboarding.getUserByEmail(value.email);
            if (!userExist) return failedResponse(res, 404, "User with this email does not exists.");
            
            const userEmail: string | undefined = userExist.defaultEmail;
            if (userEmail === undefined) return failedResponse(res, 500, "User password is undefined");

            const isValidToken = await verifyToken(userEmail, value.token);
            if (!isValidToken) return failedResponse(res, 400, "Invalid or expired token");
        
  
            const updatedUser = await CompleteOnboarding.changePassword(value.email,value.password);
            if (!updatedUser) {
                return failedResponse(res, 500, "Failed to update password");
            }
  
            const access_token: string = generateJwtToken({ id: userExist._id, role: userExist.role, organization:userExist.organization, email:userExist.email});
            return successResponse(res, 200, "Password updated successfully.", { access_token, details: updatedUser });
            
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
  
  }
  