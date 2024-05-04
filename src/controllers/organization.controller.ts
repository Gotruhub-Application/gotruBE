import { Media } from "../models/media.models";
import { AppToken, Plan, SubUnit, Unit, User } from "../models/organization.models";
import { Subscription } from "../models/admin.models";
import { Request, Response, NextFunction } from "express";
import { logger } from "../logger"; 
import { failedResponse, initiatePaystack, successResponse } from "../support/http";
import { SubUnitValidator, orgUpdateUserValidator, orgUserValidator, purchasePlanValidator, sendUsersTokenValidator, unitValidator } from "../validators/organization.validator";
import { generateRandomPassword, sendOnboardingMail, sendTemplateMail, writeErrosToLogs } from "../support/helpers";
import bcrypt from "bcrypt"
import { emitUserCreationSignal } from "../support/signals";


export class OrganizatioinUnits {
    static async getUnits (req:Request, res:Response, next:NextFunction){
        try {

          const units = await Unit.find({ organization:req.params.organizationId}).populate({
            path: "organization",
            select: "nameOfEstablishment" // Specify the fields you need from the organization
        });
          return successResponse(res,200,"Success",{units} )
        } catch (error:any) {
          logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
          return failedResponse(res,500, error.message)
        }
      };
    
      static async createUnit (req:Request, res:Response, next:NextFunction){
        try {
            const { error, value } = unitValidator.validate(req.body);
            if (error) {
                return failedResponse (res, 400, `${error.details[0].message}`)
            }
            const unit = await Unit.findOne({ organization:req.params.organizationId, name:value.name});
            value["organization"] = req.params.organizationId
            logger.info(value);
            
            if(unit) return failedResponse(res,400, "Unit with this name already exist.") 
            const newUnit  = await Unit.create(value)
          return successResponse(res,200,"Unit created successfully",{newUnit} )
        } catch (error:any) {
          logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
          return failedResponse(res,500, error.message)
        }
      };

      static async getSingleUnit (req:Request, res:Response, next:NextFunction){
        try {

          const unit = await Unit.findOne({_id:req.params.id, organization:req.params.organizationId}).populate({
            path: "organization",
            select: "nameOfEstablishment" // Specify the fields you need from the organization
        });
          if(!unit) return failedResponse(res,404, "Unit not found") 
          return successResponse(res,200,"Unit created successfully",{unit} )
        } catch (error:any) {
          logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
          return failedResponse(res,500, error.message)
        }
      };
      
      static async updateUnit (req:Request, res:Response, next:NextFunction){
        try {
            const { error, value } = unitValidator.validate(req.body);
            if (error) {
                return failedResponse (res, 400, `${error.details[0].message}`)
            }
            const unit = await Unit.findOneAndUpdate({_id:req.params.id, organization:req.params.organizationId}, value, {new:true});
            if(!unit) return failedResponse(res,404, "Unit not found") 
          return successResponse(res,200,"Unit updated successfully",{unit} )
        } catch (error:any) {
          logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
          return failedResponse(res,500, error.message)
        }
      };

      static async deleteUnit (req:Request, res:Response, next:NextFunction){
        try {
            const unit = await Unit.findOneAndDelete({id:req.params.unitId, organization:req.params.organizationId});
            if(!unit) return failedResponse(res,404, "Unit not found") 
          return successResponse(res,204 )
        } catch (error:any) {
          logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
          return failedResponse(res,500, error.message)
        }
      };


}


export class OrganizatioinSubUnits {
  static async getSubbUnits (req:Request, res:Response, next:NextFunction){
      try {

        const units = await SubUnit.find({ organization:req.params.organizationId, unit:req.params.id}).populate({
          path: "organization",
          select: "nameOfEstablishment" // Specify the fields you need from the organization
      }).populate({
        path: "unit",
        select: "name" // Specify the fields you need from the organization
    });
        return successResponse(res,200,"Success",{units} )
      } catch (error:any) {
        logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
        return failedResponse(res,500, error.message)
      }
    };
  
    static async createSubUnit (req:Request, res:Response, next:NextFunction){
      try {
          const { error, value } = SubUnitValidator.validate(req.body);
          if (error) {
              return failedResponse (res, 400, `${error.details[0].message}`)
          }
          const unitExist = await Unit.findOne({_id:value.unit, organization:req.params.organizationId});
          if(!unitExist) return failedResponse(res,404, "Unit not found") 

          const unit = await SubUnit.findOne({ organization:req.params.organizationId, ...value});
          value["organization"] = req.params.organizationId

          if(unit) return failedResponse(res,400, "Subunit with this name already exist.") 
          const newUnit  = await SubUnit.create(value)
        return successResponse(res,201,"Unit created successfully",{newUnit} )
      } catch (error:any) {
        logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
        return failedResponse(res,500, error.message)
      }
    };

