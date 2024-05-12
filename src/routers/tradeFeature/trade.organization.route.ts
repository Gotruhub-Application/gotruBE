import {Router} from "express"
import { IsAuthenticatedUser,IsAuthenticatedOrganization } from "../../support/middleware"
import { Catetgory } from "../../controllers/organization/tradeFeatures/organization.trade.controllers";

export const tradeOrganizationRouter = Router();

tradeOrganizationRouter
.post("/category",IsAuthenticatedOrganization,Catetgory.addCategory)
.get("/category",IsAuthenticatedOrganization,Catetgory.getAllCategory)
.get("/category/:id",IsAuthenticatedOrganization,Catetgory.getSingleCategory)
.put("/category/:id",IsAuthenticatedOrganization,Catetgory.updateSingleCategory)
.delete("/category/:id",IsAuthenticatedOrganization,Catetgory.deleteSingleCategory)