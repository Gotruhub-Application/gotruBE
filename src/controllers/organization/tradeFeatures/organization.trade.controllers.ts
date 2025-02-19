import { Request, Response, NextFunction } from "express";
import { failedResponse, successResponse } from "../../../support/http"; 
import { createNotification, writeErrosToLogs } from "../../../support/helpers";
import { createCategorySchema, createProductSchema, orderPickupSchema, payloadSchema, updateOrderStatusSchema, updateProductSchema, updateWithdrawalRequestSchema } from "../../../validators/tradeFeature/organization.validator";
import { Category, Order, OrderPickup, Product, ProductHistory, User, WalletModel, WalletTransactionModel, WithdrawalRequest } from "../../../models/organization.models";
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
    // static async getAllProducts(req: Request, res: Response) {
    //     const ITEMS_PER_PAGE = 50;
    //     try {
    //         const page = parseInt(req.query.page as string) || 1; // Get the page number from query parameters, default to 1
    //         const filterByCategory = req.query.category;
    //         const filterByInstock = req.query.inStock === 'true'; // Convert string to boolean
    //         const filterByproductName = req.query.name;

    //         const skip = (page - 1) * ITEMS_PER_PAGE;
    
    //         // Construct the filter object based on query parameters
    //         const filter: any = { uploadedBy: req.params.organizationId };
    //         if (filterByproductName) {
    //             filter.productName = { $regex: new RegExp(req.query.name as string, 'i') };
    //         }
    //         if (filterByCategory) {
    //             filter.category = filterByCategory;
    //         }
    //         if (filterByInstock) {
    //             filter.quantity = { $gt: 0 }; // Products with quantity greater than 0
    //         }
    
    //         // Query products based on the constructed filter
    //         console.log(filter,"abvsd")
    //         const products = await Product.find(filter)
    //             .skip(skip)
    //             .limit(ITEMS_PER_PAGE);
    
    //         return successResponse(res, 200, "Success", { products });
    
    //     } catch (error: any) {
    //         writeErrosToLogs(error);
    //         return failedResponse(res, 500, error.message);
    //     }
    // };
    static async getAllProducts(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 50;
        try {
          const page = parseInt(req.query.page as string) || 1;
          const filterByCategory = req.query.category;
          const filterByInstock = req.query.inStock === 'true';
          const filterByproductName = req.query.name;
      
          const skip = (page - 1) * ITEMS_PER_PAGE;
      
          const filter: any = { uploadedBy: req.params.organizationId };
          if (filterByproductName) {
            filter.productName = { $regex: new RegExp(req.query.name as string, 'i') };
          }
          if (filterByCategory) {
            filter.category = filterByCategory;
          }
          if (filterByInstock) {
            filter.quantity = { $gt: 0 };
          }
      
          const totalCount = await Product.countDocuments(filter);
          const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
      
          const products = await Product.find(filter)
            .skip(skip)
            .limit(ITEMS_PER_PAGE);
      
          return successResponse(res, 200, "Success", {
            products,
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
            const { error, value } = updateProductSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);
            const originalProduct = await Product.findOne({_id:req.params.id,uploadedBy:req.params.organizationId})

            const productExists = await Product.findOneAndUpdate({_id:req.params.id,uploadedBy:req.params.organizationId}, value,{new:true})
            if (!productExists) return failedResponse(res, 404, "Product does not exist");
             // Generate history description by comparing fields


            // Compare each field and generate appropriate description
            if (originalProduct?.productName !== value.productName) {
                await ProductHistory.create({
                  organization: req.params.organizationId,
                  product: req.params.id,
                  description: `Product name changed from "${originalProduct?.productName}" to "${value.productName}"`
              });
            }
            if (originalProduct?.price !== value.price) {
                await ProductHistory.create({
                  organization: req.params.organizationId,
                  product: req.params.id,
                  description: `Price updated from ${originalProduct?.price} to ${value.price}`
              });
            }
            if (originalProduct?.quantity !== value.quantity) {
                console.log("Heyyyyyy")
                await ProductHistory.create({
                  organization: req.params.organizationId,
                  product: req.params.id,
                  description: `Quantity updated from ${originalProduct?.quantity} to ${value.quantity}`
              });
            }
            if (originalProduct?.description !== value.description) {
                await ProductHistory.create({
                  organization: req.params.organizationId,
                  product: req.params.id,
                  description: `Description was updated`
              });
            }
            if (originalProduct?.minimumQuantity !== value.minimumQuantity) {
                await ProductHistory.create({
                  organization: req.params.organizationId,
                  product: req.params.id,
                  description: `Minimum quantity changed from ${originalProduct?.minimumQuantity} to ${value.minimumQuantity}`
              });
            }
            
            // // If category changed, fetch category names for better description
            // if (originalProduct?.category.toString() !== value.category.toString()) {
            //     const oldCategory = await Category.findById(originalProduct?.category);
            //     const newCategory = await Category.findById(value.category);
            //     if (oldCategory && newCategory) {
            //         await ProductHistory.create({
            //           organization: req.params.organizationId,
            //           product: req.params.id,
            //           description: `Category changed from "${oldCategory.name}" to "${newCategory.name}"`
            //       });
            //     }
            // }


            return successResponse(res, 200, "Success", {productExists})

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

    static async getSingleProductHistory(req: Request, res: Response) {
      try {
          const {
              startDate,
              endDate,
              description,
              sortOrder = 'desc',
              page = 1,
              limit = 100
          } = req.query;
  
          // Build filter object
          const filter: any = {
              organization: req.params.organizationId,
              product: req.params.id,
          };
  
          // Add date range filter if provided
          if (startDate || endDate) {
              filter.createdAt = {};
              if (startDate) {
                  filter.createdAt.$gte = new Date(startDate as string);
              }
              if (endDate) {
                  filter.createdAt.$lte = new Date(endDate as string);
              }
          }
  
          // Add description search if provided
          if (description) {
              filter.description = {
                  $regex: description,
                  $options: 'i'  // case-insensitive search
              };
          }
  
          // Calculate skip value for pagination
          const skip = (Number(page) - 1) * Number(limit);
  

          // Get total count for pagination
          const totalCount = await ProductHistory.countDocuments(filter);
  
          // Execute query with filters, pagination, and sorting
          const history = await ProductHistory.find(filter)
              .populate("organization")
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(Number(limit));
  
          // Calculate pagination info
          const totalPages = Math.ceil(totalCount / Number(limit));
          const hasNextPage = Number(page) < totalPages;
          const hasPrevPage = Number(page) > 1;
  
          return successResponse(res, 200, "Success", {
              history,
              pagination: {
                  currentPage: Number(page),
                  totalPages,
                  totalItems: totalCount,
                  hasNextPage,
                  hasPrevPage,
                  itemsPerPage: Number(limit)
              }
          });
      } catch (error: any) {
          writeErrosToLogs(error);
          return failedResponse(res, 500, error.message);
      }
  }
};


export class WithdrawalRequestController {


    // Get all Withdrawal Requests
    static async getAllWithdrawalRequests(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId;
            console.log(organizationId, "sv");

            const { page = 1, limit = 10 } = req.query;

            const pageNumber = parseInt(page as string, 10) || 1;
            const limitNumber = parseInt(limit as string, 10) || 10;

            const withdrawalRequests = await WithdrawalRequest.find({ user: { $ne: null } })
                .populate({
                    path: 'user',
                    match: { organization: organizationId },
                    select: 'fullName email organization'
                })
                .populate({
                    path: 'wallet',
                    select: 'balance'
                })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber);

            // Filter out withdrawal requests where the populated user is null
            const filteredWithdrawalRequests = withdrawalRequests.filter(wr => wr.user !== null);

            const totalWithdrawalRequests = filteredWithdrawalRequests.length;
            const totalPages = Math.ceil(totalWithdrawalRequests / limitNumber);

            return successResponse(res, 200, "Success", {
                withdrawalRequests: filteredWithdrawalRequests,
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
                match: { organization: organizationId },
                select: 'fullName email organization'
            })
            .populate({
                path: 'wallet',
                select: 'balance'
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
                match: { organization: organizationId },
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
                    deliveryDate: value.deliveryDate
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
            // // create sale notification to admin
            // const payload: CreateNotificationParams = {
            //     owner: organization,
            //     title: `Sales alert`,
            //     type: `gotrutrade`,
            //     message: `#${totalAmount} of stocks has just been sold out via ${value.paymentMode}`
            //     };
            const payload2: CreateNotificationParams = {
                owner: child_id,
                title: `Purchase alert`,
                type: `gotrutrade`,
                message: `Your order was successful. Order ID ${newOrder?._id}`
                };
            // await createNotification(payload); //admin
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
                .sort({ createdAt: -1 })
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
            let { organizationId:organization} = req.params
            const {organzId} = req.query
            const { page = 1, limit = 10 } = req.query;

            // if (role !== 'admin') {
            //     return failedResponse(res, 403, "Unauthorized access.");
            // }

            const orders = await Order.find({organization})
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ createdAt: -1 })
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
    };
    static async getAllOrdersMobile(req: Request, res: Response) {
        try {
            let { organizationId:organization} = req.query
            const {organzId} = req.query
            const { page = 1, limit = 10 } = req.query;

            // if (role !== 'admin') {
            //     return failedResponse(res, 403, "Unauthorized access.");
            // }

            const orders = await Order.find({organization})
                .limit(Number(limit))
                .sort({ createdAt: -1 })
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
    };


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
    };

    static async newUpdateOrderStatus(req: Request, res: Response) {
        try {
          const { organizationId: organization } = req.params;
          const { orderId } = req.params;
          const { error, value } = updateOrderStatusSchema.validate(req.body);
    
          if (error) return failedResponse(res, 400, `${error.details[0].message}`);
    
          const order = await Order.findOne({ _id: orderId, organization: organization });
    
          if (!order) {
            return failedResponse(res, 404, "Order not found.");
          }
    
          const orderUser = await User.findById(order.user).populate('guardians');
          if (!orderUser) {
            return failedResponse(res, 404, "Order user not found.");
          }
    
        //   const updatingUser = await User.findById(value.updatedBy);
        //   if (!updatingUser) {
        //     return failedResponse(res, 404, "Updating user not found.");
        //   }
    
          let collectedBy;
    
          switch (value.authorizedAccounts) {
            case "assignee":
              const orderPick = await OrderPickup.findOne({ subunit: orderUser.subUnit });
              if (!orderPick) {
                return failedResponse(res, 404, "Order pickup not found for the subunit.");
              }
            //   if (orderPick.assignee.toString() !== updatingUser._id.toString()) {
            //     return failedResponse(res, 403, "Unauthorized access.");
            //   }
              collectedBy = orderPick.assignee;
              break;
    
            case "guardian":
            //   if (!orderUser.guardians || orderUser.guardians.toString() !== updatingUser._id.toString()) {
            //     return failedResponse(res, 403, "Unauthorized access.");
            //   }
              collectedBy = orderUser.guardians;
              break;
    
            case "member":
            //   if (orderUser._id.toString() !== updatingUser._id.toString()) {
            //     return failedResponse(res, 403, "Unauthorized access.");
            //   }
              collectedBy = orderUser._id;
              break;
    
            default:
              return failedResponse(res, 400, "Invalid authorized account type.");
          }
    
          order.status = value.status;
          order.collectedBy = collectedBy;
          

          if (value.status === "delivered"){
            value.deliveredOn = new Date();
            order.deliveredOn = value.deliveredOn;
          }
    
          await order.save();
    
          return successResponse(res, 200, "Order status updated successfully.", order);
        } catch (error: any) {
          writeErrosToLogs(error);
          return failedResponse(res, 500, `An error occurred while updating the order status: ${error.message}`);
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
    };
    // static async getOrdersByUnitOrSubunit(req: Request, res: Response) {
    //     try {
    //     let { organizationId} = req.query
    //       const { unitId, subunitId, page = 1, limit = 10, today } = req.query;
          
    //       // Convert page and limit to numbers
    //       const pageNum = Number(page);
    //       const limitNum = Number(limit);
    
    //       // Base query for users
    //       let userQuery: any = { organization: organizationId };
    //       // let userQuery: any = { };
    
    //       if (unitId) {
    //         userQuery.piviotUnit = unitId;
    //       }
    
    //       if (subunitId) {
    //         userQuery.subUnit = subunitId;
    //       }
    
    //       // Find all users in the specified unit or subunit
    //       const users = await User.find(userQuery).select('_id');
    //       const userIds = users.map(user => user._id);
    
    //       // Base query for orders
    //       let orderQuery: any = {
    //         // organization: organizationId,
    //         user: { $in: userIds }
    //       };
    
    //       // If 'today' is true, add date filter
    //       if (today === 'true') {
    //         const startOfDay = new Date();
    //         startOfDay.setHours(0, 0, 0, 0);
    
    //         const endOfDay = new Date();
    //         endOfDay.setHours(23, 59, 59, 999);
    
    //         orderQuery.createdAt = {
    //           $gte: startOfDay,
    //           $lte: endOfDay
    //         };
    //       }
    
    //       // Execute the query
    //       const orders = await Order.find(orderQuery)
    //         .populate('user', 'fullName regNum')
    //         .populate('items.product')
    //         .populate('attendant')
    //         .limit(limitNum)
    //         .skip((pageNum - 1) * limitNum)
    //         .exec();
    
    //       // Count total documents
    //       const count = await Order.countDocuments(orderQuery);
    
    //       return successResponse(res, 200, "Orders retrieved successfully.", {
    //         orders,
    //         totalPages: Math.ceil(count / limitNum),
    //         currentPage: pageNum,
    //         totalOrders: count
    //       });
    //     } catch (error: any) {
    //       writeErrosToLogs(error);
    //       return failedResponse(res, 500, `An error occurred while retrieving the orders: ${error.message}`);
    //     }
    //   }

    static async getOrdersByUnitOrSubunit(req: Request, res: Response) {
      try {
        let { organizationId } = req.query
        const { 
          unitId, 
          subunitId, 
          page = 1, 
          limit = 10, 
          today,
          startDate,
          endDate 
        } = req.query;
    
        // Convert page and limit to numbers
        const pageNum = Number(page);
        const limitNum = Number(limit);
    
        // Base query for users
        let userQuery: any = { organization: organizationId };
        // let userQuery: any = { };
    
        if (unitId) {
          userQuery.piviotUnit = unitId;
        }
    
        if (subunitId) {
          userQuery.subUnit = subunitId;
        }
    
        // Find all users in the specified unit or subunit
        const users = await User.find(userQuery).select('_id');
        const userIds = users.map(user => user._id);
    
        // Base query for orders
        let orderQuery: any = {
          // organization: organizationId,
          user: { $in: userIds }
        };
    
        // Handle date filtering
        if (today === 'true') {
          // If today is specified, it takes precedence over date range
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
    
          const endOfDay = new Date();
          endOfDay.setHours(23, 59, 59, 999);
    
          orderQuery.createdAt = {
            $gte: startOfDay,
            $lte: endOfDay
          };
        } else if (startDate || endDate) {
          // Handle date range filtering
          orderQuery.createdAt = {};
          
          if (startDate) {
            const start = new Date(startDate as string);
            start.setHours(0, 0, 0, 0);
            orderQuery.createdAt.$gte = start;
          }
          
          if (endDate) {
            const end = new Date(endDate as string);
            end.setHours(23, 59, 59, 999);
            orderQuery.createdAt.$lte = end;
          }
        }
    
        // Execute the query
        const orders = await Order.find(orderQuery)
          .populate('user', 'fullName regNum')
          .populate('items.product')
          .populate('attendant')
          .limit(limitNum)
          .skip((pageNum - 1) * limitNum)
          .exec();
    
        // Count total documents
        const count = await Order.countDocuments(orderQuery);
    
        return successResponse(res, 200, "Orders retrieved successfully.", {
          orders,
          totalPages: Math.ceil(count / limitNum),
          currentPage: pageNum,
          totalOrders: count
        });
      } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, `An error occurred while retrieving the orders: ${error.message}`);
      }
    }
};


