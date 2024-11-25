import { Request, Response } from "express";
import { failedResponse, successResponse } from "../../../support/http"; 
import { writeErrosToLogs } from "../../../support/helpers";
import { logger } from "../../../logger";
import { AppToken, SubUnit, User } from "../../../models/organization.models";
import { ResultSchema } from "../../../validators/resultfeature/resultfeature.validator";
import { Result } from "../../../models/organziation/resultfeature.models";
import { TermModel } from "../../../models/organziation/monitorFeature.models";
import { Feature, Subscription } from "../../../models/admin.models";
import { Notification } from "../../../models/general.models";


export class ResultController {
    static async uploadResult(req: Request, res: Response) {
        try {
            const { error, value } = ResultSchema.validate(req.body);
            const staff = (req as any).user._id
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            const termExist = await TermModel.findOne({ _id: value.term, organization: (req as any).user.organization });
            if (!termExist) return failedResponse(res, 400, "Term not found.");

            const user = await User.findById(value.user);
            if (!user) return failedResponse(res, 404, "User not found.");

            // Check if the user is the coordinator of the course
            const subunit= await SubUnit.findById(user?.subUnit);
            if(subunit?.coordinator != staff) return failedResponse(res, 403, "Permission denied. You are not the coordinator of this subunit.");


            // Set additional values
            value.organization = req.params.organizationId;
            value.subUnit = user.subUnit;
            value.sessionId = termExist?.sessionId;

            // Upsert result
            const result = await Result.updateOne(
                { user: value.user },
                { $set: value },
                { upsert: true }
            );

            // create notification
            const message = `Result for ${user.fullName}'s has just been uploaded at ${new Date()}`
            await Notification.create({
                owner: req.params.organizationId,
                title: `New result uploads`,
                type: `result_check`,
                message: message
              });

            return successResponse(res, 201, "Success", result);

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getResult(req: Request, res: Response) {
        try {

            const {sessionId, termId, studentId:userId} = req.params

            console.log(sessionId,termId, userId)
            const {role} =(req as any).user;

            if (role === "student"){
                // get token
                const {resultToken} = req.query;
                if (!resultToken) return failedResponse(res, 400, "Result token is required in query params.");

                // validate the token
                const token = await AppToken.findOne({token:resultToken});
                if (!token) return failedResponse(res, 400, "Result token is invalid");

                if (token?.used) return failedResponse(res, 400, "Result token nohas been used.");

                if ('planValidity' in token.plan) {
                    const currentDate = new Date();
                    
                    const subPlanType = await Subscription.findById(token.plan.subscriptionType);
                    if (!subPlanType) return failedResponse (res, 404, "subscriptionType not found.");
                    const features = subPlanType.feature;
                    for(const feature of features) {
                        const _feature = await Feature.findById(feature);
                        if(_feature?.name.toLocaleLowerCase() === "result") {
                            break;
        
                        }else {
                            return failedResponse (res, 400, "Not a result token. Please contact support.");
                        }
                    };
                };

                const result = await Result.findOne({sessionId:sessionId, user:userId, term:termId});
                if (!result) return failedResponse(res, 404, "Result not found.");
                token.used = true;
                token.expired= true
                await token.save();
                return successResponse(res, 201, "Success", result);
            }else if(role !="staff"){
                return failedResponse(res, 403, "Permission denied");
            }
            const result = await Result.findOne({sessionId:sessionId, user:userId, term:termId});
            if (!result) return failedResponse(res, 404, "Result not found.");
            return successResponse(res, 201, "Success", result);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getSubUnitStudents(req: Request, res: Response) {
        try {
            const { subUnitId, sessionId, termId } = req.params;
            const staffId = (req as any).user._id;
        
            const termExist = await TermModel.findOne({ _id: termId, organization: (req as any).user.organization });
            if (!termExist) return failedResponse(res, 400, "Term not found.");
        
            // Check if the user is the coordinator of the course
            const subunit = await SubUnit.findById(subUnitId);
            if (subunit?.coordinator.toString() !== staffId.toString()) return failedResponse(res, 403, "Permission denied. You are not the coordinator of this subunit.");
        
            const users = await User.find({ subUnit: subUnitId })
                .lean();
            if (!users.length) return successResponse(res, 200, "No users found in this subunit.", []);
        
            // Add has_result field to each user
            const usersWithHasResult = await Promise.all(users.map(async user => ({
                ...user,
                has_result: await ResultController.userHasResult(user._id.toString(), sessionId, subUnitId, termId)
            })));
        
            return successResponse(res, 200, "Success", usersWithHasResult);
        
            } catch (error: any) {
                writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
            }
      };
    
      static async userHasResult(userId: string, sessionId: string, subUnitId: string, termId: string): Promise<boolean> {
        const result = await Result.findOne({ user: userId, sessionId, subUnit: subUnitId, term: termId });
        return !!result;
      };

      static async clearUploadByUser(req: Request, res: Response) {
        try {

            const {sessionId, termId, studentId:userId,subUnitId} = req.params
            const staffId = (req as any).user._id;

            // Check if the user is the coordinator of the course
            const subunit = await SubUnit.findById(subUnitId);
            if (subunit?.coordinator.toString() !== staffId.toString()) return failedResponse(res, 403, "Permission denied. You are not the coordinator of this subunit.");

            const result = await Result.findOneAndDelete({sessionId:sessionId, user:userId, term:termId});
            if (!result) return failedResponse(res, 404, "Result not found.");
            return successResponse(res, 204, "Upload cleared successfully.");
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async viewResults(req: Request, res: Response) {
        try {

            const {sessionId, termId, subUnitId, organizationId} = req.params
            console.log(sessionId, termId, subUnitId, organizationId)

            const results = await Result.find({sessionId:sessionId, term:termId,subUnit:subUnitId});
            if (!results) return failedResponse(res, 404, "Result not found.");
            return successResponse(res, 200, "Success.", results);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    

}