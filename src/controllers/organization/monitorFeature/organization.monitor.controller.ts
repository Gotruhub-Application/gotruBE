import { Request, Response, NextFunction } from "express";
import { failedResponse, initiatePaystack, successResponse } from "../../../support/http"; 
import { isLessThanFourMonths, writeErrosToLogs } from "../../../support/helpers";
import { UpdateLocationSchema, attendanceGradingUpdateValidationSchema, attendanceGradingValidationSchema, createAttendanceSchema, createClassScheduleSchema, createCourseSchema, createLocationSchema, createSessionSchema, createSubUnitCourseSchema, createTermSchema, flagAttendanceSchema, threadholdValueValidator, updateAttendanceSchema, updateClassScheduleSchema, updateCourseSchema, updateSessionSchema, updateSubUnitCourseSchema, updateTermSchema, updateThreadholdValueValidator } from "../../../validators/monitorFeature/organization.monitor";
import { AttendanceGrading, AttendanceModel, ClassScheduleModel, CourseModel, LocationModel, SessionModel, SubUnitCourseModel, TermModel, ThreadholdValue } from "../../../models/organziation/monitorFeature.models";
import { logger } from "../../../logger";
import { AppToken, Unit, User } from "../../../models/organization.models";
import { schedule } from "node-cron";
import { features } from "process";
import { Feature } from "../../../models/admin.models";
import mongoose from 'mongoose';

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
        const ITEMS_PER_PAGE = 100;
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

            // validate durations
            const isvalidDurations = isLessThanFourMonths(value.startDate, value.endDate)
            if(!isvalidDurations) return failedResponse(res, 400, "The start and end dates cannot exceed 4 months");

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
        const ITEMS_PER_PAGE = 100;
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

            const unit = await Unit.findOne({_id:value.unit, organization:req.params.organizationId})
            if (!unit) return failedResponse(res, 400, "Unit not found")
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
        const ITEMS_PER_PAGE = 100;
        try {
            const { courseCode, unit } = req.query;
            const page = parseInt(req.query.page as string) || 1; // Get the page number from query parameters, default to 1
            const skip = (page - 1) * ITEMS_PER_PAGE; 
            
            // Initialize the filter object with the organization ID
            const filter: any = {};
            filter.organization = req.params.organizationId;
    
            // Add filtering conditions if they exist in the query parameters
            if (courseCode) filter.courseCode = courseCode;
            if (unit) filter.unit = unit; // Correctly use the 'unit' field
    
            // Fetch courses based on filters, pagination, and limit
            const courseExist = await CourseModel.find({ ...filter })
                .skip(skip)
                .limit(ITEMS_PER_PAGE);
    
            // Return a success response with the fetched courses
            return successResponse(res, 200, "Success", courseExist);
    
        } catch (error: any) {
            // Log the error and return a failure response
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
        const ITEMS_PER_PAGE = 100;
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
            
            const sourcePrice = await Feature.findOne({name:"monitorsource"});
            if (!sourcePrice) {
                return failedResponse(res, 500, "Monitor source feature not found");
            }
            const paystack = await initiatePaystack(metadata, (req as any).org.email, (totalAmount * sourcePrice.basePrice));
            return successResponse(res, 200, "Success", paystack)

        }catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    static async getAllPaidSubUnitCourses(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 100;
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
            // const sortedCor = sortCoordinates(value.location, value.endlocation)
            // value.location = sortedCor[0]
            // value.endlocation = sortedCor[1]

            // save class schedule
            const classSchedule = await ClassScheduleModel.create(value);
            return successResponse(res, 201, "Class schedule added successfully", classSchedule);

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        };
        // function sortCoordinates(point1:any, point2:any) {
        //     // Extracting latitude and longitude from the points
        //     const { lat: lat1, long: lon1 } = point1;
        //     const { lat: lat2, long: lon2 } = point2;
          
        //     // Compare latitude first
        //     if (lat1 < lat2) {
        //         return [point1, point2];
        //     } else if (lat1 > lat2) {
        //         return [point2, point1];
        //     } else {
        //         // If latitudes are equal, compare longitude
        //         if (lon1 < lon2) {
        //             return [point1, point2];
        //         } else {
        //             return [point2, point1];
        //         }
        //     }
        //   };
    };


    static async getAllClassSchedules(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 100;
        try {
            const page = parseInt(req.query.page as string) || 1;
            const skip = (page - 1) * ITEMS_PER_PAGE;

            logger.info(req.params.organizationId)
            const classSchedules = await ClassScheduleModel.find({ organization:req.params.organizationId, subUnit:req.params.subUnitId })
            .populate("location locationId")
                .skip(skip)
                .limit(ITEMS_PER_PAGE);
            const returnPayload = classSchedules.map(schedule => ({
                _id: schedule._id,
                day: schedule.day,
                course: schedule.course?.course?.name,
                code: schedule.course?.course?.courseCode,
                location:schedule.locationId ? schedule.locationId.name : null,
                startTime:schedule.startTime,
                endTime:schedule.endTime,

            }));

            return successResponse(res, 200, "Success", returnPayload);

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getSingleAssigneeClassSchedules(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 100;
        try {

            const page = parseInt(req.query.page as string) || 1;
            const skip = (page - 1) * ITEMS_PER_PAGE;
            const coordinatorId = req.params.coordinatorId; // Assuming this is passed in the request params
            logger.info(`Fetching schedules for organization: ${req.params.organizationId}, subUnit: ${req.params.subUnitId}, coordinator: ${coordinatorId}`);
            // Convert coordinatorId to ObjectId
            let coordinatorObjectId: mongoose.Types.ObjectId;
            try {
                coordinatorObjectId = new mongoose.Types.ObjectId(coordinatorId);
            } catch (error) {
                return failedResponse(res, 400, "Invalid Coordinator ID format");
            }
            const classSchedules = await ClassScheduleModel.find({
                organization: req.params.organizationId,
                coordinators: coordinatorObjectId // Filter by coordinator
            })
            .populate("location locationId course")
            .skip(skip)
            .limit(ITEMS_PER_PAGE);

            const returnPayload = classSchedules.map(schedule => ({
                _id: schedule._id,
                day: schedule.day,
                course: schedule.course?.name,
                code: schedule.course?.courseCode,
                location: schedule.locationId?.name || null,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
            }));

            return successResponse(res, 200, "Success", returnPayload);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async getSingleClassSchedule(req: Request, res: Response) {
        try {
            const classSchedule = await ClassScheduleModel.findOne({ _id: req.params.id, organization: req.params.organizationId }).populate("location locationId");
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

export class Location {
    static async createLocation (req:Request, res:Response, next:NextFunction){
        try {
            const { error, value } = createLocationSchema.validate(req.body);
            if (error) {
                return failedResponse (res, 400, `${error.details[0].message}`)
            }
            const locationExist = await LocationModel.findOne({name:value.name, organization:req.params.organizationId});
            if(locationExist) return failedResponse(res,404, "Location already exist") 

            const sortedCor = sortCoordinates(value.location, value.endlocation)
            value.location = sortedCor[0]
            value.endlocation = sortedCor[1]
            value["organization"] = req.params.organizationId
            const location  = await LocationModel.create(value)
          return successResponse(res,201,"Unit created successfully",{location} )
  
          function sortCoordinates(point1:any, point2:any) {
            // Extracting latitude and longitude from the points
            const { lat: lat1, long: lon1 } = point1;
            const { lat: lat2, long: lon2 } = point2;
          
            // Compare latitude first
            if (lat1 < lat2) {
                return [point1, point2];
            } else if (lat1 > lat2) {
                return [point2, point1];
            } else {
                // If latitudes are equal, compare longitude
                if (lon1 < lon2) {
                    return [point1, point2];
                } else {
                    return [point2, point1];
                }
            }
          };
          
        } catch (error:any) {
          logger.error(`Error at line ${error.name}: ${error.message}\n${error.stack}`);
          return failedResponse(res,500, error.message)
        }
      };

      static async getLocations(req: Request, res: Response) {
        try {
            const locations = await LocationModel.find({ organization: req.params.organizationId });

            return successResponse(res, 200, "Success", locations );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    static async getSingleLocations(req: Request, res: Response) {
        try {
            const location = await LocationModel.findOne({ organization: req.params.organizationId, _id:req.params.id});

            return successResponse(res, 200, "Success", location );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    static async updateSingleLocation(req: Request, res: Response) {
        try {
            const { error, value } = UpdateLocationSchema.validate(req.body);
            if (error) {
                return failedResponse (res, 400, `${error.details[0].message}`)
            }
            const location = await LocationModel.findOneAndUpdate({ organization: req.params.organizationId, _id:req.params.id}, value);

            return successResponse(res, 200, "Success", location );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    static async deleteSingleLocation(req: Request, res: Response) {
        try {
            const location = await LocationModel.findOneAndDelete({ organization: req.params.organizationId, _id:req.params.id});

            return successResponse(res, 204, "Success" );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
}
export class AttendanceController {
    static async addAttendance(req: Request, res: Response) {
        try {
            const { error, value } = createAttendanceSchema.validate(req.body);
            const {role, _id:userId, organization}= (req as any).user
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            // validate course expiration
            const schedule = await ClassScheduleModel.findOne({_id:value.classScheduleId, organization})
            if(!schedule) failedResponse(res, 404, "classSchedule not found");
            if(schedule?.expired) failedResponse(res, 400, "Failed. Monitor source subscription has expired for this schedule.");

            // validate role
            const user = await User.findById(userId);
            if(role === "student"){
                console.log(user?.monitorToken, "asdas")
                const token = await AppToken.findById(user?.monitorToken)
                if (!token) {
                    return failedResponse(res, 400, "Student has no active monitor end subscription");
                }

                if (token.expires_at.getTime() < Date.now()) {
                    token.expired = true;
                    await token.save();
                    return failedResponse(res, 400, "Your monitor end subscription has expired token has expired");
                };

                // if(user?.subUnit != schedule?.subUnit) return failedResponse(res, 400, "You cannot take attendance in another sub-unit."); 
            }
            // else if(role === "staff"){
            //     if(!schedule?.coordinators.includes(userId) ) return failedResponse(res, 400, "You are not this course's coordinator."); 
            // }

            // validate the scanning user is in the sub unit or it's a coordinator
            value.term = schedule?.term;
            value.user = userId;
            // save attendance
            value.organization = req.params.organizationId;
            const attendance = await AttendanceModel.create(value);
            // Populate details
            const populatedAttendance = await AttendanceModel.findById(attendance._id)

            return successResponse(res, 201, "Attendance added successfully", populatedAttendance);

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

    static async getAllAttendances(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 100;
        try {
            const page = parseInt(req.query.page as string) || 1;
            const skip = (page - 1) * ITEMS_PER_PAGE;
            const attendances = await AttendanceModel.find({ organization: req.params.organizationId, classScheduleId:req.params.classScheduleId })
                .skip(skip)
                .sort({ createdAt: -1 })
                .limit(ITEMS_PER_PAGE);

            return successResponse(res, 200, "Success", attendances );

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    static async getSingleUserAttendances(req: Request, res: Response) {
        const ITEMS_PER_PAGE = 100;
        try {
            const {userId} = req.params;
            console.log(userId, "sbdbfbdv")
            const page = parseInt(req.query.page as string) || 1;
            const skip = (page - 1) * ITEMS_PER_PAGE;
            const attendances = await AttendanceModel.find({ organization: req.params.organizationId, user:userId })
                .skip(skip)
                .sort({ createdAt: -1 })
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

    static async updateSingleAttendance(req: Request, res: Response) {
        try {
            const { error, value } = flagAttendanceSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            const attendance = await AttendanceModel.findById(req.params.id);
            
            // const attendance = await AttendanceModel.findOneAndUpdate({ _id: req.params.id, organization: req.params.organizationId }, value, { new: true });
            if (!attendance) return failedResponse(res, 404, "Attendance does not exist");
            attendance.flag = value.flag;
            attendance.save()
            return successResponse(res, 200, "Success", { attendance });

        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    }

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
};


export class AttendanceGradingController {
    // Create new attendance grading
    static async createAttendanceGrading(req: Request, res: Response) {
      try {
        const { error, value } = attendanceGradingValidationSchema.validate(req.body);
        if (error) return failedResponse(res, 400, `${error.details[0].message}`);

        // check if grading exists
        const gradeExist = await AttendanceGrading.findOne({organization:req.params.organizationId, name:value.name});
        if(gradeExist) return failedResponse(res, 400, `Grade name '${value.name}' already exist. duplicate not allowed.`);

        value.organization = req.params.organizationId
        const attendanceGrading = new AttendanceGrading(value);
        await attendanceGrading.save();
        return successResponse(res, 201, 'Attendance grading created successfully', attendanceGrading);
      } catch (error: any) {
        return failedResponse(res, 500, error.message);
      }
    }
  
    // Get all attendance gradings
    static async getAllAttendanceGradings(req: Request, res: Response) {
      try {
        const gradings = await AttendanceGrading.find({organization:req.params.organizationId});
        return successResponse(res, 200, 'Attendance gradings fetched successfully', gradings);
      } catch (error: any) {
        return failedResponse(res, 500, error.message);
      }
    }
  
    // Get a specific attendance grading
    static async getSingleAttendanceGrading(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const grading = await AttendanceGrading.findById(id);
        if (!grading) {
          return failedResponse(res, 404, 'Attendance grading not found');
        }
        return successResponse(res, 200, 'Attendance grading fetched successfully', grading);
      } catch (error: any) {
        return failedResponse(res, 500, error.message);
      }
    }
  
    // Update attendance grading
    static async updateAttendanceGrading(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const { error, value } = attendanceGradingUpdateValidationSchema.validate(req.body);
        if (error) return failedResponse(res, 400, `${error.details[0].message}`);
  
        const grading = await AttendanceGrading.findByIdAndUpdate(id, value, { new: true });
  
        if (!grading) {
          return failedResponse(res, 404, 'Attendance grading not found');
        }
  
        return successResponse(res, 200, 'Attendance grading updated successfully', grading);
      } catch (error: any) {
        return failedResponse(res, 500, error.message);
      }
    };
  
    // Delete attendance grading
    static async deleteAttendanceGrading(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const grading = await AttendanceGrading.findByIdAndDelete(id);
        if (!grading) {
          return failedResponse(res, 404, 'Attendance grading not found');
        }
        return successResponse(res, 200, 'Attendance grading deleted successfully', grading);
      } catch (error: any) {
        return failedResponse(res, 500, error.message);
      }
    }
  }


  
export class ThreadholdValueController {
    // Create new threadhold value
    static async createThreadholdValue(req: Request, res: Response) {
      try {
        const { error, value } = threadholdValueValidator.validate(req.body);
        if (error) return failedResponse(res, 400, `${error.details[0].message}`);
  
        // check if threadhold value exists
        const valueExist = await ThreadholdValue.findOne({
          organization: req.params.organizationId,
          name: value.name,
          type: value.type
        });
        if (valueExist) return failedResponse(res, 400, `Threadhold value with name '${value.name}' and type '${value.type}' already exists. Duplicate not allowed.`);
  
        value.organization = req.params.organizationId;
        const threadholdValue = new ThreadholdValue(value);
        await threadholdValue.save();
        return successResponse(res, 201, 'Threadhold value created successfully', threadholdValue);
      } catch (error: any) {
        return failedResponse(res, 500, error.message);
      }
    }
  
    // Get all threadhold values
    static async getAllThreadholdValues(req: Request, res: Response) {
      try {
        const values = await ThreadholdValue.find({ organization: req.params.organizationId });
        return successResponse(res, 200, 'Threadhold values fetched successfully', values);
      } catch (error: any) {
        return failedResponse(res, 500, error.message);
      }
    }
  
    // Get a specific threadhold value
    static async getSingleThreadholdValue(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const value = await ThreadholdValue.findById(id);
        if (!value) {
          return failedResponse(res, 404, 'Threadhold value not found');
        }
        return successResponse(res, 200, 'Threadhold value fetched successfully', value);
      } catch (error: any) {
        return failedResponse(res, 500, error.message);
      }
    }
  
    // Update threadhold value
    static async updateThreadholdValue(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const { error, value } = updateThreadholdValueValidator.validate(req.body);
        if (error) return failedResponse(res, 400, `${error.details[0].message}`);
  
        const updatedValue = await ThreadholdValue.findByIdAndUpdate(id, value, { new: true });
  
        if (!updatedValue) {
          return failedResponse(res, 404, 'Threadhold value not found');
        }
  
        return successResponse(res, 200, 'Threadhold value updated successfully', updatedValue);
      } catch (error: any) {
        return failedResponse(res, 500, error.message);
      }
    }
  
    // Delete threadhold value
    static async deleteThreadholdValue(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const value = await ThreadholdValue.findByIdAndDelete(id);
        if (!value) {
          return failedResponse(res, 404, 'Threadhold value not found');
        }
        return successResponse(res, 200, 'Threadhold value deleted successfully', value);
      } catch (error: any) {
        return failedResponse(res, 500, error.message);
      }
    }
  }