    static async getSingleSubUnit (req:Request, res:Response, next:NextFunction){
      try {

        const unit = await SubUnit.findOne({_id:req.params.id, organization:req.params.organizationId}).populate({
          path: "organization",
          select: "nameOfEstablishment" // Specify the fields you need from the organization
      }).populate({
        path: "unit",
        select: "name" // Specify the fields you need from the organization
    });
        if(!unit) return failedResponse(res,404, "Sub-unit not found") 
        return successResponse(res,200,"Success",{unit} )
      } catch (error:any) {
        logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
        return failedResponse(res,500, error.message)
      }
    };
    
    static async updateSubUnit (req:Request, res:Response, next:NextFunction) {
      try {
          const { error, value } = unitValidator.validate(req.body);
          if (error) {
              return failedResponse(res, 400, `${error.details[0].message}`);
          }
          
          const unit = await SubUnit.findOneAndUpdate({_id:req.params.id, organization:req.params.organizationId}, value, { new: true });
          if (!unit) {
              return failedResponse(res, 404, "Subunit not found");
          }
          
          return successResponse(res, 200, "Sub-unit updated successfully", { unit });
      } catch (error:any) {
          logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
          return failedResponse(res, 500, error.message);
      }
  }
  

    static async deleteSubUnit (req:Request, res:Response, next:NextFunction){
      try {
          const unit = await SubUnit.findOneAndDelete({_id:req.params.id, organization:req.params.organizationId});
          if(!unit) return failedResponse(res,404, "Sub-unit not found") 

          return successResponse(res,204)
      } catch (error:any) {
          logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
          return failedResponse(res,500, error.message)
      }
    };


}

export class OrgUsers {
  static async createUser (req:Request, res:Response, next:NextFunction){
    try {
        let password:string = "";
        const { error, value } = orgUserValidator.validate(req.body);
        if (error) {
            return failedResponse (res, 400, `${error.details[0].message}`)
        }
        if (value.role == "student"){
              const userExist = await User.findOne({
              regNum:{ $regex: new RegExp(value.regNum, 'i') }, 
              organization: req.params.organizationId
            });
    
              if(userExist) return failedResponse(res,400, "Student with the registration number already exist.") 

            // validate parents
              // Find the documents for the provided feature IDs
              const parent = await User.findById(value.guardians);
            
              if (!parent) return failedResponse(res,404, "guardians not found.")
            // validate unit
            const unit = await Unit.findOne({
              _id:value.piviotUnit, 
              organization: req.params.organizationId
            });
            if(!unit) return failedResponse(res,404, "Pivot unit is not a valid unit.") 

            // validate subunit
            if (value.subUnit){
              const subUnit = await SubUnit.findOne({
                _id:value.subUnit, 
                organization: req.params.organizationId
              });

              if(!subUnit) return failedResponse(res,404, "Sub unit is not valid.") 
            }
          
        }
  
        // validate profileImage
        const image = await Media.findOne({
          _id:value.profileImage, 
        });
        if(!image) return failedResponse(res,404, "Profile image is not valid.") 

        if (value.role == "guardian"){
          // validate profileImage
          const signature = await Media.findById(
            value.signature);
          if(!signature) return failedResponse(res,404, "SIgnature image is not valid.") 

          // validate children
          // Find the documents for the provided children IDs
         
          const children = await User.find({ _id: { $in: value.children } });
          logger.info(children);

          // const { kids, ...data } = value;

          // Check if kids array is defined before accessing its length
          if (children.length !== value.children.length) {
            return failedResponse(res, 404, "One or more children IDs are invalid.");
          }
        }

        if (value.role != "student"){
          // validate profileImage
          const userExist = await User.findOne({
            defaultEmail:value.email, 
            organization: req.params.organizationId
          });
  
          if(userExist) return failedResponse(res,400, "User with this email already exist.") 
          password = generateRandomPassword(6)
          const salt = await bcrypt.genSalt(10)
          value["password"] = await bcrypt.hash(password, salt);
          value["defaultEmail"] = value.email
          value.email = `${req.params.domain}_${value.email}`
          
        }

        value["organization"] = req.params.organizationId
        const newUser  = await User.create(value)
        // send onbard mail to the new user
        await sendOnboardingMail(value.role,value.defaultEmail,
          "Complete Registeration","templates/user_onboarding.html",
          {email:value.email, fullName:value.fullName, password:password}
        )
        emitUserCreationSignal(newUser)
        return successResponse(res,201,"Unit created successfully",{newUser} )

    } catch (error:any) {
      logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
      return failedResponse(res,500, error.message)
    }
  };

