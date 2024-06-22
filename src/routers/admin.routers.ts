import {Router} from "express"
import { AdminSummary, ContractPlan, FeaturesController, SubscriptionPlanController } from "../controllers/gotru.admin.controllers"
import { paystackWebhook } from "../controllers/auth/general.controllers"
import { IsAuthenticatedGotruAdmin } from "../support/middleware"

export const adminRouter = Router()

adminRouter
.get("/features", IsAuthenticatedGotruAdmin, FeaturesController.getAllFeatures)
.post("/features", IsAuthenticatedGotruAdmin, FeaturesController.addFeature)
.get("/features/:id", IsAuthenticatedGotruAdmin, FeaturesController.getSingleFeature)
.delete("/features/:id", IsAuthenticatedGotruAdmin, FeaturesController.DeleteSingleFeature)
.put("/features/:id", IsAuthenticatedGotruAdmin, FeaturesController.UpdateSingleFeature)

//  Subscription plans
.get("/subscriptions", IsAuthenticatedGotruAdmin, SubscriptionPlanController.getSubPlans)
.post("/subscriptions", IsAuthenticatedGotruAdmin, SubscriptionPlanController.addSubPlans)
.get("/subscriptions/:id", IsAuthenticatedGotruAdmin, SubscriptionPlanController.getSinglePlan)
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
.get("/graph", IsAuthenticatedGotruAdmin, AdminSummary.getSubscriptionRevenue)
.get("/organizations/users-summary/:organizationId", IsAuthenticatedGotruAdmin, AdminSummary.getOrgUserSummary)
.get("/organizations/active-plans/:organizationId", IsAuthenticatedGotruAdmin, AdminSummary.getOrgActiveSubSummary)
.get("/organizations/feature-matric/:organizationId", IsAuthenticatedGotruAdmin, AdminSummary.organFeatureUsageMetric)