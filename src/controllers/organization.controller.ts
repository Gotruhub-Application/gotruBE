import { Request, Response, NextFunction } from "express";
import { logger } from "../logger"; 
import { failedResponse, successResponse } from "../support/http";
import { Unit } from "../models/organization.models";
import { unitValidator } from "../validators/organization.validator";


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

          const unit = await Unit.findOne({id:req.params.id, organization:req.params.organizationId}).populate({
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
            const unit = await Unit.findOneAndUpdate({id:req.params.unitId, organization:req.params.organizationId, name:value.name}, {set$:{value}}, {new:true});
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

