import { Request, Response, NextFunction } from "express";
import { AppToken, SignInOutRecordModel, User } from "../../../models/organization.models";
import { signInOutRecordValidator } from "../../../validators/organization.validator";
import { failedResponse, successResponse } from "../../../support/http"; 
import { writeErrosToLogs } from "../../../support/helpers";
import { Media } from "../../../models/media.models";
import { sendNotif } from "../../../support/firebaseNotification";

export class SignInOutRecordHistory {
    static async createHistory(req: Request, res: Response) {
        try {
            const { error, value } = signInOutRecordValidator.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            console.log((req as any).user)
            const { organization:organizationId } =  (req as any).user;

            // Check if users exist in the organization
            const usersToCheck = ['user', 'guardians', 'approvalBy', 'scannedBy', 'scannedUser'];
            const userExistPromises = usersToCheck.map(async (field) => {
                const user = await User.findOne({ _id: value[field], organization: organizationId });
                if (!user) {
                    return `This ${field} does not exist.`;
                }
            });
            const userExistResults = await Promise.all(userExistPromises);
            const userExistErrors = userExistResults.filter(Boolean); // Filter out null values
            if (userExistErrors.length > 0) {
                return failedResponse(res, 400, userExistErrors.join(' '));
            }

            // Prevent scannedUser id not in authorizedFor
            if (value.authorizedFor.includes(value.scannedUser)) {
                return failedResponse(res, 400, `scannedUser id cannot be in the authorizedFor array.`);
            }

            // Validate other
            // const other = await Media.findById(value.other);
            // if (!other) return failedResponse(res, 404, `Invalid media ID for others.`);

            // Create the main record
            const history = await SignInOutRecordModel.create({ ...value, organization: organizationId });

            // Create records for authorized users
            if (value.authorizedFor && value.authorizedFor.length > 0) {
                const children = await User.find({ _id: { $in: value.authorizedFor }, organization: organizationId });
                for (const child of children) {
                    const passToken = await AppToken.findById(child.passToken);
                    if (!passToken) return failedResponse(res, 400, `Child with id ${child._id} has no pass token.`);
                    if (passToken.expired) return failedResponse(res, 400, `Child with id ${child._id} has an expired token.`);
                }

                const recordsToCreate = value.authorizedFor.map((user: any) => ({
                    user,
                    guardians: value.guardians,
                    coordinate: value.coordinate,
                    approvalBy: value.approvalBy,
                    authorizationType: value.authorizationType,
                    scannedBy: value.scannedBy,
                    scannedUser: value.scannedUser,
                    scanned: false,
                    organization: organizationId,
                    other: value.other
                }));
                await SignInOutRecordModel.create(recordsToCreate);
            }

            return successResponse(res, 200, "Success.", { history });
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }
}

export class ScanChildQrCode {
    static async getDetails(req: Request, res: Response) {
        try {
            const student = await User.findById(req.params.id).populate("passToken");
            if (!student) {
                return failedResponse(res, 404, "Student not found");
            };
            let children;

            const token = await AppToken.findById(student.passToken)
            if (!token) {
                return failedResponse(res, 400, "Student has no active pass subscription");
            }

            if (token.expires_at.getTime() < Date.now()) {
                token.expired = true;
                await token.save();
                return failedResponse(res, 400, "Pass token has expired");
            }
            const guardians = await User.findById(student.guardians)
            .populate({
                path: "children",
                populate: {
                    path: "passToken",
                    match: { expired: false } // Only populate children whose token has not expired
                }
            });
            if (guardians) {
                // Filter out children without passToken or with expired passToken
                children = guardians.children.filter((child: any) => {
                  return child.passToken && 
                         !child.passToken.expired
                });
            }
            // await sendNotif("dxacpPtkwFpUUESfMlFdfB:APA91bHvDxRwXetjz6P2mtIQNR23SoEBJ9iI5l5zTjiCNcA-QSVZiHCCObQKEtMDUf_tytkJcsn1WKb80adF_jKBlJjhDJhskWS3Z933fdOAq4QhTcyRfS2vGWzrdSA3Ru7uaJVBSx--")
            return successResponse(res, 200, "Success",{student, children, guardians});
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }
}