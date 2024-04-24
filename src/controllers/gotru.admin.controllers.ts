import { logger } from "../logger"; 
import { failedResponse, successResponse } from "../support/http";
import { Feature, Subscription } from "../models/admin.models";
import { Request, Response, NextFunction } from "express";
import { FeatureValidator } from "../validators/admin/admin.validators";


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
            const { error, value } = FeatureValidator.validate(req.body);
            if (error) {
                return failedResponse(res, 400, `${error.details[0].message}`);
            }
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