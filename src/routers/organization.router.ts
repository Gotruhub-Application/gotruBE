import {Router} from "express"
import { Organization } from "../models/organization.models"
import { OrganizatioinUnits } from "../controllers/organization.controller"
import { IsAuthenticatedOrganization } from "../support/middleware"

export const organizationRouter = Router()
organizationRouter
.post("/units",IsAuthenticatedOrganization,OrganizatioinUnits.createUnit)
.get("/units",IsAuthenticatedOrganization,OrganizatioinUnits.getUnits)
.get("/units/:id",IsAuthenticatedOrganization,OrganizatioinUnits.getSingleUnit)
.put("/units/:id",IsAuthenticatedOrganization,OrganizatioinUnits.updateUnit)
.delete("/units/:id",IsAuthenticatedOrganization,OrganizatioinUnits.deleteUnit)