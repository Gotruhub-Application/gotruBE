import { Request, Response, NextFunction } from "express";
import { failedResponse, successResponse } from "../../../support/http"; 
import { createNotification, writeErrosToLogs } from "../../../support/helpers";
import { createCategorySchema, createProductSchema, payloadSchema, updateOrderStatusSchema, updateWithdrawalRequestSchema } from "../../../validators/tradeFeature/organization.validator";
import { Category, Order, Product, WalletModel, WalletTransactionModel, WithdrawalRequest } from "../../../models/organization.models";
import { Media } from "../../../models/media.models";
import mongoose from 'mongoose';
import bcrypt from "bcrypt"
import { CreateNotificationParams } from "../../../interfaces/general.interface";

export class Catetgory {
    static async addCategory(req: Request, res: Response) {
        try {
            const { error, value } = createCategorySchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            // check if categoty name already exist

            const categoryExist = await Category.findOne({name:value.name, organization:req.params.organizationId})
            if (categoryExist) return failedResponse(res, 400, "duplicate category name not allowed.")
            // validate media exist

            // const validMediaId = await Media.findById(value.image)
            // if (!validMediaId) return failedResponse(res, 404, "This image does not exist");

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
            const filterByproductName = req.query.name;

            const skip = (page - 1) * ITEMS_PER_PAGE;
    
            // Construct the filter object based on query parameters
            const filter: any = { uploadedBy: req.params.organizationId };
            if (filterByproductName) {
                filter.productName = { $regex: new RegExp(req.query.name as string, 'i') };
            }
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
};


export class WithdrawalRequestController {


    // Get all Withdrawal Requests
    static async getAllWithdrawalRequests(req: Request, res: Response) {
        try {
            const organizationId  = req.params.organizationId;
            console.log(organizationId, "sv")

            const { page = 1, limit = 10 } = req.query;

            const pageNumber = parseInt(page as string, 10) || 1;
            const limitNumber = parseInt(limit as string, 10) || 10;

            const withdrawalRequests = await WithdrawalRequest.find()
                .populate({
                    path: 'user',
                    match: { organizationId },
                    select: 'fullName email organization'
                })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber);

                console.log(withdrawalRequests.length, "sv")


            const totalWithdrawalRequests = withdrawalRequests.length;
            const totalPages = Math.ceil(totalWithdrawalRequests / limitNumber);

            return successResponse(res, 200, "Success", {
                withdrawalRequests,
                totalPages,
                currentPage: pageNumber,
                totalWithdrawalRequests,
            });
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while retrieving the withdrawal requests.");
        }
    }
    // Get Withdrawal Request by ID
    static async getWithdrawalRequestById(req: Request, res: Response) {
        try {
            const { id, organizationId} = req.params;
            const withdrawalRequest = await WithdrawalRequest.findById(id).populate({
                path: 'user',
                match: { organizationId },
                select: 'fullName email organization'
            });
            
            if (!withdrawalRequest) {
                return failedResponse(res, 404, "Withdrawal request not found.");
            }

            return successResponse(res, 200, "Success", withdrawalRequest);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while retrieving the withdrawal request.");
        }
    }

    // Update Withdrawal Request (status only)
    static async updateWithdrawalRequest(req: Request, res: Response) {
        try {
            const { id, organizationId} = req.params;

            const { error, value } = updateWithdrawalRequestSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            const withdrawalRequest = await WithdrawalRequest.findById(id).populate({
                path: 'user',
                match: { organizationId },
                select: 'fullName email organization'
            });

            if (!withdrawalRequest) {
                return failedResponse(res, 404, "Withdrawal request not found.");
            }

            if (value.status === 'rejected') {
                // Refund the amount to the wallet
                const wallet = await WalletModel.findById(withdrawalRequest.wallet);
                if (wallet) {
                    wallet.balance += withdrawalRequest.amount;
                    await wallet.save();

                    // Create a credit transaction
                    await WalletTransactionModel.create({
                        wallet: withdrawalRequest.wallet,
                        user: wallet.user,
                        amount: withdrawalRequest.amount,
                        type: 'credit'
                    });
                }
            }

            withdrawalRequest.status = value.status;
            await withdrawalRequest.save();

            return successResponse(res, 200, "Withdrawal request updated successfully.", withdrawalRequest);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while updating the withdrawal request.");
        }
    };
};


export class CartController {
    static async checkOut(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { organization, _id: user, role } = (req as any).user;

            const { error, value } = payloadSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            const { child_id } = value;
            const productIds = value.cart.map((item: any) => item.product);
            const products = await Product.find({ _id: { $in: productIds }, uploadedBy:organization }).session(session);
            const productMap = new Map(products.map(product => [product._id.toString(), product]));

            if(role !== "staff" && value.paymentMode === 'cash') return failedResponse(res, 403, `Only staffs can initiate cash a transaction. Please use a staff account.`);

            let totalAmount = 0;
            let newOrder;
            for (const item of value.cart) {
                const product = productMap.get(item.product);
                if (!product) return failedResponse(res, 400, `Product with id ${item.product} not found.`);
                if (product.quantity < item.quantity) return failedResponse(res, 400, `Product with id ${item.product} only has ${product.quantity} pieces left.`);
                totalAmount += product.price * item.quantity;
            }

            if (value.paymentMode === 'wallet') {
                const wallet = await WalletModel.findOne({ user: child_id }).select("+pin").session(session);
                if (!wallet) return failedResponse(res, 404, `Child wallet not found.`);

                const isValidPin = await bcrypt.compare(value.walletPin, wallet.pin);
                if (!isValidPin) return failedResponse(res, 400, `Invalid wallet credentials.`);

                if (wallet.balance < totalAmount) return failedResponse(res, 400, `Insufficient wallet balance`);

                wallet.balance -= totalAmount;
                await wallet.save({ session });

                const walletTransaction = await WalletTransactionModel.create([{
                    wallet: wallet._id,
                    user: wallet.user,
                    amount: totalAmount,
                    type: "debit"
                }], { session });

                newOrder = new Order({
                    user: wallet.user,
                    ...(role === "staff" && { attendant: user }),
                    items: value.cart,
                    totalAmount,
                    status: 'completed',
                    organization,
                    paymentMode: value.paymentMode,
                    // walletTransaction: walletTransaction[0]._id
                });
                await newOrder.save({ session });

            } else if (value.paymentMode === 'cash') {
                newOrder = new Order({
                    user: child_id,
                    ...(role === "staff" && { attendant: user }),
                    items: value.cart,
                    totalAmount,
                    status: 'completed',
                    organization,
                    paymentMode: value.paymentMode,
                    
                });
                await newOrder.save({ session });
            }

            for (const item of value.cart) {
                const product = productMap.get(item.product);
                if (product) {
                    product.quantity -= item.quantity;
                    await product.save({ session });
                }
            }
            // create sale notification to admin
            const payload: CreateNotificationParams = {
                owner: organization,
                title: `Sales alert`,
                type: `gotrutrade`,
                message: `#${totalAmount} of stocks has just been sold out via ${value.paymentMode}`
                };
            const payload2: CreateNotificationParams = {
                owner: child_id,
                title: `Purchase alert`,
                type: `gotrutrade`,
                message: `Your order was successful. Order ID ${newOrder?._id}`
                };
            await createNotification(payload); //admin
            await createNotification(payload2); //user

            await session.commitTransaction();
            session.endSession();

            return successResponse(res, 200, "Success", newOrder);
        } catch (error: any) {
            await session.abortTransaction();
            session.endSession();
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while processing the checkout.");
        }
    }
};


