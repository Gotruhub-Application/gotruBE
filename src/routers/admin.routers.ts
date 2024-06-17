import {Router} from "express"
import { AdminSummary, ContractPlan, FeaturesController, SubscriptionPlanController } from "../controllers/gotru.admin.controllers"
import { paystackWebhook } from "../controllers/auth/general.controllers"

export const adminRouter = Router()

adminRouter
.get("/features", FeaturesController.getAllFeatures)
.post("/features", FeaturesController.addFeature)
.get("/features/:id", FeaturesController.getSingleFeature)
.delete("/features/:id", FeaturesController.DeleteSingleFeature)
.put("/features/:id", FeaturesController.UpdateSingleFeature)

//  Subscription plans
.get("/subscriptions", SubscriptionPlanController.getSubPlans)
.post("/subscriptions", SubscriptionPlanController.addSubPlans)
.get("/subscriptions/:id", SubscriptionPlanController.getSinglePlan)
.delete("/subscriptions/:id", SubscriptionPlanController.DeleteSinglePlan)
.put("/subscriptions/:id", SubscriptionPlanController.UpdateSinglePlan)

.post("/webhook/paystack", paystackWebhook)

// contract plan
.get("/contract-plan/all-plans", ContractPlan.getAllContractPlans)
.post("/contract-plan/add-to-cart", ContractPlan.orderPlan)
.get("/contract-plan/orgs-plans/:organizationId", ContractPlan.getAllOrgPlans)
.get("/contract-plan/single/:id", ContractPlan.getOrgPlanById)
.get("/contract-plan/pending/:organizationId", ContractPlan.OrgPendingPlans)
.get("/contract-plan/pay/:organizationId", ContractPlan.buyPlan)
.delete("/contract-plan/:id", ContractPlan.removePlan)

// summary
.get("/summary", AdminSummary.summary)
.get("/organizations", AdminSummary.getOrganizations)
.get("/graph", AdminSummary.getSubscriptionRevenue)
.get("/organizations/users-summary/:organizationId", AdminSummary.getOrgUserSummary)
.get("/organizations/active-plans/:organizationId", AdminSummary.getOrgActiveSubSummary)
.get("/organizations/feature-matric/:organizationId", AdminSummary.organFeatureUsageMetric)