import {Router} from "express"
import { Organization } from "../models/organization.models"
import { AppAccessTokens, BuySubcriptionPlan, OrgSummary, OrgUsers, OrganizatioinSubUnits, OrganizatioinUnits, UserSummary } from "../controllers/organization.controller"
import { IsAuthenticatedNewUser, IsAuthenticatedOrganization, IsAuthenticatedStaff, IsAuthenticatedUser } from "../support/middleware"
import { ScanChildQrCode, SignInOutRecordHistory } from "../controllers/organization/passFeatures/pass.controllers"

export const organizationRouter = Router()
organizationRouter
.post("/units",IsAuthenticatedOrganization,OrganizatioinUnits.createUnit)
.get("/units",IsAuthenticatedOrganization,OrganizatioinUnits.getUnits)
.get("/units/:id",IsAuthenticatedOrganization,OrganizatioinUnits.getSingleUnit)
.put("/units/:id",IsAuthenticatedOrganization,OrganizatioinUnits.updateUnit)
.delete("/units/:id",IsAuthenticatedOrganization,OrganizatioinUnits.deleteUnit)

.post("/subunits",IsAuthenticatedOrganization,OrganizatioinSubUnits.createSubUnit)
.get("/unit/:id/subunits",IsAuthenticatedOrganization,OrganizatioinSubUnits.getSubbUnits)
.get("/subunits/:id",IsAuthenticatedOrganization,OrganizatioinSubUnits.getSingleSubUnit)
.put("/subunits/:id",IsAuthenticatedOrganization,OrganizatioinSubUnits.updateSubUnit)
.delete("/subunits/:id",IsAuthenticatedOrganization,OrganizatioinSubUnits.deleteSubUnit)

.post("/users/add-user",IsAuthenticatedOrganization, OrgUsers.createUser)
.get("/users/get-users/:role",IsAuthenticatedOrganization, OrgUsers.getUsers)
.get("/users/get-user/:id",IsAuthenticatedOrganization, OrgUsers.getSingleUser)
.put("/users/get-user/:id",IsAuthenticatedOrganization, OrgUsers.updateSingleUser)
.delete("/users/get-user/:id",IsAuthenticatedOrganization, OrgUsers.deleteSingleUser)

.post("/plan/add-to-cart",IsAuthenticatedOrganization, BuySubcriptionPlan.orderPlan)
.get("/plan/my-plans",IsAuthenticatedOrganization, BuySubcriptionPlan.getAllMyPlans)
.get("/plan/single/:id",IsAuthenticatedOrganization, BuySubcriptionPlan.getMyPlanById)
.get("/plan/pending",IsAuthenticatedOrganization, BuySubcriptionPlan.myPendingPlans)
.get("/plan/pay",IsAuthenticatedOrganization, BuySubcriptionPlan.buyPlan)
.delete("/plan/:id",IsAuthenticatedOrganization, BuySubcriptionPlan.removePlan)

.post("/tokens/send-token", IsAuthenticatedOrganization,AppAccessTokens.sendtokens)
.post("/activate-feature",IsAuthenticatedNewUser,AppAccessTokens.useAppTokenForChild)

// pass features
.get("/scan-qrcode/:id", IsAuthenticatedStaff, ScanChildQrCode.getDetails)
.post("/sign-in-out",IsAuthenticatedStaff, SignInOutRecordHistory.createHistory)
.get("/pass-history", IsAuthenticatedOrganization, OrgSummary.getAllPassHistory)

// summary
.get("/my-orgnz-summary", IsAuthenticatedOrganization,OrgSummary.getOrgSummary)
.get("/my-orgnz-summary/unit/:unitId",IsAuthenticatedOrganization, OrgSummary.getUnitSummary)
.get("/my-orgnz-summary/unit/:unitId/subunit-summary",IsAuthenticatedOrganization, OrgSummary.getSubUnitSummary)
.get("/my-orgnz-summary/unit/:unitId/attendance-summary",IsAuthenticatedOrganization, OrgSummary.getAttendanceSummary)

// user summary
.get('/pass-summary', IsAuthenticatedOrganization, UserSummary.passSummary)
.get('/wallet-summary/:memberId', IsAuthenticatedOrganization, UserSummary.walletInfo)
.get('/attendance-summary/:memberId/:termId', IsAuthenticatedOrganization, UserSummary.getUserAttendanceSummary)


// users copy

.get("/mobile-section/units",IsAuthenticatedUser,OrganizatioinUnits.getUnits)
.get("/mobile-section/units/:id",IsAuthenticatedUser,OrganizatioinUnits.getSingleUnit)

.get("/mobile-section/unit/:id/subunits",IsAuthenticatedUser,OrganizatioinSubUnits.getSubbUnits)
.get("/subunits/:id",IsAuthenticatedUser,OrganizatioinSubUnits.getSingleSubUnit)

.get("/mobile-section/users/get-users/:role",IsAuthenticatedUser, OrgUsers.getUsers)
.get("/mobile-section/users/get-user/:id",IsAuthenticatedUser, OrgUsers.getSingleUser)

.post("/mobile-section/activate-feature",IsAuthenticatedNewUser,AppAccessTokens.useAppTokenForChild)

// pass features
.get("/mobile-section/scan-qrcode/:id", IsAuthenticatedStaff, ScanChildQrCode.getDetails)
.post("/mobile-section/sign-in-out",IsAuthenticatedUser, SignInOutRecordHistory.createHistory)

.get('/mobile-section/attendance-summary/:memberId/:termId', IsAuthenticatedUser, UserSummary.getUserAttendanceSummary)