export class OrderController {
    // Get all orders for the requesting user with pagination
    static async getUserOrders(req: Request, res: Response) {
        try {
            const { child_id} = req.params
            const { page = 1, limit = 10 } = req.query;

            const orders = await Order.find({ user: child_id })
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .exec();

            const count = await Order.countDocuments({ user: child_id });

            return successResponse(res, 200, "Orders retrieved successfully.", {
                orders,
                totalPages: Math.ceil(count / Number(limit)),
                currentPage: Number(page),
                totalOrders: count
            });
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while retrieving the orders.");
        }
    }

    // Get all orders for the admin with pagination
    static async getAllOrders(req: Request, res: Response) {
        try {
            const { organizationId:organization} = req.params
            const { page = 1, limit = 10 } = req.query;

            // if (role !== 'admin') {
            //     return failedResponse(res, 403, "Unauthorized access.");
            // }

            const orders = await Order.find({organization})
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .exec();

            const count = await Order.countDocuments({organization});

            return successResponse(res, 200, "Orders retrieved successfully.", {
                orders,
                totalPages: Math.ceil(count / Number(limit)),
                currentPage: Number(page),
                totalOrders: count
            });
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while retrieving the orders.");
        }
    }

    // Get order by ID for the requesting user
    static async getUserOrderById(req: Request, res: Response) {
        try {

            const { orderId, child_id} = req.params;

            const order = await Order.findOne({ _id: orderId, user: child_id });

            if (!order) {
                return failedResponse(res, 404, "Order not found.");
            }

            return successResponse(res, 200, "Order retrieved successfully.", order);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while retrieving the order.");
        }
    }

    // Get order by ID for the admin
    static async getAdminOrderById(req: Request, res: Response) {
        try {

            const { orderId,organizationId:organization } = req.params;

            // if (role !== 'admin') {
            //     return failedResponse(res, 403, "Unauthorized access.");
            // }

            const order = await Order.findOne({_id:orderId, organization:organization});

            if (!order) {
                return failedResponse(res, 404, "Order not found.");
            }

            return successResponse(res, 200, "Order retrieved successfully.", order);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while retrieving the order.");
        }
    }

    // Update order status by the admin
    static async updateOrderStatus(req: Request, res: Response) {
        try {
            const {organizationId:organization } = req.params;
            const { orderId } = req.params;
            const { status } = req.body;

            const { error, value } = updateOrderStatusSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            
            const order = await Order.findOne({_id:orderId, organization:organization});

            if (!order) {
                return failedResponse(res, 404, "Order not found.");
            }

            order.status = value.status;
            await order.save();

            return successResponse(res, 200, "Order status updated successfully.", order);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while updating the order status.");
        }
    }

    // Delete order by the admin
    static async deleteOrder(req: Request, res: Response) {
        try {
            const {organizationId:organization} = req.params
            const { orderId } = req.params;

            const order = await Order.findOneAndDelete({_id:orderId, organization:organization});

            if (!order) {
                return failedResponse(res, 404, "Order not found.");
            }

            return successResponse(res, 200, "Order deleted successfully.");
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while deleting the order.");
        }
    }
}