import { ResultController } from "../../controllers/organization/ResultFeature/result.organization.controller";
import { IsAuthenticatedOrganization, IsAuthenticatedStaff, IsAuthenticatedUser } from "../../support/middleware";
import {organizationRouter} from "../organization.router";

organizationRouter
.post("/result/upload", IsAuthenticatedStaff, ResultController.uploadResult)
.get("/result/retrieve/:sessionId/:termId/:studentId", IsAuthenticatedUser, ResultController.getResult)
.get("/result/students/:sessionId/:termId/:subUnitId", IsAuthenticatedStaff, ResultController.getSubUnitStudents)
.delete("/result/students/:sessionId/:termId/:subUnitId/:studentId", IsAuthenticatedStaff, ResultController.clearUploadByUser)
.get("/result/:sessionId/:termId/:subUnitId/", IsAuthenticatedOrganization, ResultController.viewResults)