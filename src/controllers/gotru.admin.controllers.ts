import { logger } from "../logger"; 
import { failedResponse, successResponse } from "../support/http";
import { Announcement, Feature, Subscription } from "../models/admin.models";
import { Request, Response, NextFunction } from "express";
import { ContractpurchasePlanValidator, FeatureValidator, SubscriptionValidator, UpdateSubscriptionValidator, createAnnouncementSchema, updateAnnouncementSchema } from "../validators/admin/admin.validators";
import { Organization, Plan, User } from "../models/organization.models";
import { writeErrosToLogs } from "../support/helpers";
import mongoose from "mongoose";
import { myEmitter } from "../events/eventEmitter";


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
            const feature = await Feature.findByIdAndDelete(featureId)
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
            const subPlan = await Subscription.findByIdAndDelete(planId)
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
            .populate("Organization")
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
  
  };


  export class AdminSummary {
    static async summary(req: Request, res: Response) {
      try {
        // Total income from subscriptions
        const totalAmount = await Plan.aggregate([
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" }
            }
          }
        ]);
  
        const totalAmountContract = await Plan.aggregate([
          {
            $match: { isContract: true }
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" }
            }
          }
        ]);
  
        // Active plans
        const activePlans = await Plan.countDocuments({ quantityLeft: { $gt: 0 }, paidStatus: true });
        const totalOrgan = await Organization.countDocuments();
  
        // Total amounts grouped by subscription name
        const result = await Plan.aggregate([
            {
              $lookup: {
                from: 'subscriptions', // The name of the Subscription collection
                localField: 'subscriptionType',
                foreignField: '_id',
                as: 'subscription'
              }
            },
            {
              $unwind: '$subscription'
            },
            {
              $group: {
                _id: { $toLower: '$subscription.name' }, // Convert subscription name to lowercase
                totalAmount: { $sum: '$amount' }
              }
            },
            {
              $project: {
                _id: 0,
                subscriptionName: '$_id',
                totalAmount: 1
              }
            }
          ]);
  
        // Initialize the response object
        const response = {
          totalRevenue: 0,
          totalAmountBasicPlan: 0,
          totalAmountComboPlan: 0,
          totalAmountBulkPlan: 0,
          totalAmountResultPlan: 0,
  
          subRevenue: totalAmount.length > 0 ? totalAmount[0].totalAmount : 0,
          activePlans: activePlans,
          totalOrgan: totalOrgan,
          totalAmountContract: totalAmountContract.length > 0 ? totalAmountContract[0].totalAmount : 0,
        };
        

        // Populate the response object with the results from the aggregation
        result.forEach(item => {
          if (item.subscriptionName === 'basic') {
            response.totalAmountBasicPlan = item.totalAmount;
          } else if (item.subscriptionName === 'combo') {
            response.totalAmountComboPlan = item.totalAmount;
          } else if (item.subscriptionName === 'bulk') {
            response.totalAmountBulkPlan = item.totalAmount;
          } else if (item.subscriptionName === 'result') {
            response.totalAmountResultPlan = item.totalAmount;
          }
        });
  
        // Calculate total revenue
        response.totalRevenue = response.totalAmountBasicPlan +
                                response.totalAmountBulkPlan +
                                response.totalAmountComboPlan +
                                response.totalAmountResultPlan;
  
        return successResponse(res, 200, "Success", response);
  
      } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, error.message);
      }
    };

    // static async getOrganizations(req: Request, res: Response) {
    //   try {
    //     // Get the current date and time
    //     const now = new Date();
  
    //     // Calculate the start of this month
    //     const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
    //     // Calculate the start of last month
    //     const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    //     const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
    //     // Calculate the start of this year
    //     const startOfThisYear = new Date(now.getFullYear(), 0, 1);
  
    //     // Extract query parameters to determine the filter
    //     const { filter } = req.query;
  
    //     let matchCondition = {};
  
    //     if (filter === 'thisMonth') {
    //       matchCondition = { createdAt: { $gte: startOfThisMonth } };
    //     } else if (filter === 'lastMonth') {
    //       matchCondition = { createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth } };
    //     } else if (filter === 'thisYear') {
    //       matchCondition = { createdAt: { $gte: startOfThisYear } };
    //     }
  
    //     // Query the database with the match condition and project only the required fields
    //     const organizations = await Organization.find(matchCondition, {
    //       nameOfEstablishment: 1,
    //       email: 1,
    //       phone: 1,
    //       isActive: 1,
    //       createdAt: 1,
    //     }).exec();
  
    //     return successResponse(res, 200, 'Success', organizations);
    //   } catch (error: any) {
    //     writeErrosToLogs(error);
    //     return failedResponse(res, 500, error.message);
    //   }
    // };

    static async getOrganizations(req: Request, res: Response) {
      try {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const startOfThisYear = new Date(now.getFullYear(), 0, 1);
    
        const { filter, activeStatus, bizType } = req.query;
    
        let matchCondition: any = {};
    
        if (filter === 'thisMonth') {
          matchCondition.createdAt = { $gte: startOfThisMonth };
        } else if (filter === 'lastMonth') {
          matchCondition.createdAt = { $gte: startOfLastMonth, $lt: endOfLastMonth };
        } else if (filter === 'thisYear') {
          matchCondition.createdAt = { $gte: startOfThisYear };
        }if (bizType) {
          matchCondition.bizType = bizType;
        }
        
        const organizations = await Organization.find(matchCondition, {
          nameOfEstablishment: 1,
          email: 1,
          phone: 1,
          isActive:1,
          createdAt: 1,
        }).exec();
    
        const organizationsWithActiveStatus = await Promise.all(
          organizations.map(async (org) => {
            const hasActiveSubPlan = await org.hasActiveSubPlan();
    
            if (activeStatus === 'active' && !hasActiveSubPlan) {
              return null;
            }
            if (activeStatus === 'inactive' && hasActiveSubPlan) {
              return null;
            }
    
            const lastActivePlan = await Plan.findOne({
              Organization: org._id,
              paidStatus:true
            }).sort({ updatedAt: -1 }).exec();
    
            const firstPlan = await Plan.findOne({
              Organization: org._id,
              paidStatus: true,
            }).sort({ createdAt: 1 }).exec();
    
            return {
              ...org.toObject(),
              hasActiveSubPlan,
              lastActive: lastActivePlan ? lastActivePlan.updatedAt : "No Plan",
              firstPlan: firstPlan ? firstPlan.createdAt : "No Plan",
            };
          })
        );
    
        const filteredOrganizations = organizationsWithActiveStatus.filter(org => org !== null);
    
        return successResponse(res, 200, 'Success', filteredOrganizations);
      } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, error.message);
      }
    }
    

    static async getSubscriptionRevenue(req: Request, res: Response) {
      try {
        const now = new Date();
        const { filter } = req.query;
        const organizationId = req.params.organizationId
  
        let startDate;
  
        switch (filter) {
          case '12months':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
          case '6months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            break;
          case '1month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
          case '7days':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            break;
          default:
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
        }
  
        const subscriptionData = await Plan.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
              Organization:new mongoose.Types.ObjectId(organizationId), 
            }
          },
          {
            $lookup: {
              from: 'subscriptions', // The name of the Subscription collection
              localField: 'subscriptionType',
              foreignField: '_id',
              as: 'subscription'
            }
          },
          {
            $unwind: '$subscription'
          },
          {
            $group: {
              _id: {
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' },
                subscriptionName: '$subscription.name'
              },
              totalAmount: { $sum: '$amount' }
            }
          },
          {
            $project: {
              month: '$_id.month',
              year: '$_id.year',
              subscriptionName: '$_id.subscriptionName',
              totalAmount: 1,
              _id: 0
            }
          },
          {
            $sort: { year: 1, month: 1 }
          }
        ]);
  
        // Organize data by month and subscription type
        const organizedData: { [key: string]: any } = {};
  
        subscriptionData.forEach(data => {
          const { year, month, subscriptionName, totalAmount } = data;
          const key = `${year}-${month}`;
  
          if (!organizedData[key]) {
            organizedData[key] = {};
          }
  
          organizedData[key][subscriptionName] = totalAmount;
        });
  
        return successResponse(res, 200, 'Success', organizedData);
      } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, error.message);
      }
    };

    static async getOrgUserSummary (req:Request, res:Response){
      try {
        const {organizationId} = req.params;
        const organization = await Organization.findById(organizationId)
        const totalStudents = await User.countDocuments({organization:organizationId, role:"student"});
        const totalGuardian = await User.countDocuments({organization:organizationId, role:"guardian"});
        const totalStaffs = await User.countDocuments({organization:organizationId, role:"staff"});

        return successResponse(res, 200, "Success", {totalStudents,totalGuardian,totalStaffs, organization})
  
      } catch (error:any) {
        writeErrosToLogs(error)
        return failedResponse(res,500, error.message)
        
      }
  
    };

    static async getOrgActiveSubSummary(req: Request, res: Response) {
      try {
        const { organizationId } = req.params;
        const { page = 1, limit = 10 } = req.query; // Default values for pagination
  
        if (!mongoose.Types.ObjectId.isValid(organizationId as string)) {
          return failedResponse(res, 400, 'Invalid organization ID');
        }
  
        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(limit as string, 10);
        const skip = (pageNumber - 1) * pageSize;
  
        const plans = await Plan.find({
          Organization: organizationId,
          quantityLeft: { $gt: 0 },
          paidStatus: true
        })
          .select('subscriptionType quantity quantityLeft')
          .skip(skip)
          .limit(pageSize);
  
        const totalPlans = await Plan.countDocuments({
          Organization: organizationId,
          quantityLeft: { $gt: 0 },
          paidStatus: true
        });
  
        const totalPages = Math.ceil(totalPlans / pageSize);
  
        const response = {
          plans,
          totalPlans,
          totalPages,
          currentPage: pageNumber,
          pageSize
        };
  
        return successResponse(res, 200, "Success", response);
      } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, error.message);
      }
    };

    // static async organFeatureUsageMetric (req:Request, res:Response){
    //   try {
    //     const { organizationId } = req.params;
    
    //     if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    //       return failedResponse(res, 400, 'Invalid organization ID');
    //     }
    
    //     const result = await Plan.aggregate([
    //       {
    //         $match: {
    //           Organization: new mongoose.Types.ObjectId(organizationId),
    //         }
    //       },
    //       {
    //         $lookup: {
    //           from: 'subscriptions', // The name of the Subscription collection
    //           localField: 'subscriptionType',
    //           foreignField: '_id',
    //           as: 'subscription'
    //         }
    //       },
    //       {
    //         $unwind: '$subscription'
    //       },
    //       {
    //         $group: {
    //           _id: { $toLower: '$subscription.name' }, // Convert subscription name to lowercase
    //           planCount: { $sum: 1 } // Count the number of plans
    //         }
    //       },
    //       {
    //         $project: {
    //           _id: 0,
    //           subscriptionName: '$_id',
    //           planCount: 1
    //         }
    //       }
    //     ]);

    //     const total = result.reduce((acc, item) => acc + item.planCount, 0);

    //     result.forEach(item => {
    //       item.percentage = (item.planCount/total) * 100
    //     });
    
    //     return successResponse(res, 200, "Success", {result, total});
    //   } catch (error: any) {
    //     writeErrosToLogs(error);
    //     return failedResponse(res, 500, error.message);
    //   }
  
    // };
    static async organFeatureUsageMetric(req: Request, res: Response) {
      try {
        const { organizationId } = req.params;
    
        if (!mongoose.Types.ObjectId.isValid(organizationId)) {
          return failedResponse(res, 400, 'Invalid organization ID');
        }
    
        const result = await Plan.aggregate([
          {
            $match: {
              Organization: new mongoose.Types.ObjectId(organizationId),
            }
          },
          {
            $lookup: {
              from: 'subscriptions',
              localField: 'subscriptionType',
              foreignField: '_id',
              as: 'subscription'
            }
          },
          {
            $unwind: '$subscription'
          },
          {
            $lookup: {
              from: 'features',
              localField: 'subscription.feature',
              foreignField: '_id',
              as: 'features'
            }
          },
          {
            $unwind: '$features'
          },
          {
            $group: {
              _id: {
                subscriptionName: { $toLower: '$subscription.name' },
                featureName: '$features.name'
              },
              planCount: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: '$_id.subscriptionName',
              features: {
                $push: {
                  name: '$_id.featureName',
                  count: '$planCount'
                }
              },
              totalPlans: { $sum: '$planCount' }
            }
          },
          {
            $project: {
              _id: 0,
              subscriptionName: '$_id',
              features: 1,
              totalPlans: 1
            }
          }
        ]);
    
        const grandTotal = result.reduce((acc, item) => acc + item.totalPlans, 0);
    
        interface SubscriptionResult {
          subscriptionName: string;
          features: Array<{ name: string; count: number; percentage?: number }>;
          totalPlans: number;
          percentage?: number;
        }
    
        result.forEach((subscription: SubscriptionResult) => {
          subscription.percentage = (subscription.totalPlans / grandTotal) * 100;
          subscription.features.forEach((feature: { name: string; count: number; percentage?: number }) => {
            feature.percentage = (feature.count / subscription.totalPlans) * 100;
          });
        });
    
        return successResponse(res, 200, "Success", { result, grandTotal });
      } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, error.message);
      }
    }

    static async subscriptionSummary(req: Request, res: Response) {
      try {
        // const { organizationId } = req.params;
    
        // if (!mongoose.Types.ObjectId.isValid(organizationId)) {
        //   return failedResponse(res, 400, 'Invalid organization ID');
        // }
    
        const result = await Plan.aggregate([
          // {
          //   $match: {
          //     Organization: new mongoose.Types.ObjectId(organizationId),
          //   }
          // },
          {
            $lookup: {
              from: 'subscriptions',
              localField: 'subscriptionType',
              foreignField: '_id',
              as: 'subscription'
            }
          },
          {
            $unwind: '$subscription'
          },
          {
            $group: {
              _id: '$subscription._id',
              subscriptionName: { $first: '$subscription.name' },
              totalAmount: { $sum: { $ifNull: ['$amount', 0] } },
              planCount: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              subscriptionId: '$_id',
              subscriptionName: 1,
              totalAmount: 1,
              planCount: 1
            }
          }
        ]);
    
        const totalAmount = result.reduce((acc, item) => acc + item.totalAmount, 0);
        const totalPlans = result.reduce((acc, item) => acc + item.planCount, 0);
    
        result.forEach(item => {
          item.percentageAmount = (item.totalAmount / totalAmount) * 100;
          item.percentagePlans = (item.planCount / totalPlans) * 100;
        });
    
        return successResponse(res, 200, "Success", { result, totalAmount, totalPlans });
      } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, error.message);
      }
    }

  }

  export class ManageAccounts{

    static async deactivateOrganizationAccount(req: Request, res: Response) {
      try {
        let { status } = req.query;
        const { id } = req.params;
    
        // Ensure the status query parameter is provided
        if (!status) {
          return failedResponse(res, 400, "Status should be 'true' or 'false'");
        }
    
        // Convert the status parameter to a boolean
        const isActive = (status as string).toLowerCase() === "true";
    
        // Update the organization's status using the provided query parameter
        const organization = await Organization.findOneAndUpdate(
          { _id: id },  // Assuming you have the organization ID in the request parameters
          { isActive: isActive },  // Update the isActive field
          { new: true }  // Return the updated document
        );
    
        // Check if the organization exists
        if (!organization) {
          return failedResponse(res, 404, "Organization not found");
        }
    
        return successResponse(res, 200, "Organization status updated successfully", organization);
      } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, error.message);
      }
    }
  };