  static async getUsers (req:Request, res:Response, next:NextFunction){
    const ITEMS_PER_PAGE = 1;
    try {
        const page = parseInt(req.query.page as string) || 1; // Get the page number from query parameters, default to 1
        const skip = (page - 1) * ITEMS_PER_PAGE; // Calculate the number of items to skip
        const users = await User.find({
          role:{ $regex: new RegExp(req.params.role, 'i') }, 
          organization: req.params.organizationId
        })
        .skip(skip)
        .limit(ITEMS_PER_PAGE);;
        return successResponse(res,200,"Success",{users} )

    } catch (error:any) {
      logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
      return failedResponse(res,500, error.message)
    }
  };

  static async getSingleUser (req:Request, res:Response, next:NextFunction){
    try {
        const user = await User.findOne({
          _id:req.params.id,
          organization: req.params.organizationId
        }).populate("signature guardians relationImage children");
        return successResponse(res,200,"Success",{user} )

    } catch (error:any) {
      logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
      return failedResponse(res,500, error.message)
    }
  };

  static async updateSingleUser (req:Request, res:Response, next:NextFunction){
    try {
      const { error, value } = orgUpdateUserValidator.validate(req.body);
      if (error) {
          return failedResponse (res, 400, `${error.details[0].message}`)
      }
      if (value.role == "student"){

            // Find the documents for the provided feature IDs
            const parent = await User.findById(value.guardians);
            
            if (!parent) return failedResponse(res,404, "guardians not found.")
          // validate unit
          const unit = await Unit.findOne({
            _id:value.piviotUnit, 
            organization: req.params.organizationId
          });
          if(!unit) return failedResponse(res,404, "Pivot unit is not a valid unit.") 

          // validate subunit
          if (value.subUnit){
            const subUnit = await SubUnit.findOne({
              _id:value.subUnit, 
              organization: req.params.organizationId
            });

            if(!subUnit) return failedResponse(res,404, "Sub unit is not valid.") 
          }
        
      }

      // validate profileImage
      const image = await Media.findOne({
        _id:value.profileImage, 
      });
      if(!image) return failedResponse(res,404, "Profile image is not valid.") 

      if (value.role == "guardian"){
        // validate profileImage
        const signature = await Media.findById(
          value.signature);
        if(!signature) return failedResponse(res,404, "SIgnature image is not valid.") 

        // validate children
        // Find the documents for the provided children IDs
       
        const children = await User.find({ _id: { $in: value.children } });
        logger.info(children);

        // Check if kids array is defined before accessing its length
        if (children.length !== value.children.length) {
          return failedResponse(res, 404, "One or more children IDs are invalid.");
        }
      }
      const updatedUser  = await User.findOneAndUpdate({_id:req.params.id, organization:req.params.organizationId}, value, {new:true})
      return successResponse(res, 200, "Success", {updatedUser})
    } catch (error:any) {
      logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
      return failedResponse(res,500, error.message)
    }
  };

  static async deleteSingleUser (req:Request, res:Response, next:NextFunction){
    try {
        const user = await User.findOneAndDelete({
          _id:req.params.id,
          organization: req.params.organizationId
        });
        return successResponse(res,204)

    } catch (error:any) {
      logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
      return failedResponse(res,500, error.message)
    }
  };
}


