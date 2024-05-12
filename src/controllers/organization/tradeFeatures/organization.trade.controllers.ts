import { Request, Response, NextFunction } from "express";
import { failedResponse, successResponse } from "../../../support/http"; 
import { writeErrosToLogs } from "../../../support/helpers";
import { createCategorySchema } from "../../../validators/tradeFeature/organization.validator";
import { Category, Product } from "../../../models/organization.models";
import { Media } from "../../../models/media.models";

export class Catetgory {
    static async addCategory(req: Request, res: Response) {
        try {
            const { error, value } = createCategorySchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            // check if categoty name already exist

            const categoryExist = await Category.findOne({name:value.name, organization:req.params.organizationId})
            if (categoryExist) return failedResponse(res, 400, "duplicate category name not allowed.")
            // validate media exist

            const validMediaId = await Media.findById(value.image)
            if (!validMediaId) return failedResponse(res, 404, "This image does not exist");

            // save category
            value.organization = req.params.organizationId
            const newCategory = await Category.create(value)
            return successResponse(res, 201, "Category added succesfully", {newCategory})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getAllCategory(req: Request, res: Response) {
        try {

            const categoryExist = await Category.find({organization:req.params.organizationId})

            return successResponse(res, 200, "Success", {categoryExist})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getSingleCategory(req: Request, res: Response) {
        try {

            const categoryExist = await Category.findOne({_id:req.params.id,organization:req.params.organizationId})
            if (!categoryExist) return failedResponse(res, 404, "Category does not exist");

            return successResponse(res, 200, "Success", {categoryExist})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async updateSingleCategory(req: Request, res: Response) {
        try {
            const { error, value } = createCategorySchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            const categoryExist = await Category.findOneAndUpdate({_id:req.params.id,organization:req.params.organizationId}, value,{new:true})
            if (!categoryExist) return failedResponse(res, 404, "Category does not exist");

            return successResponse(res, 200, "Success", {categoryExist})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async deleteSingleCategory(req: Request, res: Response) {
        try {
            const { error, value } = createCategorySchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            const categoryExist = await Category.findOneAndDelete({_id:req.params.id,organization:req.params.organizationId})
            if (!categoryExist) return failedResponse(res, 404, "Category does not exist");

            return successResponse(res, 204, "Success", {categoryExist})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
}