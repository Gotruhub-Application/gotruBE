import { Media } from "../models/media.models";
import { AppToken, Order, Organization, Plan, Product, SignInOutRecordModel, SubUnit, SubaccountModel, Unit, User, WalletModel, WalletTransactionModel, WithdrawalRequest } from "../models/organization.models";
import { Feature, Subscription } from "../models/admin.models";
import { Request, Response, NextFunction } from "express";
import { logger } from "../logger"; 
import { createPaystackSubAccount, failedResponse, initiatePaystack, successResponse } from "../support/http";
import { SubUnitValidator, UnpdatesubaccountJoiSchema, orgUpdateUserValidator, orgUserValidator, purchasePlanValidator, sendUsersTokenValidator, subaccountJoiSchema, unitValidator, useAppTokenValidator } from "../validators/organization.validator";
import { createNotification, generateRandomPassword, generateRandomString, sendOnboardingMail, sendTemplateMail, writeErrosToLogs } from "../support/helpers";
import bcrypt from "bcrypt"
import { emitUserCreationSignal } from "../support/signals";
import { AttendanceModel, ClassScheduleModel, SubUnitCourseModel } from "../models/organziation/monitorFeature.models";
import mongoose from "mongoose";
import { sendNotif } from "../support/firebaseNotification";
import { getSubunitAttendanceSummaryByUserId } from "./organization/monitorFeature/monitorFuncs";
import { Notification } from "../models/general.models";
import { CreateNotificationParams } from "../interfaces/general.interface";

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
            const unit = await Unit.findOneAndDelete({_id:req.params.id, organization:req.params.organizationId});
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

          const subUnit = await SubUnit.findOne({ organization:req.params.organizationId, name:value.name});
          if(subUnit) return failedResponse(res,400, "sub-unit with this name already exist.") 
          value["organization"] = req.params.organizationId

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
              if(value.guardians){
                const parent = await User.findById(value.guardians);
            
                if (!parent) return failedResponse(res,404, "guardians not found.")
              }
              
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
          if (value.children){
            const children = await User.find({ _id: { $in: value.children } });
            // const { kids, ...data } = value;
  
            // Check if kids array is defined before accessing its length
            if (children.length !== value.children.length) {
              return failedResponse(res, 404, "One or more children IDs are invalid.");
            }
          }
          
        }

        if (value.email){
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
        if (value.email){
          await sendOnboardingMail(value.role,value.defaultEmail,
            "Complete Registeration","templates/user_onboarding.html",
            {email:value.email, fullName:value.fullName, password:password}
          )
        }
        emitUserCreationSignal(newUser)
        return successResponse(res,201,"Unit created successfully",{newUser} )

    } catch (error:any) {
      logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
      return failedResponse(res,500, error.message)
    }
  };

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    const ITEMS_PER_PAGE = 100;
    try {
      const page = parseInt(req.query.page as string) || 1; // Get the page number from query parameters, default to 1
      const skip = (page - 1) * ITEMS_PER_PAGE; // Calculate the number of items to skip
  
      // Build the query object
      const query: any = {
        organization: req.params.organizationId,
      };
  
      if (req.query.role) {
        query.role = { $regex: new RegExp(req.query.role as string, 'i') };
      }
  
      if (req.query.subUnit) {
        query.subUnit = req.query.subUnit;
      }
  
      if (req.query.piviotUnit) {
        query.piviotUnit = req.query.piviotUnit;
      }
  
      if (req.query.fullName) {
        query.fullName = { $regex: new RegExp(req.query.fullName as string, 'i') };
      }
  
      const users = await User.find(query)
        // .skip(skip)
        // .limit(ITEMS_PER_PAGE);
  
      return successResponse(res, 200, "Success", { users });
  
    } catch (error: any) {
      logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
      return failedResponse(res, 500, error.message);
    }
  };

  static async getSingleUser (req:Request, res:Response, next:NextFunction){
    try {
        const user = await User.findOne({
          _id:req.params.id,
          // organization: req.params.organizationId
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
            const parent = await User.findById(value.guardians).select("-password");
            
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
      if (!subscriptionTypeExist) return failedResponse (res, 404, "One of the subscription type not found")
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

  static async getMyPlanById (req:Request, res:Response){

    try {
      const {id} = req.params

      const plan = await Plan.findOne({ Organization: req.params.organizationId, _id:id })
      // if (plan){
      //   if("feature" in plan.subscriptionType){
      //     const features = await Feature.find({_id:{ $in: plan.subscriptionType.feature }})
      //     return successResponse(res, 200, "Success", {plan, features} );
      //   }
      // }                               

      return successResponse(res, 200, "Success", plan );
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
            type:"plan",
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

        const userIds = value.users.map((userObj: { user: string }) => userObj.user);
        const users = await User.find({ _id: { $in: userIds } });

        if (users.length !== userIds.length) {
            return failedResponse(res, 404, "One or more user IDs are invalid.");
        }

        let plan = await Plan.findOne({ _id: value.plan, Organization: req.params.organizationId });
        if (!plan) return failedResponse(res, 404, "This plan does not exist.");

        const totalRequiredQuantity = value.users.reduce((acc: number, userObj: { quantity: number }) => acc + userObj.quantity, 0);

        if (plan.quantityLeft < totalRequiredQuantity) {
            return failedResponse(res, 400, `Cannot send plan quantity ${totalRequiredQuantity} to users. Available quantity is ${plan.quantityLeft}`);
        }

        const tokenPromises = [];
        const emailPromises = [];
        const pushNotificationPromises = [];
        let allGeneratedTokens: { [key: string]: string[] } = {};

        for (const userObj of value.users) {
            const user = users.find((u: any) => u._id.toString() === userObj.user);
            if (!user || !user.defaultEmail) continue;

            const generatedTokens: string[] = [];
            for (let i = 0; i < userObj.quantity; i++) {
                tokenPromises.push(
                    AppToken.create({ token: `${Date.now().toString()}${generateRandomString(3)}`, plan: plan._id, user: user._id }).then(token => {
                        generatedTokens.push(token.token);
                    })
                );
            }
            allGeneratedTokens[user.defaultEmail] = generatedTokens;
        }

        await Promise.all(tokenPromises);

        for (const [email, tokens] of Object.entries(allGeneratedTokens)) {
            const user = users.find((u: any) => u.defaultEmail === email);
            if (user) {
                emailPromises.push(
                    sendTemplateMail(email, "Application Access Token", "templates/appAccessToken.html", { token: tokens, fullname: user.fullName })
                );
            };
            if (user?.fcmToken) {
              const notifyPayload = { type: `appToken`, tokens };
              
              try {
                
                // create the notifcation
                const payload: CreateNotificationParams = {
                  owner: `${user._id}`,
                  title: `New app access token(s).`,
                  type: `token`,
                  message: `Here are your new app tokens: ${tokens}`,
                };
                await sendNotif(user.fcmToken,  `New app access token(s).`,`You have received ${tokens.length} new access token(s)`, notifyPayload);

                await createNotification(payload);
              } catch (error: any) {
                writeErrosToLogs(error);
              }
            }
        };
        

        await Promise.all(emailPromises);

        await Plan.findByIdAndUpdate(value.plan, { $inc: { quantityLeft: -totalRequiredQuantity } });

        return successResponse(res, 200, "Tokens sent successfully.");
    } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, error.message);
    }
}


  static async useAppTokenForChild(req: Request, res: Response) {
    try {
      const { error, value } = useAppTokenValidator.validate(req.body);
      if (error) return failedResponse(res, 400, `${error.details[0].message}`);

      // validate data
      const child = await User.findById(value.child);      
      if (!child) return failedResponse(res,404, "Child not found.")
      
      // const subPlanType = await Subscription.findById(value.subscriptionType)
      // if (!subPlanType) return failedResponse (res, 404, "subscriptionType not found.")

      const token = await AppToken.findOne({token: value.token, user:(req as any).user._id}).populate('plan');
      if (!token) return failedResponse (res, 404, "App token not found.")
      if (token.used) return failedResponse (res, 400, "This token has been used.")
      

      if ('planValidity' in token.plan) {
        const currentDate = new Date();
        
        const subPlanType = await Subscription.findById(token.plan.subscriptionType)
        if (!subPlanType) return failedResponse (res, 404, "subscriptionType not found.")
        const features = subPlanType.feature
        for(const feature of features){
            const _feature = await Feature.findById(feature)
            if(_feature?.name.toLocaleLowerCase() == "gotrupass"){
              child.passToken = token._id
            }else if ( _feature?.name.toLocaleLowerCase() == "gotrutrade"){
              child.tradeToken = token._id
            }else if ( _feature?.name.toLocaleLowerCase() == "gotrumonitor"){
              child.monitorToken = token._id
            }else{
              return failedResponse (res, 400, "Feature  not found. Please contact support.")
            }
        }
        
        token.used = true;
        token.expires_at =  new Date(currentDate.setDate(currentDate.getDate() + (token.plan.planValidity-1)));
        await child.save()
        await token.save()

        return successResponse(res,200, "Feature unlocked.")
      };
      return failedResponse (res, 400, "Plan validity cannot be deatermined.")
              
    } catch (error:any) {
      writeErrosToLogs(error)
      return failedResponse(res, 500, error.message)
    }
  }
}



export class SubaccountController {
    static async createSubaccount(req: Request, res: Response) {
        try {
            // Validate request body against Joi schema
            const { error, value } = subaccountJoiSchema.validate(req.body);
            if (error) {
                return failedResponse(res, 400, error.details[0].message);
            }

            value.organization = req.params.organizationId;
            // Check if the organization already has a subaccount
            const existingAcc = await SubaccountModel.findOne({ organization: value.organization });
            if (existingAcc) return failedResponse(res, 400, "You can only have one payment account.");

            // Create new Subaccount
    
            value.percentage_charge = 0.0
            // value.metadata ={"custom_fields":[{"display_name":"Cart ID","variable_name": "cart_id","value": "8393"}]}
            const sub_acc = await createPaystackSubAccount(value)
            value.subaccount_code = sub_acc.data.subaccount_code;
            value.settlement_bank = sub_acc.data.settlement_bank
            value.account_name = sub_acc.data.account_name
            if(!sub_acc.status) return failedResponse(res, 400, "error", sub_acc);
            await SubaccountModel.create(value);
            return successResponse(res, 201, "Subaccount created successfully.");

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while creating the subaccount.");
        }
    }

    static async updateSubaccount(req: Request, res: Response) {
        try {
            // Validate request body against Joi schema
            const { error, value } = UnpdatesubaccountJoiSchema.validate(req.body);
            if (error) {
                return failedResponse(res, 400, error.details[0].message);
            }

            // Update the subaccount
            const updatedSubaccount = await SubaccountModel.findOneAndUpdate(
                {organization: req.params.organizationId },
                value,
                { new: true, runValidators: true }
            );

            if (!updatedSubaccount) {
                return failedResponse(res, 404, "Subaccount not found.");
            }
            // value.percentage_charge = 0.0
            // value.metadata ={"custom_fields":[{"display_name":"Cart ID","variable_name": "cart_id","value": "8393"}]}
            // const sub_acc = createPaystackSubAccount(value)
            // console.log(sub_acc, "heyyy")

            return successResponse(res, 200, "Subaccount updated successfully.", updatedSubaccount);

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while updating the subaccount.");
        }
    };
    static async getSubaccount(req: Request, res: Response) {
      try {
          const {organizationId } = req.params;
          const subaccount = await SubaccountModel.findOne({ organization: organizationId });

          if (!subaccount) {
              return failedResponse(res, 404, "Subaccount not found.");
          }

          return successResponse(res, 200, "Subaccount retrieved successfully.", subaccount);

      } catch (error: any) {
          writeErrosToLogs(error);
          return failedResponse(res, 500, "An error occurred while retrieving the subaccount.");
      }
  };
};

export class OrgSummary {
  static async getOrgSummary (req:Request, res:Response){
    try {
      const {organizationId} = req.params;
      const totalStudents = await User.countDocuments({organization:organizationId, role:"student"});
      const totalGuardian = await User.countDocuments({organization:organizationId, role:"guardian"});
      const totalStaffs = await User.countDocuments({organization:organizationId, role:"staff"});
      const totalStocks = await Product.countDocuments({uploadedBy:organizationId})

      return successResponse(res, 200, "Success", {totalStudents,totalGuardian,totalStaffs, totalStocks})

    } catch (error:any) {
      writeErrosToLogs(error)
      return failedResponse(res,500, error.message)
      
    }

  };
  
  static async getAllPassHistory(req: Request, res: Response) {
    const ITEMS_PER_PAGE = 100;
    try {
      const page = parseInt(req.query.page as string) || 1;
      const skip = (page - 1) * ITEMS_PER_PAGE;
      // Extract filter parameters from query
      const { unit, subunit, startDate, endDate, today } = req.query;
  
      const filter:any = { organization: req.params.organizationId };
      if (today === 'true') {
        // Filter for today's records
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        filter.createdAt = { $gte: startOfDay, $lt: endOfDay };
      };
      if (startDate && endDate) {
        filter.createdAt = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      };
      if (unit){
        filter.piviotUnit = unit
      };
      if (subunit){
        filter.subUnit = subunit
      };
  
      const totalCount = await SignInOutRecordModel.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  
      const history = await SignInOutRecordModel.find(filter)
        .populate("user")
        .populate("other")
        .populate("authorizationType")
        .populate("approvalBy")
        .populate("scannedBy")
        .sort({ createdAt: -1 }) // Sort by the most recent first
        .skip(skip)
        .limit(ITEMS_PER_PAGE);
  
      return successResponse(res, 200, "Success", {
        history,
        currentPage: page,
        totalPages,
        totalCount,
        itemsPerPage: ITEMS_PER_PAGE
      });
    } catch (error: any) {
      writeErrosToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  }

  // static async getAllPassHistory(req: Request, res: Response) {
  //     const ITEMS_PER_PAGE = 100;
  //     try {
  //         const page = parseInt(req.query.page as string) || 1;
  //         const skip = (page - 1) * ITEMS_PER_PAGE; 
  //         const history = await SignInOutRecordModel.find({
  //             organization:req.params.organizationId
  //         })
  //         .populate("user")
  //         .populate("other")
  //         .populate("authorizationType")
  //         .populate("approvalBy")
  //         .sort({ createdAt: -1 }) // Sort by the most recent
  //         .skip(skip)
  //         .limit(ITEMS_PER_PAGE); // Limit the number of items per page



  //         return successResponse(res, 200, "Success", history);
  //     } catch (error: any) {
  //         writeErrosToLogs(error);
  //         return failedResponse(res, 500, error.message);
  //     }
  // };
  static async getUnitSummary (req:Request, res:Response){
    try {
      const {organizationId, unitId} = req.params;
      const totalStudents = await User.countDocuments({organization:organizationId, role:"student", piviotUnit:unitId});
      const totalSubUnits = await SubUnit.countDocuments({organization:organizationId, unit:unitId})
      const subUnits = await SubUnit.find({ unit: unitId }).select('_id');
      const subUnitIds = subUnits.map(subUnit => subUnit._id);
      const totalAssignments = await SubUnitCourseModel.countDocuments({ subUnit: { $in: subUnitIds }, paid:true });

      return successResponse(res, 200, "Success", {totalStudents, totalSubUnits, totalAssignments})

    } catch (error:any) {
      writeErrosToLogs(error)
      return failedResponse(res,500, error.message)
      
    }

  };

  static async getSubUnitSummary (req:Request, res:Response){
    try {
      const { organizationId, unitId } = req.params;

        const subUnits = await SubUnit.find({ unit: unitId }).select('_id name');
        const response = [];

        for (const subUnit of subUnits) {
            const subUnitId = subUnit._id;
            const totalStudents = await User.countDocuments({ organization: organizationId, role: "student", subUnit: subUnitId });
            const totalAssignments = await SubUnitCourseModel.countDocuments({ subUnit: subUnitId, paid:true });

            const data = {
                name: subUnit.name,
                id: subUnitId,
                totalStudents,
                totalAssignments
            };

            response.push(data);
        }

      return successResponse(res, 200, "Success", response);

    } catch (error:any) {
      writeErrosToLogs(error)
      return failedResponse(res,500, error.message)
      
    }

  };
  static async getSingleSubUnitSummary (req:Request, res:Response){
    try {
      const { organizationId, subUnitId } = req.params;

        const subUnit = await SubUnit.findById(subUnitId).select('_id name unit');
        const totalStudents = await User.countDocuments({ organization: organizationId, role: "student", subUnit: subUnitId });
        const totalAssignments = await SubUnitCourseModel.countDocuments({ subUnit: subUnitId, paid:true });
        const unit =  await Unit.findById(subUnit?.unit,)

        const data = {
          unit: unit?.name,
            name: subUnit?.name,
            id: subUnitId,
            totalStudents,
            totalAssignments
        };

      return successResponse(res, 200, "Success", data);

    } catch (error:any) {
      writeErrosToLogs(error)
      return failedResponse(res,500, error.message)
      
    }

  };
  static async getAttendanceSummary(req: Request, res: Response) {
      try {
          const { organizationId, unitId, date } = req.params;

          // Fetch all students in the subunits
          const students = await User.find({ organization: organizationId, role: 'student'}).select('_id');
          const studentIds = students.map(student => student._id);

          // Fetch attendance records for the specified date
          const attendanceRecords = await AttendanceModel.find({
              user: { $in: studentIds },
              flag:false
              // createdAt: {
              //     $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
              //     $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
              // }
          });

          let earlyCount = 0;
          let lateCount = 0;
          let presentCount = 0;

          attendanceRecords.forEach(record => {
              if (record.remark.toLocaleLowerCase() === 'early') earlyCount++;
              else if (record.remark.toLocaleLowerCase() === 'late') lateCount++;
              presentCount++;
          });

          const totalStudents = students.length;
          const absentCount = totalStudents - presentCount;

          const earlyPercentage = (earlyCount / totalStudents) * 100;
          const latePercentage = (lateCount / totalStudents) * 100;
          const absentPercentage = (absentCount / totalStudents) * 100;

          const summary = {
              earlyPercentage,
              latePercentage,
              absentPercentage,
              totalStudents,
              earlyCount,
              lateCount,
              absentCount
          };

          return successResponse(res, 200, "Success", summary);
      } catch (error: any) {
          writeErrosToLogs(error);
          return failedResponse(res, 500, error.message);
      }
  };
  static async getAttendanceSummaryBySubunitCourse (req: Request, res: Response) {
    try {
      const { subunitCourseId, organizationId } = req.params;
      const subunitCourse = await SubUnitCourseModel.findById(subunitCourseId).populate("course");
      if(!subunitCourse) return failedResponse(res, 404, "Subunit course not found.")
      const relatedSchedules = await ClassScheduleModel.find({
        course: subunitCourseId
      }).populate("coordinators")
      const days = relatedSchedules.map(course => course.day);
      const coordinators = relatedSchedules.map(course => course.coordinators);
      const durations = relatedSchedules.map(course => course.endTime - course.startTime);

      // staff OrgSummary
      // Fetch all students in the subunits
      const staffs = await User.find({ organization: organizationId, role: 'staff'}).select('_id');
      const staffIds = staffs.map(staff => staff._id);
      // Fetch attendance records for the specified date
      const staffsAttendanceRecords = await AttendanceModel.find({
          user: { $in: staffIds },
          flag:false
          // createdAt: {
          //     $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          //     $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
          // }
      });
      const students = await User.find({ organization: organizationId, role: 'student'}).select('_id');
      const studentIds = students.map(student => student._id);
      const studentsAttendanceRecords = await AttendanceModel.find({
          user: { $in: studentIds },
          flag:false
          // createdAt: {
          //     $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          //     $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
          // }
      });
      const resp = {
        courseCode: subunitCourse.course.courseCode,
        days,
        coordinators,
        durations,
        staffsAttendanceRecords,
        studentsAttendanceRecords,
        
      }
      return successResponse(res, 200, "Success", resp);
  } catch (error:any) {
      writeErrosToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  }
};

export class UserSummary {
  static async passSummary(req: Request, res: Response) {
    const { userId, date } = req.query;
    const organizationId = req.params.organizationId;


    try {

      const signinTotal = await SignInOutRecordModel.countDocuments({
        user: new mongoose.Types.ObjectId(userId as string),
        organization: new mongoose.Types.ObjectId(organizationId as string),
        actionType: "sign_in"
      });

      const signin = await SignInOutRecordModel.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId as string),
            organization: new mongoose.Types.ObjectId(organizationId as string),
            actionType: "sign_in"
            // createdAt: { $gte: startDate, $lte: endDate } // Filter by date range
          }
        },
        {
          $group: {
            _id: '$authorizationType', // Group by 'authorizationType'
            count: { $sum: 1 } // Count the number of records in each group
          }
        },
        {
          $project: {
            _id: 0,
            authorizationType: '$_id',
            count: 1,
            percentage: {
              $multiply: [{ $divide: ['$count', signinTotal] }, 100]
            }
          }
        }
      ]);


      const signoutTotal = await SignInOutRecordModel.countDocuments({
        user: new mongoose.Types.ObjectId(userId as string),
        organization: new mongoose.Types.ObjectId(organizationId as string),
        actionType: "sign_out"
      });
      const signout = await SignInOutRecordModel.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId as string),
            organization: new mongoose.Types.ObjectId(organizationId as string),
            actionType: "sign_out"
            // createdAt: { $gte: startDate, $lte: endDate } // Filter by date range
          }
        },
        {
          $group: {
            _id: '$authorizationType', // Group by 'authorizationType'
            count: { $sum: 1 } // Count the number of records in each group
          }
        },
        {
          $project: {
            _id: 0,
            authorizationType: '$_id',
            count: 1,
            percentage: {
              $multiply: [{ $divide: ['$count', signoutTotal] }, 100]
            }
          }
        }
      ]);

      return successResponse(res, 200, "Success", {signin:signin, signout:signout});
    } catch (error: any) {
      writeErrosToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  };

  static async walletInfo(req: Request, res: Response) {
    const { memberId } = req.params;
    console.log(memberId, "sdfdbvbd")
  
    try {
      // Find the wallet associated with the user
      const wallet = await WalletModel.findOne({ user: memberId });

      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
  
      const walletId = wallet._id;
  
      // Compute total transactions (both credits and debits)
      const totalTransactions = await WalletTransactionModel.aggregate([
        { $match: { wallet: walletId } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
  
      // Compute total debits
      const totalDebits = await WalletTransactionModel.aggregate([
        { $match: { wallet: walletId, type: "debit" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
  
      // Compute total credits
      const totalCredits = await WalletTransactionModel.aggregate([
        { $match: { wallet: walletId, type: "credit" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
  
      // Compute total completed withdrawals
      const totalWithdrawals = await WithdrawalRequest.aggregate([
        { $match: { wallet: walletId, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
  
      const response = {
        balance: wallet.balance,
        totalTransactions: totalTransactions[0]?.total || 0,
        totalDebits: totalDebits[0]?.total || 0,
        totalCredits: totalCredits[0]?.total || 0,
        totalWithdrawals: totalWithdrawals[0]?.total || 0
      };
  
      return res.status(200).json({ success: true, data: response });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  static async orgzTradeSummary(req: Request, res: Response) {

    try {
        // Find all users associated with the organization
        const users = await User.find({ organization: req.params.organizationId }).select('_id');

        // Extract user IDs from the retrieved users
        const userIds = users.map(user => user._id);

        const organizationId = new mongoose.Types.ObjectId(req.params.organizationId);

        // Aggregate cash sales for the organization
        const orderCashSale = await Order.aggregate([
            { $match: { organization: organizationId, paymentMode: "cash" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        console.log(orderCashSale, organizationId, "xxxxxxx");

        // Aggregate QR (wallet) sales for the organization
        const orderQrSale = await Order.aggregate([
            { $match: { organization: organizationId, paymentMode: "wallet" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        // Find all wallets associated with the users
        const wallets = await WalletModel.find({ user: { $in: userIds } });

        // Extract wallet IDs from the retrieved wallets
        const walletIds = wallets.map(wallet => wallet._id);

        // Aggregate total transactions (both credits and debits)
        const totalTransactions = await WalletTransactionModel.aggregate([
            { $match: { wallet: { $in: walletIds } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Aggregate total debits
        const totalDebits = await WalletTransactionModel.aggregate([
            { $match: { wallet: { $in: walletIds }, type: "debit" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Aggregate total credits
        const totalCredits = await WalletTransactionModel.aggregate([
            { $match: { wallet: { $in: walletIds }, type: "credit" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Aggregate total completed withdrawals
        const totalWithdrawals = await WithdrawalRequest.aggregate([
            { $match: { wallet: { $in: walletIds }, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Calculate total available balance in all wallets
        const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);

        // Prepare the response object
        const response = {
            balance: totalBalance,
            totalTransactions: totalTransactions[0]?.total || 0,
            totalDebits: totalDebits[0]?.total || 0,
            totalCredits: totalCredits[0]?.total || 0,
            totalWithdrawals: totalWithdrawals[0]?.total || 0,
            cashSales: orderCashSale[0]?.total || 0,
            orderQrSale: orderQrSale[0]?.total || 0
        };

        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

static async getUserAttendanceSummary(req: Request, res: Response) {
  try {
    const { memberId, termId } = req.params;
    console.log("LHjckvdvdvdfvfd")

    const attendanceSummary = await AttendanceModel.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(memberId),
          term: new mongoose.Types.ObjectId(termId),
          // flag:false
        },
      },
      {
        $lookup: {
          from: 'classschedules',
          localField: 'classScheduleId',
          foreignField: '_id',
          as: 'classSchedule',
        },
      },
      {
        $unwind: {
          path: '$classSchedule',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'subunitcourses',
          localField: 'classSchedule.course',
          foreignField: '_id',
          as: 'subUnitCourse',
        },
      },
      {
        $unwind: {
          path: '$subUnitCourse',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'subUnitCourse.course',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $unwind: {
          path: '$course',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: { $ifNull: ['$course._id', null] },
          courseName: { $first: { $ifNull: ['$course.courseCode', 'Unknown Course'] } },
          totalScore: {
            $sum: {
              $cond: [
                { $eq: ['$attendanceType', 'signin'] },
                { $toDouble: { $ifNull: ['$score', '0'] } },
                0,
              ],
            },
          },
          attendedSessions: {
            $sum: { $cond: [{ $eq: ['$attendanceType', 'signin'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          courseId: { $ifNull: ['$_id', 'unknown'] },
          courseName: 1,
          attendedSessions: 1,
          totalScore: 1,
          attendanceRate: {
            $cond: [
              { $gt: ['$attendedSessions', 0] },
              { $multiply: [{ $divide: ['$totalScore', { $multiply: ['$attendedSessions', 100] }] }, 100] },
              0,
            ],
          },
        },
      },
      {
        $match: {
          courseId: { $ne: 'unknown' },
        },
      },
    ]);

    return successResponse(res, 200, 'Success', attendanceSummary);
  } catch (error: any) {
    writeErrosToLogs(error);
    return failedResponse(res, 500, error.message);
  }
};


static async getUserAttendanceSummaryBySubunit(req: Request, res: Response) {
  interface AttendanceSummary {
    courseId: string;
    courseName: string;
    attendedSessions: number;
    totalScore: number;
    attendanceRate: number;
  }
  
  interface UserAttendanceSummary {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    courseSummaries: AttendanceSummary[];
    overallAttendanceRate: number;
  }
  try {
    const { termId, subUnitId, organizationId } = req.params;

    // First, get all class schedules for this term and subunit
    const classSchedules = await ClassScheduleModel.find({
      term: termId,
      subUnit: subUnitId,
      organization: organizationId,
      expired: { $ne: true }
    }).select('_id');

    // Get all students in the subunit
    const members = await User.find({
      organization: organizationId,
      role: "student",
      subUnit: subUnitId,
    }).select('_id fullName email');

    // Get attendance summaries for all members across all class schedules
    const response = await Promise.all(
      members.map(async (member) => {
        // Get attendance for each class schedule
        const allCourseSummaries = await Promise.all(
          classSchedules.map(schedule => 
            getSubunitAttendanceSummaryByUserId(
              member._id.toString(),
              termId,
              schedule._id.toString()
            )
          )
        );

        // Flatten all course summaries into a single array
        const courseSummaries = allCourseSummaries.flat();

        // Calculate overall attendance rate
        const overallAttendanceRate = courseSummaries.length > 0
          ? courseSummaries.reduce((acc, course) => acc + course.attendanceRate, 0) / courseSummaries.length
          : 0;

        return {
          userId: member._id,
          email: member.email,
          courseSummaries,
          overallAttendanceRate: Number(overallAttendanceRate.toFixed(2))
        };
      })
    );

    // Sort by overall attendance rate in descending order
    const sortedResponse = response.sort((a, b) => b.overallAttendanceRate - a.overallAttendanceRate);

    // Calculate summary statistics
    const summaryData = {
      totalStudents: sortedResponse.length,
      totalClassSchedules: classSchedules.length,
      averageAttendanceRate: Number(
        (sortedResponse.reduce((acc, student) => acc + student.overallAttendanceRate, 0) / 
        sortedResponse.length || 0).toFixed(2)
      ),
      studentSummaries: sortedResponse
    };

    return successResponse(res, 200, 'Success', summaryData);
  } catch (error: any) {
    writeErrosToLogs(error);
    return failedResponse(res, 500, error.message);
  }
}


// static async getUserAttendanceSummary(req: Request, res: Response) {
//   try {
//     const { memberId, termId } = req.params;

//     const attendanceSummary = await AttendanceModel.aggregate([
//       {
//         $match: {
//           user: new mongoose.Types.ObjectId(memberId),
//           term: new mongoose.Types.ObjectId(termId)
//         }
//       },
//       {
//         $lookup: {
//           from: 'classschedules',
//           localField: 'classScheduleId',
//           foreignField: '_id',
//           as: 'classSchedule'
//         }
//       },
//       {
//         $unwind: {
//           path: '$classSchedule',
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $lookup: {
//           from: 'subunitcourses',
//           localField: 'classSchedule.course',
//           foreignField: '_id',
//           as: 'subUnitCourse'
//         }
//       },
//       {
//         $unwind: {
//           path: '$subUnitCourse',
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $lookup: {
//           from: 'courses',
//           localField: 'subUnitCourse.course',
//           foreignField: '_id',
//           as: 'course'
//         }
//       },
//       {
//         $unwind: {
//           path: '$course',
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $group: {
//           _id: { $ifNull: ['$course._id', null] },
//           courseName: { $first: { $ifNull: ['$course.courseCode', 'Unknown Course'] } },
//           attendedSessions: {
//             $sum: { $cond: [{ $eq: ['$attendanceType', 'signin'] }, 1, 0] }
//           },
//           rate: {
//             $sum: {
//               $cond: [
//                 { $eq: ['$attendanceType', 'signin'] },
//                 {
//                   $switch: {
//                     branches: [
//                       { case: { $eq: ['$remark', 'early'] }, then: '$score' },
//                       { case: { $eq: ['$remark', 'late'] }, then: '$score' },
//                       { case: { $eq: ['$remark', 'absent'] }, then: '$score' }
//                     ],
//                     default: 0
//                   }
//                 },
//                 0
//               ]
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           courseId: { $ifNull: ['$_id', 'unknown'] },
//           courseName: 1,
//           attendedSessions: 1,
//           rate: 1,
//           attendanceRate: {
//             $cond: [
//               { $gt: ['$attendedSessions', 0] },
//               { $divide: ['$rate', '$attendedSessions'] },
//               0
//             ]
//           }
//         }
//       },
//       {
//         $match: {
//           courseId: { $ne: 'unknown' }
//         }
//       }
//     ]);

//     return successResponse(res, 200, "Success", attendanceSummary);
//   } catch (error: any) {
//     writeErrosToLogs(error);
//     return failedResponse(res, 500, error.message);
//   }
// }

// static async getUserAttendanceSummary(req: Request, res: Response) {
//   try {
//     const { memberId, termId } = req.params;

//     const attendanceSummary = await AttendanceModel.aggregate([
//       {
//         $match: {
//           user: new mongoose.Types.ObjectId(memberId),
//           term: new mongoose.Types.ObjectId(termId)
//         }
//       },
//       {
//         $lookup: {
//           from: 'classschedules',
//           localField: 'classScheduleId',
//           foreignField: '_id',
//           as: 'classSchedule'
//         }
//       },
//       {
//         $unwind: {
//           path: '$classSchedule',
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $lookup: {
//           from: 'subunitcourses',
//           localField: 'classSchedule.course',
//           foreignField: '_id',
//           as: 'subUnitCourse'
//         }
//       },
//       {
//         $unwind: {
//           path: '$subUnitCourse',
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $lookup: {
//           from: 'courses',
//           localField: 'subUnitCourse.course',
//           foreignField: '_id',
//           as: 'course'
//         }
//       },
//       {
//         $unwind: {
//           path: '$course',
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $group: {
//           _id: { $ifNull: ['$course._id', null] },
//           courseName: { $first: { $ifNull: ['$course.courseCode', 'Unknown Course'] } },
//           attendedSessions: {
//             $sum: { $cond: [{ $eq: ['$attendanceType', 'signin'] }, 1, 0] }
//           },
//           rate: {
//             $sum: {
//               $cond: [
//                 { $eq: ['$attendanceType', 'signin'] },
//                 {
//                   $switch: {
//                     branches: [
//                       { case: { $eq: ['$remark', 'early'] }, then: 100 },
//                       { case: { $eq: ['$remark', 'late'] }, then: 50 }
//                     ],
//                     default: 0
//                   }
//                 },
//                 0
//               ]
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           courseId: { $ifNull: ['$_id', 'unknown'] },
//           courseName: 1,
//           attendedSessions: 1,
//           rate: 1,
//           attendanceRate: {
//             $cond: [
//               { $gt: ['$attendedSessions', 0] },
//               { $divide: ['$rate', '$attendedSessions'] },
//               0
//             ]
//           }
//         }
//       },
//       {
//         $match: {
//           courseId: { $ne: 'unknown' }
//         }
//       }
//     ]);

//     return successResponse(res, 200, "Success", attendanceSummary);
//   } catch (error: any) {
//     writeErrosToLogs(error);
//     return failedResponse(res, 500, error.message);
//   }
// }


  // static async getUserAttendanceSummary(req: Request, res: Response) {
  //   try {
  //     const { memberId, termId} = req.params; // Assuming memberId is passed in params
      
  //     // Fetch all attendance records for the user
  //     const attendances = await AttendanceModel.find({ user: memberId, term:termId })
  //       .populate({
  //         path: 'classScheduleId',
  //         select: 'course',
  //         populate: {
  //           path: 'course',
  //           model: 'Course'
  //         }
  //       })
  //       .populate('classScheduleId.course')
  //       .exec();

  //     // Group by course and compute attendance metrics
  //     const attendanceSummary: any = {};
  
  //     attendances.forEach(attendance => {
  //       const courseId = attendance.classScheduleId.course._id.toString();
  //       if (!attendanceSummary[courseId]) {
  //         attendanceSummary[courseId] = {
  //           courseName: attendance.classScheduleId.course.course.courseCode,

  //           attendedSessions: 0,
  //           rate: 0
  //         };
  //       }
        
  //       if (attendance.attendanceType === 'signin') {
  //         attendanceSummary[courseId].rate += attendance.remark === "early" ? 100 : attendance.remark === "late" ? 50 : 0
  //         attendanceSummary[courseId].attendedSessions += 1;
  //       }
  //     });
  
  //     // Transform the data into a response format
  //     const response = Object.keys(attendanceSummary).map(courseId => {
  //       const data = attendanceSummary[courseId];
  //       console.log(data, "asnfdsbdfsdfvb")
  //       return {
  //         courseId,
  //         courseName: data.courseName,
  //         rate: data.rate,
  //         attendedSessions: data.attendedSessions,
  //         attendanceRate: data.attendedSessions > 0 ? (data.rate / data.attendedSessions): 0
  //       };
  //     })
  //     // .filter(item => item.attendanceRate > 100); // Filter if needed
  
  //     return successResponse(res, 200, "Success", response);
  
  //   } catch (error: any) {
  //     writeErrosToLogs(error);
  //     return failedResponse(res, 500, error.message);
  //   }
  // }
  
  
}

