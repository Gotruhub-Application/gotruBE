import { AttendanceController, ClassScheduleController, CourseController, Session, SubUnitCourseController, TermController } from "../../controllers/organization/monitorFeature/organization.monitor.controller";
import { IsAuthenticatedUser } from "../../support/middleware";
import {organizationRouter} from "../organization.router";

organizationRouter
.get("/mobile-section/session", IsAuthenticatedUser, Session.getAllSessions)
.get("/mobile-section/session/:sessionId", IsAuthenticatedUser, Session.getSingleSession)

.get("/mobile-section/term/:sessionId", IsAuthenticatedUser, TermController.getAllTerms)
.get("/mobile-section/term/single/:termId", IsAuthenticatedUser, TermController.getSingleTerm)

.get("/mobile-section/course", IsAuthenticatedUser, CourseController.getAllCourses)
.get("/mobile-section/course/:courseId", IsAuthenticatedUser, CourseController.getSingleCourse)

.get("/mobile-section/schedule/:subUnitId", IsAuthenticatedUser, ClassScheduleController.getAllClassSchedules)
.get("/mobile-section/schedule/single/:id", IsAuthenticatedUser, ClassScheduleController.getSingleClassSchedule)

.get("/mobile-section/attendance/schedule/:classScheduleId", IsAuthenticatedUser, AttendanceController.getAllAttendances)
.get("/mobile-section/attendance/scheduleuser/:userId", IsAuthenticatedUser, AttendanceController.getSingleUserAttendances)
.get("/mobile-section/attendance/:id", IsAuthenticatedUser, AttendanceController.getSingleAttendance)