export class BuySubcriptionPlan {
  static async orderPlan (req:Request, res:Response){
    try {
      const { error, value } = purchasePlanValidator.validate(req.body);
      if (error) return failedResponse (res, 400, `${error.details[0].message}`)
      const subscriptionTypeExist = await Subscription.findById(value.subscriptionType)
      if (!subscriptionTypeExist) return failedResponse (res, 404, "subscription type not found")

      value.Organization = req.params.organizationId
      value.amount = (value.quantity * parseFloat(subscriptionTypeExist.amount.toString()));
      value.planValidity= subscriptionTypeExist.planValidity
      value.quantityLeft= value.quantity
      
      const plan = await Plan.create(value)
      return successResponse(res, 200, "Success", {plan})

    } catch (error:any) {
      writeErrosToLogs(error)
      return failedResponse(res,500, error.message)
      
    }

  };
  static async getAllMyPlans (req:Request, res:Response){
      const ITEMS_PER_PAGE = 10;
      try {
        const page = parseInt(req.query.page as string) || 1; // Get the page number from query parameters, default to 1
        const skip = (page - 1) * ITEMS_PER_PAGE; // Calculate the number of items to skip

        const plans = await Plan.find({ Organization: req.params.organizationId, paidStatus: true }).populate("subscriptionType")
                                  .skip(skip)
                                  .limit(ITEMS_PER_PAGE); // Limit the number of items per page
                                  

        return successResponse(res, 200, "Success", { plans });
    } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, error.message);
    }

  };

  static async myPendingPlans (req:Request, res:Response){
    const ITEMS_PER_PAGE = 10;
    try {
      const page = parseInt(req.query.page as string) || 1; // Get the page number from query parameters, default to 1
      const skip = (page - 1) * ITEMS_PER_PAGE; // Calculate the number of items to skip

      const plans = await Plan.find({ Organization: req.params.organizationId, paidStatus: false })
                                .skip(skip)
                                .limit(ITEMS_PER_PAGE); // Limit the number of items per page

      return successResponse(res, 200, "Success", { plans });
    } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, error.message);
    }

  };

  static async removePlan (req:Request, res:Response){
    try {

      const plan = await Plan.findByIdAndDelete(req.params.id)
      if (!plan) return failedResponse (res, 404, "Plan not found")

      return successResponse(res,204)

    } catch (error:any) {
      writeErrosToLogs(error)
      return failedResponse (res, 500, `${error.details[0].message}`)
      
    }

  };

  static async buyPlan (req:Request, res:Response){
    try {

      const plans = await Plan.find({Organization: req.params.organizationId, paidStatus: false})
      if (!plans) return failedResponse (res, 404, "No plan found.")

      let totalAmount = 0;
      for (const plan of plans) {
        logger.info(plan.amount)
          totalAmount += plan.amount || 0; // Add the amount of each plan to the total
      }
      const metadata = plans.map(plan => ({
        cart_id: req.params.organizationId, // Adjust based on your data structure
        custom_fields: {
            _id: plan._id, // Assuming this is the plan ID
            Organization: plan.Organization // Assuming this is the Organization ID
            // Add other fields as needed
        }
    }));
    
      
      const paystack = await initiatePaystack(metadata,(req as any).org.email, (totalAmount*100))
      return successResponse(res, 200, "Success", {paystack})

    } catch (error:any) {
      writeErrosToLogs(error)
      return failedResponse(res,500, error.message)
      
    }

  };

}

export class AppAccessTokens {
  static async sendtokens(req: Request, res: Response) {
    try {
      const { error, value } = sendUsersTokenValidator.validate(req.body);
      if (error) return failedResponse(res, 400, `${error.details[0].message}`);
    
      const users = await User.find({ _id: { $in: value.users } });
      logger.info(users);

      if (users.length !== value.users.length) {
        return failedResponse(res, 404, "One or more users IDs are invalid.");
      };
      
      let plan = await Plan.findOne({_id:value.plan, Organization:req.params.organizationId});
      if (!plan) return failedResponse(res, 404, "This plan does not exist.");

      // ensure token left is sufficient for users to send to
      const index = users.length;
      if (plan.quantityLeft < users.length) return failedResponse(res, 400, `Cannot send plan quantity ${plan?.quantityLeft} to ${index} users`);
      
      const generatedTokens = [];
    
      for (const user of users) {
        if (!user.defaultEmail) continue;

        const token = await AppToken.create({ token: Date.now().toString(), plan: plan, user:user });
        generatedTokens.push(token);
        await sendTemplateMail(user.defaultEmail, "Application Access Token", "templates/appAccessToken.html", { token: token.token, fullname: user.fullName });
      }
      // Decrement the quantityLeft field by the number of tokens generated
      await Plan.findByIdAndUpdate(value.plan, { $inc: { quantityLeft: -index } });
      return successResponse(res, 200, "Tokens sent successfully.", { generatedTokens });
    } catch (error: any) {
      writeErrosToLogs(error)
      return failedResponse(res, 500, error.message)
    }
  }
}

