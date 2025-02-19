import { AttendanceController, AttendanceGradingController, ClassScheduleController, CourseController, Location, Session, SubUnitCourseController, TermController, ThreadholdValueController } from "../../controllers/organization/monitorFeature/organization.monitor.controller";
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
.get("/attendance/schedule/:classScheduleId", IsAuthenticatedOrganization, AttendanceController.getAllAttendances)
.get("/attendance/schedule/user/:userId", IsAuthenticatedOrganization, AttendanceController.getSingleUserAttendances)
.get("/attendance/:id", IsAuthenticatedOrganization, AttendanceController.getSingleAttendance)
.delete("/attendance/:id", IsAuthenticatedOrganization, AttendanceController.deleteSingleAttendance)
.get("/attendance/history/:classScheduleId", IsAuthenticatedOrganization, AttendanceController.getAttendanceHistoryByClassSchedule)


.post('/attendance-grading', IsAuthenticatedOrganization, AttendanceGradingController.createAttendanceGrading)
.get('/attendance-gradings', IsAuthenticatedOrganization, AttendanceGradingController.getAllAttendanceGradings)
.get('/attendance-grading/:id', IsAuthenticatedOrganization, AttendanceGradingController.getSingleAttendanceGrading)
.put('/attendance-grading/:id', IsAuthenticatedOrganization, AttendanceGradingController.updateAttendanceGrading)
.delete('/attendance-grading/:id', IsAuthenticatedOrganization, AttendanceGradingController.deleteAttendanceGrading)

.post('/threadhold-value', IsAuthenticatedOrganization, ThreadholdValueController.createThreadholdValue)
.get('/threadhold-values', IsAuthenticatedOrganization, ThreadholdValueController.getAllThreadholdValues)
.get('/threadhold-value/:id', IsAuthenticatedOrganization, ThreadholdValueController.getSingleThreadholdValue)
.put('/threadhold-value/:id', IsAuthenticatedOrganization, ThreadholdValueController.updateThreadholdValue)
.delete('/threadhold-value/:id', IsAuthenticatedOrganization, ThreadholdValueController.deleteThreadholdValue)

.post("/locations", IsAuthenticatedOrganization, Location.createLocation)
.get("/locations", IsAuthenticatedOrganization, Location.getLocations)
.get("/locations/:id", IsAuthenticatedOrganization, Location.getSingleLocations)
.put("/locations/:id", IsAuthenticatedOrganization, Location.updateSingleLocation)
.delete("/locations/:id", IsAuthenticatedOrganization, Location.deleteSingleLocation)