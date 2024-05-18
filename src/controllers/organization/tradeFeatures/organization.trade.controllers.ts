import { Request, Response, NextFunction } from "express";
import { failedResponse, successResponse } from "../../../support/http"; 
import { writeErrosToLogs } from "../../../support/helpers";
import { createCategorySchema, createProductSchema } from "../../../validators/tradeFeature/organization.validator";
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
        const ITEMS_PER_PAGE = 10;
        try {

            const page = parseInt(req.query.page as string) || 1; // Get the page number from query parameters, default to 1
            const skip = (page - 1) * ITEMS_PER_PAGE; //
            const categoryExist = await Category.find({organization:req.params.organizationId})
            .skip(skip)
            .limit(ITEMS_PER_PAGE);

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

            const categoryExist = await Category.findOneAndDelete({_id:req.params.id,organization:req.params.organizationId})
            if (!categoryExist) return failedResponse(res, 404, "Category does not exist");

            return successResponse(res, 204, "Success", {categoryExist})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
}

export class Products {
    static async addProduct(req: Request, res: Response) {
        try {
            const { error, value } = createProductSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            const categoryExist = await Category.findOne({_id:value.category,organization:req.params.organizationId})
            if (!categoryExist) return failedResponse(res, 404, "Category does not exist");

            const validMediaId = await Media.findById(value.productCoverImage)
            if (!validMediaId) return failedResponse(res, 404, "This image does not exist");

            // save category
            value.uploadedBy = req.params.organizationId
            const newProduct = await Product.create(value)
            return successResponse(res, 201, "Product added succesfully", {newProduct})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    static async getAllProducts(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 10;
        try {
            const page = parseInt(req.query.page as string) || 1; // Get the page number from query parameters, default to 1
            const filterByCategory = req.query.category;
            const filterByInstock = req.query.inStock === 'true'; // Convert string to boolean

            const skip = (page - 1) * ITEMS_PER_PAGE;
    
            // Construct the filter object based on query parameters
            const filter: any = { uploadedBy: req.params.organizationId };
            if (filterByCategory) {
                filter.category = filterByCategory;
            }
            if (filterByInstock) {
                filter.quantity = { $gt: 0 }; // Products with quantity greater than 0
            }
    
            // Query products based on the constructed filter
            console.log(filter,"abvsd")
            const products = await Product.find(filter)
                .skip(skip)
                .limit(ITEMS_PER_PAGE);
    
            return successResponse(res, 200, "Success", { products });
    
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    
    static async getSingleProduct(req: Request, res: Response) {
        try {

            const productExist = await Product.findOne({_id:req.params.id,uploadedBy:req.params.organizationId})
            if (!productExist) return failedResponse(res, 404, "Product does not exist");

            return successResponse(res, 200, "Success", {productExist})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async updateSingleProduct(req: Request, res: Response) {
        try {
            const { error, value } = createProductSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            const productExist = await Product.findOneAndUpdate({_id:req.params.id,uploadedBy:req.params.organizationId}, value,{new:true})
            if (!productExist) return failedResponse(res, 404, "Product does not exist");

            return successResponse(res, 200, "Success", {productExist})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async deleteSingleProduct(req: Request, res: Response) {
        try {

            const productExist = await Product.findOneAndDelete({_id:req.params.id,uploadedBy:req.params.organizationId})
            if (!productExist) return failedResponse(res, 404, "Product does not exist");

            return successResponse(res, 204, "Success", {productExist})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
}