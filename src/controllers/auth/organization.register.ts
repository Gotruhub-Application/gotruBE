import { Organization,Token} from "../../models/organization.models";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt"
import { OrgRegistrationValidation,orgEmailVerificationValidator, resentTokenValidator } from "../../validators/auth/organizations";
import { logger } from "../../logger"; 
import { failedResponse, successResponse } from "../../support/http";
import { OtpToken, ValidateToken, verifyToken } from "../../support/helpers"; 
import { LoginValidator, NewPasswordValidator } from "../../validators/auth/general.validators";
import { generateJwtToken } from "../../support/generateTokens";


export const OrganizationSignup= async (req:Request, res:Response, next:NextFunction) => {
  try {


    const { error, value } = OrgRegistrationValidation.validate(req.body);
    if (error) {
      return failedResponse (res, 400, `${error.details[0].message}`)
    }

    const isOrganization = await Organization.findOne({ email: value.email });
    if (isOrganization) {
      return failedResponse (res, 400, "Email already exist.")
    }
    // const salt = await bcrypt.genSalt(10)
    // value.password = await bcrypt.hash(value.password, salt);
    const organization = await Organization.create({ ...value, role: "admin"});
    await OtpToken(value.email,"Account activation code", "templates/activateemail.html" )
    // const {password, ...responseOrganization} = organization.toObject();

    return successResponse(res,201,"Verification token has been sent to your email.")
  } catch (error:any) {
    logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
    return failedResponse(res,500, error.message)
  }
};

export const verifyOrgAccount = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { error, value } = orgEmailVerificationValidator.validate(req.body);
    if (error) {
      return failedResponse (res, 400, `${error.details[0].message}`)
    }
    const isOrganization = await Organization.findOne({ email: value.email });
    if (!isOrganization) {
      return failedResponse (res, 404, "Email does not exist.")
    }
    const verify = await verifyToken(value.email, value.token)
    if (!verify){
      return failedResponse (res, 400, "Invalid token or token has expired")
    }
    isOrganization.isVerified =true
    await isOrganization.save()
    return successResponse(res,201,"Verification successful.")
  } catch (error:any) {
    logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
    return failedResponse(res,500, error.message)
  }

}

export const resendToken= async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { error, value } = resentTokenValidator.validate(req.body);
    if (error) {
      return failedResponse (res, 400, `${error.details[0].message}`)
    }
    await OtpToken(value.email,"Account activation code", "templates/activateemail.html" )
    return successResponse(res,200,"Verification token has been resent to your email.")
  } catch (error:any) {
    logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
    return failedResponse(res,500, error.message)
  }
    
}

export const setPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { error, value } = LoginValidator.validate(req.body);
      if (error) {
          return failedResponse(res, 400, `${error.details[0].message}`);
      }

      const isOrganization = await Organization.findOne({ email: value.email }).select("+password").lean();
      if (!isOrganization) {
          return failedResponse(res, 404, "Email does not exist.");
      }
      if (!isOrganization.isVerified) {
        return failedResponse(res, 400, "Account not verified, please verify account.");
    }

    const salt = await bcrypt.genSalt(10)
    value.password = await bcrypt.hash(value.password, salt);

    isOrganization.password = value.password

    await isOrganization.save()

    return successResponse(res, 200, "Success");
  } catch (error:any) {
      // Log the error using your logger
      logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
      return failedResponse(res, 500, "Internal server error");
  }
};



export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { error, value } = LoginValidator.validate(req.body);
      if (error) {
          return failedResponse(res, 400, `${error.details[0].message}`);
      }

      const isOrganization = await Organization.findOne({ email: value.email }).select("+password").lean();
      if (!isOrganization) {
          return failedResponse(res, 404, "Email does not exist.");
      }
      if (!isOrganization.isVerified) {
        return failedResponse(res, 400, "Account not verified, please verify account.");
    }

      const isValidPassword = await bcrypt.compare(value.password, isOrganization.password);
      if (!isValidPassword) {
          return failedResponse(res, 400, "Incorrect password");
      }

      const access_token: string = generateJwtToken({ id: isOrganization._id, role: isOrganization.role });
      const {password, ...isOrganizationWithNoPassword} = isOrganization
      return successResponse(res, 200, "Success", { access_token, details: isOrganizationWithNoPassword });
  } catch (error:any) {
      // Log the error using your logger
      logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
      return failedResponse(res, 500, "Internal server error");
  }
};


export class ResetPasswordController {

  // get reset token
  static async getResetToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = resentTokenValidator.validate(req.body);
      if (error) {
        return failedResponse(res, 400, `${error.details[0].message}`);
      }

      const isOrganization = await Organization.findOne({ email: value.email });
      if (!isOrganization) {
        return failedResponse(res, 404, "Email does not exists.");
      }

      await OtpToken(value.email, "Reset token.", "templates/reset_password.html");

      return successResponse(res, 201, "Reset token sent.");
    } catch (error: any) {
      logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
      return failedResponse(res, 500, error.message);
    }
  };

  // get reset token
  static async verifyToken(req: Request, res: Response, next: NextFunction) {
      try {
          const { error, value } = orgEmailVerificationValidator.validate(req.body);
          if (error) {
          return failedResponse(res, 400, `${error.details[0].message}`);
          }

          const isOrganization = await Organization.findOne({ email: value.email });
          if (!isOrganization) {
              return failedResponse(res, 404, "Email does not exists.");
          }

          const isValidToken = await ValidateToken(value.email, value.token);
          if (!isValidToken){
              return failedResponse(res, 400, "Token not valid");
          }

          return successResponse(res, 200, "Valid token");
      } catch (error: any) {
          logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
          return failedResponse(res, 500, error.message);
      }
  };

  // get reset token
  static async changePassword(req: Request, res: Response, next: NextFunction) {
      try {
          const { error, value } = NewPasswordValidator.validate(req.body);
          if (error) {
          return failedResponse(res, 400, `${error.details[0].message}`);
          }

          const isOrganization = await Organization.findOne({ email: value.email });
          if (!isOrganization) {
              return failedResponse(res, 404, "Email does not exists.");
          }

          const isValidToken = await verifyToken(value.email, value.token);
          if (!isValidToken){
              return failedResponse(res, 400, "Token not valid");
          }

          const salt = await bcrypt.genSalt(10)
          value.password = await bcrypt.hash(value.password, salt);

          isOrganization.password = value.password

          await isOrganization.save()

          const access_token: string = generateJwtToken({ id: isOrganization._id, role: isOrganization.role });
          return successResponse(res, 200, "Password updated successfully.", { access_token });
          
      } catch (error: any) {
          logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
          return failedResponse(res, 500, error.message);
      }
  };

}
