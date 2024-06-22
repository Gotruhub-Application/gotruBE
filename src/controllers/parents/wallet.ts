import { Request, Response } from "express";
import { SubaccountModel, User, WalletModel, WalletTransactionModel, WithdrawalRequest } from "../../models/organization.models";
import { failedResponse, splitPaymentToSubAccount, successResponse } from "../../support/http"; 
import { writeErrosToLogs } from "../../support/helpers"; 
import { UpdateWalletPinSchema, UpdateWithdrawalAccount, createWithdrawalRequestSchema, fundWalletSchema } from "../../validators/parent/wallet";
import bcrypt from "bcrypt"
import { id_ID } from "@faker-js/faker";


export class ParentManageWallet {
    static async getChildWallet(req: Request, res: Response) {
        try {
            const { organization } = (req as any).user;
            const { _id } = (req as any).user;
            console.log(_id,"sdvbasdjvbds")
            const {child_id} = req.params
            console.log(child_id,"2222")

            const child = await User.findOne({
                organization:organization,
                guardians: _id,
                _id:child_id

            });
            if (!child) {
                return failedResponse(res, 404, "Child not found");
            };
            
            const childWallet = await WalletModel.findOne({user:child_id})

            const data = {
                _id:childWallet?._id,
                user:childWallet?.user,
                balance:childWallet?.balance

            }

            return successResponse(res, 200, "Success", data);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async updateChildWalletPin(req: Request, res: Response) {
        try {

            const {error, value} = UpdateWalletPinSchema.validate(req.body);
            if (error) {
                return failedResponse(res, 400, error.details[0].message);
            }

            const { organization } = (req as any).user;
            const { _id: guardianId } = (req as any).user;
            const {child_id} = req.params

            const child = await User.findOne({
                organization,
                guardians: guardianId,
                _id:child_id

            });
            if (!child) {
                return failedResponse(res, 404, "Child not found");
            };
            
            // validate old pin
            const wallet = await WalletModel.findOne({user:child_id})
            if(!wallet) return failedResponse(res, 400, "wallet not found");
            const corretOldPin = await bcrypt.compare(value.oldPin, wallet.pin)
            if(!corretOldPin) return failedResponse(res, 400, "incorrect old pin");

            value.newPin = await bcrypt.hash(value.newPin, 10)
            await WalletModel.findOneAndUpdate({user:child_id}, {pin:value.newPin})

            return successResponse(res, 200, "Pin updated successfully");
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getChildWalletTransaction(req: Request, res: Response) {
        try {
            const { organization } = (req as any).user;
            const { _id: guardianId } = (req as any).user;
            const { child_id } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10 transactions per page
            const skip = (page - 1) * limit;

            const child = await User.findOne({
                organization,
                guardians: guardianId,
                _id: child_id,
            });

            if (!child) {
                return failedResponse(res, 404, "Child not found");
            }

            const totalCount = await WalletTransactionModel.countDocuments({ user: child_id });
            const totalPages = Math.ceil(totalCount / limit);

            const transactions = await WalletTransactionModel.find({ user: child_id })
                .skip(skip)
                .limit(limit);

            return successResponse(res, 200, "Success", {
                transactions,
                totalPages,
                currentPage: page,
                totalCount,
            });
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    static async fundChildWallet(req: Request, res: Response) {
        try {

            const {error, value} = fundWalletSchema.validate(req.body);
            if (error) {
                return failedResponse(res, 400, error.details[0].message);
            }

            const { organization } = (req as any).user;
            const { _id, defaultEmail} = (req as any).user;
            const {child_id} = req.params

            const child = await User.findOne({
                organization:organization,
                guardians: _id,
                _id:child_id

            });
            if (!child) {
                return failedResponse(res, 404, "Child not found");
            };
            const subAcc = await SubaccountModel.findOne({organization:organization});
            if (!subAcc) return failedResponse(res, 400, "Your Organization has not set up a payment wallet yet.");

            const metadata:Array<object> = [{
                cart_id: child_id, // Adjust based on your data structure
                custom_fields: {
                    type:"wallet",
                    _id: child_id, // Assuming this is the plan ID
                    Organization:organization// Assuming this is the Organization ID
                    // Add other fields as needed
                }
            }]
            const payload:object ={
                email:defaultEmail,
                amount:(value.amount*100).toString(),
                subaccount:subAcc.subaccount_code,
                metadata:metadata,
                reference:`GOTRU_${Date.now()}`,
                bearer: "subaccount",
                transaction_charge: 100
                
                
            }
            const initiatePayment = await splitPaymentToSubAccount(payload)

            return successResponse(res, 200, "Success", initiatePayment);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getWithdrawalAccount(req: Request, res: Response) {
        try {

            const { _id: guardianId } = (req as any).user;

            const account = await User.findById(guardianId)
            .select("bankName accountNum accountName _id")
            .lean();
            
            if (!account) {
                return failedResponse(res, 404, "Account not found");
            };

            return successResponse(res, 200, "Success", account);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async updateWithdrawalAccount(req: Request, res: Response) {
        try {

            const {error, value} = UpdateWithdrawalAccount.validate(req.body);
            if (error) {
                return failedResponse(res, 400, error.details[0].message);
            }

            const { _id: guardianId } = (req as any).user;

            const account = await User.findByIdAndUpdate(guardianId, value, {new:true});
            if (!account) {
                return failedResponse(res, 404, "Account not found");
            };

            return successResponse(res, 200, "Account updated successfully", account);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

};



export class ParentWithdrawalRequestController {

    // Create Withdrawal Request
    static async createWithdrawalRequest(req: Request, res: Response) {
        try {
            // Validate request body against Joi schema
            const { error, value } = createWithdrawalRequestSchema.validate(req.body);
            if (error) {
                return failedResponse(res, 400, error.details[0].message);
            }

            const { amount } = value;
            const {_id:user, organization:organization,} = (req as any).user;
            const {child_id} = req.params;

            const child = await User.findOne({
                organization:organization,
                guardians: user,
                _id:child_id

            });
            if (!child) {
                return failedResponse(res, 404, "Child not found");
            };

            // Check if wallet exists and belongs to the user
            const userWallet = await WalletModel.findOne({ user:child_id });
            if (!userWallet) {
                return failedResponse(res, 404, 'Wallet not found or does not belong to the user.');
            }

            if(userWallet.balance < value.amount) return failedResponse(res, 400, 'Insufficient balance.')
            if(value.amount < 100) return failedResponse(res, 400, 'Invalid input.');


            value.user = user;
            value.wallet = userWallet
            // Create a new WithdrawalRequest
            const newWithdrawalRequest = await WithdrawalRequest.create(value);

            return successResponse(res, 201, 'Withdrawal request created successfully.', newWithdrawalRequest);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, 'An error occurred while creating the withdrawal request.');
        }
    };

    // Get all Withdrawal Requests
    static async getAllWithdrawalRequests(req: Request, res: Response) {
        try {
            const wallet_id = req.params.wallet_id
            const user_id = (req as any).user._id
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10 requests per page
            const skip = (page - 1) * limit;
    
            const totalCount = await WithdrawalRequest.countDocuments({ wallet: wallet_id,user:user_id });
            const totalPages = Math.ceil(totalCount / limit);
    
            const withdrawalRequests = await WithdrawalRequest.find({wallet: wallet_id, user:user_id})
                .skip(skip)
                .limit(limit);
    
            return successResponse(res, 200, "Success", {
                withdrawalRequests,
                totalPages,
                currentPage: page,
                totalCount,
            });
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, "An error occurred while retrieving the withdrawal requests.");
        }
    };
    

}