export class OrderPickupController {
    // Create method
    static async createOrderPickup(req: Request, res: Response) {
      try {
        let { organizationId:organization} = req.query
        const { error, value } = orderPickupSchema.validate(req.body);
        if (error) {
          return failedResponse(res, 400, `Validation error: ${error.details[0].message}`);
        }

        value.organization = organization;
  
        const newOrderPickup = new OrderPickup(value);
        const savedOrderPickup = await newOrderPickup.save();
  
  
        return successResponse(res, 201, "OrderPickup created successfully.", savedOrderPickup);
      } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, `Error creating OrderPickup: ${error.message}`);
      }
    }
  
    // GetById method
    static async getOrderPickupById(req: Request, res: Response) {
      try {
        
        const { id } = req.params;
        const orderPickup = await OrderPickup.findById(id);
        if (!orderPickup) {
          return failedResponse(res, 404, "OrderPickup not found.");
        }
        return successResponse(res, 200, "OrderPickup retrieved successfully.", orderPickup);
      } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, `Error fetching OrderPickup: ${error.message}`);
      }
    }
  
    // Update method
    static async updateOrderPickup(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const { error, value } = orderPickupSchema.validate(req.body);
        if (error) {
          return failedResponse(res, 400, `Validation error: ${error.details[0].message}`);
        }
  
        const updatedOrderPickup = await OrderPickup.findByIdAndUpdate(id, value, { new: true });
        if (!updatedOrderPickup) {
          return failedResponse(res, 404, "OrderPickup not found.");
        }
        return successResponse(res, 200, "OrderPickup updated successfully.", updatedOrderPickup);
      } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, `Error updating OrderPickup: ${error.message}`);
      }
    }
  
    // Delete method
    static async deleteOrderPickupById(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const orderPickup = await OrderPickup.findByIdAndDelete(id);
        if (!orderPickup) {
          return failedResponse(res, 404, "OrderPickup not found.");
        }
        return successResponse(res, 200, "OrderPickup deleted successfully.", orderPickup);
      } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, `Error deleting OrderPickup: ${error.message}`);
      }
    }
  
    // Get all method
    static async getAllOrderPickups(req: Request, res: Response) {
      try {
        let { organizationId:organization} = req.query
        const orderPickups = await OrderPickup.find({organization});
        return successResponse(res, 200, "OrderPickups retrieved successfully.", orderPickups);
      } catch (error: any) {
        writeErrosToLogs(error);
        return failedResponse(res, 500, `Error fetching OrderPickups: ${error.message}`);
      }
    }

    // get pickup by assignee id
    static async getAllOrderPickupsByAsigneeId(req: Request, res: Response) {
        try {
          let { organizationId:organization} = req.query
          const { assigneeId} = req.params;
          const orderPickups = await OrderPickup.find({organization, assignee:assigneeId});
          return successResponse(res, 200, "OrderPickups retrieved successfully.", orderPickups);
        } catch (error: any) {
          writeErrosToLogs(error);
          return failedResponse(res, 500, `Error fetching OrderPickups: ${error.message}`);
        }
      }
  };
