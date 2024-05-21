import {Router} from "express"
import { Organization } from "../models/organization.models"
import { AppAccessTokens, BuySubcriptionPlan, OrgUsers, OrganizatioinSubUnits, OrganizatioinUnits } from "../controllers/organization.controller"
import { IsAuthenticatedNewUser, IsAuthenticatedOrganization, IsAuthenticatedStaff } from "../support/middleware"
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
.get("/plan/pending",IsAuthenticatedOrganization, BuySubcriptionPlan.myPendingPlans)
.get("/plan/pay",IsAuthenticatedOrganization, BuySubcriptionPlan.buyPlan)
.delete("/plan/:id",IsAuthenticatedOrganization, BuySubcriptionPlan.removePlan)

.post("/tokens/send-token", IsAuthenticatedOrganization,AppAccessTokens.sendtokens)
.post("/activate-feature",IsAuthenticatedNewUser,AppAccessTokens.useAppTokenForChild)

// pass features
.get("/scan-qrcode/:id", IsAuthenticatedStaff, ScanChildQrCode.getDetails)
.post("/sign-in-out",IsAuthenticatedOrganization, SignInOutRecordHistory.createHistory)
