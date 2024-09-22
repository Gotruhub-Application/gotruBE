import {Router} from "express"
import { AdminSummary, ContractPlan, FeaturesController, ManageAccounts, ManageAnnouncements, SubscriptionPlanController } from "../controllers/gotru.admin.controllers"
import { paystackWebhook } from "../controllers/auth/general.controllers"
import { IsAuthenticatedGotruAdmin } from "../support/middleware"

export const adminRouter = Router()

adminRouter
.get("/features",  FeaturesController.getAllFeatures)
.post("/features", IsAuthenticatedGotruAdmin, FeaturesController.addFeature)
.get("/features/:id", FeaturesController.getSingleFeature)
.delete("/features/:id", IsAuthenticatedGotruAdmin, FeaturesController.DeleteSingleFeature)
.put("/features/:id", IsAuthenticatedGotruAdmin, FeaturesController.UpdateSingleFeature)

//  Subscription plans
.get("/subscriptions", SubscriptionPlanController.getSubPlans)
.post("/subscriptions", IsAuthenticatedGotruAdmin, SubscriptionPlanController.addSubPlans)
.get("/subscriptions/:id", SubscriptionPlanController.getSinglePlan)
.delete("/subscriptions/:id", IsAuthenticatedGotruAdmin, SubscriptionPlanController.DeleteSinglePlan)
.put("/subscriptions/:id", IsAuthenticatedGotruAdmin, SubscriptionPlanController.UpdateSinglePlan)

.post("/webhook/paystack", paystackWebhook)

// contract plan
.get("/contract-plan/all-plans", IsAuthenticatedGotruAdmin, ContractPlan.getAllContractPlans)
.post("/contract-plan/add-to-cart", IsAuthenticatedGotruAdmin, ContractPlan.orderPlan)
.get("/contract-plan/orgs-plans/:organizationId", IsAuthenticatedGotruAdmin, ContractPlan.getAllOrgPlans)
.get("/contract-plan/single/:id", IsAuthenticatedGotruAdmin, ContractPlan.getOrgPlanById)
.get("/contract-plan/pending/:organizationId", IsAuthenticatedGotruAdmin, ContractPlan.OrgPendingPlans)
.get("/contract-plan/pay/:organizationId", IsAuthenticatedGotruAdmin, ContractPlan.buyPlan)
.delete("/contract-plan/:id", IsAuthenticatedGotruAdmin, ContractPlan.removePlan)

// summary
.get("/summary", IsAuthenticatedGotruAdmin, AdminSummary.summary)
.get("/organizations", IsAuthenticatedGotruAdmin, AdminSummary.getOrganizations)
.get("/graph/:organizationId", IsAuthenticatedGotruAdmin, AdminSummary.getSubscriptionRevenue)
.get("/organizations/users-summary/:organizationId", IsAuthenticatedGotruAdmin, AdminSummary.getOrgUserSummary)
.get("/organizations/active-plans/:organizationId", IsAuthenticatedGotruAdmin, AdminSummary.getOrgActiveSubSummary)
.get("/organizations/feature-matric/:organizationId", IsAuthenticatedGotruAdmin, AdminSummary.organFeatureUsageMetric)
.get("/summary/subscription-summary", IsAuthenticatedGotruAdmin, AdminSummary.subscriptionSummary)

.put("/organizations/deactivate-acccount/:id",IsAuthenticatedGotruAdmin, ManageAccounts.deactivateOrganizationAccount)

// manage global announcement
.post("/announcements",IsAuthenticatedGotruAdmin, ManageAnnouncements.createAnnouncement )
.get("/announcements",IsAuthenticatedGotruAdmin, ManageAnnouncements.getAllAnnouncements )
.get("/announcements/:id",IsAuthenticatedGotruAdmin, ManageAnnouncements.getAnnouncementById )
.put("/announcements/:id",IsAuthenticatedGotruAdmin, ManageAnnouncements.updateAnnouncement )
.delete("/announcements/:id",IsAuthenticatedGotruAdmin, ManageAnnouncements.deleteAnnouncement )