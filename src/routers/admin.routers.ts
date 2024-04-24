import {Router} from "express"
import { FeaturesController } from "../controllers/gotru.admin.controllers"

export const adminRouter = Router()

adminRouter
.get("/features", FeaturesController.getAllFeatures)
.post("/features", FeaturesController.addFeature)
.get("/features/:id", FeaturesController.getSingleFeature)
.delete("/features/:id", FeaturesController.DeleteSingleFeature)
.put("/features/:id", FeaturesController.UpdateSingleFeature)
