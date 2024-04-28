import {Router} from "express"
import { Organization } from "../models/organization.models"
import { OrganizatioinSubUnits, OrganizatioinUnits } from "../controllers/organization.controller"
import { IsAuthenticatedOrganization } from "../support/middleware"

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