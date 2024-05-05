import { Request, Response, NextFunction } from "express";
import { AppToken, SignInOutRecordModel, User } from "../../../models/organization.models";
import { failedResponse, successResponse } from "../../../support/http"; 
import { writeErrosToLogs } from "../../../support/helpers";


export class ParentManageRelatedAccounts {
    static async getAllRelatedAccount(req: Request, res: Response) {
        try {
            const { organization } = (req as any).user;
            const { _id: guardianId } = (req as any).user;

            const relatedAccounts = await User.find({
                organization,
                guardians: guardianId
            }).populate("profileImage")
            .populate("subUnit")
            .populate("piviotUnit");


            return successResponse(res, 200, "Success", { relatedAccounts });
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    static async getAllSIngleRelatedAccountPassHistory(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 10;
        try {
            const page = parseInt(req.query.page as string) || 1;
            const skip = (page - 1) * ITEMS_PER_PAGE; // Calculate the number of items to skip
            const { organization } = (req as any).user;
            const id = req.params.id;

            const student = await User.findById(req.params.id).populate("passToken");
            if (!student) {
                return failedResponse(res, 404, "Student not found");
            };

            const token = await AppToken.findById(student.passToken)
            if (!token) {
                return failedResponse(res, 400, "Student has no active pass subscription");
            };

            if (token.expires_at.getTime() < Date.now()) {
                token.expired = true;
                await token.save();
                return failedResponse(res, 400, "Pass token has expired");
            };
            const history = await SignInOutRecordModel.find({
                organization,
                user: id
            })
            .populate("user")
            .populate("other")
            .populate("authorizationType")
            .populate("approvalBy")
            .skip(skip)
            .limit(ITEMS_PER_PAGE); // Limit the number of items per page



            return successResponse(res, 200, "Success", { history });
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    } 
}