import { Request, Response, NextFunction } from "express";
import { failedResponse, initiatePaystack, successResponse } from "../../../support/http"; 
import { writeErrosToLogs } from "../../../support/helpers";
import { createAttendanceSchema, createClassScheduleSchema, createCourseSchema, createSessionSchema, createSubUnitCourseSchema, createTermSchema, updateAttendanceSchema, updateClassScheduleSchema, updateCourseSchema, updateSessionSchema, updateSubUnitCourseSchema, updateTermSchema } from "../../../validators/monitorFeature/organization.monitor";
import { AttendanceModel, ClassScheduleModel, CourseModel, SessionModel, SubUnitCourseModel, TermModel } from "../../../models/organziation/monitorFeature.models";
import { logger } from "../../../logger";

export class Session {
    static async addSession(req: Request, res: Response) {
        try {
            const { error, value } = createSessionSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            // check if session name already exist

            const sessionExist = await SessionModel.findOne({name:value.name, organization:req.params.organizationId})
            if (sessionExist) return failedResponse(res, 400, "duplicate session name not allowed.")
            // validate media exist

            // save category
            value.organization = req.params.organizationId
            const newSession = await SessionModel.create(value)
            return successResponse(res, 201, "Session added succesfully", {newSession})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getAllSessions(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 10;
        try {

            const page = parseInt(req.query.page as string) || 1; // Get the page number from query parameters, default to 1
            const skip = (page - 1) * ITEMS_PER_PAGE; //
            const sessionExist = await SessionModel.find({organization:req.params.organizationId})
            .skip(skip)
            .limit(ITEMS_PER_PAGE);

            return successResponse(res, 200, "Success", sessionExist)

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getSingleSession(req: Request, res: Response) {
        try {

            const sessionExist = await SessionModel.findOne({_id:req.params.sessionId,organization:req.params.organizationId})
            if (!sessionExist) return failedResponse(res, 404, "Session does not exist");

            return successResponse(res, 200, "Success", sessionExist)

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async updateSingleSession(req: Request, res: Response) {
        try {
            const { error, value } = updateSessionSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            const sessionExist = await SessionModel.findOneAndUpdate({_id:req.params.sessionId,organization:req.params.organizationId}, value,{new:true})
            if (!sessionExist) return failedResponse(res, 404, "Session does not exist");

            return successResponse(res, 200, "Success", {sessionExist})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async deleteSingleSession(req: Request, res: Response) {
        try {

            const sessionExist = await SessionModel.findOneAndDelete({_id:req.params.sessionId,organization:req.params.organizationId})
            if (!sessionExist) return failedResponse(res, 404, "Session does not exist");

            return successResponse(res, 204, "Success", {sessionExist})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
};


export class TermController {
    static async addTerm(req: Request, res: Response) {
        try {
            const { error, value } = createTermSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            // check if term name already exist

            const termExist = await TermModel.findOne({name:value.name, organization:req.params.organizationId, sessionId:value.sessionId})
            if (termExist) return failedResponse(res, 400, "duplicate term name not allowed.")
            // validate media exist

            // save category
            value.organization = req.params.organizationId
            const term = await TermModel.create(value)
            return successResponse(res, 201, "Term added succesfully", term)

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getAllTerms(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 10;
        try {

            const page = parseInt(req.query.page as string) || 1; // Get the page number from query parameters, default to 1
            const skip = (page - 1) * ITEMS_PER_PAGE; //
            const termExist = await TermModel.find({organization:req.params.organizationId,sessionId:req.params.sessionId})
            .skip(skip)
            .limit(ITEMS_PER_PAGE);

            return successResponse(res, 200, "Success", termExist)

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getSingleTerm(req: Request, res: Response) {
        try {

            const termExist = await TermModel.findOne({_id:req.params.termId,organization:req.params.organizationId})
            if (!termExist) return failedResponse(res, 404, "Term does not exist");

            return successResponse(res, 200, "Success", termExist)

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async updateSingleSessionTerm(req: Request, res: Response) {
        try {
            const { error, value } = updateTermSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            const termExist = await TermModel.findOneAndUpdate({_id:req.params.termId,organization:req.params.organizationId}, value,{new:true})
            if (!termExist) return failedResponse(res, 404, "Term does not exist");

            return successResponse(res, 200, "Success", termExist)

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async deleteSingleSessionTerm(req: Request, res: Response) {
        try {

            const termExist = await TermModel.findOneAndDelete({_id:req.params.termId,organization:req.params.organizationId})
            if (!termExist) return failedResponse(res, 404, "Term does not exist");

            return successResponse(res, 204, "Success", termExist)

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
};


export class CourseController {
    static async addCourse(req: Request, res: Response) {
        try {
            const { error, value } = createCourseSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            // check if term name already exist

            const courseExist = await CourseModel.findOne({name:value.name, organization:req.params.organizationId, courseCode:value.courseCode})
            if (courseExist) return failedResponse(res, 400, "duplicate course name not allowed.")
            // validate media exist

            // save category
            value.organization = req.params.organizationId
            const course = await CourseModel.create(value)
            return successResponse(res, 201, "course added succesfully", course)

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getAllCourses(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 10;
        try {

            const page = parseInt(req.query.page as string) || 1; // Get the page number from query parameters, default to 1
            const skip = (page - 1) * ITEMS_PER_PAGE; //
            const courseExist = await CourseModel.find({organization:req.params.organizationId})
            .skip(skip)
            .limit(ITEMS_PER_PAGE);

            return successResponse(res, 200, "Success", courseExist)

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getSingleCourse(req: Request, res: Response) {
        try {

            const courseExist = await CourseModel.findOne({_id:req.params.courseId,organization:req.params.organizationId})
            if (!courseExist) return failedResponse(res, 404, "Course does not exist");

            return successResponse(res, 200, "Success", courseExist)

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async updateSingleCourse(req: Request, res: Response) {
        try {
            const { error, value } = updateCourseSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            const courseExist = await CourseModel.findOneAndUpdate({_id:req.params.courseId,organization:req.params.organizationId}, value,{new:true})
            if (!courseExist) return failedResponse(res, 404, "Term does not exist");

            return successResponse(res, 200, "Success", courseExist)

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async deleteSingleCourse(req: Request, res: Response) {
        try {

            const courseExist = await CourseModel.findOneAndDelete({_id:req.params.courseId,organization:req.params.organizationId})
            if (!courseExist) return failedResponse(res, 404, "Course does not exist");

            return successResponse(res, 204, "Success", {courseExist})

        }catch(error:any){
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
};


export class SubUnitCourseController {
    static async addSubUnitCourse(req: Request, res: Response) {
        try {
            const { error, value } = createSubUnitCourseSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            // check if sub-unit course already exists
            const subUnitCourseExist = await SubUnitCourseModel.findOne({
                course: value.course,
                organization: req.params.organizationId,
                subUnit: value.subUnit,
                term: value.term
            });
            if (subUnitCourseExist) return failedResponse(res, 400, "Duplicate sub-unit course not allowed.");

            // save sub-unit course
            value.organization = req.params.organizationId;
            const subUnitCourse = await SubUnitCourseModel.create(value);
            return successResponse(res, 201, "Sub-unit course added successfully", subUnitCourse );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    static async getAllUNPaidSubUnitCourses(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 10;
        try {
            const page = parseInt(req.query.page as string) || 1;
            const skip = (page - 1) * ITEMS_PER_PAGE;
            const subUnitCourses = await SubUnitCourseModel.find({ organization: req.params.organizationId, paid:false })
                .skip(skip)
                .limit(ITEMS_PER_PAGE);

            return successResponse(res, 200, "Success", subUnitCourses );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async SubUnitCoursesCheckout(req: Request, res: Response) {
        try {

            const subUnitCourses = await SubUnitCourseModel.find({ organization: req.params.organizationId, paid:false })

            let totalAmount = 0;
            for (const course of subUnitCourses) {

                totalAmount += 100; // Add the amount of each plan to the total
            }
            const metadata = subUnitCourses.map(course => ({
            cart_id: course._id, // Adjust based on your data structure
            custom_fields: {
                type:"subUnitCourses",
                _id: course._id, // Assuming this is the plan ID
                Organization: course.organization // Assuming this is the Organization ID
                // Add other fields as needed
                }
            }));
                
            
            const paystack = await initiatePaystack(metadata,(req as any).org.email, (totalAmount*100))
            return successResponse(res, 200, "Success", paystack)

        }catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    static async getAllPaidSubUnitCourses(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 10;
        try {
            const page = parseInt(req.query.page as string) || 1;
            const skip = (page - 1) * ITEMS_PER_PAGE;
            const subUnitCourses = await SubUnitCourseModel.find({ organization: req.params.organizationId, paid:true, subUnit:req.params.subUnitId })
                .skip(skip)
                .limit(ITEMS_PER_PAGE);

            return successResponse(res, 200, "Success", subUnitCourses );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    static async getSingleSubUnitCourse(req: Request, res: Response) {
        try {
            const subUnitCourse = await SubUnitCourseModel.findOne({ _id: req.params.courseId, organization: req.params.organizationId });
            if (!subUnitCourse) return failedResponse(res, 404, "Sub-unit course does not exist");

            return successResponse(res, 200, "Success", subUnitCourse );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    // static async updateSingleSubUnitCourse(req: Request, res: Response) {
    //     try {
    //         const { error, value } = updateSubUnitCourseSchema.validate(req.body);
    //         if (error) return failedResponse(res, 400, `${error.details[0].message}`);

    //         const subUnitCourse = await SubUnitCourseModel.findOneAndUpdate({ _id: req.params.subUnitId, organization: req.params.organizationId }, value, { new: true });
    //         if (!subUnitCourse) return failedResponse(res, 404, "Sub-unit course does not exist");

    //         return successResponse(res, 200, "Success", subUnitCourse);

    //     } catch (error: any) {
    //         writeErrosToLogs(error);
    //         return failedResponse(res, 500, error.message);
    //     }
    // }

    static async deleteSingleSubUnitCourse(req: Request, res: Response) {
        try {
            const subUnitCourse = await SubUnitCourseModel.findOneAndDelete({ _id: req.params.courseId, organization: req.params.organizationId });
            if (!subUnitCourse) return failedResponse(res, 404, "Sub-unit course does not exist");

            return successResponse(res, 204, "Success", subUnitCourse);

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }
};


export class ClassScheduleController {
    static async addClassSchedule(req: Request, res: Response) {
        try {
            const { error, value } = createClassScheduleSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);
            value.organization = req.params.organizationId;

            // validate subunitCourse paid status
            const IspaidCourse = await SubUnitCourseModel.findOne({_id:value.course, organization:value.organization})
            if(!IspaidCourse) return failedResponse(res, 404, "Course not found");
            if (!IspaidCourse.paid && !IspaidCourse.expired) return failedResponse(res, 400, "Only paid sub-unit courses can be added to schedule.");

            // add term
            value.term = IspaidCourse.term;
            value.subUnit = IspaidCourse.subUnit;
            // save class schedule
            const classSchedule = await ClassScheduleModel.create(value);
            return successResponse(res, 201, "Class schedule added successfully", classSchedule);

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    static async getAllClassSchedules(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 10;
        try {
            const page = parseInt(req.query.page as string) || 1;
            const skip = (page - 1) * ITEMS_PER_PAGE;

            logger.info(req.params.organizationId)
            const classSchedules = await ClassScheduleModel.find({ organization:req.params.organizationId, subUnit:req.params.subUnitId })
                .skip(skip)
                .limit(ITEMS_PER_PAGE);

            return successResponse(res, 200, "Success", classSchedules);

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    static async getSingleClassSchedule(req: Request, res: Response) {
        try {
            const classSchedule = await ClassScheduleModel.findOne({ _id: req.params.id, organization: req.params.organizationId });
            if (!classSchedule) return failedResponse(res, 404, "Class schedule does not exist");

            return successResponse(res, 200, "Success", classSchedule );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    static async updateSingleClassSchedule(req: Request, res: Response) {
        try {
            const { error, value } = updateClassScheduleSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            if(value.course){

                // validate subunitCourse paid status
                const IspaidCourse = await SubUnitCourseModel.findOne({_id:value.course, organization:req.params.organizationId})
                if(!IspaidCourse) return failedResponse(res, 404, "Course not found");
                if (!IspaidCourse.paid && !IspaidCourse.expired) return failedResponse(res, 400, "Only paid sub-unit courses can be added to schedule.");
                // add term
                value.term = IspaidCourse.term;
                value.subUnit = IspaidCourse.subUnit;
            }
            

            const classSchedule = await ClassScheduleModel.findOneAndUpdate({ _id: req.params.id, organization: req.params.organizationId }, value, { new: true });
            if (!classSchedule) return failedResponse(res, 404, "Class schedule does not exist");

            return successResponse(res, 200, "Success", classSchedule);

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    static async deleteSingleClassSchedule(req: Request, res: Response) {
        try {
            const classSchedule = await ClassScheduleModel.findOneAndDelete({ _id: req.params.id, organization: req.params.organizationId });
            if (!classSchedule) return failedResponse(res, 404, "Class schedule does not exist");

            return successResponse(res, 204, "Success", classSchedule );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }
};


export class AttendanceController {
    static async addAttendance(req: Request, res: Response) {
        try {
            const { error, value } = createAttendanceSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            // save attendance
            value.organization = req.params.organizationId;
            const attendance = await AttendanceModel.create(value);
            return successResponse(res, 201, "Attendance added successfully", attendance );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    static async getAllAttendances(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 10;
        try {
            const page = parseInt(req.query.page as string) || 1;
            const skip = (page - 1) * ITEMS_PER_PAGE;
            const attendances = await AttendanceModel.find({ organization: req.params.organizationId, classScheduleId:req.params.classScheduleId })
                .skip(skip)
                .limit(ITEMS_PER_PAGE);

            return successResponse(res, 200, "Success", attendances );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    static async getSingleAttendance(req: Request, res: Response) {
        try {
            const attendance = await AttendanceModel.findOne({ _id: req.params.id, organization: req.params.organizationId });
            if (!attendance) return failedResponse(res, 404, "Attendance does not exist");

            return successResponse(res, 200, "Success", attendance );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    // static async updateSingleAttendance(req: Request, res: Response) {
    //     try {
    //         const { error, value } = updateAttendanceSchema.validate(req.body);
    //         if (error) return failedResponse(res, 400, `${error.details[0].message}`);

    //         const attendance = await AttendanceModel.findOneAndUpdate({ _id: req.params.id, organization: req.params.organizationId }, value, { new: true });
    //         if (!attendance) return failedResponse(res, 404, "Attendance does not exist");

    //         return successResponse(res, 200, "Success", { attendance });

    //     } catch (error: any) {
    //         writeErrosToLogs(error);
    //         return failedResponse(res, 500, error.message);
    //     }
    // }

    static async deleteSingleAttendance(req: Request, res: Response) {
        try {
            const attendance = await AttendanceModel.findOneAndDelete({ _id: req.params.id, organization: req.params.organizationId });
            if (!attendance) return failedResponse(res, 404, "Attendance does not exist");

            return successResponse(res, 204, "Success",  attendance );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }
}