export class ManageAnnouncements {
  // Create a new announcement
  static async createAnnouncement(req: Request, res: Response) {
    try {
      const { error, value } = createAnnouncementSchema.validate(req.body);
      if (error) {
        return failedResponse(res, 400, error.details[0].message);
      }

      const newAnnouncement = await Announcement.create(value);
      value.createAt = new Date();
      myEmitter.emitCustomEvent(value) // send an event out 

      return successResponse(res, 201, "Announcement created successfully", newAnnouncement);
    } catch (error: any) {
      writeErrosToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  }

  // Get all announcements
  static async getAllAnnouncements(req: Request, res: Response) {
    try {
      const announcements = await Announcement.find();

      return successResponse(res, 200, "Announcements fetched successfully", announcements);
    } catch (error: any) {
      writeErrosToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  }

  // Get a single announcement by ID
  static async getAnnouncementById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const announcement = await Announcement.findById(id);

      if (!announcement) {
        return failedResponse(res, 404, "Announcement not found");
      }

      return successResponse(res, 200, "Announcement fetched successfully", announcement);
    } catch (error: any) {
      writeErrosToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  };

  // Update an announcement by ID
  static async updateAnnouncement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error, value } = updateAnnouncementSchema.validate(req.body);
      if (error) {
        return failedResponse(res, 400, error.details[0].message);
      }
      

      const updatedAnnouncement = await Announcement.findByIdAndUpdate(
        id,
        value,
        { new: true } // Return the updated document and validate the update against the model schema
      );

      if (!updatedAnnouncement) {
        return failedResponse(res, 404, "Announcement not found");
      }

      return successResponse(res, 200, "Announcement updated successfully", updatedAnnouncement);
    } catch (error: any) {
      writeErrosToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  }

  // Delete an announcement by ID
  static async deleteAnnouncement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

      if (!deletedAnnouncement) {
        return failedResponse(res, 404, "Announcement not found");
      }

      return successResponse(res, 200, "Announcement deleted successfully");
    } catch (error: any) {
      writeErrosToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  }
}