import { AttendanceController, ClassScheduleController, CourseController, Session, SubUnitCourseController, TermController } from "../../controllers/organization/monitorFeature/organization.monitor.controller";
import { IsAuthenticatedOrganization, IsAuthenticatedUser } from "../../support/middleware";
import { organizationRouter } from "../organization.router";

organizationRouter
.post("/session", IsAuthenticatedOrganization, Session.addSession)
.get("/session", IsAuthenticatedOrganization, Session.getAllSessions)
.get("/session/:sessionId", IsAuthenticatedOrganization, Session.getSingleSession)
.put("/session/:sessionId", IsAuthenticatedOrganization, Session.updateSingleSession)
.delete("/session/:sessionId", IsAuthenticatedOrganization, Session.deleteSingleSession)

.post("/term", IsAuthenticatedOrganization, TermController.addTerm)
.get("/term/:sessionId", IsAuthenticatedOrganization, TermController.getAllTerms)
.get("/term/single/:termId", IsAuthenticatedOrganization, TermController.getSingleTerm)
.put("/term/single/:termId", IsAuthenticatedOrganization, TermController.updateSingleSessionTerm)
.delete("/term/single/:termId", IsAuthenticatedOrganization, TermController.deleteSingleSessionTerm)

.post("/course", IsAuthenticatedOrganization, CourseController.addCourse)
.get("/course", IsAuthenticatedOrganization, CourseController.getAllCourses)
.get("/course/:courseId", IsAuthenticatedOrganization, CourseController.getSingleCourse)
.put("/course/:courseId", IsAuthenticatedOrganization, CourseController.updateSingleCourse)
.delete("/course/:courseId", IsAuthenticatedOrganization, CourseController.deleteSingleCourse)

.post("/sub-unit/course", IsAuthenticatedOrganization, SubUnitCourseController.addSubUnitCourse)
.get("/sub-unit/course/cart", IsAuthenticatedOrganization, SubUnitCourseController.getAllUNPaidSubUnitCourses)
.get("/sub-unit/course/pay", IsAuthenticatedOrganization, SubUnitCourseController.SubUnitCoursesCheckout)
.get("/sub-unit/course/paid/:subUnitId", IsAuthenticatedOrganization, SubUnitCourseController.getAllPaidSubUnitCourses)
.get("/sub-unit/course/single/:courseId", IsAuthenticatedOrganization, SubUnitCourseController.getSingleSubUnitCourse)
// .put("/sub-unit/course/single/:courseId", IsAuthenticatedOrganization, SubUnitCourseController.updateSingleSubUnitCourse)
.delete("/sub-unit/course/single/:courseId", IsAuthenticatedOrganization, SubUnitCourseController.deleteSingleSubUnitCourse)

.post("/schedule", IsAuthenticatedOrganization, ClassScheduleController.addClassSchedule)
.get("/schedule/:subUnitId", IsAuthenticatedOrganization, ClassScheduleController.getAllClassSchedules)
.get("/schedule/single/:id", IsAuthenticatedOrganization, ClassScheduleController.getSingleClassSchedule)
.put("/schedule/single/:id", IsAuthenticatedOrganization, ClassScheduleController.updateSingleClassSchedule)
.delete("/schedule/single/:id", IsAuthenticatedOrganization, ClassScheduleController.deleteSingleClassSchedule)

.post("/attendance", IsAuthenticatedUser, AttendanceController.addAttendance)
.get("/attendance", IsAuthenticatedOrganization, AttendanceController.getAllAttendances)
.get("/attendance/:attendanceId", IsAuthenticatedOrganization, AttendanceController.getSingleAttendance)
.delete("/attendance/:attendanceId", IsAuthenticatedOrganization, AttendanceController.deleteSingleAttendance)