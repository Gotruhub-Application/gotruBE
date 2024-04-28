import { Request, Response, NextFunction } from "express";
import { logger } from "../logger"; 
import { failedResponse, successResponse } from "../support/http";
import { SubUnit, Unit } from "../models/organization.models";
import { SubUnitValidator, unitValidator } from "../validators/organization.validator";
import { Logger } from "winston";


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

