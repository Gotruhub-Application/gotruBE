import { logger } from "../logger"; 
import { failedResponse, successResponse } from "../support/http";
import { Feature, Subscription } from "../models/admin.models";
import { Request, Response, NextFunction } from "express";
import { ContractpurchasePlanValidator, FeatureValidator, SubscriptionValidator, UpdateSubscriptionValidator } from "../validators/admin/admin.validators";
import { Plan } from "../models/organization.models";
import { writeErrosToLogs } from "../support/helpers";


export class FeaturesController {
    static async getAllFeatures(req:Request, res:Response) {
        try {
            
            const features= await Feature.find()
            return successResponse(res,200,"success", features)
        } catch (error:any) {
            logger.error(`Error at line ${error.lineNumber}: ${error.message}\n${error.stack}`);
            return failedResponse(res, 500, error.message);
        }
    };

    static async addFeature(req:Request, res:Response) {
        try {
            const { error, value } = FeatureValidator.validate(req.body);
            if (error) {
                return failedResponse(res, 400, `${error.details[0].message}`);
            }
            const featureExist = await Feature.findOne(value)
            if (featureExist) return failedResponse(res, 400, "Feature with this name already exist.");
            const newFeature = await Feature.create(value)
            return successResponse(res,201,"New feature added sucessfully.", newFeature)
        } catch (error:any) {
            logger.error(`Error in add feature at line ${error.lineNumber}: ${error.message}\n${error.stack}`);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getSingleFeature(req:Request, res:Response) {
        try {
            const featureId = req.params.id
            const feature = await Feature.findById(featureId)
            if (!feature){
                return failedResponse(res, 404, `Feature with id ${featureId} not found`);
            }
            return successResponse(res,201,"New feature added sucessfully.", feature)
        } catch (error:any) {
            logger.error(`Error in getsinglefeture at line ${error.lineNumber}: ${error.message}\n${error.stack}`);
            return failedResponse(res, 500, error.message);
        }
    };
    static async UpdateSingleFeature(req:Request, res:Response) {
        try {
            const { error, value } = FeatureValidator.validate(req.body);
            if (error) {
                return failedResponse(res, 400, `${error.details[0].message}`);
            }
            const featureId:any= req.params.id
            const feature = await Feature.findByIdAndUpdate(featureId, value, { new: true })
            if (!feature){
                return failedResponse(res, 404, `Feature with id ${featureId} not found`);
            }
            return successResponse(res,201,"New feature added sucessfully.", feature)
        } catch (error:any) {
            logger.error(`Error in admin controllers at line ${error.lineNumber}: ${error.message}\n${error.stack}`);
            return failedResponse(res, 500, error.message);
        }
    };
    static async DeleteSingleFeature(req:Request, res:Response) {
        try {

            const featureId:any= req.params.id
            const feature = await Feature.findOneAndDelete(featureId)
            if (!feature){
                return failedResponse(res, 404, `Feature with id ${featureId} not found`);
            }
            return successResponse(res,204,"Feature deleted sucessfully.", feature)
        } catch (error:any) {
            logger.error(`Error in admin delete feature controllers at line ${error.lineNumber}: ${error.message}\n${error.stack}`);
            return failedResponse(res, 500, error.message);
        }
    };
}


export class SubscriptionPlanController {
    static async getSubPlans(req:Request, res:Response) {
        try {
            
            const subPlans= await Subscription.find().populate("feature")
            return successResponse(res,200,"success", subPlans)
        } catch (error:any) {
            logger.error(`Error at line ${error.lineNumber}: ${error.message}\n${error.stack}`);
            return failedResponse(res, 500, error.message);
        }
    };

    static async addSubPlans(req: Request, res: Response) {
        try {
            const { error, value } = SubscriptionValidator.validate(req.body);
            if (error) {
                return failedResponse(res, 400, `${error.details[0].message}`);
            }
    
            // Retrieve the feature IDs from the request body
            const { features, ...subscriptionData } = value;
    
            // Find the documents for the provided feature IDs
            const featureDocuments = await Feature.find({ _id: { $in: features } });
    
            // Check if all feature IDs are valid
            if (featureDocuments.length !== features.length) {
                return failedResponse(res, 404, "One or more feature IDs are invalid.");
            }
    
            // Create a new subscription document with the retrieved feature documents
            const newSubscription = await Subscription.create({ ...subscriptionData, feature: featureDocuments });
    
            return successResponse(res, 201, "New plan added successfully.", newSubscription);
        } catch (error: any) {
            logger.error(`Error in add subscription plan at line ${error.lineNumber}: ${error.message}\n${error.stack}`);
            return failedResponse(res, 500, error.message);
        }
    }
    

    static async getSinglePlan(req:Request, res:Response) {
        try {
            const planId = req.params.id
            const subPlan = await Subscription.findById(planId).populate("feature")
            if (!planId){
                return failedResponse(res, 404, `Plan with id ${planId} not found`);
            }
            return successResponse(res,200,"Success", subPlan)
        } catch (error:any) {
            logger.error(`Error in getsinglefeture at line ${error.lineNumber}: ${error.message}\n${error.stack}`);
            return failedResponse(res, 500, error.message);
        }
    };
    static async UpdateSinglePlan(req: Request, res: Response) {
        try {
            const { error, value } = UpdateSubscriptionValidator.validate(req.body);
            if (error) {
                return failedResponse(res, 400, `${error.details[0].message}`);
            }
    
            const planId: any = req.params.id;
            const { features, ...subscriptionData } = value;
    
            // Find the subscription document
            const subPlan = await Subscription.findById(planId).populate("feature")
            if (!subPlan) {
                return failedResponse(res, 404, `Plan with id ${planId} not found`);
            }
    
            // If features are provided, update them
            if (features !== undefined && features.length > 0) {
                // Find the documents for the provided feature IDs
                const featureDocuments = await Feature.find({ _id: { $in: features } });
        
                // Check if all feature IDs are valid
                if (featureDocuments.length !== features.length) {
                    return failedResponse(res, 404, "One or more feature IDs are invalid.");
                }
                subPlan.feature = features;
            } else {
                return failedResponse(res, 400, "At least one feature must be provided");
            }
    
            // Update other subscription data
            Object.assign(subPlan, subscriptionData);
    
            // Save the updated subscription
            const updatedSubscription = await subPlan.save();
    
            return successResponse(res, 200, "Plan updated successfully.", updatedSubscription);
        } catch (error: any) {
            logger.error(`Error in admin controllers at line ${error.lineNumber}: ${error.message}\n${error.stack}`);
            return failedResponse(res, 500, error.message);
        }
    };
    
    static async DeleteSinglePlan(req:Request, res:Response) {
        try {
            const planId:any= req.params.id
            const subPlan = await Subscription.findOneAndDelete(planId)
            if (!subPlan){
                return failedResponse(res, 404, `Plan with id ${planId} not found`);
            }
            return successResponse(res,204,"Plan deleted sucessfully.", subPlan)
        } catch (error:any) {
            logger.error(`Error in admin delete sub controllers at line ${error.lineNumber}: ${error.message}\n${error.stack}`);
            return failedResponse(res, 500, error.message);
        }
    };
}

export class ContractPlan {
    static async orderPlan (req:Request, res:Response){
      try {
  
        const { error, value } = ContractpurchasePlanValidator.validate(req.body);
        if (error) return failedResponse (res, 400, `${error.details[0].message}`)
        const subscriptionTypeExist = await Subscription.findById(value.subscriptionType)
        if (!subscriptionTypeExist) return failedResponse (res, 404, "One of the subscription type not found")
        value.Organization = value.organizationId
        value.amount = (value.quantity * parseFloat(subscriptionTypeExist.amount.toString()));
        value.planValidity= subscriptionTypeExist.planValidity
        value.quantityLeft= value.quantity
        value.isContract = true
        
        const plan = await Plan.create(value)
        return successResponse(res, 200, "Success", {plan})
  
      } catch (error:any) {
        writeErrosToLogs(error)
        return failedResponse(res,500, error.message)
        
      }
  
    };
    static async getAllOrgPlans (req:Request, res:Response){
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

    static async getAllContractPlans (req:Request, res:Response){
        const ITEMS_PER_PAGE = 10;
        try {
          const page = parseInt(req.query.page as string) || 1; // Get the page number from query parameters, default to 1
          const skip = (page - 1) * ITEMS_PER_PAGE; // Calculate the number of items to skip
  
          const plans = await Plan.find({ paidStatus: true }).populate("subscriptionType")
                                    .skip(skip)
                                    .limit(ITEMS_PER_PAGE); // Limit the number of items per page
                                    
  
          return successResponse(res, 200, "Success", plans );
      } catch (error: any) {
          writeErrosToLogs(error);
          return failedResponse(res, 500, error.message);
      }
  
    };
  
    static async getOrgPlanById (req:Request, res:Response){
  
      try {
        const {id} = req.params
  
        const plan = await Plan.findById(id)
        if(!plan) return failedResponse(res, 404, "Not found" ); 

        return successResponse(res, 200, "Success", plan );
    } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, error.message);
    }
  
  };
  
    static async OrgPendingPlans (req:Request, res:Response){
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
  
        const plans = await Plan.updateMany({Organization: req.params.organizationId, paidStatus: false}, {paidStatus:true})
        if (!plans) return failedResponse (res, 404, "No plan found.")
        return successResponse(res, 200, "Success")
  
      } catch (error:any) {
        writeErrosToLogs(error)
        return failedResponse(res,500, error.message)
        
      }
  
    };
  
  }