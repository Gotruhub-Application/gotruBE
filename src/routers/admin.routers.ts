import {Router} from "express"
import { FeaturesController, SubscriptionPlanController } from "../controllers/gotru.admin.controllers"
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
